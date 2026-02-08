/**
 * Payment Webhook Handler
 * 
 * Express middleware for handling payment webhooks from external providers
 * (Telecom Credit, Alpha Note, etc.)
 * 
 * This file exports an Express router that can be mounted on the main app.
 */

import { Router, Request, Response } from "express";
import { processPaymentWebhook } from "./paymentRouter";

const webhookRouter = Router();

/**
 * Generic webhook endpoint for payment providers
 * POST /api/payment/webhook/:provider
 * 
 * Supported providers:
 * - telecom_credit
 * - alpha_note
 * - bank_transfer (for manual notifications)
 * - other
 */
webhookRouter.post("/webhook/:provider", async (req: Request, res: Response) => {
  const provider = req.params.provider as 'telecom_credit' | 'alpha_note' | 'bank_transfer' | 'other';
  
  // Validate provider
  const validProviders = ['telecom_credit', 'alpha_note', 'bank_transfer', 'other'];
  if (!validProviders.includes(provider)) {
    res.status(400).json({ error: "Invalid provider" });
    return;
  }

  // Get source IP for logging
  const sourceIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
    || req.socket.remoteAddress 
    || 'unknown';

  try {
    // Parse payload (support both JSON and form-urlencoded)
    let payload: Record<string, any>;
    
    if (req.headers['content-type']?.includes('application/json')) {
      payload = req.body;
    } else if (req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      payload = req.body;
    } else {
      // Try to parse as JSON anyway
      payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    }

    console.log(`[Payment Webhook] Received from ${provider}:`, {
      sourceIp,
      contentType: req.headers['content-type'],
      payloadKeys: Object.keys(payload || {}),
    });

    // Process the webhook
    const result = await processPaymentWebhook(provider, payload, sourceIp);

    if (result.success) {
      console.log(`[Payment Webhook] Successfully processed: ${result.message}`, { linkId: result.linkId });
      res.status(200).json({ 
        success: true, 
        message: result.message,
        linkId: result.linkId,
      });
    } else {
      console.warn(`[Payment Webhook] Processing failed: ${result.message}`, { linkId: result.linkId });
      // Still return 200 to prevent retries for known failures
      res.status(200).json({ 
        success: false, 
        message: result.message,
        linkId: result.linkId,
      });
    }
  } catch (error) {
    console.error("[Payment Webhook] Error processing webhook:", error);
    // Return 500 to trigger retry from provider
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * Health check endpoint for payment webhooks
 * GET /api/payment/webhook/health
 */
webhookRouter.get("/webhook/health", (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    message: "Payment webhook endpoint is healthy",
  });
});

/**
 * Webhook verification endpoint (for providers that require URL verification)
 * GET /api/payment/webhook/:provider
 */
webhookRouter.get("/webhook/:provider", (req: Request, res: Response) => {
  const provider = req.params.provider;
  
  // Some providers send a verification challenge
  const challenge = req.query.challenge || req.query.hub_challenge || req.query.verify_token;
  
  if (challenge) {
    // Echo back the challenge for verification
    res.status(200).send(challenge);
    return;
  }

  // Otherwise, just confirm the endpoint exists
  res.status(200).json({
    status: "ok",
    provider,
    message: "Webhook endpoint is ready",
    timestamp: new Date().toISOString(),
  });
});

export { webhookRouter };
