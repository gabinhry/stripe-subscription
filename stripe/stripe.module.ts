import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../shared/config/config.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { UsersModule } from '../users/users.module';
import { StripeLogsEntity } from './entities/stripe-logs.entity';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    SubscriptionModule,
    TypeOrmModule.forFeature([
      StripeLogsEntity
    ]),
  ],
  controllers: [
    StripeController
  ],
  providers: [
    StripeService
  ]
})
export class StripeModule { }
