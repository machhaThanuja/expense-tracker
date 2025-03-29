import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [formError, setFormError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const { loginUser, error } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, password } = formData;

        // Validate form
        if (!email || !password) {
            setFormError('Please fill in all fields');
            return;
        }

        setIsLoading(true);
        setFormError(null);

        try {
            await loginUser(email, password);
            navigate('/');
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                    <h1>Login</h1>
                    <p>Sign in to your account</p>
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

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                        {!isLoading && <FaSignInAlt className={styles.buttonIcon} />}
                    </button>
                </form>

                <div className={styles.formFooter}>
                    <p>
                        Don't have an account? <Link to="/signup" className={styles.link}>Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;