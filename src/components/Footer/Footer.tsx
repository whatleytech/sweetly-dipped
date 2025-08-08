import styles from "./Footer.module.css";

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
            © {currentYear} Sweetly Dipped x Jas, LLC. All rights reserved.
          </div>
          <div className={styles.companyInfo}>
            <p>Website owned by Sweetly Dipped x Jas, LLC</p>
            <p>Website created by Whatley Technologies, LLC</p>
          </div>
          <div className={styles.social}>
            <a
              href="https://www.instagram.com/sweetlydippedxjas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Sweetly Dipped on Instagram"
              className={styles.socialLink}
            >
              📷
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
