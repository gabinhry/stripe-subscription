### Step 1 - Back
Add folder `stripe` in your `backend/src/api`.

Don't forget to add `StripeModule` in the imports of the `app.module`.

### Step 2
Add folder `subscription` in your `backend/src/api`.

Don't forget to add `SubscriptionModule` in the imports of the `app.module`.

### Step 3
Add following code in your environments files :

    stripe: {
        prices: {
            product_1: "price_1xXxXXxxxXXXxxxxX"
        },
        secretKey: "sk_test_xXxXXxxxXXXxxxxXxXxXXxxxXXXxxxxXxXxXXxxxXXXxxxxXxXxXXxxxXXXxxxxXxXxXXxxxXXXxxxxXxXxXXxxxXXXxxxxX",
        webhookSecret: "whsec_3xXxXXxxxXXXxxxxXxXxXXxxxXXXxxxxX"
    },

For the price you need to create a product on Stripe before. 

And for the webhookSecret you need to create a webhook with these events :
- checkout.session.completed
- invoice.paid
- invoice.payment_failed
- customer.subscription.deleted
- invoice.payment_action_required


### Step 4
In user.interface.ts add this : `stripeCustomerId?: string;`

In user.interface.ts add this : 

<pre>
    @Column({ nullable: true, select: false })
    stripeCustomerId: string;
</pre>

### Step 5

In user.service.ts add following code : 

<pre>
    async updateStripe(
        userId: string,
        stripeCustomerId
    ) {
        const userEntity = new UserEntity();

        userEntity.stripeCustomerId = stripeCustomerId;

        return await this.userRepository.update(userId, userEntity);
    }

    async updateRole(
        userId: string,
        role
    ) {
        const userEntity = new UserEntity();
        userEntity.role = role;
        return await this.userRepository.update(userId, userEntity);
    }
    
    async getStripeId(userId): Promise<UserEntity> {
        return await this.userRepository
            .createQueryBuilder("user")
            .select(["user.stripeCustomerId"])
            .where("user.id = :userId", { userId: userId })
            .getOne();
    }
</pre>

### Step 6
In backend install `npm install stripe@8.132.0`

### Step 7

Add following code in main.ts

<pre>
import * as bodyParser from 'body-parser';

(...)

const rawBodyBuffer = (req: any, res: any, buf: any, encoding: any) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  };

  app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
  app.use(bodyParser.json({ verify: rawBodyBuffer }));
</pre>

### Step 8 - Front
Add folder `example` in your `frontend/src/pages`.

Add sussess and cancel urls.

And following code in pages.navigation.tsx :

```
    <Route exact path="/example" component={ExampleScreen} />
```

You need to be connected to access to this page.

### Step 9
In frontend install `npm install @stripe/stripe-js@1.11.0`

### Step 10
Add stripe public key in your environment :
<pre>
    stripePK: "pk_test_XxxXXXXxXXXXXXXxXXxxxxxXxxXXXXxXXXXXXXxXXxxxxxXxxXXXXxXXXXXXXxXXxxxxxXxxXXXXxXXXXXXXxXXxxxxx"
</pre>

### Bonus

If you want to inform your users when they correctly subscribe or when the subscribtion is cancelled for example.

You can use a mailer module and send mail in the webhook in `stripe/stripe.service.ts`.

That's it ! :rocket:
