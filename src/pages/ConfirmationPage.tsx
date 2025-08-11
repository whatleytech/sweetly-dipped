import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ConfirmationPage.module.css";
import type { FormData } from "../types/formTypes";

const STORAGE_KEY = "sweetly-dipped-form-data";

const REFERRAL_OPTIONS = [
  "Instagram",
  "Tiktok", 
  "Returning customer",
  "Referral",
  "Other"
] as const;

export const ConfirmationPage = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
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

  const startEditing = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editingField || !formData) return;
    
    if (editingField === "name") {
      const [firstName, ...lastNameParts] = editValue.split(" ");
      const lastName = lastNameParts.join(" ");
      updateFormData({ 
        firstName: firstName || "", 
        lastName: lastName || "" 
      });
    } else {
      updateFormData({ [editingField]: editValue });
    }
    
    setIsEditing(false);
    setEditingField(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditingField(null);
    setEditValue("");
  };

  const handleSubmit = () => {
    if (!formData?.termsAccepted) {
      alert("Please accept the terms and conditions to continue.");
      return;
    }
    
    // TODO: Submit form data to backend
    console.log("Final form submitted:", formData);
    
    // Clear localStorage after successful submission
    localStorage.removeItem(STORAGE_KEY);
    
    // Navigate to success page or back to home
    navigate("/");
  };

  if (!formData) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPackageLabel = (packageType: string) => {
    const packageLabels = {
      "small": "Small Package",
      "medium": "Medium Package", 
      "large": "Large Package",
      "xl": "Extra Large Package",
      "by-dozen": "By The Dozen"
    };
    return packageLabels[packageType as keyof typeof packageLabels] || packageType;
  };

  const getTotalByDozen = () => {
    return formData.riceKrispies + formData.oreos + formData.pretzels + formData.marshmallows;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Order Confirmation</h1>
        <p>Please review your order details below</p>
      </div>

      {/* Payment Notice */}
      <div className={styles.paymentNotice}>
        <div className={styles.paymentIcon}>💳</div>
        <div className={styles.paymentText}>
          <strong>Currently ONLY accepting payments via Venmo.</strong>
        </div>
      </div>

      {/* Rush Order Notice */}
      {formData.rushOrder && (
        <div className={styles.rushNotice}>
          <div className={styles.rushIcon}>⚠️</div>
          <div className={styles.rushText}>
            <strong>Rush Order Notice:</strong> Your selected pickup date is within 2 weeks. 
            We will reach out to confirm if we are able to fulfill your order in this timeframe.
          </div>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.orderDetails}>
          <h2>Order Details</h2>
          
          {/* Contact Information */}
          <div className={styles.section}>
            <h3>Contact Information</h3>
            <div className={styles.fieldGroup}>
              <label>Name:</label>
              <div className={styles.fieldValue}>
                {isEditing && editingField === "name" ? (
                  <div className={styles.editMode}>
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={styles.editInput}
                    />
                    <button onClick={saveEdit} className={styles.saveBtn}>Save</button>
                    <button onClick={cancelEdit} className={styles.cancelBtn}>Cancel</button>
                  </div>
                ) : (
                  <div className={styles.displayMode}>
                    <span>{formData.firstName} {formData.lastName}</span>
                    <button 
                      onClick={() => startEditing("name", `${formData.firstName} ${formData.lastName}`)}
                      className={styles.editBtn}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label>Email:</label>
              <div className={styles.fieldValue}>
                {isEditing && editingField === "email" ? (
                  <div className={styles.editMode}>
                    <input
                      type="email"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={styles.editInput}
                    />
                    <button onClick={saveEdit} className={styles.saveBtn}>Save</button>
                    <button onClick={cancelEdit} className={styles.cancelBtn}>Cancel</button>
                  </div>
                ) : (
                  <div className={styles.displayMode}>
                    <span>{formData.email}</span>
                    <button 
                      onClick={() => startEditing("email", formData.email)}
                      className={styles.editBtn}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label>Phone:</label>
              <div className={styles.fieldValue}>
                {isEditing && editingField === "phone" ? (
                  <div className={styles.editMode}>
                    <input
                      type="tel"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={styles.editInput}
                    />
                    <button onClick={saveEdit} className={styles.saveBtn}>Save</button>
                    <button onClick={cancelEdit} className={styles.cancelBtn}>Cancel</button>
                  </div>
                ) : (
                  <div className={styles.displayMode}>
                    <span>{formData.phone}</span>
                    <button 
                      onClick={() => startEditing("phone", formData.phone)}
                      className={styles.editBtn}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label>Preferred Contact Method:</label>
              <span className={styles.fieldValue}>
                {formData.communicationMethod === "email" ? "Email" : 
                 formData.communicationMethod === "text" ? "Text Message" : "Not specified"}
              </span>
            </div>
          </div>

          {/* Package Details */}
          <div className={styles.section}>
            <h3>Package Details</h3>
            <div className={styles.fieldGroup}>
              <label>Package Type:</label>
              <span className={styles.fieldValue}>{getPackageLabel(formData.packageType)}</span>
            </div>

            {formData.packageType === "by-dozen" && (
              <div className={styles.fieldGroup}>
                <label>Treats Breakdown:</label>
                <div className={styles.treatsBreakdown}>
                  <div>Rice Krispies: {formData.riceKrispies}</div>
                  <div>Oreos: {formData.oreos}</div>
                  <div>Pretzels: {formData.pretzels}</div>
                  <div>Marshmallows: {formData.marshmallows}</div>
                  <div className={styles.total}>Total: {getTotalByDozen()} dozen</div>
                </div>
              </div>
            )}
          </div>

          {/* Design Details */}
          <div className={styles.section}>
            <h3>Design Details</h3>
            <div className={styles.fieldGroup}>
              <label>Color Scheme:</label>
              <span className={styles.fieldValue}>{formData.colorScheme || "Not specified"}</span>
            </div>

            <div className={styles.fieldGroup}>
              <label>Event Type:</label>
              <span className={styles.fieldValue}>{formData.eventType || "Not specified"}</span>
            </div>

            <div className={styles.fieldGroup}>
              <label>Theme:</label>
              <span className={styles.fieldValue}>{formData.theme || "Not specified"}</span>
            </div>

            {formData.additionalDesigns && (
              <div className={styles.fieldGroup}>
                <label>Additional Design Notes:</label>
                <span className={styles.fieldValue}>{formData.additionalDesigns}</span>
              </div>
            )}
          </div>

          {/* Pickup Details */}
          <div className={styles.section}>
            <h3>Pickup Details</h3>
            <div className={styles.fieldGroup}>
              <label>Pickup Date:</label>
              <span className={styles.fieldValue}>{formatDate(formData.pickupDate)}</span>
            </div>

            <div className={styles.fieldGroup}>
              <label>Pickup Time:</label>
              <span className={styles.fieldValue}>
                {formData.pickupTime} ({formData.pickupTimeWindow})
              </span>
            </div>
          </div>

          {/* Referral Source */}
          <div className={styles.section}>
            <h3>How did you hear about us?</h3>
            <div className={styles.fieldGroup}>
              <label>Referral Source:</label>
              <select
                value={formData.referralSource || ""}
                onChange={(e) => updateFormData({ referralSource: e.target.value })}
                className={styles.referralSelect}
              >
                <option value="">Select an option...</option>
                {REFERRAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className={styles.termsSection}>
          <h3>Important Information</h3>
          
          <div className={styles.infoBox}>
            <p>
              After you fill out this order form, we will contact you to go over details, 
              availability, and to provide payment information. Completion of this form does 
              NOT mean that your order is confirmed. You should hear from us within 48 hours.
            </p>
            <p>
              If you have any questions or concerns, feel free to contact us at{" "}
              <a href="mailto:sweetlydippedbyjas@gmail.com">sweetlydippedbyjas@gmail.com</a>. 
              Thank you!!
            </p>
          </div>

          <div className={styles.termsBox}>
            <h4>Terms & Conditions</h4>
            <div className={styles.termsContent}>
              <p>
                Completing this form does NOT confirm your order. You will receive a response 
                via EMAIL within 48 hours. Once you receive a response from us, a 50% 
                nonrefundable deposit will be required via Venmo to secure your order. We will 
                hold your spot for 48 hours. Once we confirm that your deposit has been 
                received, your order will then be confirmed.
              </p>
              <p>
                Final payment is due one week prior to pickup date.
              </p>
              <p>
                <strong>PICKUP</strong> - All orders are pickup only. The pickup location is at 
                a public place in Midtown. Exact location will be shared in confirmation email. 
                There is a 15 minute grace period. Contact us if there are any issues with 
                arriving on time for your pickup. If you do not arrive within the grace period, 
                we will attempt to contact you twice via the phone number provided. If no contact 
                is made, we have the discretion to leave and your order is void. 50% of total 
                payment will be refunded.
              </p>
            </div>
          </div>

          <div className={styles.termsCheckbox}>
            <label>
              <input
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
              />
              <span>I have read and agreed to these terms and conditions.</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
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
