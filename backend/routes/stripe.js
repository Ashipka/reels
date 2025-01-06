const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const pool = require("../db");

router.post("/create-checkout-session", async (req, res) => {
  const { amount, orderId, proposalId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pln", 
            product_data: {
              name: `Order #${orderId} - Proposal #${proposalId}`,
            },
            unit_amount: Math.round(amount * 100), // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment-success?proposalId=${proposalId}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
      automatic_tax: {enabled: true},
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("Error creating checkout session:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/start-onboarding", async (req, res) => {
  const { userId, orderId } = req.query;

  try {
    // Проверяем Stripe Account ID
    const result = await pool.query(`SELECT stripe_account_id FROM users WHERE id = $1`, [userId]);
    if (result.rows.length === 0 || !result.rows[0].stripe_account_id) {
      return res.status(404).json({ message: "Stripe account not found." });
    }

    const accountId = result.rows[0].stripe_account_id;

    // Генерация ссылки на Onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/start-onboarding?userId=${userId}&orderId=${orderId}`,
      return_url: `${process.env.FRONTEND_URL}/proposal-form?orderId=${orderId}`,
      type: "account_onboarding",
    });

    res.status(200).json({ onboardingUrl: accountLink.url });
  } catch (err) {
    console.error("Error starting onboarding:", err.message);
    res.status(500).json({ message: "Failed to start onboarding." });
  }
});

// Check onboarding status
router.get("/check-onboarding-status", async (req, res) => {
  const { userId } = req.query;

  try {
    // Fetch the Stripe account ID
    const result = await pool.query(`SELECT stripe_account_id FROM users WHERE id = $1`, [userId]);

    let accountId = result.rows[0]?.stripe_account_id;

    // If stripe_account_id is null, create a new Stripe account
    if (!accountId) {
      const userResult = await pool.query(`SELECT email, name FROM users WHERE id = $1`, [userId]);
      if (userResult.rows.length === 0) {
        return res.status(404).json({ message: "User not found." });
      }

      const { email, name } = userResult.rows[0];

      // Create a new Stripe account
      const account = await stripe.accounts.create({
        type: "express",
        email,
        business_type: "individual",
        individual: {
          first_name: name.split(" ")[0],
          last_name: name.split(" ")[1] || "",
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      accountId = account.id;

      // Update the user with the new Stripe account ID
      await pool.query(`UPDATE users SET stripe_account_id = $1 WHERE id = $2`, [accountId, userId]);
    }

    // Check onboarding status with Stripe
    const account = await stripe.accounts.retrieve(accountId);
    if (account.details_submitted) {
      return res.status(200).json({ onboarded: true });
    }

    // Generate a new onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.FRONTEND_URL}/stripe-onboarding?userId=${userId}`,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
      type: "account_onboarding",
    });

    return res.status(200).json({ onboarded: false, onboardingUrl: accountLink.url });
  } catch (err) {
    console.error("Error checking onboarding status:", err.message);
    res.status(500).json({ message: "Failed to check onboarding status." });
  }
});

module.exports = router;
