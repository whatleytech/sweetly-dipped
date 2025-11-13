import { useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import styles from "./ThankYouPage.module.css";

import {
  generatePackageSummary,
  generateByDozenBreakdown,
  generatePickupSummary,
} from "@/utils/packageSummaryUtils";
import { useFormData } from "@/hooks/useFormData";
import { usePackageOptions } from "@/hooks/useConfigQuery";

export const ThankYouPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    formData,
    orderNumber: storedOrderNumber,
    isLoading,
    isLoadingFormId,
    error,
    clearFormData,
  } = useFormData();
  const { data: packageOptions = [] } = usePackageOptions();

  // Prefer orderNumber from navigation state, fallback to stored
  // Type-safe extraction of orderNumber from navigation state
  const orderNumberFromState =
    location.state &&
    typeof location.state === 'object' &&
    'orderNumber' in location.state
      ? (location.state as { orderNumber?: string }).orderNumber
      : undefined;
  const orderNumber = orderNumberFromState || storedOrderNumber;

  // Redirect to home if no order number exists (after loading completes)
  useEffect(() => {
    // Only redirect if we're not loading AND we have no order number AND no error
    // If we have orderNumber from navigation state, wait for formData to load
    if (!isLoadingFormId && !isLoading && !orderNumber && !error) {
      console.error('No order number found');
      navigate('/');
    }
  }, [orderNumber, isLoading, isLoadingFormId, error, navigate]);

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

  const packageSummary = generatePackageSummary(formData, packageOptions);
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
