import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
}

export default function DataTable<T extends Record<string, unknown>>({
    columns,
    data,
    onRowClick,
}: DataTableProps<T>) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3"
                                >
                                    <div className="flex items-center gap-1">
                                        {col.label}
                                        {col.sortable && (
                                            <div className="flex flex-col">
                                                <ChevronUp size={10} className="text-gray-300" />
                                                <ChevronDown size={10} className="-mt-1 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-12 text-gray-400 text-sm">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            data.map((item, idx) => (
                                <tr
                                    key={idx}
                                    onClick={() => onRowClick?.(item)}
                                    className={`border-b border-gray-50 last:border-0 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''
                                        }`}
                                >
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-5 py-3.5 text-sm text-gray-700">
                                            {col.render ? col.render(item) : String(item[col.key] ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
