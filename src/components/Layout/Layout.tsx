import React from 'react';
import type { ReactNode } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <div className={styles.root}>
    <header className={styles.header}>Header (nav/logo placeholder)</header>
    <main className={styles.main}>{children}</main>
    <footer className={styles.footer}>Footer placeholder</footer>
  </div>
); 