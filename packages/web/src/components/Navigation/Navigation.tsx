import { Link } from "react-router-dom";
import styles from "./Navigation.module.css";

export const Navigation = () => {
  return (
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
            <Link to="/design-package" className={styles.navLink}>
              Design Your Package
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
