
import { useState } from 'react'

function Register({ onRegistered, onShowLogin }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone_number: '',
        organization: '',
    })

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/api/users/register/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                const messages = Object.entries(data)
                    .map(([field, errors]) => `${field}: ${errors}`)
                    .join(', ')

                throw new Error(messages || 'Registration failed')
            }

            alert('Registration successful! Please login.')
            onRegistered()

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="register-page">
            <form className="register-panel" onSubmit={handleRegister}>
                <div className="register-brand">
                    <span className="register-brand-icon">🛡️</span>
                    <h1>FraudLens</h1>
                    <p>Intelligent Financial Fraud Detection</p>
                </div>

                <div className="register-heading">
                    <h2>Create Account</h2>
                    <p>Join FraudLens to assess transaction risks.</p>
                </div>

                {error && (
                    <div className="register-error">{error}</div>
                )}

                <div className="register-field">
                    <label htmlFor="register-username">Username</label>
                    <input
                        id="register-username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Choose a username"
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="register-field">
                    <label htmlFor="register-email">Email Address</label>
                    <input
                        id="register-email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="register-field">
                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />
                </div>

                <div className="register-field">
                    <label htmlFor="register-phone">
                        Phone Number <span>(Optional)</span>
                    </label>
                    <input
                        id="register-phone"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        autoComplete="tel"
                    />
                </div>

                <div className="register-field">
                    <label htmlFor="register-organization">
                        Organization <span>(Optional)</span>
                    </label>
                    <input
                        id="register-organization"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        placeholder="Enter organization"
                        autoComplete="organization"
                    />
                </div>

                <button
                    className="register-submit"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>

                <div className="register-login">
                    <span>Already have an account?</span>
                    <button type="button" onClick={onShowLogin}>
                        Login
                    </button>
                </div>
            </form>
        </div>
    )
}

export default Register
