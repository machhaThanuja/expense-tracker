import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaChartPie, FaRegListAlt, FaCog, FaPlus } from 'react-icons/fa';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen }) => {
    const navigate = useNavigate();

    const handleAddExpense = () => {
        navigate('/expenses', { state: { showForm: true } });
    };

    return (
        <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
            <div className={styles.sidebarContent}>
                <ul className={styles.navList}>
                    <li>
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                        >
                            <FaHome className={styles.navIcon} />
                            <span className={styles.navText}>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/expenses"
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                        >
                            <FaRegListAlt className={styles.navIcon} />
                            <span className={styles.navText}>Expenses</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/reports"
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                        >
                            <FaChartPie className={styles.navIcon} />
                            <span className={styles.navText}>Reports</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.active : ''}`
                            }
                        >
                            <FaCog className={styles.navIcon} />
                            <span className={styles.navText}>Settings</span>
                        </NavLink>
                    </li>
                </ul>
                <button className={styles.addButton} onClick={handleAddExpense}>
                    <FaPlus className={styles.addIcon} />
                    <span className={styles.addText}>Add Expense</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;