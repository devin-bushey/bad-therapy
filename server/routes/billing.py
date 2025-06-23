from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
import stripe
import os
from database.user_profile import get_user_profile, update_user_profile
from models.user import UserProfile
from utils.jwt_bearer import require_auth
import json
from pydantic import BaseModel
from core.config import get_settings

router = APIRouter()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

class CheckoutRequest(BaseModel):
    lookup_key: str = "premium-plan"

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: CheckoutRequest,
    current_user = Depends(require_auth)
):
    """Create Stripe Checkout Session for subscription"""
    settings = get_settings()
    if not settings.BILLING_ENABLED:
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
        
        return {"url": checkout_session.url}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class PortalRequest(BaseModel):
    session_id: str

@router.post("/create-portal-session")
async def create_portal_session(
    request: PortalRequest,
    current_user = Depends(require_auth)
):
    """Create Stripe Customer Portal session for billing management"""
    settings = get_settings()
    if not settings.BILLING_ENABLED:
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
        
        return {"url": portal_session.url}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events - Following official Stripe sample patterns"""
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        # Verify webhook signature
        if STRIPE_WEBHOOK_SECRET:
            event = stripe.Webhook.construct_event(
                payload=payload, 
                sig_header=sig_header, 
                secret=STRIPE_WEBHOOK_SECRET
            )
            data = event['data']
        else:
            # For development without webhook secret
            event_data = json.loads(payload)
            data = event_data['data']
            event = event_data
        
        event_type = event['type']
        data_object = data['object']
        
        print(f'Webhook received: {event_type}')
        
        # Handle events following Stripe sample patterns
        if event_type == 'checkout.session.completed':
            # Payment succeeded - store session info for customer portal
            checkout_session = data_object
            customer_id = checkout_session.get('customer')
            
            if customer_id and checkout_session.get('metadata', {}).get('user_id'):
                user_id = checkout_session['metadata']['user_id']
                # Store session_id for customer portal access
                update_user_profile(user_id, {
                    "stripe_customer_id": customer_id,
                    "stripe_session_id": checkout_session['id'],
                    "is_premium": True,
                    "message_count": 0
                })
                print(f'✅ Payment succeeded for user {user_id}')
        
        elif event_type == 'customer.subscription.created':
            subscription = data_object
            customer_id = subscription["customer"]
            
            # Find user by customer ID and activate premium
            customer = stripe.Customer.retrieve(customer_id)
            user_id = customer.metadata.get("user_id")
            
            if user_id:
                update_user_profile(user_id, {
                    "is_premium": True,
                    "message_count": 0
                })
                print(f'✅ Subscription created for user {user_id}')
        
        elif event_type == 'customer.subscription.updated':
            subscription = data_object
            customer_id = subscription["customer"]
            
            customer = stripe.Customer.retrieve(customer_id)
            user_id = customer.metadata.get("user_id")
            
            if user_id:
                # Update subscription status based on subscription state
                is_active = subscription["status"] in ["active", "trialing"]
                update_user_profile(user_id, {
                    "is_premium": is_active
                })
                print(f'✅ Subscription updated for user {user_id}: {subscription["status"]}')
        
        elif event_type == 'customer.subscription.deleted':
            subscription = data_object
            customer_id = subscription["customer"]
            
            customer = stripe.Customer.retrieve(customer_id)
            user_id = customer.metadata.get("user_id")
            
            if user_id:
                update_user_profile(user_id, {
                    "is_premium": False
                })
                print(f'✅ Subscription canceled for user {user_id}')
        
        elif event_type == 'customer.subscription.trial_will_end':
            subscription = data_object
            customer_id = subscription["customer"]
            
            customer = stripe.Customer.retrieve(customer_id)
            user_id = customer.metadata.get("user_id")
            print(f'⚠️ Trial ending soon for user {user_id}')
        
        elif event_type == 'invoice.payment_succeeded':
            invoice = data_object
            customer_id = invoice["customer"]
            
            if invoice["billing_reason"] == "subscription_cycle":
                customer = stripe.Customer.retrieve(customer_id)
                user_id = customer.metadata.get("user_id")
                
                if user_id:
                    # Reset message count on successful billing cycle
                    update_user_profile(user_id, {
                        "message_count": 0
                    })
                    print(f'✅ Payment succeeded - reset message count for user {user_id}')
        
        return {"status": "success"}
        
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
async def get_usage(current_user = Depends(require_auth)):
    """Get user's current usage and subscription status"""
    try:
        settings = get_settings()
        
        # If billing is disabled, all users are premium with unlimited messages
        if not settings.BILLING_ENABLED:
            return {
                "message_count": 0,
                "is_premium": True,
                "messages_remaining": None,
                "billing_enabled": False
            }
        
        user_profile = get_user_profile(user_id=current_user.sub)

        print(f'User profile: {user_profile}')
        
        if not user_profile:
            return {
                "message_count": 0,
                "is_premium": False,
                "messages_remaining": 10,
                "billing_enabled": True
            }
        
        message_count = user_profile.get('message_count', 0)
        is_premium = user_profile.get('is_premium', False)
        stripe_session_id = user_profile.get('stripe_session_id')
        messages_remaining = None if is_premium else max(0, 10 - message_count)
        
        return {
            "message_count": message_count,
            "is_premium": is_premium,
            "messages_remaining": messages_remaining,
            "stripe_session_id": stripe_session_id,
            "billing_enabled": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))