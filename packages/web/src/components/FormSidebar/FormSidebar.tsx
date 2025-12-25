import styles from "./FormSidebar.module.css";
import type { FormData } from "@/types/formTypes";

import {
  getStepStatus,
  isStepAccessible,
  isStepCompleted,
  getCompletedStepsCount,
  getFullStepIndex,
} from "@/utils/formStepUtils";
import { StepItem } from "./StepItem";
import { ProgressSection } from "./ProgressSection";
import { useAdditionalDesignOptions } from '@/hooks/useConfigQuery';

interface FormSidebarProps {
  formData: FormData;
  formSteps: Array<{ id: string; title: string }>;
  currentVisibleIndex?: number;
  onNavigateToStep: (step: number) => void;
}

export const FormSidebar = ({
  formData,
  formSteps,
  currentVisibleIndex,
  onNavigateToStep,
}: FormSidebarProps) => {
  const { data: additionalDesignOptions } = useAdditionalDesignOptions();

  const handleStepClick = (stepIndex: number) => {
    if (
      isStepAccessible(stepIndex, formSteps, currentVisibleIndex!, formData)
    ) {
      const fullStepIndex = getFullStepIndex(stepIndex, formSteps);
      onNavigateToStep(fullStepIndex);
    }
  };

  const completedStepsCount = getCompletedStepsCount(formSteps, formData);
  const totalSteps = formSteps.length;

  return (
    <div className={styles.sidebar}>
      <h3 className={styles.title}>Your Progress</h3>

      <div className={styles.stepsList}>
        {formSteps.map((step, index) => {
          const status = getStepStatus(index, formSteps, currentVisibleIndex!);
          const isClickable = isStepAccessible(
            index,
            formSteps,
            currentVisibleIndex!,
            formData
          );
          const isCompleted = isStepCompleted(step.id, formData);

          return (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              status={status}
              isClickable={isClickable}
              isCompleted={isCompleted}
              formData={formData}
              onStepClick={handleStepClick}
              additionalDesignOptions={additionalDesignOptions}
            />
          );
        })}
      </div>

      <ProgressSection
        completedStepsCount={completedStepsCount}
        totalSteps={totalSteps}
      />
    </div>
  );
};
