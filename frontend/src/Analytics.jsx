
import { useEffect, useState } from 'react'

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title
} from 'chart.js'

import { Doughnut, Line, Bar } from 'react-chartjs-2'

import './App.css'

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title
)

function Analytics() {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = sessionStorage.getItem('fraudlens_token')

                const response = await fetch(
                    'http://127.0.0.1:8000/api/transactions/',
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                )

                if (!response.ok) {
                    throw new Error('Unable to fetch transactions')
                }

                const data = await response.json()

                setTransactions(Array.isArray(data) ? data : data.results || [])
            } catch (err) {
                setError('Unable to load analytics data.')
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [])

    const fraudCount = transactions.filter(
        (item) => item.is_fraud
    ).length

    const legitimateCount = transactions.length - fraudCount

    const doughnutData = {
        labels: ['Fraud', 'Legitimate'],
        datasets: [{
            data: [fraudCount, legitimateCount],
            backgroundColor: ['#ef4444', '#22c55e'],
            borderWidth: 0
        }]
    }

    const dailyData = {}

    transactions.forEach((item) => {
        const date = new Date(item.transaction_date)
            .toLocaleDateString()

        dailyData[date] = (dailyData[date] || 0) + 1
    })

    const lineData = {
        labels: Object.keys(dailyData),
        datasets: [{
            label: 'Transactions',
            data: Object.values(dailyData),
            borderColor: '#6366f1',
            backgroundColor: '#6366f1',
            tension: 0.3
        }]
    }

    const barData = {
        labels: ['Fraud', 'Legitimate'],
        datasets: [{
            label: 'Number of Transactions',
            data: [fraudCount, legitimateCount],
            backgroundColor: ['#ef4444', '#22c55e'],
            borderRadius: 6
        }]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }

    if (loading) {
        return <main className="main-content">Loading analytics...</main>
    }

    if (error) {
        return <main className="main-content">{error}</main>
    }

    return (
        <main className="main-content analytics-page">
            <div className="page-heading">
                <h1>Analytics Overview</h1>
                <p>Visual insights into transaction activity and fraud detection.</p>
            </div>

            <section className="stats">
                <div className="stat-card">
                    <p>Total Transactions</p>
                    <h2>{transactions.length}</h2>
                </div>

                <div className="stat-card">
                    <p>Fraud Detected</p>
                    <h2>{fraudCount}</h2>
                </div>

                <div className="stat-card">
                    <p>Legitimate Transactions</p>
                    <h2>{legitimateCount}</h2>
                </div>
            </section>

            <section className="analytics-grid">
                <div className="analytics-card">
                    <h2>Fraud vs Legitimate</h2>
                    <div className="chart-container">
                        <Doughnut data={doughnutData} options={chartOptions} />
                    </div>
                </div>

                <div className="analytics-card">
                    <h2>Daily Transaction Activity</h2>
                    <div className="chart-container">
                        <Line data={lineData} options={chartOptions} />
                    </div>
                </div>

                <div className="analytics-card">
                    <h2>Transaction Statistics</h2>
                    <div className="chart-container">
                        <Bar data={barData} options={chartOptions} />
                    </div>
                </div>
            </section>
        </main>
    )
}

export default Analytics
