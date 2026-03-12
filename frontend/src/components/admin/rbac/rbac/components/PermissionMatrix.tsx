import React from 'react';
import { Check, X } from 'lucide-react';
import type { PermissionGroup, RBACRole } from '@/types/admin.types';

interface PermissionMatrixProps {
    groups: PermissionGroup[];
    roles: RBACRole[];
}

export default function PermissionMatrix({ groups, roles }: PermissionMatrixProps) {
    return (
        <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-50">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 border-b border-r border-gray-200 sticky left-0 bg-gray-50 min-w-[200px]">
                            Permission
                        </th>
                        {roles.map((role) => (
                            <th
                                key={role.id}
                                className="px-4 py-3 text-center border-b border-gray-200 min-w-[120px]"
                            >
                                <span
                                    className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full"
                                    style={{
                                        backgroundColor: `${role.color || '#6b7280'}15`,
                                        color: role.color || '#6b7280',
                                    }}
                                >
                                    {role.name}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {groups.map((group) => (
                        <React.Fragment key={group.id}>
                            {/* Group header row */}
                            <tr className="bg-gray-50/50">
                                <td
                                    colSpan={roles.length + 1}
                                    className="px-4 py-2 font-semibold text-gray-600 text-xs uppercase tracking-wider border-b border-gray-100"
                                >
                                    {group.name}
                                </td>
                            </tr>
                            {/* Permission rows */}
                            {group.permissions.map((perm) => (
                                <tr key={perm.key} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-4 py-2 border-r border-gray-100 sticky left-0 bg-white">
                                        <span className="text-gray-700">{perm.label}</span>
                                        <span className="ml-1.5 text-[10px] text-gray-400 font-mono">{perm.key}</span>
                                    </td>
                                    {roles.map((role) => {
                                        const has = role.permissions.includes(perm.key);
                                        return (
                                            <td key={role.id} className="text-center px-4 py-2 border-gray-100">
                                                {has ? (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                                                        <Check size={14} />
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-300">
                                                        <X size={14} />
                                                    </span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
