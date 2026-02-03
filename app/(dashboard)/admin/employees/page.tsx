import { getUsersAction } from '@/app/admin-actions';
import CreateUserForm from '@/components/admin/CreateUserForm';
import UsersList from '@/components/admin/UsersList';

export default async function EmployeesPage() {
    const users = await getUsersAction();

    return (
        <div>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>Employees</h1>
                    <p className="text-muted">Manage your team members.</p>
                </div>
            </header>

            <div style={{ marginBottom: '2rem' }}>
                <CreateUserForm />
            </div>

            <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Team Directory</h3>
                <UsersList users={users || []} />
            </div>
        </div>
    );
}
