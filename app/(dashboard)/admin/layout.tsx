import Sidebar from '@/components/layout/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{
                flex: 1,
                marginLeft: 'var(--sidebar-width, 260px)',
                padding: '2rem',
                background: 'var(--color-background)',
                transition: 'margin-left 0.3s var(--ease-spring)'
            }}>
                <div className="container">
                    {children}
                </div>
            </main>
        </div>
    );
}
