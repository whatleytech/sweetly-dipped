import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ThankYouPage.module.css";
import type { FormData } from "../types/formTypes";
import { generateOrderNumber } from "../utils/orderUtils";
import {
  generatePackageSummary,
  generateByDozenBreakdown,
  generatePickupSummary,
} from "../utils/packageSummaryUtils";

const STORAGE_KEY = "sweetly-dipped-form-data";

export const ThankYouPage = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [orderNumber, setOrderNumber] = useState<string>("");
  const orderNumberGenerated = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData.formData);
        // Generate order number only once to avoid double incrementing
        if (!orderNumberGenerated.current) {
          setOrderNumber(generateOrderNumber());
          orderNumberGenerated.current = true;
        }
      } catch (error) {
        console.error("Error loading form data:", error);
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleReturnHome = () => {
    localStorage.removeItem(STORAGE_KEY);
    navigate("/");
  };

  if (!formData) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const packageSummary = generatePackageSummary(formData);
  const pickupSummary = generatePickupSummary(formData);
  const breakdown =
    formData.packageType === "by-dozen"
      ? generateByDozenBreakdown(formData)
      : [];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Thank you for your order!</h1>
          <p className={styles.orderNumber}>Order #: {orderNumber}</p>
        </div>

        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <p className={styles.packageInfo}>{packageSummary}</p>
          {breakdown.length > 0 && (
            <ul className={styles.breakdown}>
              {breakdown.map((item, index) => (
                <li key={index} className={styles.breakdownItem}>
                  {item}
                </li>
              ))}
            </ul>
          )}
          <p className={styles.pickupInfo}>{pickupSummary}</p>
        </div>

        <p className={styles.message}>
          Thank you for ordering with Sweetly Dipped! We will reach out to you
          within the next 48 hours. If you are not already, please follow us on
          Instagram at{" "}
          <a
            href="https://www.instagram.com/sweetlydippedxjas"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramLink}
          >
            @sweetlydippedxjas
          </a>
        </p>

        <button onClick={handleReturnHome} className={styles.returnButton}>
          Return to Home
        </button>
      </div>
    </div>
  );
};
