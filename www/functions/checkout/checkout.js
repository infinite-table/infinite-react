// This is your test secret API key.
const stripe = require('stripe')(
  process.env.STRIPE_SECRET_API_KEY
);

const YOUR_DOMAIN = 'https://infinite-table.com';

exports.handler = async (event) => {
  const { quantity } = JSON.parse(event.body);
  const validatedQuantity =
    quantity > 0 && quantity < 1000 ? quantity : 1;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: '{{PRICE_ID}}',
        quantity: validatedQuantity,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/?success=true`,
    cancel_url: `${YOUR_DOMAIN}?canceled=true`,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      sessionId: session.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    }),
  };
};
