import styles from "./HeroSection.module.css";
import logo from "../../assets/images/logo.png";

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
            src={logo}
            alt="Sweetly Dipped by Jas logo - chocolate dripping design with pink text"
            className={styles.lifestyleImage}
          />
        </div>
      </div>
    </section>
  );
};
