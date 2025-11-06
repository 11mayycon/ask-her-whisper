import { Router, Request, Response } from 'express';
import Stripe from 'stripe';

const router = Router();
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
    })
  : null;

// Endpoint para criar sessão de checkout
router.post('/create-checkout', async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;

    if (!email || !phone) {
      return res.status(400).json({
        error: 'Email e telefone são obrigatórios'
      });
    }

    console.log('📝 Criando checkout para:', { email, phone });

    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe não está configurado'
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product: process.env.STRIPE_PRODUCT_ID || 'prod_T6FQ6T3HfUh2w7',
            unit_amount: 1990, // R$ 19,90
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        email,
        phone,
      },
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    console.log('✅ Checkout criado:', session.id);

    return res.json({
      url: session.url,
      sessionId: session.id
    });
  } catch (error: any) {
    console.error('❌ Erro ao criar checkout:', error.message);
    return res.status(500).json({
      error: 'Erro ao criar checkout Stripe',
      details: error.message
    });
  }
});

// Endpoint para verificar status da sessão
router.get('/checkout-session/:sessionId', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe não está configurado'
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return res.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
    });
  } catch (error: any) {
    console.error('❌ Erro ao buscar sessão:', error.message);
    return res.status(500).json({
      error: 'Erro ao buscar sessão',
      details: error.message
    });
  }
});

export default router;
