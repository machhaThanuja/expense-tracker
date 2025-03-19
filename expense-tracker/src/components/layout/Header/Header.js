import React from 'react';
import { FaBars, FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import styles from './Header.module.css';

const Header = ({ toggleSidebar }) => {
    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <button className={styles.menuButton} onClick={toggleSidebar}>
                    <FaBars />
                </button>
                <div className={styles.logo}>ExpenseTracker</div>
            </div>
            <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search expenses..."
                    className={styles.searchInput}
                />
            </div>
            <div className={styles.headerRight}>
                <button className={styles.iconButton}>
                    <FaBell />
                    <span className={styles.notificationBadge}>3</span>
                </button>
                <div className={styles.userProfile}>
                    <FaUserCircle className={styles.userAvatar} />
                    <span className={styles.userName}>John Doe</span>
                </div>
            </div>
        </header>
    );
};

export default Header;