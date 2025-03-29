import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css'; // Reusing the login page styles

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [formError, setFormError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { registerUser, error } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, email, password, confirmPassword } = formData;

        // Validate form
        if (!name || !email || !password || !confirmPassword) {
            setFormError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setFormError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setFormError(null);

        try {
            await registerUser(name, email, password);
            navigate('/');
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                    <h1>Create Account</h1>
                    <p>Sign up to get started</p>
                </div>

                {(formError || error) && (
                    <div className={styles.errorMessage}>
                        {formError || error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <div className={styles.inputIcon}>
                            <FaUser />
                        </div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputIcon}>
                            <FaEnvelope />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputIcon}>
                            <FaLock />
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Password"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.inputIcon}>
                            <FaLock />
                        </div>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm Password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                        {!isLoading && <FaUserPlus className={styles.buttonIcon} />}
                    </button>
                </form>

                <div className={styles.formFooter}>
                    <p>
                        Already have an account? <Link to="/login" className={styles.link}>Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;