import { Link } from "react-router-dom";
import styles from "./PackagesTable.module.css";

const packages = [
  {
    id: "small",
    name: "Small",
    quantity: "3 dozen",
    price: 90,
    popular: false,
  },
  {
    id: "medium",
    name: "Medium",
    quantity: "5 dozen",
    price: 150,
    popular: true,
  },
  {
    id: "large",
    name: "Large",
    quantity: "8 dozen",
    price: 250,
    popular: false,
  },
  {
    id: "xl",
    name: "XL",
    quantity: "12 dozen",
    price: 375,
    popular: false,
  },
];

export const PackagesTable = () => {
  return (
    <section className={styles.packagesSection}>
      <div className={styles.container}>
        <Link to="/design-package" className={styles.navLink}>
          <h2 className={styles.title}>Packages</h2>
          <div className={styles.table}>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`${styles.package} ${
                  pkg.popular ? styles.popular : ""
                }`}
              >
                {pkg.popular && (
                  <div className={styles.popularBadge}>Most Popular</div>
                )}
                <h3 className={styles.packageName}>{pkg.name}</h3>
                <div className={styles.quantity}>{pkg.quantity}</div>
                <div className={styles.price}>${pkg.price}</div>
              </div>
            ))}
          </div>
        </Link>
      </div>
    </section>
  );
};
