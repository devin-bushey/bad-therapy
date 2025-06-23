from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
import stripe
import os
from service.billing_service import billing_service
from models.billing import (
    CheckoutRequest, PortalRequest, UsageResponse, 
    CheckoutResponse, PortalResponse, WebhookResponse
)
from utils.jwt_bearer import require_auth
import json
from core.config import get_settings

router = APIRouter()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.post("/create-checkout-session")
async def create_checkout_session(
    request: CheckoutRequest,
    current_user = Depends(require_auth)
) -> CheckoutResponse:
    """Create Stripe Checkout Session for subscription"""
    if not billing_service.is_billing_enabled():
        raise HTTPException(status_code=400, detail="Billing is currently disabled")
    
    try:
        # Get price using lookup key (following Stripe best practices)
        prices = stripe.Price.list(
            lookup_keys=[request.lookup_key],
            expand=['data.product']
        )
        
        if not prices.data:
            raise HTTPException(status_code=400, detail="Price not found")
        
        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price': prices.data[0].id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f"{FRONTEND_URL}/dashboard?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/dashboard?canceled=true",
            # Add customer info for better UX
            customer_email=getattr(current_user, 'email', None),
            metadata={
                "user_id": current_user.sub
            }
        )
        
        return CheckoutResponse(url=checkout_session.url)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create-portal-session")
async def create_portal_session(
    request: PortalRequest,
    current_user = Depends(require_auth)
) -> PortalResponse:
    """Create Stripe Customer Portal session for billing management"""
    if not billing_service.is_billing_enabled():
        raise HTTPException(status_code=400, detail="Billing is currently disabled")
    
    try:
        # Following Stripe sample pattern - use checkout session to get customer
        checkout_session = stripe.checkout.Session.retrieve(request.session_id)
        
        if not checkout_session.customer:
            raise HTTPException(status_code=400, detail="No customer found for session")
        
        # Create portal session
        portal_session = stripe.billing_portal.Session.create(
            customer=checkout_session.customer,
            return_url=f"{FRONTEND_URL}/dashboard"
        )
        
        return PortalResponse(url=portal_session.url)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request) -> WebhookResponse:
    """Handle Stripe webhook events - Following official Stripe sample patterns"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        # Always require webhook signature verification in production
        if not STRIPE_WEBHOOK_SECRET:
            print("❌ Webhook error - STRIPE_WEBHOOK_SECRET not configured")
            raise HTTPException(status_code=500, detail="Webhook secret not configured")
        
        if not sig_header:
            print("❌ Webhook error - Missing stripe-signature header")
            raise HTTPException(status_code=400, detail="Missing signature header")
        
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload=payload, 
            sig_header=sig_header, 
            secret=STRIPE_WEBHOOK_SECRET
        )
        data = event['data']
        
        event_type = event['type']
        data_object = data['object']
        
        print(f'Webhook received: {event_type}')
        
        # Handle events using billing service
        if event_type == 'checkout.session.completed':
            billing_service.handle_checkout_completed(data_object)
        
        elif event_type == 'customer.subscription.created':
            billing_service.handle_subscription_created(data_object)
        
        elif event_type == 'customer.subscription.updated':
            billing_service.handle_subscription_updated(data_object)
        
        elif event_type == 'customer.subscription.deleted':
            billing_service.handle_subscription_deleted(data_object)
        
        elif event_type == 'customer.subscription.trial_will_end':
            billing_service.handle_trial_ending(data_object)
        
        elif event_type == 'invoice.payment_succeeded':
            billing_service.handle_payment_succeeded(data_object)
        
        return WebhookResponse(status="success")
        
    except ValueError as e:
        print(f"❌ Webhook error - Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        print(f"❌ Webhook error - Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception as e:
        print(f"❌ Webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usage")
async def get_usage(current_user = Depends(require_auth)) -> UsageResponse:
    """Get user's current usage and subscription status"""
    try:
        billing_status = billing_service.get_billing_status(current_user.sub)
        return UsageResponse(**billing_status)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))