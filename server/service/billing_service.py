"""
Billing Service Module

Centralizes all billing-related logic including message limits,
premium status checks, and usage tracking.
"""

from typing import Dict, Any
from database.user_profile import get_user_profile, increment_message_count
from core.config import get_settings
import logging

logger = logging.getLogger(__name__)

class BillingService:
    """Service class for handling billing operations"""
    
    def __init__(self):
        self.settings = get_settings()
    
    def is_billing_enabled(self) -> bool:
        """Check if billing is enabled in settings"""
        return self.settings.BILLING_ENABLED
    
    def get_user_billing_status(self, user_id: str) -> Dict[str, Any]:
        """Get comprehensive billing status for a user"""
        if not self.is_billing_enabled():
            return {
                "is_premium": True,
                "message_count": 0,
                "messages_remaining": None,
                "billing_enabled": False
            }
        
        user_profile = get_user_profile(user_id=user_id)
        if not user_profile:
            return {
                "is_premium": False,
                "message_count": 0,
                "messages_remaining": 10,
                "billing_enabled": True
            }
        
        message_count = user_profile.get('message_count', 0)
        is_premium = user_profile.get('is_premium', False)
        messages_remaining = None if is_premium else max(0, 10 - message_count)
        
        return {
            "is_premium": is_premium,
            "message_count": message_count,
            "messages_remaining": messages_remaining,
            "billing_enabled": True,
            "stripe_session_id": user_profile.get('stripe_session_id'),
            "stripe_customer_id": user_profile.get('stripe_customer_id')
        }
    
    def check_message_limits(self, user_id: str) -> Dict[str, Any]:
        """
        Check if user can send a message based on their billing status
        
        Returns:
            Dict with 'can_send' boolean and additional context
        """
        if not self.is_billing_enabled():
            return {
                "can_send": True,
                "reason": "billing_disabled",
                "message_count": 0,
                "is_premium": True
            }
        
        user_profile = get_user_profile(user_id=user_id)
        if not user_profile:
            # New user, allow first message
            return {
                "can_send": True,
                "reason": "new_user",
                "message_count": 0,
                "is_premium": False
            }
        
        is_premium = user_profile.get('is_premium', False)
        if is_premium:
            return {
                "can_send": True,
                "reason": "premium_user",
                "message_count": user_profile.get('message_count', 0),
                "is_premium": True
            }
        
        message_count = user_profile.get('message_count', 0)
        if message_count >= 10:
            return {
                "can_send": False,
                "reason": "limit_reached",
                "message_count": message_count,
                "is_premium": False,
                "limit": 10
            }
        
        return {
            "can_send": True,
            "reason": "within_limit",
            "message_count": message_count,
            "is_premium": False,
            "remaining": 10 - message_count
        }
    
    def increment_user_message_count(self, user_id: str) -> bool:
        """
        Increment message count for user
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if not self.is_billing_enabled():
                # No need to track if billing is disabled
                return True
            
            increment_message_count(user_id)
            logger.info(f"Incremented message count for user {user_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to increment message count for user {user_id}: {e}")
            return False
    
    def format_limit_error_response(self, user_id: str) -> Dict[str, Any]:
        """Format the standard message limit error response"""
        limit_check = self.check_message_limits(user_id)
        
        return {
            "error_type": "MESSAGE_LIMIT_REACHED",
            "message": "You've reached your 10 free message limit. Upgrade to Premium for unlimited messages!",
            "current_count": limit_check.get("message_count", 10),
            "limit": 10,
            "upgrade_required": True
        }
    
    def get_billing_status(self, user_id: str) -> Dict[str, Any]:
        """Alias for get_user_billing_status for compatibility"""
        return self.get_user_billing_status(user_id)
    
    # Webhook handler methods
    def handle_checkout_completed(self, checkout_session: Dict[str, Any]):
        """Handle checkout.session.completed webhook"""
        customer_id = checkout_session.get('customer')
        
        if customer_id and checkout_session.get('metadata', {}).get('user_id'):
            user_id = checkout_session['metadata']['user_id']
            from database.user_profile import update_user_profile
            # Store session_id for customer portal access
            update_user_profile(user_id, {
                "stripe_customer_id": customer_id,
                "stripe_session_id": checkout_session['id'],
                "is_premium": True,
                "message_count": 0
            })
            logger.info(f'✅ Payment succeeded for user {user_id}')
    
    def handle_subscription_created(self, subscription: Dict[str, Any]):
        """Handle customer.subscription.created webhook"""
        import stripe
        customer_id = subscription["customer"]
        
        # Find user by customer ID and activate premium
        customer = stripe.Customer.retrieve(customer_id)
        user_id = customer.metadata.get("user_id")
        
        if user_id:
            from database.user_profile import update_user_profile
            update_user_profile(user_id, {
                "is_premium": True,
                "message_count": 0
            })
            logger.info(f'✅ Subscription created for user {user_id}')
    
    def handle_subscription_updated(self, subscription: Dict[str, Any]):
        """Handle customer.subscription.updated webhook"""
        import stripe
        customer_id = subscription["customer"]
        
        customer = stripe.Customer.retrieve(customer_id)
        user_id = customer.metadata.get("user_id")
        
        if user_id:
            from database.user_profile import update_user_profile
            # Update subscription status based on subscription state
            is_active = subscription["status"] in ["active", "trialing"]
            update_user_profile(user_id, {
                "is_premium": is_active
            })
            logger.info(f'✅ Subscription updated for user {user_id}: {subscription["status"]}')
    
    def handle_subscription_deleted(self, subscription: Dict[str, Any]):
        """Handle customer.subscription.deleted webhook"""
        import stripe
        customer_id = subscription["customer"]
        
        customer = stripe.Customer.retrieve(customer_id)
        user_id = customer.metadata.get("user_id")
        
        if user_id:
            from database.user_profile import update_user_profile
            update_user_profile(user_id, {
                "is_premium": False
            })
            logger.info(f'✅ Subscription canceled for user {user_id}')
    
    def handle_trial_ending(self, subscription: Dict[str, Any]):
        """Handle customer.subscription.trial_will_end webhook"""
        import stripe
        customer_id = subscription["customer"]
        
        customer = stripe.Customer.retrieve(customer_id)
        user_id = customer.metadata.get("user_id")
        logger.info(f'⚠️ Trial ending soon for user {user_id}')
    
    def handle_payment_succeeded(self, invoice: Dict[str, Any]):
        """Handle invoice.payment_succeeded webhook"""
        import stripe
        customer_id = invoice["customer"]
        
        if invoice["billing_reason"] == "subscription_cycle":
            customer = stripe.Customer.retrieve(customer_id)
            user_id = customer.metadata.get("user_id")
            
            if user_id:
                from database.user_profile import update_user_profile
                # Reset message count on successful billing cycle
                update_user_profile(user_id, {
                    "message_count": 0
                })
                logger.info(f'✅ Payment succeeded - reset message count for user {user_id}')

# Global instance for easy import
billing_service = BillingService()