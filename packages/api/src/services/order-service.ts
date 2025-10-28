import { prisma } from '../db/prisma';

export async function generateOrderNumber(date: string): Promise<string> {
  // Parse the date and create start/end of day boundaries
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);
  
  // Count existing orders for this date
  const existingOrderCount = await prisma.order.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lt: endOfDay
      }
    }
  });
  
  // Generate order number with 3-digit padding
  const orderNumber = `${date}-${String(existingOrderCount + 1).padStart(3, '0')}`;
  
  return orderNumber;
}
