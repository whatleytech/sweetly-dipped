import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FormData } from '@sweetly-dipped/shared-types';
import { formDataApi, type StoredFormData } from '@/api/formDataApi';

const STORAGE_KEY = 'sweetly-dipped-form-id';

export const useFormData = () => {
  const [formId, setFormId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isLoadingFormId, setIsLoadingFormId] = useState(true);
  const queryClient = useQueryClient();

  // Get or create form ID from localStorage
  useEffect(() => {
    const savedFormId = localStorage.getItem(STORAGE_KEY);
    console.log("useFormData: Loading formId from localStorage:", savedFormId);
    if (savedFormId) {
      setFormId(savedFormId);
    }
    setIsLoadingFormId(false);
  }, []);

  // Query for form data
  const {
    data: storedData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['formData', formId],
    queryFn: () => formDataApi.get(formId!),
    enabled: !!formId,
    retry: (failureCount, error) => {
      // Don't retry on 404 (form not found)
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Create new form data mutation
  const createMutation = useMutation({
    mutationFn: formDataApi.create,
    onSuccess: (data) => {
      setFormId(data.id);
      localStorage.setItem(STORAGE_KEY, data.id);
      queryClient.setQueryData(['formData', data.id], data);
    },
  });

  // Update form data mutation
  const updateMutation = useMutation({
    mutationFn: ({ formData, currentStep, orderNumber }: {
      formData?: FormData;
      currentStep?: number;
      orderNumber?: string;
    }) => formDataApi.update(formId!, { formData, currentStep, orderNumber }),
    onSuccess: (data) => {
      queryClient.setQueryData(['formData', formId!], data);
    },
  });

  // Delete form data mutation
  const deleteMutation = useMutation({
    mutationFn: () => formDataApi.delete(formId!),
    onSuccess: () => {
      localStorage.removeItem(STORAGE_KEY);
      setFormId(null);
      queryClient.removeQueries({ queryKey: ['formData', formId!] });
    },
  });

  // Initialize form data if no ID exists
  const initializeForm = useCallback(async (initialData: FormData, currentStep = 0) => {
    if (!formId && !isInitializing) {
      setIsInitializing(true);
      try {
        await createMutation.mutateAsync({ formData: initialData, currentStep });
      } finally {
        setIsInitializing(false);
      }
    }
  }, [formId, isInitializing, createMutation]);

  // Update form data
  const updateFormData = useCallback(async (updates: Partial<FormData>) => {
    if (!formId) {
      throw new Error('Form not initialized');
    }

    const currentData = queryClient.getQueryData<StoredFormData>(['formData', formId]);
    if (!currentData) {
      throw new Error('Form data not found');
    }

    const updatedFormData = {
      ...currentData.formData,
      ...updates,
    };

    await updateMutation.mutateAsync({ formData: updatedFormData });
  }, [formId, updateMutation, queryClient]);

  // Update current step
  const updateCurrentStep = useCallback(async (step: number) => {
    if (!formId) {
      throw new Error('Form not initialized');
    }

    await updateMutation.mutateAsync({ currentStep: step });
  }, [formId, updateMutation]);

  // Update order number
  const updateOrderNumber = useCallback(async (orderNumber: string) => {
    if (!formId) {
      throw new Error('Form not initialized');
    }

    await updateMutation.mutateAsync({ orderNumber });
  }, [formId, updateMutation]);

  // Clear form data
  const clearFormData = useCallback(async () => {
    // Clear formId from localStorage to start fresh
    localStorage.removeItem(STORAGE_KEY);
    setFormId(null);
  }, []);

  // Get current form data
  const formData = storedData?.formData || null;
  const currentStep = storedData?.currentStep || 0;
  const orderNumber = storedData?.orderNumber;
  
  console.log("useFormData: Current state:", { 
    formId, 
    isLoadingFormId, 
    isLoading, 
    formData: !!formData, 
    storedData: !!storedData 
  });

  return {
    // Data
    formData,
    currentStep,
    orderNumber,
    formId,
    
    // Loading states
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isInitializing,
    isLoadingFormId,
    
    // Error states
    error,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    
    // Actions
    initializeForm,
    updateFormData,
    updateCurrentStep,
    updateOrderNumber,
    clearFormData,
    refetch,
  };
};
