import React from 'react';
import styles from './MainContent.module.css';

const MainContent = ({ children }) => {
    return (
        <main className={styles.mainContent}>
            {children}
        </main>
    );
};

export default MainContent;