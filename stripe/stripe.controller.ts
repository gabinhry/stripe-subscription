import { BadRequestException, Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthUser } from '../../shared/decorators/auth-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorators';
import { UsersService } from '../users/users.service';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {

    constructor(private stripeService: StripeService,
        private usersService: UsersService) { }

    @Post('subscribe')
    @Roles('user', 'premium', 'admin')
    async createSpartanSession(@Body() body, @AuthUser() user) {
        console.log("subscribe", body);
        console.log("subscribe", user);
        try {
            const sessionId = await this.stripeService.getSessionIdSpartan(body, user);
            if (!sessionId) {
                throw new BadRequestException(
                    'Email already used',
                );
            }
            return sessionId;
        } catch (e) {
            console.log("err", e);
            throw new BadRequestException(e.message);
        }
    }

    @Post('portal')
    @Roles('user', 'premium', 'admin')
    async createStripePortalSession(@AuthUser() user) {
        try {
            const res = await this.usersService.getStripeId(user.id);

            if (!res) return { success: false };

            const portalUrl = await this.stripeService.getPortalSession(
                res.stripeCustomerId
            );
            return {
                success: true,
                url: portalUrl,
            };
        } catch (err) {
            console.log("err", err);
            return {
                success: false,
            };
        }
    }


    @Post('webhook')
    async stripeWebhook(@Req() req: any, @Res() res: Response) {
        const { responseStatusCode } = await this.stripeService.webhook(req);
        res.sendStatus(responseStatusCode);
    }
}
