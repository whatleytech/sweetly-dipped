import { Router } from 'express';

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

const router = Router();

// POST /api/order/number - Generate a new order number
router.post('/number', (req, res) => {
  try {
    const orderNumber = generateOrderNumber();
    res.json({ orderNumber });
  } catch (error) {
    console.error('Error generating order number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as orderRouter };
