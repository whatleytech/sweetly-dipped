import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DesignPackagePage.module.css";
import type { FormData } from "../types/formTypes";
import { FormSidebar } from "../components/FormSidebar/FormSidebar";
import { LeadQuestions } from "../components/FormSteps/LeadQuestions.tsx";
import { CommunicationPreference } from "../components/FormSteps/CommunicationPreference.tsx";
import { PackageSelection } from "../components/FormSteps/PackageSelection.tsx";
import { ByTheDozen } from "../components/FormSteps/ByTheDozen.tsx";
import { ColorScheme } from "../components/FormSteps/ColorScheme.tsx";
import { EventDetails } from "../components/FormSteps/EventDetails.tsx";
import { AdditionalDesigns } from "../components/FormSteps/AdditionalDesigns.tsx";
import { PickupDetails } from "../components/FormSteps/PickupDetails.tsx";

const FORM_STEPS = [
  { id: "lead", title: "Contact Information", component: LeadQuestions },
  {
    id: "communication",
    title: "Communication Preference",
    component: CommunicationPreference,
  },
  { id: "package", title: "Package Selection", component: PackageSelection },
  { id: "by-dozen", title: "By The Dozen", component: ByTheDozen },
  { id: "color", title: "Color Scheme", component: ColorScheme },
  { id: "event", title: "Event Details", component: EventDetails },
  { id: "designs", title: "Additional Designs", component: AdditionalDesigns },
  { id: "pickup", title: "Pickup Details", component: PickupDetails },
] as const;

const STORAGE_KEY = "sweetly-dipped-form-data";

export const DesignPackagePage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    communicationMethod: "",
    packageType: "",
    riceKrispies: 0,
    oreos: 0,
    pretzels: 0,
    marshmallows: 0,
    colorScheme: "",
    eventType: "",
    theme: "",
    additionalDesigns: "",
    pickupDate: "",
    pickupTimeWindow: "",
    pickupTime: "",
    rushOrder: false,
  });

  const navigate = useNavigate();

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData.formData);
        setCurrentStep(parsedData.currentStep);
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        formData,
        currentStep,
      })
    );
  }, [formData, currentStep]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const getStepIndexById = (id: (typeof FORM_STEPS)[number]["id"]) =>
    FORM_STEPS.findIndex((s) => s.id === id);

    const scrollToStepTop = () => {
      // Scroll to position the step header with some padding above to show context
      const stepHeader = document.querySelector(`.${styles.stepHeader}`);
      if (stepHeader) {
        const elementRect = stepHeader.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        // Add some padding above the step header (80px) to show page context
        const scrollPosition = Math.max(0, absoluteElementTop - 80);

        window.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }
    };

    const nextStep = () => {
      const currentId = FORM_STEPS[currentStep].id;

      // Skip logic: if package selected is not by-dozen, skip the by-dozen step
      if (currentId === "package" && formData.packageType !== "by-dozen") {
        setCurrentStep(getStepIndexById("color"));
        // Scroll after state update
        setTimeout(scrollToStepTop, 0);
        return;
      }

      if (currentId === "by-dozen" && formData.packageType !== "by-dozen") {
        setCurrentStep(Math.min(currentStep + 1, FORM_STEPS.length - 1));
        // Scroll after state update
        setTimeout(scrollToStepTop, 0);
        return;
      }

      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
        // Scroll after state update
        setTimeout(scrollToStepTop, 0);
      }
    };

  const prevStep = () => {
    const currentId = FORM_STEPS[currentStep].id;

    if (currentId === "color") {
      // If not by-dozen, go back to package; otherwise back to by-dozen
      if (formData.packageType !== "by-dozen") {
        setCurrentStep(getStepIndexById("package"));
        // Scroll after state update
        setTimeout(scrollToStepTop, 0);
        return;
      }
      setCurrentStep(getStepIndexById("by-dozen"));
      // Scroll after state update
      setTimeout(scrollToStepTop, 0);
      return;
    }

    if (currentId === "by-dozen" && formData.packageType !== "by-dozen") {
      setCurrentStep(getStepIndexById("package"));
      // Scroll after state update
      setTimeout(scrollToStepTop, 0);
      return;
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Scroll after state update
      setTimeout(scrollToStepTop, 0);
    }
  };

  const handleSubmit = () => {
    // TODO: Submit form data to backend
    console.log("Form submitted:", formData);
    // Clear localStorage after successful submission
    localStorage.removeItem(STORAGE_KEY);
    // Navigate to confirmation page or back to home
    navigate("/");
  };

  const CurrentStepComponent = FORM_STEPS[currentStep].component;

  // Build visible steps list based on chosen package
  const visibleSteps = FORM_STEPS.filter(
    (s) => s.id !== "by-dozen" || formData.packageType === "by-dozen"
  );
  const currentStepId = FORM_STEPS[currentStep].id;
  const currentVisibleIndex = Math.max(
    0,
    visibleSteps.findIndex((s) => s.id === currentStepId)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Design Your Package</h1>
        <p>Let's create your perfect chocolate-covered treats!</p>
      </div>

      <div className={styles.content}>
        <div className={styles.formSection}>
          <div className={styles.stepHeader}>
            <h2>
              Step {currentVisibleIndex + 1} of {visibleSteps.length}:{" "}
              {FORM_STEPS[currentStep].title}
            </h2>
          </div>

          <div className={styles.stepContent}>
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              onNext={nextStep}
              onPrev={prevStep}
              onSubmit={handleSubmit}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === FORM_STEPS.length - 1}
            />
          </div>
        </div>

        <div className={styles.sidebar}>
          <FormSidebar
            formData={formData}
            currentStep={currentStep}
            formSteps={visibleSteps.map((s) => ({ id: s.id, title: s.title }))}
            currentVisibleIndex={currentVisibleIndex}
          />
        </div>
      </div>
    </div>
  );
};
