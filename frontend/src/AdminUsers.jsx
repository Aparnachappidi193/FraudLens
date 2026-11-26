
import { useEffect, useState } from 'react';
import './AdminUsers.css';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = sessionStorage.getItem('fraudlens_token');

                const response = await fetch(
                    'http://127.0.0.1:8000/api/users/admin-users/',
                    {
                        headers: {
                            Authorization: `Token ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Unable to load users.');
                }

                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return <div className="admin-users-page">Loading users...</div>;
    }

    if (error) {
        return <div className="admin-users-page admin-users-error">{error}</div>;
    }

    return (
        <div className="admin-users-page">
            <div className="admin-users-header">
                <div>
                    <h2>User Management</h2>
                    <p>View and monitor registered FraudLens users.</p>
                </div>

                <div className="admin-users-total">
                    Total Users: {users.length}
                </div>
            </div>

            <div className="admin-users-search">
                <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="admin-users-table-wrapper">
                <table className="admin-users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Registration Date</th>
                            <th>Status</th>
                            <th>Transactions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.username}</td>
                                    <td>{user.email || 'Not provided'}</td>
                                    <td>
                                        {new Date(user.date_joined).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className={
                                            user.is_active
                                                ? 'admin-user-active'
                                                : 'admin-user-inactive'
                                        }>
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>{user.transaction_count}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="admin-users-empty">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminUsers;
