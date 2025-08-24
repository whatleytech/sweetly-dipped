import express from 'express';
import cors from 'cors';
import type { FormData } from '../src/types/formTypes';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// In-memory order counter for each date
const orderCountStore = new Map<string, number>();

// Helper function to generate order number
const generateOrderNumber = (): string => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Get the current count for today
  const currentCount = orderCountStore.get(dateString) || 0;
  const nextCount = currentCount + 1;
  
  // Store the updated count
  orderCountStore.set(dateString, nextCount);
  
  // Format the sequential number with leading zeros
  const sequentialNumber = nextCount.toString().padStart(3, '0');
  
  return `${dateString}-${sequentialNumber}`;
};

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

// API Routes

// GET /api/form-data/:id - Get form data by ID
app.get('/api/form-data/:id', (req, res) => {
  const { id } = req.params;
  const data = formDataStore.get(id);
  
  if (!data) {
    return res.status(404).json({ error: 'Form data not found' });
  }
  
  res.json(serializeFormData(data));
});

// POST /api/form-data - Create new form data
app.post('/api/form-data', (req, res) => {
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

// PUT /api/form-data/:id - Update existing form data
app.put('/api/form-data/:id', (req, res) => {
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

// DELETE /api/form-data/:id - Delete form data
app.delete('/api/form-data/:id', (req, res) => {
  const { id } = req.params;
  
  if (!formDataStore.has(id)) {
    return res.status(404).json({ error: 'Form data not found' });
  }
  
  formDataStore.delete(id);
  res.status(204).send();
});

// GET /api/form-data - List all form data (for debugging)
app.get('/api/form-data', (req, res) => {
  const allData = Array.from(formDataStore.values()).map(serializeFormData);
  res.json(allData);
});

// POST /api/order-number - Generate a new order number
app.post('/api/order-number', (req, res) => {
  try {
    const orderNumber = generateOrderNumber();
    res.json({ orderNumber });
  } catch (error) {
    console.error('Error generating order number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export { app, PORT };
