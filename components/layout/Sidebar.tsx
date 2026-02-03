'use client';

import { logoutAction } from '@/app/actions';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Hexagon, Clock } from 'lucide-react';
import styles from './Sidebar.module.css';
import { clsx } from 'clsx';

import { useState, useEffect } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Update layout margin when sidebar collapses
    useEffect(() => {
        const root = document.documentElement;
        if (isCollapsed) {
            root.style.setProperty('--sidebar-width', '80px');
        } else {
            root.style.setProperty('--sidebar-width', '260px');
        }
    }, [isCollapsed]);

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);

    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/employees', label: 'Employees', icon: Users },
        { href: '/admin/attendance', label: 'Attendance', icon: Clock },
        { href: '/admin/reports', label: 'Reports', icon: FileText },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className={clsx(styles.sidebar, isCollapsed && styles.collapsed)}>
            <div className={styles.logoContainer}>
                <button
                    onClick={toggleSidebar}
                    className={styles.logoToggle}
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <Hexagon fill="currentColor" size={28} />
                </button>
                {!isCollapsed && <span className={styles.logoText}>AttendX</span>}
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(styles.item, isActive && styles.active)}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon size={20} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <form action={logoutAction} style={{ width: '100%' }}>
                    <button
                        type="submit"
                        className={styles.item}
                        style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}
                        title={isCollapsed ? "Sign Out" : undefined}
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span>Sign Out</span>}
                    </button>
                </form>
            </div>
        </aside>
    );
}
