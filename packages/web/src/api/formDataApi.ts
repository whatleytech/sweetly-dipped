import type { FormData } from '@sweetly-dipped/shared-types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

// Structured error types for better error handling
export interface ApiError {
  type: 'network' | 'validation' | 'server' | 'not-found' | 'timeout';
  message: string;
  status?: number;
  retryable: boolean;
  originalError?: Error;
}

export class FormDataApiError extends Error {
  public status: number;
  public type: ApiError['type'];
  public retryable: boolean;
  public originalError?: Error;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'FormDataApiError';
    this.status = error.status || 0;
    this.type = error.type;
    this.retryable = error.retryable;
    this.originalError = error.originalError;
  }
}

interface ErrorResponseData {
  error?: string;
  message?: string;
  [key: string]: unknown;
}

// Type guards
function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

function hasFormData(
  obj: Record<string, unknown>
): obj is { formData: Record<string, unknown> } {
  return 'formData' in obj && isObject(obj.formData);
}

function hasVisitedSteps(
  formData: Record<string, unknown>
): formData is { visitedSteps: string[] } {
  return 'visitedSteps' in formData && Array.isArray(formData.visitedSteps);
}

function isErrorResponse(
  obj: Record<string, unknown>
): obj is ErrorResponseData {
  return 'error' in obj || 'message' in obj;
}

// Helper function to delay execution
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Enhanced response handler with structured error types
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      type:
        response.status >= 500
          ? 'server'
          : response.status === 404
            ? 'not-found'
            : response.status === 408
              ? 'timeout'
              : 'validation',
      message: `Request failed: ${response.status}`,
      status: response.status,
      retryable: response.status >= 500 || response.status === 408,
    };

    try {
      const errorData = await response.json();
      if (isObject(errorData) && isErrorResponse(errorData)) {
        error.message = errorData.error || errorData.message || error.message;
      }
    } catch {
      // Keep default error message if JSON parsing fails
    }

    throw new FormDataApiError(error);
  }

  const data = await response.json();
  return deserializeApiResponse(data);
}

// Enhanced fetch wrapper with timeout and retry logic
async function fetchWithRetry(
  url: string,
  options: Parameters<typeof fetch>[1] & { signal?: AbortSignal } = {},
  timeoutMs: number = DEFAULT_TIMEOUT,
  maxRetries: number = MAX_RETRIES
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Handle network errors (no connection)
      if (error instanceof TypeError) {
        const networkError: ApiError = {
          type: 'network',
          message: 'Network error - please check your connection',
          retryable: false,
          originalError: error,
        };
        throw new FormDataApiError(networkError);
      }

      // Handle timeout errors
      if (error instanceof Error && error.message.includes('timeout')) {
        const timeoutError: ApiError = {
          type: 'timeout',
          message: `Request timed out after ${timeoutMs}ms`,
          retryable: false,
          originalError: error,
        };
        throw new FormDataApiError(timeoutError);
      }

      // Handle abort errors (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        const abortError: ApiError = {
          type: 'timeout',
          message: 'Request was aborted due to timeout',
          retryable: false,
          originalError: error,
        };
        throw new FormDataApiError(abortError);
      }

      // If this is the last attempt, throw a generic server error
      if (attempt === maxRetries) {
        const serverError: ApiError = {
          type: 'server',
          message: `Request failed after ${maxRetries + 1} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`,
          retryable: false,
          originalError: lastError,
        };
        throw new FormDataApiError(serverError);
      }

      // Wait before retrying (exponential backoff)
      await delay(RETRY_DELAY * Math.pow(2, attempt));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw lastError || new Error('Unknown error occurred');
}

// Helper function to deserialize API response and convert visitedSteps back to Set
function deserializeApiResponse<T>(data: unknown): T {
  if (isObject(data) && hasFormData(data) && hasVisitedSteps(data.formData)) {
    return {
      ...data,
      formData: {
        ...data.formData,
        visitedSteps: new Set(data.formData.visitedSteps),
      },
    } as T;
  }
  return data as T;
}

// Helper function to serialize request data and convert visitedSteps Set to array
function serializeApiRequest(
  data: CreateFormDataRequest | UpdateFormDataRequest
): Record<string, unknown> {
  const serialized = { ...data };

  if (serialized.formData && serialized.formData.visitedSteps instanceof Set) {
    const { visitedSteps, ...restFormData } = serialized.formData;
    serialized.formData = {
      ...restFormData,
      visitedSteps: Array.from(visitedSteps),
    } as unknown as FormData;
  }

  return serialized;
}

export const formDataApi = {
  // Create new form data
  async create(data: CreateFormDataRequest): Promise<StoredFormData> {
    const serializedData = serializeApiRequest(data);
    const response = await fetchWithRetry(`${API_BASE_URL}/forms`, {
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
    const response = await fetchWithRetry(`${API_BASE_URL}/forms/${id}`);
    return handleResponse<StoredFormData>(response);
  },

  // Update form data
  async update(
    id: string,
    data: UpdateFormDataRequest
  ): Promise<StoredFormData> {
    const serializedData = serializeApiRequest(data);
    const response = await fetchWithRetry(`${API_BASE_URL}/forms/${id}`, {
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
    const response = await fetchWithRetry(`${API_BASE_URL}/forms/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error: ApiError = {
        type: response.status === 404 ? 'not-found' : 'server',
        message: `Failed to delete form data: ${response.status}`,
        status: response.status,
        retryable: response.status >= 500,
      };

      try {
        const errorData = await response.json();
        if (isObject(errorData) && isErrorResponse(errorData)) {
          error.message = errorData.error || error.message;
        }
      } catch {
        // Keep default error message
      }

      throw new FormDataApiError(error);
    }
  },

  // List all form data (for debugging)
  async list(): Promise<StoredFormData[]> {
    const response = await fetchWithRetry(`${API_BASE_URL}/forms`);
    return handleResponse<StoredFormData[]>(response);
  },

  // Submit form
  async submitForm(
    formId: string
  ): Promise<{ orderNumber: string; submittedAt: string }> {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/forms/${formId}/submit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return handleResponse<{ orderNumber: string; submittedAt: string }>(
      response
    );
  },

  // Health check
  async health(): Promise<{ status: string; timestamp: string }> {
    const response = await fetchWithRetry(`${API_BASE_URL}/health`);
    return handleResponse<{ status: string; timestamp: string }>(response);
  },
};
