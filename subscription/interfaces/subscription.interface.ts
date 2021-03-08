import { User } from "../../users/interfaces/user.interface";

export interface StripeSubscription {
    id?: number;
    user?: User;
    source?: string;
    startDate?: Date;
    endDate?: Date;
    subscriptionId?: string;
}