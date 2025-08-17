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
    pickupTime: "",
    rushOrder: false,
    referralSource: "",
    termsAccepted: false,
    visitedSteps: new Set(["lead"]), // Start with the first step visited
  });

  const navigate = useNavigate();

  // Load form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Convert visitedSteps back to Set if it exists
        if (
          parsedData.formData.visitedSteps &&
          Array.isArray(parsedData.formData.visitedSteps)
        ) {
          parsedData.formData.visitedSteps = new Set(
            parsedData.formData.visitedSteps
          );
        } else {
          parsedData.formData.visitedSteps = new Set(["lead"]);
        }
        setFormData(parsedData.formData);
        setCurrentStep(parsedData.currentStep);
      } catch (error) {
        console.error("Error loading form data:", error);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      formData: {
        ...formData,
        visitedSteps: Array.from(formData.visitedSteps), // Convert Set to Array for JSON serialization
      },
      currentStep,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [formData, currentStep]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const markStepAsVisited = (stepId: string) => {
    setFormData((prev) => ({
      ...prev,
      visitedSteps: new Set([...prev.visitedSteps, stepId]),
    }));
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

  setTimeout(scrollToStepTop, 0);

  const nextStep = () => {
    const currentId = FORM_STEPS[currentStep].id;

    // Mark current step as visited
    markStepAsVisited(currentId);

    // Skip logic: if package selected is not by-dozen, skip the by-dozen step
    if (currentId === "package" && formData.packageType !== "by-dozen") {
      const nextStepIndex = getStepIndexById("color");
      setCurrentStep(nextStepIndex);
      markStepAsVisited("color"); // Mark the next step as visited
      return;
    }

    if (currentId === "by-dozen" && formData.packageType !== "by-dozen") {
      setCurrentStep(Math.min(currentStep + 1, FORM_STEPS.length - 1));
      return;
    }

    if (currentStep < FORM_STEPS.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      markStepAsVisited(FORM_STEPS[nextStepIndex].id);
    }
  };

  const prevStep = () => {
    const currentId = FORM_STEPS[currentStep].id;

    if (currentId === "color") {
      // If not by-dozen, go back to package; otherwise back to by-dozen
      if (formData.packageType !== "by-dozen") {
        setCurrentStep(getStepIndexById("package"));
        return;
      }
      setCurrentStep(getStepIndexById("by-dozen"));
      return;
    }

    if (currentId === "by-dozen" && formData.packageType !== "by-dozen") {
      setCurrentStep(getStepIndexById("package"));
      return;
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Navigate to confirmation page
    navigate("/confirmation");
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
            formSteps={visibleSteps.map((s) => ({ id: s.id, title: s.title }))}
            currentVisibleIndex={currentVisibleIndex}
            setCurrentStep={setCurrentStep}
          />
        </div>
      </div>

      <button
        style={{ color: "black", borderColor: "black" }}
        onClick={() => {
          setFormData({
            firstName: "Test",
            lastName: "Test",
            email: "test@test.com",
            phone: "123-456-7890",
            communicationMethod: "text",
            packageType: "by-dozen",
            riceKrispies: 1,
            oreos: 2,
            pretzels: 1,
            marshmallows: 2,
            colorScheme: "Red",
            eventType: "Corporate",
            theme: "Lawyer Ball",
            additionalDesigns: "",
            pickupDate: "2025-09-21",
            pickupTime: "3:00 PM",
            rushOrder: false,
            referralSource: "",
            termsAccepted: false,
            visitedSteps: new Set([
              "lead",
              "communication",
              "package",
              "by-dozen",
              "color",
              "event",
              "designs",
              "pickup",
            ]),
          });
          setCurrentStep(7);
        }}
      >
        Fill in form
      </button>
    </div>
  );
};
