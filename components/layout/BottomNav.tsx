'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, User, Fingerprint } from 'lucide-react';
import styles from './BottomNav.module.css';
import { clsx } from 'clsx';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/employee', label: 'Home', icon: Home },
        { href: '/employee/leaves', label: 'Leaves', icon: Calendar },
        { href: '/employee/check-in', label: 'Check In', icon: Fingerprint, highlight: true },
        { href: '/employee/profile', label: 'Profile', icon: User },
    ];

    return (
        <nav className={styles.nav}>
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(styles.item, isActive && styles.active, item.highlight && styles.highlight)}
                    >
                        <item.icon size={item.highlight ? 28 : 24} strokeWidth={item.highlight ? 2.5 : 2} />
                        <span className={styles.label}>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
