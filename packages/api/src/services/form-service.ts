import type { FormData } from '@sweetly-dipped/shared-types';
import type { Customer, Form } from '../generated/client';

export interface StoredFormData {
  id: string;
  formData: FormData;
  createdAt: string;
  updatedAt: string;
}

// Transform FormData to database format
export function formDataToDatabase(formData: FormData, customerId: string) {
  return {
    customerId,
    communicationMethod: formData.communicationMethod || null,
    pickupDate: formData.pickupDate || null,
    pickupTime: formData.pickupTime || null,
    rushOrder: formData.rushOrder,
    packageType: formData.packageType || null,
    riceKrispies: formData.riceKrispies,
    oreos: formData.oreos,
    pretzels: formData.pretzels,
    marshmallows: formData.marshmallows,
    referralSource: formData.referralSource || null,
    data: {
      colorScheme: formData.colorScheme,
      eventType: formData.eventType,
      theme: formData.theme,
      additionalDesigns: formData.additionalDesigns,
      termsAccepted: formData.termsAccepted,
      visitedSteps: Array.from(formData.visitedSteps)  // Set → Array for JSON
    }
  };
}

// Transform database format back to FormData
export function databaseToFormData(
  dbForm: Form & { customer: Customer }
): StoredFormData {
  const jsonData = dbForm.data as {
    colorScheme: string;
    eventType: string;
    theme: string;
    additionalDesigns: string;
    termsAccepted: boolean;
    visitedSteps: string[];
  };
  
  return {
    id: dbForm.id,
    formData: {
      firstName: dbForm.customer.firstName,
      lastName: dbForm.customer.lastName,
      email: dbForm.customer.email,
      phone: dbForm.customer.phone,
      communicationMethod: (dbForm.communicationMethod || '') as FormData['communicationMethod'],
      packageType: (dbForm.packageType || '') as FormData['packageType'],
      riceKrispies: dbForm.riceKrispies,
      oreos: dbForm.oreos,
      pretzels: dbForm.pretzels,
      marshmallows: dbForm.marshmallows,
      pickupDate: dbForm.pickupDate || '',
      pickupTime: dbForm.pickupTime || '',
      rushOrder: dbForm.rushOrder,
      referralSource: dbForm.referralSource || '',
      colorScheme: jsonData.colorScheme || '',
      eventType: jsonData.eventType || '',
      theme: jsonData.theme || '',
      additionalDesigns: jsonData.additionalDesigns || '',
      termsAccepted: jsonData.termsAccepted || false,
      visitedSteps: new Set(jsonData.visitedSteps || [])  // Array → Set
    },
    createdAt: dbForm.createdAt.toISOString(),
    updatedAt: dbForm.updatedAt.toISOString()
  };
}
