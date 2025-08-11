import styles from "./RushOrderNotice.module.css";

export const RushOrderNotice = () => {
  return (
    <div className={styles.rushNotice}>
      <div className={styles.rushIcon}>⚠️</div>
      <div className={styles.rushText}>
        <strong>Rush Order Notice:</strong> Your selected pickup date is
        within 2 weeks. We will reach out to confirm if we are able to
        fulfill your order in this timeframe.
      </div>
    </div>
  );
};
