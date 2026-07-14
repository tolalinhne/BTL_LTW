import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

export default function AdminLayout() {
    return (
        <div className="flex h-screen overflow-hidden bg-background-light">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
