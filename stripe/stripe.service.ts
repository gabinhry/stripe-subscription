import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeLogsEntity } from './entities/stripe-logs.entity'
import { ConfigService } from '../../shared/config/config.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { SubscriptionService } from '../subscription/subscription.service';

@Injectable()
export class StripeService {
    private stripe: Stripe;
    private priceId: string; // 19.70€

    constructor(@InjectRepository(StripeLogsEntity) private stripeLogsRepository: Repository<StripeLogsEntity>,
        private configService: ConfigService,
        private usersService: UsersService,
        private subscriptionService: SubscriptionService) {
        this.stripe = new Stripe(this.configService.environment.stripe.secretKey, {
            apiVersion: '2020-08-27',
        });

        this.priceId = this.configService.environment.stripe.prices.spartan;
    }

    async createLogs(user, status): Promise<StripeLogsEntity> {
        const stripeLogsEntity = new StripeLogsEntity();

        stripeLogsEntity.user = user;
        stripeLogsEntity.timestamp = new Date();

        stripeLogsEntity.status = status;

        return await this.stripeLogsRepository.save(stripeLogsEntity);
    }

    async getSessionIdSpartan(body, user) {
        const successUrl = body.successUrl;
        const cancelUrl = body.cancelUrl;

        const session = await this.stripe.checkout.sessions.create({
            mode: "subscription",
            payment_method_types: ['card'],
            line_items: [
                {
                    price: this.priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            client_reference_id: user.id
        });

        return { sessionId: session.id };
    }


    async getPortalSession(stripeCustomerId) {
        const session = await this.stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: this.configService.environment.website.host + '/account',
        });
        return session.url;
    }

    /**
   * Webhook gérant les abonnements Stripe.
   * @param {any} req Objet "req" d'Express.
   */
    async webhook(req: any): Promise<{ responseStatusCode: number }> {
        let data: any;
        let event: Stripe.Event;

        try {
            // Check if webhook signing is configured.
            const webhookSecret = this.configService.environment.stripe.webhookSecret;

            if (webhookSecret) {
                let signature: any = req.headers['stripe-signature'];
                try {
                    event = this.stripe.webhooks.constructEvent(
                        req.rawBody,
                        signature,
                        webhookSecret
                    );
                } catch (err) {
                    console.log("err", err);
                    console.log('La signature de vérification du Webhook a échouée.');
                    return { responseStatusCode: 400 };
                }
                data = event.data;
            } else {
                throw new Error(
                    "No Stripe webhook.",
                );
            }

            let stripeSubscriptionId: string;
            let stripeCustomerId = data.object.customer;

            let user = null;
            if (event.type != "checkout.session.completed") {
                user = await this.usersService.findOne({ stripeCustomerId });
                console.log("user", user);
            }

            console.log("event.type", event.type);

            switch (event.type) {
                // First subscribtion
                case 'checkout.session.completed':
                    stripeSubscriptionId = data.object.subscription;
                    const userId = data.object.client_reference_id;
                    user = await this.usersService.findOne({ id: userId });
                    this.subscriptionService.createSubscription(user, "STRIPE", stripeSubscriptionId);
                    this.usersService.updateStripe(user.id, stripeCustomerId);
                    /*
                    this.mailerService.sendMail(user.email, Template.SUBSCRIPTION_SUCCESS, {
                        pseudo: user.pseudo
                    });
                    */
                    this.usersService.updateRole(user.id, "premium");
                    this.createLogs(user, "completed");
                    return { responseStatusCode: 200 };
                // Event call every month when the subscription is paid
                case 'invoice.paid':
                    this.usersService.updateRole(user.id, "premium");
                    this.createLogs(user, "paid");
                    return { responseStatusCode: 200 };
                case 'invoice.payment_failed':
                    /*
                    this.mailerService.sendMail(user.email, Template.SUBSCRIPTION_FAILED, {
                        pseudo: user.pseudo
                    });
                    */
                    this.usersService.updateRole(user.id, "user");
                    this.createLogs(user, "payment_failed");
                    return { responseStatusCode: 200 };
                case 'customer.subscription.deleted':
                    /*
                    this.mailerService.sendMail(user.email, Template.SUBSCRIPTION_DELETED, {
                        pseudo: user.pseudo
                    });
                    */
                    this.subscriptionService.deleteSubscription(user);
                    this.usersService.updateRole(user.id, "user");
                    this.createLogs(user, "deleted");
                    return { responseStatusCode: 200 };
                case 'invoice.payment_action_required':
                    /*
                    this.mailerService.sendMail(user.email, Template.SUBSCRIPTION_ACTION_REQUIRED, {
                        pseudo: user.pseudo
                    });
                    */
                    this.usersService.updateRole(user.id, "user");
                    this.createLogs(user, "payment_action_required");
                    return { responseStatusCode: 200 };
                default:
                    console.log('[STRIPE] unhandled event type');
                    console.log('[STRIPE] event.type :>>', event.type);
                    return { responseStatusCode: 200 };
            }
        } catch (err) {
            console.log("err", err);
            return { responseStatusCode: 500 };
        }
    }
}
