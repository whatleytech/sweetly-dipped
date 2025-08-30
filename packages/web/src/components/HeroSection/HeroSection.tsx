import React from "react";
import styles from "./HeroSection.module.css";
import logo from "@/assets/images/logo.png";
import pretzelVideo from "@/assets/videos/pretzel-design-fast-optimized.mp4";

export const HeroSection = () => {
  const handleVideoError = (
    e: React.SyntheticEvent<HTMLVideoElement, Event>
  ) => {
    console.error("Video failed to load:", e);
  };

  return (
    <section className={styles.hero}>
      <video
        className={styles.backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        onError={handleVideoError}
        src={pretzelVideo}
      >
        Your browser does not support the video tag.
      </video>
      <div className={styles.content}>
        <div className={styles.text}>
          <h1 className={styles.headline}>
            Personalized Chocolate-Covered Treats
          </h1>
          <p className={styles.subcopy}>
            <i>Sweetly Made, Perfectly Dipped</i>
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
