
import { useState } from 'react'

function Settings({ onLogout }) {
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setMessage('')
        setError('')

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.')
            return
        }

        if (newPassword.length < 8) {
            setError('New password must contain at least 8 characters.')
            return
        }

        setLoading(true)

        try {
            const token = sessionStorage.getItem('fraudlens_token')

            const response = await fetch(
                'http://127.0.0.1:8000/api/users/change-password/',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                        old_password: oldPassword,
                        new_password: newPassword,
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Unable to change password.')
            }

            setMessage(data.message)
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')

            setTimeout(() => {
                onLogout()
            }, 1500)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="settings-page">
            <div className="settings-header">
                <h2>Settings</h2>
                <p>Manage your FraudLens account and security preferences.</p>
            </div>

            <div className="settings-card">
                <div className="settings-card-heading">
                    <div className="settings-icon">👤</div>
                    <div>
                        <h3>Account Settings</h3>
                        <p>Manage your personal account information.</p>
                    </div>
                </div>

                <div className="settings-info">
                    <p>
                        Update your phone number and organization details
                        from the My Profile section.
                    </p>
                </div>
            </div>

            <div className="settings-card">
                <div className="settings-card-heading">
                    <div className="settings-icon">🔒</div>
                    <div>
                        <h3>Security</h3>
                        <p>Keep your account protected.</p>
                    </div>
                </div>

                <div className="settings-security-note">
                    Your account uses token-based authentication.
                    Never share your password or authentication token.
                </div>

                <div className="settings-divider"></div>

                <h3 className="settings-form-title">Change Password</h3>
                <p className="settings-form-description">
                    Enter your current password and choose a new password.
                </p>

                {message && (
                    <div className="settings-success">{message}</div>
                )}

                {error && (
                    <div className="settings-error">{error}</div>
                )}

                <form
                    className="settings-password-form"
                    onSubmit={handlePasswordChange}
                >
                    <div className="settings-field">
                        <label htmlFor="old-password">
                            Current Password
                        </label>
                        <input
                            id="old-password"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Enter current password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <div className="settings-field">
                        <label htmlFor="new-password">
                            New Password
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                    </div>

                    <div className="settings-field">
                        <label htmlFor="confirm-password">
                            Confirm New Password
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                    </div>

                    <button
                        className="settings-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>

            <div className="settings-card">
                <div className="settings-card-heading">
                    <div className="settings-icon">ℹ️</div>
                    <div>
                        <h3>Application Information</h3>
                        <p>Details about this application.</p>
                    </div>
                </div>

                <div className="settings-app-info">
                    <div>
                        <span>Application</span>
                        <strong>FraudLens</strong>
                    </div>
                    <div>
                        <span>Version</span>
                        <strong>1.0</strong>
                    </div>
                    <div>
                        <span>Type</span>
                        <strong>Machine Learning Fraud Detection System</strong>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
