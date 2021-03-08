import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { User } from '../../users/interfaces/user.interface';
import { StripeSubscription } from '../interfaces/subscription.interface';

@Entity("subscription")
export class SubscriptionEntity implements StripeSubscription {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserEntity)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column()
    source: string;

    @Column({ nullable: true })
    subscriptionId: string;

    @Column({ type: "datetime" })
    startDate: Date;

    @Column({ type: "datetime", nullable: true })
    endDate: Date;
}