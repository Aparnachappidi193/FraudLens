import AdminDashboard from './AdminDashboard'
import AdminUsers from './AdminUsers';
import { useState, useEffect } from 'react'
import FraudDetection from './FraudDetection'
import Transactions from './Transactions'
import Analytics from './Analytics'
import ModelPerformance from './ModelPerformance'
import Login from './Login'
import Register from './Register'
import Profile from './Profile'
import Settings from './Settings'
import './App.css'



function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [transactions, setTransactions] = useState([])
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [token, setToken] = useState(
    sessionStorage.getItem('fraudlens_token')
  )

  const [showRegister, setShowRegister] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // const handleLogin = (authToken) => {
  //   sessionStorage.setItem('fraudlens_token', authToken)
  //   setToken(authToken)
  // }

  const handleLogin = (authToken) => {
    console.log('Received token:', authToken)

    sessionStorage.setItem('fraudlens_token', authToken)

    console.log(
      'Stored token:',
      sessionStorage.getItem('fraudlens_token')
    )

    setToken(authToken)
  }

  const handleLogout = async () => {
    const authToken = sessionStorage.getItem('fraudlens_token')

    try {
      await fetch('http://127.0.0.1:8000/api/users/logout/', {
        method: 'POST',
        headers: {
          Authorization: `Token ${authToken}`,
        },
      })
    } catch (error) {
      console.error('Logout API Error:', error)
    } finally {
      sessionStorage.removeItem('fraudlens_token')
      setToken(null)
      setCurrentUser(null)
      setShowRegister(false)
      setActivePage('Dashboard')
    }
  }

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) return

      try {
        const response = await fetch(
          'http://127.0.0.1:8000/api/users/me/',
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        )

        if (!response.ok) {
          throw new Error('Unable to fetch user details')
        }

        const data = await response.json()
        setCurrentUser(data)

      } catch (error) {
        console.error('User API Error:', error)
      }
    }

    fetchCurrentUser()
  }, [token])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!token) {
          setLoading(false)
          return
        }

        const authHeaders = {
          Authorization: `Token ${token}`,
        }

        const [transactionsResponse, predictionsResponse] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/transactions/', {
            headers: authHeaders,
          }),
          fetch('http://127.0.0.1:8000/api/predictions/', {
            headers: authHeaders,
          }),
        ])
        if (!transactionsResponse.ok || !predictionsResponse.ok) {
          throw new Error('Unable to fetch dashboard data')
        }

        const transactionsData = await transactionsResponse.json()
        const predictionsData = await predictionsResponse.json()

        setTransactions(transactionsData)
        setPredictions(predictionsData)

      } catch (error) {
        console.error('Dashboard API Error:', error)
        setApiError('Unable to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [activePage, token])

  const totalTransactions = transactions.length

  const highRiskCount = transactions.filter(
    (item) => item.risk_level === 'High'
  ).length

  const mediumRiskCount = transactions.filter(
    (item) => item.risk_level === 'Medium'
  ).length

  const lowRiskCount = transactions.filter(
    (item) => item.risk_level === 'Low'
  ).length

  const pendingCount = transactions.filter(
    (item) => item.analysis_status === 'Pending Analysis'
  ).length

  const alerts = transactions
    .filter((item) =>
      ['High', 'Medium'].includes(item.risk_level) ||
      item.analysis_status === 'Pending Analysis'
    )
    .map((item) => ({
      ...item,
      alertType:
        item.risk_level === 'High'
          ? 'High Risk'
          : item.risk_level === 'Medium'
            ? 'Medium Risk'
            : 'Pending Analysis',
      alertMessage:
        item.risk_level === 'High'
          ? 'This transaction requires immediate review.'
          : item.risk_level === 'Medium'
            ? 'Review this transaction for potential risk indicators.'
            : 'This transaction has not been assessed yet.'
    }))
    .slice(0, 6)

  if (!token) {
    return showRegister ? (
      <Register
        onRegistered={() => setShowRegister(false)}
        onShowLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
      />
    )
  }
  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">🛡 FraudLens</h2>

        <nav>
          <a
            href="#"
            className={activePage === 'Dashboard' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              setActivePage('Dashboard')
            }}
          >
            Dashboard
          </a>

          <a
            href="#"
            className={activePage === 'Fraud Detection' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              setActivePage('Fraud Detection')
            }}
          >
            Fraud Detection
          </a>

          <a
            href="#"
            className={activePage === 'Transactions' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              setActivePage('Transactions')
            }}
          >
            Transactions
          </a>
          <a
            href="#"
            className={activePage === 'Analytics' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              setActivePage('Analytics')
            }}
          >
            Analytics
          </a>
          <a
            href="#"
            className={activePage === 'Model Performance' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              setActivePage('Model Performance')
            }}
          >
            Model Performance
          </a>
          <a
            href="#"
            className={activePage === 'Profile' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              setActivePage('Profile')
            }}
          >
            My Profile
          </a>

          {currentUser && (currentUser.is_staff || currentUser.is_superuser) && (
            <>
              <a
                href="#"
                className={activePage === 'Admin Dashboard' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  setActivePage('Admin Dashboard')
                }}
              >
                Admin Dashboard
              </a>

              <a
                href="#"
                className={activePage === 'Admin Users' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault()
                  setActivePage('Admin Users')
                }}
              >
                Admin Users
              </a>
            </>
          )}

        </nav>

        <div className="sidebar-bottom">
          <a
            href="#"
            className={activePage === 'Settings' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault()
              setActivePage('Settings')
            }}
          >
            Settings
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault()
              handleLogout()
            }}
          >
            Logout
          </a>
        </div>
      </aside>

      {activePage === 'Dashboard' ? (
        <main className="main-content">
          <header className="topbar">
            <div>
              <h1>Fraud Detection Dashboard</h1>
              <p>Monitor and analyze transaction risks</p>
            </div>
            {currentUser && (
              <div className="profile">
                Welcome, {currentUser.username}
              </div>
            )}

            {currentUser && (currentUser.is_staff || currentUser.is_superuser) && (
              <a
                href="http://127.0.0.1:8000/admin/"
                target="_blank"
                rel="noopener noreferrer"
                className="profile"
              >
                Administrator
              </a>
            )}
          </header>
          {apiError && (
            <div className="error-message">
              {apiError}
            </div>
          )}

          <section className="welcome">
            <h2>Welcome to FraudLens</h2>
            <p>
              Monitor financial transactions and review rule-based risk assessments.
            </p>
          </section>

          <section className="stats">
            <div className="stat-card">
              <p>Total Transactions</p>
              <h2>{loading ? '...' : totalTransactions}</h2>
              <span>Recorded transactions</span>
            </div>

            <div className="stat-card">
              <p>High Risk</p>
              <h2>{loading ? '...' : highRiskCount}</h2>
              <span>Transactions requiring attention</span>
            </div>

            <div className="stat-card">
              <p>Medium Risk</p>
              <h2>{loading ? '...' : mediumRiskCount}</h2>
              <span>Transactions requiring review</span>
            </div>

            <div className="stat-card">
              <p>Low Risk</p>
              <h2>{loading ? '...' : lowRiskCount}</h2>
              <span>Lower assessed risk</span>
            </div>

            <div className="stat-card">
              <p>Pending Analysis</p>
              <h2>{loading ? '...' : pendingCount}</h2>
              <span>Awaiting assessment</span>
            </div>
          </section>

          <section className="content-card alerts-section">
            <div className="alerts-heading">
              <div>
                <h2>Alerts & Notifications</h2>
                <p>Transactions that may require your attention.</p>
              </div>

              <span className="alerts-count">
                {alerts.length} Alerts
              </span>
            </div>

            {alerts.length === 0 ? (
              <div className="no-alerts">
                <h3>No Pending Alerts</h3>
                <p>
                  No high-risk, medium-risk, or pending transactions
                  are currently listed.
                </p>
              </div>
            ) : (
              <div className="alerts-list">
                {alerts.map((item) => (
                  <div
                    className={`alert-item alert-${item.alertType
                      .toLowerCase()
                      .replaceAll(' ', '-')}`}
                    key={item.transaction_id}
                  >
                    <div className="alert-icon">
                      {item.alertType === 'High Risk'
                        ? '⚠️'
                        : item.alertType === 'Medium Risk'
                          ? '🔔'
                          : '⏳'}
                    </div>

                    <div className="alert-details">
                      <h3>{item.alertType}</h3>
                      <p>{item.alertMessage}</p>
                      <span>
                        Transaction ID: {item.transaction_id}
                      </span>
                      <span>
                        Amount: ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setActivePage('Transactions')}
            >
              View All Transactions
            </button>
          </section>


          <section className="content-card">
            <h2>Transaction Risk Assessment</h2>
            <p>
              Review transaction details and identify potential risk indicators
              using FraudLens risk assessment.
            </p>
            <button onClick={() => setActivePage('Transactions')}>
              Manage Transactions
            </button>
          </section>
        </main>
      ) : activePage === 'Fraud Detection' ? (
        <FraudDetection />
      ) : activePage === 'Transactions' ? (
        <main className="main-content">
          <Transactions />
        </main>
      ) : activePage === 'Analytics' ? (
        <Analytics />
      ) : activePage === 'Model Performance' ? (
        <ModelPerformance />
      ) : activePage === 'Profile' ? (
        <main className="main-content">
          <Profile />
        </main>
      ) : activePage === 'Settings' ? (
        <main className="main-content">
          <Settings onLogout={handleLogout} />
        </main>
      ) : activePage === 'Admin Dashboard' &&
        currentUser && (currentUser.is_staff || currentUser.is_superuser) ? (
        <AdminDashboard />
      ) : activePage === 'Admin Users' &&
        currentUser && (currentUser.is_staff || currentUser.is_superuser) ? (
        <AdminUsers />
      ) : null}
    </div>
  )
}

export default App
