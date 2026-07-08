const Stripe = require('stripe');
try {
  const stripe = new Stripe('sk_test_fake', {
    apiVersion: '2025-12-15.clover',
  });
  console.log("Stripe initialized");
} catch(e) {
  console.log("Error:", e.message);
}
