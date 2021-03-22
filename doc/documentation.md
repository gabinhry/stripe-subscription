
### How does it work? ? ### 
Thois module uses Stripe's checkout session. </br>
They are meant to create a payment session on Stripe's side for a given user and given product. </br>
We will redirect our user to this session when he clicks (hopefully) on "BUY NOW".

#### High picture of the workflow: ####
- User clicks on a "buy button". </br>
- Frontend asks backend to create a Stripe checkout session. </br>
- Backend creates the checkout session and returns the corresponding sessionId to the frontend. </br>
- Frontend redirects the user to the created session using the sessionId. </br>
- User pays on Stripe website and get redirect to your website (thanks to the successUrl you'll provide) once the payment is successfully done. </br>
- Backend is receiving notifications about the payment status thanks to a Webhook and save the payment status in database. </br>

[Stripe's official documentation](https://stripe.com/docs)