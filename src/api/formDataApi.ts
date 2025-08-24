import type { FormData } from '@/types/formTypes';

const API_BASE_URL = 'http://localhost:3001/api';

export interface StoredFormData {
  id: string;
  formData: FormData;
  currentStep: number;
  orderNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormDataRequest {
  formData: FormData;
  currentStep?: number;
}

export interface UpdateFormDataRequest {
  formData?: FormData;
  currentStep?: number;
  orderNumber?: string;
}

class FormDataApiError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'FormDataApiError';
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: 'Unknown error' };
    }
    
    throw new FormDataApiError(
      errorData.error || `HTTP ${response.status}`,
      response.status
    );
  }
  
  const data = await response.json();
  return deserializeApiResponse(data);
}

interface ApiFormData {
  visitedSteps?: string[] | Set<string>;
  [key: string]: unknown;
}

interface ApiData {
  formData?: ApiFormData;
  [key: string]: unknown;
}

// Helper function to deserialize API response and convert visitedSteps back to Set
function deserializeApiResponse(data: ApiData): ApiData {
  if (data?.formData?.visitedSteps && Array.isArray(data.formData.visitedSteps)) {
    return {
      ...data,
      formData: {
        ...data.formData,
        visitedSteps: new Set(data.formData.visitedSteps),
      },
    };
  }
  return data;
}

// Helper function to serialize request data and convert visitedSteps Set to array
function serializeApiRequest(data: ApiData): ApiData {
  if (data && data.formData && data.formData.visitedSteps) {
    return {
      ...data,
      formData: {
        ...data.formData,
        visitedSteps: Array.from(data.formData.visitedSteps),
      },
    };
  }
  return data;
}



export const formDataApi = {
  // Create new form data
  async create(data: CreateFormDataRequest): Promise<StoredFormData> {
    const serializedData = serializeApiRequest(data);
    const response = await fetch(`${API_BASE_URL}/form-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serializedData),
    });
    
    return handleResponse<StoredFormData>(response);
  },

  // Get form data by ID
  async get(id: string): Promise<StoredFormData> {
    const response = await fetch(`${API_BASE_URL}/form-data/${id}`);
    return handleResponse<StoredFormData>(response);
  },

  // Update form data
  async update(id: string, data: UpdateFormDataRequest): Promise<StoredFormData> {
    const serializedData = serializeApiRequest(data);
    const response = await fetch(`${API_BASE_URL}/form-data/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serializedData),
    });
    
    return handleResponse<StoredFormData>(response);
  },

  // Delete form data
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/form-data/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new FormDataApiError(
        `Failed to delete form data: ${response.status}`,
        response.status
      );
    }
  },

  // List all form data (for debugging)
  async list(): Promise<StoredFormData[]> {
    const response = await fetch(`${API_BASE_URL}/form-data`);
    return handleResponse<StoredFormData[]>(response);
  },

  // Generate order number
  async generateOrderNumber(): Promise<{ orderNumber: string }> {
    const response = await fetch(`${API_BASE_URL}/order/number`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse<{ orderNumber: string }>(response);
  },

  // Health check
  async health(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<{ status: string; timestamp: string }>(response);
  },
};
