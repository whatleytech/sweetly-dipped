/**
 * Generates a unique order number in the format YYYY-MM-DD-XXX
 * where XXX is a sequential number for that date
 */
export const generateOrderNumber = (): string => {
  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Get the current count for today from localStorage
  const orderCountKey = `order-count-${dateString}`;
  const currentCount = parseInt(localStorage.getItem(orderCountKey) || '0', 10);
  const nextCount = currentCount + 1;
  
  // Store the updated count
  localStorage.setItem(orderCountKey, nextCount.toString());
  
  // Format the sequential number with leading zeros
  const sequentialNumber = nextCount.toString().padStart(3, '0');
  
  return `${dateString}-${sequentialNumber}`;
};

/**
 * Formats a date string for display
 */
export const formatDateForDisplay = (dateString: string): string => {
  // Parse the date string as local time to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
