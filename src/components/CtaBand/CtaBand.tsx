import React from 'react';
import styles from './CtaBand.module.css';

interface CtaBandProps {
  onStartOrder: () => void;
}

export const CtaBand = ({ onStartOrder }: CtaBandProps) => {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <button 
          className={styles.ctaButton}
          onClick={onStartOrder}
          type="button"
        >
          Start Building Your Box →
        </button>
      </div>
    </section>
  );
}; 