import { Controller, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import type { OrderNumberDto } from './dto/order-number.dto.js';

@Controller('order')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('number')
  generateOrderNumber(): Promise<OrderNumberDto> {
    return this.ordersService.generateOrderNumber();
  }
}

