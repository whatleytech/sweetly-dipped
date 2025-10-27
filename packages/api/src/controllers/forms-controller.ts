import { Router } from 'express';
import type { FormData } from '@sweetly-dipped/shared-types';

// In-memory storage
interface StoredFormData {
  id: string;
  formData: FormData;
  currentStep: number;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
}

const formDataStore = new Map<string, StoredFormData>();

// Helper function to convert Set to Array for JSON serialization
const serializeFormData = (data: StoredFormData): Record<string, unknown> => ({
  ...data,
  formData: {
    ...data.formData,
    visitedSteps: Array.from(data.formData.visitedSteps),
  },
});

// Helper function to deserialize Array back to Set
const deserializeFormData = (data: { 
  formData?: { 
    visitedSteps?: string[] | Set<string> | Record<string, unknown> | null | undefined;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}): StoredFormData => {
  // Always ensure visitedSteps is a proper array before creating Set
  let visitedStepsArray: string[] = ['lead']; // default
  
  try {
    if (data.formData && data.formData.visitedSteps) {
      if (Array.isArray(data.formData.visitedSteps)) {
        visitedStepsArray = data.formData.visitedSteps;
      } else if (data.formData.visitedSteps instanceof Set) {
        visitedStepsArray = Array.from(data.formData.visitedSteps);
      } else {
        // For any other case (object, null, undefined), use default
        visitedStepsArray = ['lead'];
      }
    }
  } catch (error) {
    console.warn('Error processing visitedSteps, using default:', error);
    visitedStepsArray = ['lead'];
  }
  
  return {
    ...data,
    formData: {
      ...data.formData,
      visitedSteps: new Set(visitedStepsArray),
    } as FormData,
  } as StoredFormData;
};

const router = Router();

// GET /api/forms/:id - Get form data by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const data = formDataStore.get(id);
  
  if (!data) {
    return res.status(404).json({ error: 'Form data not found' });
  }
  
  res.json(serializeFormData(data));
});

// POST /api/forms - Create new form data
router.post('/', (req, res) => {
  try {
    const { formData, currentStep = 0 } = req.body;
    
    if (!formData) {
      return res.status(400).json({ error: 'Form data is required' });
    }
    
    const id = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const storedData: StoredFormData = {
      id,
      formData: deserializeFormData({ formData }).formData,
      currentStep,
      createdAt: now,
      updatedAt: now,
    };
    
    formDataStore.set(id, storedData);
    
    res.status(201).json({
      id,
      ...serializeFormData(storedData),
    });
  } catch (error) {
    console.error('Error creating form data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/forms/:id - Update existing form data
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { formData, currentStep, orderNumber } = req.body;
    
    const existingData = formDataStore.get(id);
    if (!existingData) {
      return res.status(404).json({ error: 'Form data not found' });
    }
    
    const updatedData: StoredFormData = {
      ...existingData,
      formData: formData ? deserializeFormData({ formData }).formData : existingData.formData,
      currentStep: currentStep !== undefined ? currentStep : existingData.currentStep,
      orderNumber: orderNumber !== undefined ? orderNumber : existingData.orderNumber,
      updatedAt: new Date().toISOString(),
    };
    
    formDataStore.set(id, updatedData);
    
    res.json(serializeFormData(updatedData));
  } catch (error) {
    console.error('Error updating form data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/forms/:id - Delete form data
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  if (!formDataStore.has(id)) {
    return res.status(404).json({ error: 'Form data not found' });
  }
  
  formDataStore.delete(id);
  res.status(204).send();
});

// GET /api/forms - List all form data (for debugging)
router.get('/', (req, res) => {
  const allData = Array.from(formDataStore.values()).map(serializeFormData);
  res.json(allData);
});

export { router as formsRouter, formDataStore };
