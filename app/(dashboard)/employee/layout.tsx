import BottomNav from '@/components/layout/BottomNav';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-background)' }}>
            <main style={{ paddingBottom: '90px', paddingTop: '1rem' }}>
                <div className="container">
                    {children}
                </div>
            </main>
            <BottomNav />
        </div>
    );
}
