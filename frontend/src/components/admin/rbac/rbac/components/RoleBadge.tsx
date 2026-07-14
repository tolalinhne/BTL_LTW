import React from 'react';
import type { RBACRole } from '@/types/admin.types';

interface RoleBadgeProps {
    role: RBACRole;
    size?: 'sm' | 'md';
}

export default function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
    const color = role.color || '#6b7280';
    const isSm = size === 'sm';

    return (
        <span
            className={`inline-flex items-center gap-1 font-medium rounded-full border ${isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
                }`}
            style={{
                backgroundColor: `${color}15`,
                color,
                borderColor: `${color}30`,
            }}
        >
            {role.isSystem && role.id === 'superadmin' && (
                <svg className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            )}
            {role.name}
        </span>
    );
}
