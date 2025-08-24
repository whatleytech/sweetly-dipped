import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ConfirmationPage.module.css";
import type { FormData } from "../types/formTypes";
import { PackageDetails } from "../components/PackageDetails/PackageDetails";
import { ContactInformation } from "../components/ContactInformation/ContactInformation";
import { DesignDetails } from "../components/DesignDetails/DesignDetails";
import { PickupDetails } from "../components/PickupDetails/PickupDetails";
import { ReferralSource } from "../components/ReferralSource/ReferralSource";
import { TermsAndConditions } from "../components/TermsAndConditions/TermsAndConditions";
import { PaymentNotice } from "../components/PaymentNotice/PaymentNotice";
import { RushOrderNotice } from "../components/RushOrderNotice/RushOrderNotice";

const STORAGE_KEY = "sweetly-dipped-form-data";

export const ConfirmationPage = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData.formData);
      } catch (error) {
        console.error("Error loading form data:", error);
        // Redirect to form if no valid data
        navigate("/design-package");
      }
    } else {
      // Redirect to form if no data
      navigate("/design-package");
    }
  }, [navigate]);

  const updateFormData = (updates: Partial<FormData>) => {
    if (!formData) return;

    const updatedData = { ...formData, ...updates };
    setFormData(updatedData);

    // Update localStorage
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...parsedData,
            formData: updatedData,
          })
        );
      } catch (error) {
        console.error("Error updating localStorage:", error);
      }
    }
  };



  const handleSubmit = () => {
    if (!formData?.termsAccepted) {
      alert("Please accept the terms and conditions to continue.");
      return;
    }

    // TODO: Submit form data to backend
    console.log("Final form submitted:", formData);

    // Navigate to thank you page
    navigate("/thank-you");
  };

  if (!formData) {
    return <div className={styles.loading}>Loading...</div>;
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
          <ContactInformation formData={formData} onUpdate={updateFormData} />
          <PackageDetails formData={formData} />
          <DesignDetails formData={formData} />
          <PickupDetails formData={formData} />
          <ReferralSource formData={formData} onUpdate={updateFormData} />
        </div>
        <TermsAndConditions formData={formData} onUpdate={updateFormData} />
        <div className={styles.submitSection}>
          <button
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
