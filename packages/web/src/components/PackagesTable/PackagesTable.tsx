import { Link } from "react-router-dom";
import styles from "./PackagesTable.module.css";
import { usePackageOptions } from '@/hooks/useConfigQuery';

export const PackagesTable = () => {
  const { data: packages = [] } = usePackageOptions();
  return (
    <section className={styles.packagesSection}>
      <div className={styles.container}>
        <Link to="/design-package" className={styles.navLink}>
          <h2 className={styles.title}>Packages</h2>
          <div className={styles.table}>
            {packages.map((pkg) => (
              <div key={pkg.id} className={styles.package}>
                <h3 className={styles.packageName}>{pkg.label}</h3>
                <div className={styles.quantity}>{pkg.description}</div>
                <div className={styles.price}>
                  {pkg.price ? `$${pkg.price}` : 'Varies'}
                </div>
              </div>
            ))}
          </div>
        </Link>
      </div>
    </section>
  );
};
