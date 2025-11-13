import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { FormsModule } from './forms/forms.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from './config/config.module.js';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    FormsModule,
    OrdersModule,
    ConfigModule,
  ],
})
export class AppModule {}

