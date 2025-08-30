import type { FormData } from '@sweetly-dipped/shared-types';
import { PACKAGE_OPTIONS } from '@/constants/formData';

/**
 * Generates a summary of the selected package
 */
export const generatePackageSummary = (formData: FormData): string => {
  if (formData.packageType === "by-dozen") {
    return generateByDozenSummary(formData);
  }
  
  const packageOption = PACKAGE_OPTIONS.find(pkg => pkg.id === formData.packageType);
  return packageOption?.label || "Package not specified";
};

/**
 * Generates a summary for by-the-dozen orders
 */
const generateByDozenSummary = (formData: FormData): string => {
  const totalDozen = 
    formData.riceKrispies + 
    formData.oreos + 
    formData.pretzels + 
    formData.marshmallows;
  
  if (totalDozen === 0) {
    return "No treats selected";
  }
  
  return `Custom Order (${totalDozen} dozen)`;
};

/**
 * Generates a detailed breakdown of by-the-dozen orders
 */
export const generateByDozenBreakdown = (formData: FormData): string[] => {
  const breakdown: string[] = [];
  
  if (formData.riceKrispies > 0) {
    breakdown.push(`${formData.riceKrispies} dozen Chocolate covered Rice Krispies`);
  }
  
  if (formData.oreos > 0) {
    breakdown.push(`${formData.oreos} dozen Chocolate covered Oreos`);
  }
  
  if (formData.pretzels > 0) {
    breakdown.push(`${formData.pretzels} dozen Chocolate dipped pretzels`);
  }
  
  if (formData.marshmallows > 0) {
    breakdown.push(`${formData.marshmallows} dozen Chocolate covered marshmallow pops`);
  }
  
  return breakdown;
};

/**
 * Generates pickup details summary
 */
export const generatePickupSummary = (formData: FormData): string => {
  const { pickupDate, pickupTime } = formData;
  
  if (!pickupDate || !pickupTime) {
    return "Pickup details not specified";
  }
  
  // Parse the date string as local time to avoid timezone issues
  const [year, month, day] = pickupDate.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  return `Pickup: ${formattedDate} at ${pickupTime}`;
};
