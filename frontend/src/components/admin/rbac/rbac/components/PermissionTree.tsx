import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import type { PermissionGroup } from '@/types/admin.types';

interface PermissionTreeProps {
    groups: PermissionGroup[];
    selected: string[];
    onChange: (selected: string[]) => void;
    readOnly?: boolean;
}

export default function PermissionTree({ groups, selected, onChange, readOnly = false }: PermissionTreeProps) {
    const [search, setSearch] = useState('');
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const filteredGroups = useMemo(() => {
        if (!search.trim()) return groups;
        const q = search.toLowerCase();
        return groups
            .map((g) => ({
                ...g,
                permissions: g.permissions.filter(
                    (p) => p.key.toLowerCase().includes(q) || p.label.toLowerCase().includes(q)
                ),
            }))
            .filter((g) => g.permissions.length > 0);
    }, [groups, search]);

    const togglePermission = (key: string) => {
        if (readOnly) return;
        onChange(
            selected.includes(key)
                ? selected.filter((k) => k !== key)
                : [...selected, key]
        );
    };

    const toggleGroup = (group: PermissionGroup) => {
        if (readOnly) return;
        const keys = group.permissions.map((p) => p.key);
        const allSelected = keys.every((k) => selected.includes(k));
        if (allSelected) {
            onChange(selected.filter((k) => !keys.includes(k)));
        } else {
            onChange([...new Set([...selected, ...keys])]);
        }
    };

    const toggleCollapse = (groupId: string) => {
        setCollapsed((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    const selectedCount = selected.length;
    const totalCount = groups.flatMap((g) => g.permissions).length;

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">
                    Quyền hạn <span className="text-primary font-semibold">({selectedCount}/{totalCount})</span>
                </p>
                {!readOnly && (
                    <button
                        type="button"
                        onClick={() => {
                            if (selectedCount === totalCount) onChange([]);
                            else onChange(groups.flatMap((g) => g.permissions.map((p) => p.key)));
                        }}
                        className="text-xs text-primary hover:underline"
                    >
                        {selectedCount === totalCount ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm permission..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
            </div>

            {/* Tree */}
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {filteredGroups.map((group) => {
                    const keys = group.permissions.map((p) => p.key);
                    const checkedCount = keys.filter((k) => selected.includes(k)).length;
                    const allChecked = checkedCount === keys.length;
                    const someChecked = checkedCount > 0 && !allChecked;
                    const isCollapsed = collapsed[group.id];

                    return (
                        <div key={group.id}>
                            {/* Group header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                                <button type="button" onClick={() => toggleCollapse(group.id)} className="text-gray-400">
                                    {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                                </button>
                                {!readOnly && (
                                    <input
                                        type="checkbox"
                                        checked={allChecked}
                                        ref={(el) => { if (el) el.indeterminate = someChecked; }}
                                        onChange={() => toggleGroup(group)}
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30 cursor-pointer"
                                    />
                                )}
                                <button type="button" onClick={() => toggleCollapse(group.id)} className="flex-1 text-left">
                                    <span className="text-sm font-semibold text-gray-700">{group.name}</span>
                                    <span className="ml-2 text-xs text-gray-400">({checkedCount}/{keys.length})</span>
                                </button>
                            </div>

                            {/* Permissions */}
                            {!isCollapsed && (
                                <div className="divide-y divide-gray-50">
                                    {group.permissions.map((perm) => {
                                        const isChecked = selected.includes(perm.key);
                                        return (
                                            <label
                                                key={perm.key}
                                                className={`flex items-center gap-3 px-4 py-2.5 pl-12 cursor-pointer transition-colors ${isChecked ? 'bg-primary/5' : 'hover:bg-gray-50'
                                                    } ${readOnly ? 'cursor-default' : ''}`}
                                            >
                                                {!readOnly && (
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => togglePermission(perm.key)}
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30 cursor-pointer"
                                                    />
                                                )}
                                                {readOnly && (
                                                    <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <span className={`text-sm ${isChecked ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                        {perm.label}
                                                    </span>
                                                    <span className="ml-2 text-[11px] text-gray-400 font-mono">{perm.key}</span>
                                                </div>
                                                {perm.danger && (
                                                    <span className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
                                                        <AlertTriangle size={10} /> Nguy hiểm
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
