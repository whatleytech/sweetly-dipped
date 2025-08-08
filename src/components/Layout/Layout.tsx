import React from 'react';
import type { ReactNode } from 'react';
import { Link } from "react-router-dom";
import styles from './Layout.module.css';
import { Footer } from "../Footer/Footer";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <div className={styles.root}>
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <Link to="/" className={styles.logo}>
            Sweetly Dipped
          </Link>
          <ul className={styles.navLinks}>
            <li>
              <Link to="/" className={styles.navLink}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className={styles.navLink}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/build-box" className={styles.navLink}>
                Build Your Box
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <main className={styles.main}>{children}</main>
    <Footer />
  </div>
); 