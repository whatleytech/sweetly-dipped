import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DesignPackagePage.module.css';
import type { FormData } from '@/types/formTypes';
import { FormSidebar } from '@/components/FormSidebar/FormSidebar';
import { LeadQuestions } from '@/components/FormSteps/LeadQuestions.tsx';
import { CommunicationPreference } from '@/components/FormSteps/CommunicationPreference.tsx';
import { PackageSelection } from '@/components/FormSteps/PackageSelection.tsx';
import { ByTheDozen } from '@/components/FormSteps/ByTheDozen.tsx';
import { ColorScheme } from '@/components/FormSteps/ColorScheme.tsx';
import { EventDetails } from '@/components/FormSteps/EventDetails.tsx';
import { AdditionalDesigns } from '@/components/FormSteps/AdditionalDesigns.tsx';
import { PickupDetails } from '@/components/FormSteps/PickupDetails.tsx';
import { useFormData } from '@/hooks/useFormData';

const FORM_STEPS = [
  { id: 'lead', title: 'Contact Information', component: LeadQuestions },
  {
    id: 'communication',
    title: 'Communication Preference',
    component: CommunicationPreference,
  },
  { id: 'package', title: 'Package Selection', component: PackageSelection },
  { id: 'by-dozen', title: 'By The Dozen', component: ByTheDozen },
  { id: 'color', title: 'Color Scheme', component: ColorScheme },
  { id: 'event', title: 'Event Details', component: EventDetails },
  { id: 'designs', title: 'Additional Designs', component: AdditionalDesigns },
  { id: 'pickup', title: 'Pickup Details', component: PickupDetails },
] as const;

export const DesignPackagePage = () => {
  const navigate = useNavigate();
  const {
    formData,
    currentStep,
    isLoading,
    error,
    isInitializing,
    isLoadingFormId,
    initializeForm,
    persistFormProgress,
  } = useFormData();

  const [localFormData, setLocalFormData] = useState<FormData | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const cloneFormData = useCallback((data: FormData): FormData => {
    return {
      ...data,
      visitedSteps: new Set(data.visitedSteps),
    };
  }, []);

  const updateLocalFormData = useCallback((updates: Partial<FormData>) => {
    setLocalFormData((prev) => {
      if (!prev) {
        throw new Error('Form data not initialized');
      }

      const { visitedSteps, ...restUpdates } = updates;
      const nextVisitedSteps =
        visitedSteps instanceof Set
          ? new Set(visitedSteps)
          : new Set(prev.visitedSteps);

      return {
        ...prev,
        ...restUpdates,
        visitedSteps: nextVisitedSteps,
      };
    });
  }, []);

  // Initialize form if no data exists
  useEffect(() => {
    if (!formData && !isLoading && !isInitializing && !isLoadingFormId) {
      const initialFormData: FormData = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        communicationMethod: '',
        packageType: '',
        riceKrispies: 0,
        oreos: 0,
        pretzels: 0,
        marshmallows: 0,
        colorScheme: '',
        eventType: '',
        theme: '',
        additionalDesigns: '',
        selectedAdditionalDesigns: [],
        pickupDate: '',
        pickupTime: '',
        rushOrder: false,
        referralSource: '',
        termsAccepted: false,
        visitedSteps: new Set(['lead']),
      };
      initializeForm(initialFormData, 0);
    }
  }, [formData, isLoading, isInitializing, isLoadingFormId, initializeForm]);

  // Keep local state in sync with server data
  useEffect(() => {
    if (formData) {
      setLocalFormData(cloneFormData(formData));
    }
  }, [formData, cloneFormData]);

  // Track the active step locally for immediate UI updates
  useEffect(() => {
    if (!isLoading && !isInitializing) {
      setActiveStep(currentStep);
    }
  }, [currentStep, isInitializing, isLoading]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stepHeader = document.querySelector(`.${styles.stepHeader}`);
      if (stepHeader) {
        const elementRect = stepHeader.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        const scrollPosition = Math.max(0, absoluteElementTop - 80);

        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [activeStep]);

  const getStepIndexById = useCallback(
    (id: (typeof FORM_STEPS)[number]['id']) =>
      FORM_STEPS.findIndex((s) => s.id === id),
    []
  );

  const persistNavigation = useCallback(
    (
      updatedData: FormData,
      targetStep: number,
      previousData: FormData,
      previousStep: number
    ) => {
      setLocalFormData(updatedData);
      setActiveStep(targetStep);

      void persistFormProgress({
        formData: updatedData,
        currentStep: targetStep,
      }).catch((persistError) => {
        console.error('Failed to persist form progress', persistError);
        setLocalFormData(previousData);
        setActiveStep(previousStep);
      });
    },
    [persistFormProgress]
  );

  const nextStep = useCallback(() => {
    if (!localFormData) {
      return;
    }

    const currentDefinition = FORM_STEPS[activeStep];
    if (!currentDefinition) {
      return;
    }

    const currentId = currentDefinition.id;
    const previousData = cloneFormData(localFormData);
    let targetIndex = activeStep;

    const visitedSteps = new Set(previousData.visitedSteps);
    visitedSteps.add(currentId);

    if (currentId === 'package' && previousData.packageType !== 'by-dozen') {
      targetIndex = getStepIndexById('color');
      if (targetIndex !== -1) {
        visitedSteps.add('color');
      }
    } else if (
      currentId === 'by-dozen' &&
      previousData.packageType !== 'by-dozen'
    ) {
      targetIndex = Math.min(activeStep + 1, FORM_STEPS.length - 1);
    } else if (activeStep < FORM_STEPS.length - 1) {
      targetIndex = activeStep + 1;
      const nextStepId = FORM_STEPS[targetIndex]?.id;
      if (nextStepId) {
        visitedSteps.add(nextStepId);
      }
    }

    if (targetIndex === activeStep || targetIndex < 0) {
      return;
    }

    const updatedData: FormData = {
      ...previousData,
      visitedSteps,
    };

    persistNavigation(updatedData, targetIndex, previousData, activeStep);
  }, [
    activeStep,
    cloneFormData,
    getStepIndexById,
    localFormData,
    persistNavigation,
  ]);

  const prevStep = useCallback(() => {
    if (!localFormData) {
      return;
    }

    const currentDefinition = FORM_STEPS[activeStep];
    if (!currentDefinition) {
      return;
    }

    const currentId = currentDefinition.id;
    let targetIndex = activeStep;

    if (currentId === 'color') {
      targetIndex =
        localFormData.packageType !== 'by-dozen'
          ? getStepIndexById('package')
          : getStepIndexById('by-dozen');
    } else if (
      currentId === 'by-dozen' &&
      localFormData.packageType !== 'by-dozen'
    ) {
      targetIndex = getStepIndexById('package');
    } else if (activeStep > 0) {
      targetIndex = activeStep - 1;
    }

    if (targetIndex === activeStep || targetIndex < 0) {
      return;
    }

    const previousData = cloneFormData(localFormData);
    const nextVisitedSteps = new Set(previousData.visitedSteps);
    const targetStepId = FORM_STEPS[targetIndex]?.id;

    if (targetStepId) {
      nextVisitedSteps.add(targetStepId);
    }

    const updatedData: FormData = {
      ...previousData,
      visitedSteps: nextVisitedSteps,
    };

    persistNavigation(updatedData, targetIndex, previousData, activeStep);
  }, [
    activeStep,
    cloneFormData,
    getStepIndexById,
    localFormData,
    persistNavigation,
  ]);

  const handleSidebarNavigation = useCallback(
    (targetIndex: number) => {
      if (!localFormData) {
        return;
      }

      const stepDefinition = FORM_STEPS[targetIndex];
      if (!stepDefinition || targetIndex === activeStep) {
        return;
      }

      const previousData = cloneFormData(localFormData);
      const visitedSteps = new Set(previousData.visitedSteps);
      visitedSteps.add(stepDefinition.id);

      const updatedData: FormData = {
        ...previousData,
        visitedSteps,
      };

      persistNavigation(updatedData, targetIndex, previousData, activeStep);
    },
    [activeStep, cloneFormData, localFormData, persistNavigation]
  );

  const currentStepDefinition = FORM_STEPS[activeStep];
  const packageTypeForVisibility =
    localFormData?.packageType ?? formData?.packageType ?? '';

  const visibleSteps = useMemo(
    () =>
      FORM_STEPS.filter(
        (step) =>
          step.id !== 'by-dozen' || packageTypeForVisibility === 'by-dozen'
      ),
    [packageTypeForVisibility]
  );

  const currentVisibleIndex = currentStepDefinition
    ? Math.max(
        0,
        visibleSteps.findIndex((step) => step.id === currentStepDefinition.id)
      )
    : 0;

  const isLoadingState =
    isLoading || isLoadingFormId || (!formData && !isInitializing);

  const CurrentStepComponent = currentStepDefinition?.component;

  const handleSubmit = useCallback(() => {
    if (localFormData) {
      void persistFormProgress({
        formData: localFormData,
        currentStep: activeStep,
      }).catch((persistError) => {
        console.error(
          'Failed to persist form progress before submission',
          persistError
        );
      });
    }
    navigate('/confirmation');
  }, [localFormData, activeStep, persistFormProgress, navigate]);

  if (isLoadingState) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>Loading your form data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error loading form data: {error.message}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>Initializing form...</p>
        </div>
      </div>
    );
  }

  if (!localFormData || !CurrentStepComponent || !currentStepDefinition) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>Preparing your form...</p>
        </div>
      </div>
    );
  }

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
              Step {currentVisibleIndex + 1} of {visibleSteps.length}:{' '}
              {currentStepDefinition.title}
            </h2>
          </div>

          <div className={styles.stepContent}>
            <CurrentStepComponent
              formData={localFormData}
              updateFormData={updateLocalFormData}
              onNext={nextStep}
              onPrev={prevStep}
              onSubmit={handleSubmit}
              isFirstStep={activeStep === 0}
              isLastStep={activeStep === FORM_STEPS.length - 1}
            />
          </div>
        </div>

        <div className={styles.sidebar}>
          <FormSidebar
            formData={localFormData}
            formSteps={visibleSteps.map((s) => ({ id: s.id, title: s.title }))}
            currentVisibleIndex={currentVisibleIndex}
            onNavigateToStep={handleSidebarNavigation}
          />
        </div>
      </div>
    </div>
  );
};
