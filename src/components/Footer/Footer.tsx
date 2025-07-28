import React from 'react';
import styles from './Footer.module.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.logo}>
            <h3>Sweetly Dipped</h3>
          </div>
          <div className={styles.copyright}>
            © {currentYear} Sweetly Dipped. All rights reserved.
          </div>
          <div className={styles.social}>
            <a href="#" aria-label="Facebook" className={styles.socialLink}>
              📘
            </a>
            <a href="#" aria-label="Instagram" className={styles.socialLink}>
              📷
            </a>
            <a href="#" aria-label="Twitter" className={styles.socialLink}>
              🐦
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}; 