import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {

    constructor(@InjectRepository(SubscriptionEntity) private subscriptionRepository: Repository<SubscriptionEntity>) { }

    async createSubscription(user, source, subscriptionId): Promise<SubscriptionEntity> {
        const subscriptionEntity = new SubscriptionEntity();

        subscriptionEntity.user = user;
        subscriptionEntity.startDate = new Date();
        subscriptionEntity.source = source;
        if (source == "STRIPE") {
            subscriptionEntity.subscriptionId = subscriptionId;
        } else {
            subscriptionEntity.subscriptionId = null;
        }
        console.log("checkout.session.completed subscriptionEntity", subscriptionEntity);

        return await this.subscriptionRepository.save(subscriptionEntity);
    }

    async updateSubscriptionEndDate(user: any, endDate: Date): Promise<SubscriptionEntity> {
        const subscription = await this.findOneSubscription(user);
        if (!subscription) return null;

        const subscriptionEntity = new SubscriptionEntity();
        subscriptionEntity.endDate = endDate;

        this.subscriptionRepository.update(subscription.id, subscriptionEntity);
    }

    async findOneSubscription(user): Promise<SubscriptionEntity> {
        return await this.subscriptionRepository.findOne({ user });
    }

    async isSubscribe(userId): Promise<boolean> {
        const res = await this.subscriptionRepository
            .createQueryBuilder("subscription")
            .leftJoin("subscription.user", "user")
            .where("user.id = :userId", { userId: userId })
            .andWhere("(subscription.endDate IS NOT NULL OR subscription.endDate > NOW())")
            .getMany();

        return res.length > 0;
    }
}
