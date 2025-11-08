import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { OrderNumberDto } from './dto/order-number.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async generateOrderNumber(dateInput?: Date): Promise<OrderNumberDto> {
    const today = dateInput ?? new Date();
    const dateString = today.toISOString().split('T')[0];

    const counter = await this.prisma.orderCounter.upsert({
      where: { date: dateString },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        date: dateString,
        count: 1,
      },
    });

    const sequentialNumber = counter.count.toString().padStart(3, '0');

    return { orderNumber: `${dateString}-${sequentialNumber}` };
  }
}

