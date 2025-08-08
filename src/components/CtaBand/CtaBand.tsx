import { useNavigate } from "react-router-dom";
import styles from "./CtaBand.module.css";

interface CtaBandProps {
  onStartOrder?: () => void;
}

export const CtaBand = ({ onStartOrder }: CtaBandProps) => {
  const navigate = useNavigate();

  const handleStartOrder = () => {
    // Call the optional callback if provided
    if (onStartOrder) {
      onStartOrder();
    }
    // Navigate to the design-package page
    navigate("/design-package");
  };

  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <button
          className={styles.ctaButton}
          onClick={handleStartOrder}
          type="button"
        >
          Start Designing Your Package →
        </button>
      </div>
    </section>
  );
};
