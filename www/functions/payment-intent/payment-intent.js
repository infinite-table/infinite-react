// This is your test secret API key.
const stripe = require('stripe')(
  process.env.STRIPE_SECRET_API_KEY
);

exports.handler = async (event) => {
  const { amount } = JSON.parse(event.body);

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount || 1,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      clientSecret: paymentIntent.client_secret,
    }),
  };
};
