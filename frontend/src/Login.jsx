
import { useState } from 'react'

function Login({ onLogin, onShowRegister }) {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/api/users/login/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Login failed')
            }

            onLogin(data.token)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <form className="login-panel" onSubmit={handleLogin}>
                <div className="login-brand">
                    <span className="login-brand-icon">🛡️</span>
                    <h1>FraudLens</h1>
                    <p>Intelligent Financial Fraud Detection</p>
                </div>

                <div className="login-heading">
                    <h2>Welcome Back</h2>
                    <p>Sign in to access your dashboard.</p>
                </div>

                {error && (
                    <div className="login-error">{error}</div>
                )}

                <div className="login-field">
                    <label htmlFor="login-username">Username</label>
                    <input
                        id="login-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="login-field">
                    <label htmlFor="login-password">Password</label>
                    <input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                    />
                </div>

                <button
                    className="login-submit"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login to Dashboard'}
                </button>

                <div className="login-register">
                    <span>Don't have an account?</span>
                    <button type="button" onClick={onShowRegister}>
                        Create Account
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Login
