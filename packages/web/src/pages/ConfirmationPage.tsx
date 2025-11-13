import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ConfirmationPage.module.css";

import { PackageDetails } from '@/components/PackageDetails/PackageDetails';
import { ContactInformation } from '@/components/ContactInformation/ContactInformation';
import { DesignDetails } from '@/components/DesignDetails/DesignDetails';
import { PickupDetails } from '@/components/PickupDetails/PickupDetails';
import { ReferralSource } from '@/components/ReferralSource/ReferralSource';
import { TermsAndConditions } from '@/components/TermsAndConditions/TermsAndConditions';
import { PaymentNotice } from '@/components/PaymentNotice/PaymentNotice';
import { RushOrderNotice } from '@/components/RushOrderNotice/RushOrderNotice';
import { useFormData } from '@/hooks/useFormData';
import type { FormData } from '@/types/formTypes';

export const ConfirmationPage = () => {
  const navigate = useNavigate();
  const {
    formData,
    isLoading,
    isLoadingFormId,
    error,
    persistFormProgress,
    submitForm,
  } = useFormData();

  const handleUpdate = useCallback(
    async (updates: Partial<FormData>) => {
      if (!formData) {
        return;
      }

      const mergedData: FormData = {
        ...formData,
        ...updates,
      };

      await persistFormProgress({ formData: mergedData });
    },
    [formData, persistFormProgress]
  );

  // Redirect to form if no data exists
  useEffect(() => {
    // Only redirect if we're not loading formId AND not loading data AND we have no form data AND no error
    if (!isLoadingFormId && !isLoading && !formData && !error) {
      console.log('Redirecting to design-package - no form data found');
      navigate('/design-package');
    }
  }, [formData, isLoading, isLoadingFormId, error, navigate]);

  const handleSubmit = async () => {
    if (!formData?.termsAccepted) {
      alert('Please accept the terms and conditions to continue.');
      return;
    }

    try {
      const { orderNumber } = await submitForm(); // Capture the returned orderNumber
      navigate('/thank-you', { state: { orderNumber } }); // Pass it via navigation state
    } catch (error) {
      console.error('Error submitting form:', error);
      console.dir(error, { depth: null });
      alert('There was an error submitting your order. Please try again.');
    }
  };

  // Show loading state
  if (isLoadingFormId || isLoading || !formData) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading your order details...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error loading order details: {error.message}</p>
          <button onClick={() => navigate('/design-package')}>
            Return to Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Order Confirmation</h1>
        <p>Please review your order details below</p>
      </div>
      <PaymentNotice />
      {formData.rushOrder && <RushOrderNotice />}

      <div className={styles.content}>
        <div className={styles.orderDetails}>
          <h2>Order Details</h2>
          <ContactInformation formData={formData} onUpdate={handleUpdate} />
          <PackageDetails formData={formData} />
          <DesignDetails formData={formData} />
          <PickupDetails formData={formData} />
          <ReferralSource formData={formData} onUpdate={handleUpdate} />
        </div>
        <TermsAndConditions formData={formData} onUpdate={handleUpdate} />
        <div className={styles.submitSection}>
          <button
            id="submit-order"
            onClick={handleSubmit}
            disabled={!formData.termsAccepted}
            className={styles.submitButton}
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
};
