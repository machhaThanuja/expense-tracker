import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaPen } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import styles from './ProfilePage.module.css';

const ProfilePage = () => {
    const { currentUser, updateUserContext } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [formError, setFormError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                name: currentUser.name || '',
                email: currentUser.email || ''
            }));
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!formData.name || !formData.email) {
            setFormError('Name and email are required');
            return;
        }

        // If changing password, validate passwords
        if (formData.newPassword || formData.currentPassword) {
            if (!formData.currentPassword) {
                setFormError('Current password is required to set a new password');
                return;
            }

            if (!formData.newPassword) {
                setFormError('New password is required');
                return;
            }

            if (formData.newPassword !== formData.confirmNewPassword) {
                setFormError('New passwords do not match');
                return;
            }

            if (formData.newPassword.length < 6) {
                setFormError('New password must be at least 6 characters');
                return;
            }
        }

        setIsLoading(true);
        setFormError(null);
        setSuccessMessage(null);

        try {
            // Prepare data for update
            const updateData = {
                name: formData.name,
                email: formData.email
            };

            // Add password data if changing password
            if (formData.newPassword && formData.currentPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const updatedUser = await updateProfile(updateData);
            updateUserContext(updatedUser);
            setSuccessMessage('Profile updated successfully');
            setIsEditing(false);

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            }));
        } catch (err) {
            console.error('Error updating profile:', err);
            setFormError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading profile...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.header}>
                    <h1>My Profile</h1>
                    <button
                        className={`${styles.editButton} ${isEditing ? styles.saveButton : ''}`}
                        onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
                        disabled={isLoading}
                    >
                        {isEditing ? (
                            <>
                                <FaCheck /> Save
                            </>
                        ) : (
                            <>
                                <FaPen /> Edit
                            </>
                        )}
                    </button>
                </div>

                {formError && (
                    <div className={styles.errorMessage}>
                        {formError}
                    </div>
                )}

                {successMessage && (
                    <div className={styles.successMessage}>
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.profileSection}>
                        <div className={styles.avatarSection}>
                            <div className={styles.avatar}>
                                {currentUser.name.substring(0, 1).toUpperCase()}
                            </div>
                            <div className={styles.userInfo}>
                                <h2>{currentUser.name}</h2>
                                <p>{currentUser.email}</p>
                                <p className={styles.memberSince}>
                                    Member since {new Date(currentUser.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Full Name</label>
                            <div className={styles.inputGroup}>
                                <FaUser className={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Email Address</label>
                            <div className={styles.inputGroup}>
                                <FaEnvelope className={styles.inputIcon} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    required
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <>
                                <div className={styles.divider}>
                                    <span>Change Password (Optional)</span>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Current Password</label>
                                    <div className={styles.inputGroup}>
                                        <FaLock className={styles.inputIcon} />
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>New Password</label>
                                    <div className={styles.inputGroup}>
                                        <FaLock className={styles.inputIcon} />
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Confirm New Password</label>
                                    <div className={styles.inputGroup}>
                                        <FaLock className={styles.inputIcon} />
                                        <input
                                            type="password"
                                            name="confirmNewPassword"
                                            value={formData.confirmNewPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                                <div className={styles.buttonsRow}>
                                    <button
                                        type="button"
                                        className={styles.cancelButton}
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormError(null);
                                            // Reset form data to current user data
                                            setFormData({
                                                name: currentUser.name || '',
                                                email: currentUser.email || '',
                                                currentPassword: '',
                                                newPassword: '',
                                                confirmNewPassword: ''
                                            });
                                        }}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className={styles.saveButton}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;