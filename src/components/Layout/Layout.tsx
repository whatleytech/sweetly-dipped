import type { ReactNode } from "react";
import styles from "./Layout.module.css";
import { Footer } from "../Footer/Footer";
import { Navigation } from "../Navigation/Navigation";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <div className={styles.root}>
    <header className={styles.header}>
      <Navigation />
    </header>
    <main className={styles.main}>{children}</main>
    <Footer />
  </div>
);
