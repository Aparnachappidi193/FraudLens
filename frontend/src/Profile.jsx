
import { useState, useEffect } from 'react'

function Profile() {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        phone_number: '',
        organization: '',
    })

    const [loading, setLoading] = useState(true)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    const token = sessionStorage.getItem('fraudlens_token')

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(
                    'http://127.0.0.1:8000/api/users/profile/',
                    {
                        headers: {
                            Authorization: `Token ${token}`,
                        },
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(
                        data.detail || 'Unable to load profile.'
                    )
                }

                setProfile(data)

            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            fetchProfile()
        } else {
            setError('Please log in to view your profile.')
            setLoading(false)
        }
    }, [token])

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        })

        setMessage('')
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage('')
        setError('')

        const phone = profile.phone_number.trim()

        if (phone && !/^[+]?[0-9\s-]{10,15}$/.test(phone)) {
            setError('Please enter a valid phone number.')
            return
        }

        setSaving(true)

        try {
            const response = await fetch(
                'http://127.0.0.1:8000/api/users/profile/',
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify({
                        phone_number: phone,
                        organization: profile.organization.trim(),
                    }),
                }
            )

            const data = await response.json()

            if (!response.ok) {
                const detail = data.detail ||
                    Object.values(data).flat().join(' ')

                throw new Error(
                    detail || 'Unable to update profile.'
                )
            }

            setProfile(data)
            setMessage('Profile updated successfully!')

        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="profile-loading">
                Loading your profile...
            </div>
        )
    }

    const completedFields = [
        profile.username,
        profile.email,
        profile.phone_number,
        profile.organization,
    ].filter(value => String(value || '').trim()).length

    const completion = Math.round(
        (completedFields / 4) * 100
    )

    return (
        <div className="profile-page">
            <div className="profile-header">
                <h2>My Profile</h2>
                <p>View and manage your personal account information.</p>
            </div>

            <div className="profile-card">

                <div className="profile-card-heading">
                    <div className="profile-avatar">👤</div>
                    <div>
                        <h3>Personal Information</h3>
                        <p>Manage your profile details below.</p>
                    </div>
                </div>

                <div className="profile-completion">
                    <div className="profile-completion-heading">
                        <strong>Profile Completion</strong>
                        <strong>{completion}%</strong>
                    </div>

                    <div className="profile-progress-track">
                        <div
                            className="profile-progress-fill"
                            style={{ width: `${completion}%` }}
                        />
                    </div>
                </div>

                {error && (
                    <div className="profile-error">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="profile-success">
                        {message}
                    </div>
                )}

                <form
                    className="profile-form"
                    onSubmit={handleSubmit}
                >
                    <div className="profile-field">
                        <label htmlFor="profile-username">
                            Username
                        </label>

                        <input
                            id="profile-username"
                            type="text"
                            value={profile.username}
                            readOnly
                        />

                        <span className="profile-hint">
                            Username cannot be changed.
                        </span>
                    </div>

                    <div className="profile-field">
                        <label htmlFor="profile-email">
                            Email Address
                        </label>

                        <input
                            id="profile-email"
                            type="email"
                            value={profile.email}
                            readOnly
                        />

                        <span className="profile-hint">
                            Email address is read-only.
                        </span>
                    </div>

                    <div className="profile-field">
                        <label htmlFor="profile-phone">
                            Phone Number
                        </label>

                        <input
                            id="profile-phone"
                            type="tel"
                            name="phone_number"
                            value={profile.phone_number || ''}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            maxLength={15}
                        />
                    </div>

                    <div className="profile-field">
                        <label htmlFor="profile-organization">
                            Organization
                        </label>

                        <input
                            id="profile-organization"
                            type="text"
                            name="organization"
                            value={profile.organization || ''}
                            onChange={handleChange}
                            placeholder="Enter organization"
                        />
                    </div>

                    <button
                        className="profile-save-button"
                        type="submit"
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default Profile
