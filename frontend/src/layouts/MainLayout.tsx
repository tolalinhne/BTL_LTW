import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/user/Header';
import Footer from '@/components/user/Footer';
import ChatWidget from '@/components/user/chat/ChatWidget';

export default function MainLayout() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="flex flex-col min-h-screen bg-brand-bg text-brand-primary">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
            <ChatWidget />
        </div>
    );
}
