import { Injectable } from '@nestjs/common';
import type { OrderNumberDto } from './dto/order-number.dto.js';

@Injectable()
export class OrdersService {
  private readonly orderCountStore = new Map<string, number>();

  generateOrderNumber(dateInput?: Date): OrderNumberDto {
    const today = dateInput ?? new Date();
    const dateString = today.toISOString().split('T')[0];

    const currentCount = this.orderCountStore.get(dateString) ?? 0;
    const nextCount = currentCount + 1;

    this.orderCountStore.set(dateString, nextCount);

    const sequentialNumber = nextCount.toString().padStart(3, '0');

    return { orderNumber: `${dateString}-${sequentialNumber}` };
  }
}

