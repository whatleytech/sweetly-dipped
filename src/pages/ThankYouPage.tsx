import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ThankYouPage.module.css";

import {
  generatePackageSummary,
  generateByDozenBreakdown,
  generatePickupSummary,
} from "../utils/packageSummaryUtils";
import { useFormData } from "../hooks/useFormData";

export const ThankYouPage = () => {
  const navigate = useNavigate();
  const {
    formData,
    orderNumber,
    isLoading,
    isLoadingFormId,
    error,
    clearFormData,
  } = useFormData();

  // Redirect to home if no data or order number exists
  useEffect(() => {
    console.log("ThankYouPage useEffect:", {
      formData,
      orderNumber,
      isLoading,
      isLoadingFormId,
      error,
    });
    // Only redirect if we're not loading formId AND not loading data AND we have no form data or order number AND no error
    if (
      !isLoadingFormId &&
      !isLoading &&
      (!formData || !orderNumber) &&
      !error
    ) {
      console.error("No form data or order number found");
      navigate("/");
    }
  }, [formData, orderNumber, isLoading, isLoadingFormId, error, navigate]);

  const handleReturnHome = async () => {
    try {
      await clearFormData();
      navigate("/");
    } catch (error) {
      console.error("Error clearing form data:", error);
      // Navigate anyway
      navigate("/");
    }
  };

  // Show error state first
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error loading order confirmation: {error.message}</p>
          <button onClick={() => navigate("/")}>Return to Home</button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoadingFormId || isLoading || !formData || !orderNumber) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your order confirmation...</div>
      </div>
    );
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
