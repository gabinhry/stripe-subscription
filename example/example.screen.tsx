import React from "react";
import styled from "styled-components";
import Button from "../../components/forms/button.component";
import Text from "../../components/style/text.component";
import { getPortalSessionUrl, getSubscribeSessionId } from "../../services/stripe.service";
import colors from "../../themes/colors.theme";
import { loadStripe } from '@stripe/stripe-js';
import { environment } from "../../environments";
import { useLogin } from "../../utils/auth.utils";
import { Redirect } from "react-router";

const Container = styled.div` 
    background-color: ${colors.dark};
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
`

const Content = styled.div` 
    width: 200px;
`

const stripePromise = loadStripe(environment.stripePK);

const ExampleScreen = () => {
    const { isLogin } = useLogin();

    const subscribe = async () => {
        console.log("subscribe");
        const stripe = await stripePromise;

        const res = await getSubscribeSessionId({
            successUrl: `put your return success url here`,
            cancelUrl: `put your return cancel url here`,
        })
        if (res.statusCode !== 200) return;
        const sessionId = res.data.sessionId;
        console.log("sessionId", sessionId);
        // When the customer clicks on the button, redirect them to Checkout.
        const result = await stripe.redirectToCheckout({
            sessionId,
        });

        if (result.error) {
            // If `redirectToCheckout` fails due to a browser or network
            // error, display the localized error message to your customer
            // using `result.error.message`.
        }
    };

    const openPortalStripe = async () => {
        const res = await getPortalSessionUrl();
        if (res.statusCode == 200 && res.data.success) {
            const link = document.createElement('a');
            link.href = res.url;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
        }
    }

    if (!isLogin) return <Redirect to="/" />

    return <Container>
        <Text h1>
            Example subscribtion with stripe
        </Text>
        <Content style={{ marginTop: 20 }}>
            <Button text="Subscribe" style={{ marginTop: 20 }} onClick={subscribe} />
            <Button text="See portal on stripe" style={{ marginTop: 10 }} onClick={openPortalStripe} />
        </Content>
    </Container>
}

export default ExampleScreen;
