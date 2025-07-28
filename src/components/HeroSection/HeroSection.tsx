import React from 'react';
import styles from './HeroSection.module.css';

export const HeroSection = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <div className={styles.text}>
          <h1 className={styles.headline}>
            Personalized Chocolate-Covered Treats
          </h1>
          <p className={styles.subcopy}>
            Elevate your next event with handcrafted indulgence.
          </p>
        </div>
        <div className={styles.image}>
          <img 
            src="https://unsplash.it/600/400?chocolate" 
            alt="Luxury chocolate-covered treats display"
            className={styles.lifestyleImage}
          />
        </div>
      </div>
    </section>
  );
}; 