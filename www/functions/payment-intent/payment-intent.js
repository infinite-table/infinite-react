// This is your test secret API key.
const stripe = require('stripe')(
  process.env.STRIPE_SECRET_API_KEY
);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
};
exports.handler = async (event) => {
  const { amount } = JSON.parse(event.body || '{}');

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount || 100,
    currency: 'usd',

    payment_method_types: ['card'],
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      clientSecret: paymentIntent.client_secret,
    }),
  };
};
