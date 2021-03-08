import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionEntity
    ]),
  ],
  providers: [
    SubscriptionService
  ],
  controllers: [
    SubscriptionController
  ],
  exports: [
    SubscriptionService
  ]
})
export class SubscriptionModule { }
