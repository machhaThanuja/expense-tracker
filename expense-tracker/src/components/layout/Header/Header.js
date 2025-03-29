import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaSearch, FaBell, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import styles from './Header.module.css';

const Header = ({ toggleSidebar }) => {
    const { currentUser, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = React.useState(false);

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    const handleProfileClick = () => {
        navigate('/profile');
        setShowDropdown(false);
    };

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
                <div
                    className={styles.userProfile}
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <div className={styles.userAvatar}>
                        {currentUser?.name?.charAt(0).toUpperCase() || <FaUserCircle />}
                    </div>
                    <span className={styles.userName}>{currentUser?.name || 'User'}</span>

                    {showDropdown && (
                        <div className={styles.userDropdown}>
                            <div className={styles.dropdownItem} onClick={handleProfileClick}>
                                <FaUserCircle className={styles.dropdownIcon} />
                                <span>My Profile</span>
                            </div>
                            <div className={styles.dropdownDivider}></div>
                            <div className={styles.dropdownItem} onClick={handleLogout}>
                                <FaSignOutAlt className={styles.dropdownIcon} />
                                <span>Log Out</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;