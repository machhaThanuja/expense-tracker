import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaReceipt, FaChartPie, FaCog, FaWallet, FaSignOutAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen }) => {
    const { currentUser, logoutUser } = useAuth();

    return (
        <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
            <div className={styles.sidebarContent}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.logo}>
                        <FaWallet className={styles.logoIcon} />
                        <span className={styles.logoText}>ExpenseTracker</span>
                    </div>
                </div>

                <div className={styles.sidebarLinks}>
                    <NavLink
                        to="/"
                        className={({ isActive }) => `${styles.sidebarLink} ${isActive ? styles.active : ''}`}
                        end
                    >
                        <FaHome className={styles.linkIcon} />
                        <span className={styles.linkText}>Dashboard</span>
                    </NavLink>

                    <NavLink
                        to="/expenses"
                        className={({ isActive }) => `${styles.sidebarLink} ${isActive ? styles.active : ''}`}
                    >
                        <FaReceipt className={styles.linkIcon} />
                        <span className={styles.linkText}>Expenses</span>
                    </NavLink>

                    <NavLink
                        to="/reports"
                        className={({ isActive }) => `${styles.sidebarLink} ${isActive ? styles.active : ''}`}
                    >
                        <FaChartPie className={styles.linkIcon} />
                        <span className={styles.linkText}>Reports</span>
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) => `${styles.sidebarLink} ${isActive ? styles.active : ''}`}
                    >
                        <FaCog className={styles.linkIcon} />
                        <span className={styles.linkText}>Settings</span>
                    </NavLink>
                </div>

                <div className={styles.sidebarFooter}>
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => `${styles.sidebarLink} ${isActive ? styles.active : ''}`}
                    >
                        <FaUser className={styles.linkIcon} />
                        <span className={styles.linkText}>Profile</span>
                    </NavLink>

                    <div className={styles.sidebarLink} onClick={logoutUser}>
                        <FaSignOutAlt className={styles.linkIcon} />
                        <span className={styles.linkText}>Logout</span>
                    </div>

                    {currentUser && (
                        <div className={styles.userInfo}>
                            <div className={styles.userAvatar}>
                                {currentUser.name.charAt(0).toUpperCase()}
                            </div>
                            <div className={styles.userData}>
                                <div className={styles.userName}>{currentUser.name}</div>
                                <div className={styles.userEmail}>{currentUser.email}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;