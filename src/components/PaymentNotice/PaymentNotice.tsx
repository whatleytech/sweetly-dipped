import styles from "./PaymentNotice.module.css";

export const PaymentNotice = () => {
  return (
    <div className={styles.paymentNotice}>
      <div className={styles.paymentIcon}>💳</div>
      <div className={styles.paymentText}>
        <strong>Currently ONLY accepting payments via Venmo.</strong>
      </div>
    </div>
  );
};
