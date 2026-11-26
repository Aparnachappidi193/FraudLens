
import { useEffect, useState } from 'react'
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    LineChart,
    Line,
    ReferenceLine,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

function Transactions() {
    const [transactions, setTransactions] = useState([])
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [showForm, setShowForm] = useState(false)
    const [editingTransactionId, setEditingTransactionId] = useState(null)
    const [deletingId, setDeletingId] = useState(null)
    const [trendPeriod, setTrendPeriod] = useState('Daily')

    const [formData, setFormData] = useState({
        amount: '',
        transaction_date: '',
        transaction_type: '',
        merchant_name: '',
        location: '',
        description: '',
    })

    const [successMessage, setSuccessMessage] = useState('')
    const [formError, setFormError] = useState('')
    const [saving, setSaving] = useState(false)
    const [analyzingId, setAnalyzingId] = useState(null)
    const [analysisError, setAnalysisError] = useState('')
    const [selectedTransaction, setSelectedTransaction] = useState(null)

    const API_URL = 'http://127.0.0.1:8000/api/transactions/'

    const emptyForm = {
        amount: '',
        transaction_date: '',
        transaction_type: '',
        merchant_name: '',
        location: '',
        description: '',
    }

    // Convert date to the format required by datetime-local input
    const formatDateForInput = (value) => {
        const date = new Date(value)

        if (Number.isNaN(date.getTime())) {
            return ''
        }

        const localDate = new Date(
            date.getTime() - date.getTimezoneOffset() * 60000
        )

        return localDate.toISOString().slice(0, 16)
    }

    // Fetch transactions belonging to the logged-in user
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const token = sessionStorage.getItem('fraudlens_token')

                if (!token) {
                    throw new Error('Authentication token not found')
                }

                const response = await fetch(API_URL, {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch transactions')
                }

                const data = await response.json()

                setTransactions(
                    Array.isArray(data) ? data : data.results || []
                )
            } catch (err) {
                setError('Unable to load transactions.')
            } finally {
                setLoading(false)
            }
        }

        fetchTransactions()
    }, [])

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // Open the form to edit an existing transaction
    const handleEdit = (item) => {
        setEditingTransactionId(item.transaction_id)

        setFormData({
            amount: item.amount,
            transaction_date: formatDateForInput(item.transaction_date),
            transaction_type: item.transaction_type || '',
            merchant_name: item.merchant_name || '',
            location: item.location || '',
            description: item.description || '',
        })

        setShowForm(true)
        setSelectedTransaction(null)
        setFormError('')
        setSuccessMessage('')
        setAnalysisError('')

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }

    // Add a new transaction or update an existing transaction
    const handleSubmit = async (e) => {
        e.preventDefault()

        setSaving(true)
        setFormError('')
        setSuccessMessage('')

        try {
            const token = sessionStorage.getItem('fraudlens_token')

            if (!token) {
                throw new Error('Authentication token not found')
            }

            const isEditing = editingTransactionId !== null

            const url = isEditing
                ? `${API_URL}${encodeURIComponent(editingTransactionId)}/`
                : API_URL

            const requestBody = isEditing
                ? formData
                : {
                    ...formData,
                    transaction_id: `FL-${Date.now()}`,
                }

            const response = await fetch(url, {
                method: isEditing ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Token ${token}`,
                },
                body: JSON.stringify(requestBody),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    typeof data === 'object'
                        ? JSON.stringify(data)
                        : 'Unable to save transaction.'
                )
            }

            if (isEditing) {
                setTransactions((prev) =>
                    prev.map((item) =>
                        item.transaction_id === editingTransactionId
                            ? data
                            : item
                    )
                )

                setSuccessMessage(
                    'Transaction updated successfully! Please analyze it again.'
                )
            } else {
                setTransactions((prev) => [data, ...prev])
                setSuccessMessage('Transaction added successfully!')
            }

            setFormData(emptyForm)
            setEditingTransactionId(null)
            setShowForm(false)

        } catch (err) {
            setFormError(
                'Unable to save transaction. Please check your details.'
            )
        } finally {
            setSaving(false)
        }
    }

    // Delete a transaction
    const handleDelete = async (transactionId) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete transaction ${transactionId}?`
        )

        if (!confirmed) {
            return
        }

        setDeletingId(transactionId)
        setFormError('')
        setSuccessMessage('')

        try {
            const token = sessionStorage.getItem('fraudlens_token')

            if (!token) {
                throw new Error('Authentication token not found')
            }

            const response = await fetch(
                `${API_URL}${encodeURIComponent(transactionId)}/`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Unable to delete transaction.')
            }

            setTransactions((prev) =>
                prev.filter(
                    (item) => item.transaction_id !== transactionId
                )
            )

            if (
                selectedTransaction?.transaction_id === transactionId
            ) {
                setSelectedTransaction(null)
            }

            setSuccessMessage('Transaction deleted successfully!')

        } catch (err) {
            setFormError('Unable to delete transaction. Please try again.')
        } finally {
            setDeletingId(null)
        }
    }

    // Analyze a manually entered transaction
    const handleAnalyze = async (transactionId) => {
        setAnalyzingId(transactionId)
        setAnalysisError('')
        setSuccessMessage('')

        try {
            const token = sessionStorage.getItem('fraudlens_token')

            if (!token) {
                throw new Error('Authentication token not found')
            }

            const response = await fetch(
                'http://127.0.0.1:8000/api/predictions/analyze-manual/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                        transaction_id: transactionId,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(
                    data.error || 'Unable to analyze transaction.'
                )
            }

            setTransactions((prev) =>
                prev.map((item) => {
                    if (item.transaction_id === transactionId) {
                        return {
                            ...item,
                            analysis_status: 'Completed',
                            risk_level: data.risk_level,
                            risk_score: data.risk_score / 100,
                            risk_reasons: data.risk_reasons || [],
                            is_fraud: false,
                        }
                    }

                    return item
                })
            )

            setSuccessMessage(
                `Risk assessment completed for ${transactionId}. Risk level: ${data.risk_level}.`
            )

        } catch (err) {
            setAnalysisError(err.message)
        } finally {
            setAnalyzingId(null)
        }
    }

    // Export transactions to CSV
    const handleExportCSV = () => {
        if (transactions.length === 0) {
            setFormError('No transactions available to export.')
            return
        }

        const headers = [
            'Transaction ID',
            'Amount',
            'Transaction Date',
            'Transaction Type',
            'Merchant Name',
            'Location',
            'Description',
            'Risk Level',
            'Risk Score',
            'Analysis Status',
        ]

        const rows = transactions.map((item) => [
            item.transaction_id,
            item.amount,
            item.transaction_date,
            item.transaction_type,
            item.merchant_name,
            item.location,
            item.description,
            item.risk_level || '',
            item.risk_score != null
                ? Math.round(item.risk_score * 100)
                : '',
            item.analysis_status || 'Pending Analysis',
        ])

        const escapeCSV = (value) => {
            const text = String(value ?? '')
            return `"${text.replace(/"/g, '""')}"`
        }

        const csvContent = [
            headers.map(escapeCSV).join(','),
            ...rows.map((row) => row.map(escapeCSV).join(',')),
        ].join('\n')

        // Add UTF-8 BOM for better Excel compatibility
        const blob = new Blob(
            ['\uFEFF' + csvContent],
            { type: 'text/csv;charset=utf-8;' }
        )

        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.download = 'FraudLens_Transactions.csv'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)

        setSuccessMessage('Transactions exported successfully!')
        setFormError('')
    }


    // Determine transaction status
    const getStatus = (item) => {
        if (item.analysis_status === 'Pending Analysis') {
            return 'Pending Analysis'
        }

        if (item.risk_level) {
            return `${item.risk_level} Risk`
        }

        return item.is_fraud ? 'Fraud' : 'Legitimate'
    }

    // Filter transactions by search and status
    // Filter transactions by search, status, and date range
    const filteredTransactions = transactions.filter((item) => {
        const matchesSearch = (item.transaction_id || '')
            .toLowerCase()
            .includes(search.toLowerCase())

        const status = getStatus(item)

        const matchesStatus =
            statusFilter === 'All' || statusFilter === status

        const transactionDate = item.transaction_date
            ? new Date(item.transaction_date)
            : null

        const matchesStartDate =
            !startDate ||
            (
                transactionDate &&
                !isNaN(transactionDate.getTime()) &&
                transactionDate >= new Date(`${startDate}T00:00:00`)
            )

        const matchesEndDate =
            !endDate ||
            (
                transactionDate &&
                !isNaN(transactionDate.getTime()) &&
                transactionDate <= new Date(`${endDate}T23:59:59.999`)
            )

        return (
            matchesSearch &&
            matchesStatus &&
            matchesStartDate &&
            matchesEndDate
        )
    })

    // Risk Distribution Chart Data
    const riskDistribution = [
        {
            name: 'Low Risk',
            value: transactions.filter(
                (item) => item.risk_level === 'Low'
            ).length,
        },
        {
            name: 'Medium Risk',
            value: transactions.filter(
                (item) => item.risk_level === 'Medium'
            ).length,
        },
        {
            name: 'High Risk',
            value: transactions.filter(
                (item) => item.risk_level === 'High'
            ).length,
        },
        {
            name: 'Pending Analysis',
            value: transactions.filter(
                (item) => item.analysis_status === 'Pending Analysis'
            ).length,
        },
    ].filter((item) => item.value > 0)

    // Transaction Type Distribution Chart Data
    const transactionTypeData = Object.values(
        transactions.reduce((result, item) => {
            const type = item.transaction_type || 'Other'

            if (!result[type]) {
                result[type] = {
                    name: type,
                    count: 0,
                }
            }

            result[type].count += 1

            return result
        }, {})
    )

    // Transaction Amount by Type Chart Data
    const transactionAmountData = Object.values(
        transactions.reduce((result, item) => {
            const type = item.transaction_type || 'Other'

            if (!result[type]) {
                result[type] = {
                    name: type,
                    amount: 0,
                }
            }

            result[type].amount += Number(item.amount || 0)

            return result
        }, {})
    )
    const transactionTrendData = Object.values(
        transactions.reduce((result, item) => {
            if (!item.transaction_date) return result

            const date = new Date(item.transaction_date)

            if (isNaN(date.getTime())) return result

            let key
            let label

            if (trendPeriod === 'Daily') {
                key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
                label = date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short'
                })
            } else if (trendPeriod === 'Weekly') {
                const weekStart = new Date(date)
                weekStart.setHours(0, 0, 0, 0)
                weekStart.setDate(
                    weekStart.getDate() - ((weekStart.getDay() + 6) % 7)
                )

                key = weekStart.getTime()
                label = `Week of ${weekStart.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short'
                })}`
            } else {
                key = `${date.getFullYear()}-${date.getMonth()}`
                label = date.toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric'
                })
            }

            if (!result[key]) {
                result[key] = {
                    date: key,
                    label,
                    count: 0
                }
            }

            result[key].count += 1

            return result
        }, {})
    ).sort((a, b) => {
        if (trendPeriod === 'Daily') {
            return new Date(a.date).getTime() - new Date(b.date).getTime()
        }

        return Number(a.date) - Number(b.date)
    })


    // Transaction Summary Calculations
    const totalTransactions = transactions.length

    const totalAmount = transactions.reduce(
        (total, item) => total + Number(item.amount || 0),
        0
    )

    const highRiskTransactions = transactions.filter(
        (item) => item.risk_level === 'High'
    ).length

    const pendingTransactions = transactions.filter(
        (item) => item.analysis_status === 'Pending Analysis'
    ).length


    return (
        <div className="transactions-page">

            {/* Page Heading */}
            <div className="page-heading">
                <h1>Transactions</h1>
                <p>View and manage your transactions.</p>
            </div>

            {/* Transaction Summary Cards */}
            <div className="transaction-summary-cards">

                <div className="summary-card">
                    <h3>Total Transactions</h3>
                    <p>{totalTransactions}</p>
                </div>

                <div className="summary-card">
                    <h3>Total Amount</h3>
                    <p>₹{totalAmount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}</p>
                </div>

                <div className="summary-card">
                    <h3>High Risk Transactions</h3>
                    <p>{highRiskTransactions}</p>
                </div>

                <div className="summary-card">
                    <h3>Pending Analysis</h3>
                    <p>{pendingTransactions}</p>
                </div>

            </div>

            {/* Transaction Analytics */}
            <div className="transaction-analytics">

                <h2>Transaction Analytics</h2>

                <div className="analytics-grid">

                    {/* Risk Distribution */}
                    <div className="analytics-card">
                        <h3>Risk Distribution</h3>

                        {riskDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={riskDistribution}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        label
                                    >
                                        {riskDistribution.map((entry, index) => (
                                            <Cell
                                                key={`risk-${index}`}
                                                fill={[
                                                    '#16a34a',
                                                    '#f59e0b',
                                                    '#dc2626',
                                                    '#64748b'
                                                ][index]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No transaction data available.</p>
                        )}
                    </div>

                    {/* Transaction Type Distribution */}
                    <div className="analytics-card">
                        <h3>Transaction Type Distribution</h3>

                        {transactionTypeData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={transactionTypeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="count"
                                        name="Transactions"
                                        fill="#2563eb"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No transaction data available.</p>
                        )}
                    </div>

                    {/* Transaction Amount Analysis */}
                    <div className="analytics-card amount-analytics-card">
                        <h3>Transaction Amount by Type</h3>

                        {transactionAmountData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={transactionAmountData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) =>
                                            `₹${Number(value).toLocaleString('en-IN')}`
                                        }
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="amount"
                                        name="Total Amount (₹)"
                                        fill="#0f766e"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No transaction data available.</p>
                        )}
                    </div>
                    <div className="analytics-card trend-analytics-card">
                        <div className="trend-chart-header">
                            <h3>Transaction Trends</h3>

                            <select
                                value={trendPeriod}
                                onChange={(e) => setTrendPeriod(e.target.value)}
                            >
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                            </select>
                        </div>

                        {transactionTrendData.length === 0 ? (
                            <p>No transaction data available.</p>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={transactionTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="label" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Transactions"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                </div>
            </div>



            {/* Add Transaction Button */}

            <div className="transaction-actions">

                <button
                    type="button"
                    className="add-transaction-btn"
                    onClick={() => {
                        setShowForm(!showForm)
                        setEditingTransactionId(null)
                        setFormData(emptyForm)
                        setFormError('')
                        setSuccessMessage('')
                    }}
                >
                    {showForm ? 'Cancel' : '+ Add Transaction'}
                </button>

                <button
                    type="button"
                    className="export-transaction-btn"
                    onClick={handleExportCSV}
                >
                    Export CSV
                </button>

            </div>


            {/* Success Message */}
            {successMessage && (
                <p className="success-message">
                    {successMessage}
                </p>
            )}

            {/* Error Messages */}
            {formError && (
                <p className="error-message">{formError}</p>
            )}

            {analysisError && (
                <p className="error-message">{analysisError}</p>
            )}

            {/* Add / Edit Transaction Form */}
            {showForm && (
                <div className="transaction-form-container">

                    <h2>
                        {editingTransactionId
                            ? 'Edit Transaction'
                            : 'Add New Transaction'}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        <div className="transaction-form-grid">

                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleInputChange}
                                    placeholder="Enter amount"
                                    min="0.01"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Transaction Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="transaction_date"
                                    value={formData.transaction_date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Transaction Type</label>
                                <select
                                    name="transaction_type"
                                    value={formData.transaction_type}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">
                                        Select transaction type
                                    </option>
                                    <option value="Online Payment">
                                        Online Payment
                                    </option>
                                    <option value="UPI">UPI</option>
                                    <option value="Credit Card">
                                        Credit Card
                                    </option>
                                    <option value="Debit Card">
                                        Debit Card
                                    </option>
                                    <option value="Bank Transfer">
                                        Bank Transfer
                                    </option>
                                    <option value="Cash">Cash</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Merchant Name</label>
                                <input
                                    type="text"
                                    name="merchant_name"
                                    value={formData.merchant_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter merchant name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Enter location"
                                />
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Enter transaction description"
                                />
                            </div>

                        </div>

                        <button
                            type="submit"
                            className="save-transaction-btn"
                            disabled={saving}
                        >
                            {saving
                                ? 'Saving...'
                                : editingTransactionId
                                    ? 'Update Transaction'
                                    : 'Save Transaction'}
                        </button>

                        {editingTransactionId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false)
                                    setEditingTransactionId(null)
                                    setFormData(emptyForm)
                                    setFormError('')
                                }}
                            >
                                Cancel Edit
                            </button>
                        )}

                    </form>
                </div>
            )}

            {/* Search and Status Filters */}
            <div className="transaction-filters">

                <input
                    type="text"
                    placeholder="Search by Transaction ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Transactions</option>
                    <option value="Fraud">Fraud Only</option>
                    <option value="Legitimate">Legitimate Only</option>
                    <option value="Pending Analysis">
                        Pending Analysis
                    </option>
                    <option value="Low Risk">Low Risk</option>
                    <option value="Medium Risk">Medium Risk</option>
                    <option value="High Risk">High Risk</option>
                </select>
                <div className="date-filter-group">
                    <label>From:</label>
                    <input
                        type="date"
                        value={startDate}
                        max={endDate || undefined}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <label>To:</label>
                    <input
                        type="date"
                        value={endDate}
                        min={startDate || undefined}
                        onChange={(e) => setEndDate(e.target.value)}
                    />

                    <button
                        type="button"
                        onClick={() => {
                            setStartDate('')
                            setEndDate('')
                        }}
                    >
                        Clear Dates
                    </button>
                </div>

            </div>

            {/* Loading and Error Messages */}
            {loading && <p>Loading transactions...</p>}

            {error && (
                <p className="error-message">{error}</p>
            )}

            {/* Transactions Table */}
            {!loading && !error && (
                <div className="transactions-table-container">

                    <table className="transactions-table">

                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Amount</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                                <th>Risk Score</th>
                                <th>Risk Reasons</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredTransactions.map((item) => {
                                const status = getStatus(item)

                                const statusClass =
                                    status === 'Pending Analysis'
                                        ? 'status-pending'
                                        : status === 'Fraud' ||
                                            status === 'High Risk'
                                            ? 'status-fraud'
                                            : status === 'Medium Risk'
                                                ? 'status-medium'
                                                : 'status-legitimate'

                                return (
                                    <tr key={item.id}>

                                        <td>{item.transaction_id}</td>

                                        <td>
                                            ₹{Number(item.amount).toFixed(2)}
                                        </td>

                                        <td>
                                            {new Date(
                                                item.transaction_date
                                            ).toLocaleString()}
                                        </td>

                                        <td>
                                            <span className={statusClass}>
                                                {status}
                                            </span>
                                        </td>

                                        <td>
                                            {item.risk_score !== undefined &&
                                                item.risk_score !== null
                                                ? `${Math.round(item.risk_score * 100)}/100`
                                                : '—'}
                                        </td>

                                        <td>
                                            {item.risk_reasons?.length > 0 ? (
                                                <ul className="risk-reasons-list">
                                                    {item.risk_reasons.map(
                                                        (reason, index) => (
                                                            <li key={index}>
                                                                {reason}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                <span>—</span>
                                            )}
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="view-transaction-btn"
                                                onClick={() =>
                                                    setSelectedTransaction(item)
                                                }
                                            >
                                                View
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleEdit(item)}
                                                disabled={saving || deletingId !== null}
                                            >
                                                Edit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(item.transaction_id)
                                                }
                                                disabled={
                                                    deletingId !== null ||
                                                    saving
                                                }
                                            >
                                                {deletingId === item.transaction_id
                                                    ? 'Deleting...'
                                                    : 'Delete'}
                                            </button>

                                            {status === 'Pending Analysis' && (
                                                <button
                                                    type="button"
                                                    className="analyze-transaction-btn"
                                                    onClick={() =>
                                                        handleAnalyze(item.transaction_id)
                                                    }
                                                    disabled={analyzingId !== null}
                                                >
                                                    {analyzingId === item.transaction_id
                                                        ? 'Analyzing...'
                                                        : 'Analyze'}
                                                </button>
                                            )}
                                        </td>

                                    </tr>
                                )
                            })}

                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan="7">
                                        No transactions found.
                                    </td>
                                </tr>
                            )}

                        </tbody>

                    </table>

                </div>
            )}

            {/* Transaction Details Popup */}
            {selectedTransaction && (
                <div className="transaction-modal-overlay">
                    <div className="transaction-modal">

                        <h2>Transaction Details</h2>

                        <p>
                            <strong>Transaction ID:</strong>{' '}
                            {selectedTransaction.transaction_id}
                        </p>

                        <p>
                            <strong>Amount:</strong>{' '}
                            ₹{Number(selectedTransaction.amount).toFixed(2)}
                        </p>

                        <p>
                            <strong>Date:</strong>{' '}
                            {new Date(
                                selectedTransaction.transaction_date
                            ).toLocaleString()}
                        </p>

                        <p>
                            <strong>Transaction Type:</strong>{' '}
                            {selectedTransaction.transaction_type || '—'}
                        </p>

                        <p>
                            <strong>Merchant:</strong>{' '}
                            {selectedTransaction.merchant_name || '—'}
                        </p>

                        <p>
                            <strong>Location:</strong>{' '}
                            {selectedTransaction.location || '—'}
                        </p>

                        <p>
                            <strong>Description:</strong>{' '}
                            {selectedTransaction.description || '—'}
                        </p>

                        <p>
                            <strong>Risk Level:</strong>{' '}
                            {selectedTransaction.risk_level
                                ? `${selectedTransaction.risk_level} Risk`
                                : 'Pending Analysis'}
                        </p>

                        <p>
                            <strong>Risk Score:</strong>{' '}
                            {selectedTransaction.risk_score !== null &&
                                selectedTransaction.risk_score !== undefined
                                ? `${Math.round(selectedTransaction.risk_score * 100)}/100`
                                : '—'}
                        </p>

                        <strong>Risk Reasons:</strong>

                        {selectedTransaction.risk_reasons?.length > 0 ? (
                            <ul>
                                {selectedTransaction.risk_reasons.map(
                                    (reason, index) => (
                                        <li key={index}>{reason}</li>
                                    )
                                )}
                            </ul>
                        ) : (
                            <p>No risk reasons available.</p>
                        )}

                        <button
                            type="button"
                            onClick={() => handleEdit(selectedTransaction)}
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleDelete(selectedTransaction.transaction_id)
                            }
                        >
                            Delete
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedTransaction(null)}
                        >
                            Close
                        </button>

                    </div>
                </div>
            )}

        </div>
    )
}

export default Transactions
