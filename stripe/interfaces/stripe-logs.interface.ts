import { User } from "../../users/interfaces/user.interface";

export interface StripeLogs {
    id?: number;
    user?: User;
    status?: "completed" | "paid" | "payment_failed" | "deleted" | "updated" | "payment_action_require";
    timestamp?: Date;
}