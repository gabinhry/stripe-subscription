import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { User } from '../../users/interfaces/user.interface';
import { StripeLogs } from '../interfaces/stripe-logs.interface';

@Entity("stripe_logs")
export class StripeLogsEntity implements StripeLogs {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserEntity)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column()
    status: "completed" | "paid" | "payment_failed" | "deleted" | "updated" | "payment_action_require";

    @Column()
    timestamp: Date;
}