import { Elements } from '@stripe/react-stripe-js';
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import IndexWrapper from '@www/components/IndexWrapper';
import { colorVariables } from '@www/styles/utils.css';
import * as React from 'react';
import { useEffect, useState } from 'react';

import CheckoutForm from './CheckoutForm';

const primaryDark = require('../../colors')['primary'];

const stripePromise = loadStripe(
  //@ts-ignore
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const root = process.env.NEXT_PUBLIC_DOMAIN || 'https://infinite-table.com';
export default function BuyPage() {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch(root + '/.netlify/functions/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 100,
      }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const appearance: Appearance = {
    theme: 'stripe',
    variables: {
      colorText: primaryDark,
      colorPrimary: colorVariables.brandDark,
    },
  };
  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
  };

  return (
    <IndexWrapper>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </IndexWrapper>
  );
}
