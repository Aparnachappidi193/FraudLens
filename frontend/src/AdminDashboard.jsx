
import { useEffect, useState } from 'react'
import './AdminDashboard.css'

function AdminDashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const token = sessionStorage.getItem('fraudlens_token')

                const response = await fetch(
                    'http://127.0.0.1:8000/api/users/admin-dashboard/',
                    {
                        headers: {
                            Authorization: `Token ${token}`
                        }
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.detail || 'Unable to load admin statistics')
                }

                setStats(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchAdminStats()
    }, [])

    const cards = [
        { title: 'Total Users', value: stats?.total_users, icon: '👥' },
        { title: 'Total Transactions', value: stats?.total_transactions, icon: '💳' },
        { title: 'High Risk', value: stats?.high_risk_transactions, icon: '🚨' },
        { title: 'Medium Risk', value: stats?.medium_risk_transactions, icon: '⚠️' },
        { title: 'Low Risk', value: stats?.low_risk_transactions, icon: '✅' },
        { title: 'Pending Analysis', value: stats?.pending_analysis, icon: '⏳' }
    ]

    return (
        <main className="main-content admin-dashboard">
            <header className="admin-header">
                <div>
                    <h1>Administrator Dashboard</h1>
                    <p>Monitor users and transaction risk across FraudLens.</p>
                </div>
            </header>

            {loading ? (
                <p>Loading administrator statistics...</p>
            ) : error ? (
                <p className="admin-error">{error}</p>
            ) : (
                <>
                    <section className="admin-stats">
                        {cards.map((card) => (
                            <div className="admin-stat-card" key={card.title}>
                                <span className="admin-stat-icon">{card.icon}</span>
                                <p>{card.title}</p>
                                <h2>{card.value ?? 0}</h2>
                            </div>
                        ))}
                    </section>

                    <section className="admin-info">
                        <h2>System Overview</h2>
                        <p>
                            Total registered users: <strong>{stats.total_users}</strong>
                        </p>
                        <p>
                            Total recorded transactions: <strong>{stats.total_transactions}</strong>
                        </p>
                        <p>
                            Transactions awaiting analysis: <strong>{stats.pending_analysis}</strong>
                        </p>
                    </section>
                </>
            )}
        </main>
    )
}

export default AdminDashboard
