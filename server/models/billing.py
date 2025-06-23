"""
Billing Models - Pydantic models for billing-related data structures

Centralized billing models for type safety and validation
"""

from pydantic import BaseModel
from typing import Optional


class MessageLimits(BaseModel):
    """User's message count and limits"""
    message_count: int
    messages_remaining: Optional[int]  # None for unlimited (premium)
    limit: int = 10
    limit_reached: bool


class BillingStatus(BaseModel):
    """Complete billing status for a user"""
    message_count: int
    is_premium: bool
    messages_remaining: Optional[int]  # None for unlimited (premium)
    billing_enabled: bool
    stripe_session_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None


class MessageLimitCheck(BaseModel):
    """Result of checking if user can send more messages"""
    can_send: bool
    is_premium: bool
    message_count: int
    messages_remaining: Optional[int]
    limit_reached: bool


class SubscriptionInfo(BaseModel):
    """Stripe subscription information"""
    subscription_id: str
    customer_id: str
    status: str  # active, trialing, canceled, etc.
    user_id: str


class CheckoutRequest(BaseModel):
    """Request to create checkout session"""
    lookup_key: str = "premium-plan"


class PortalRequest(BaseModel):
    """Request to create customer portal session"""
    session_id: str


class WebhookEvent(BaseModel):
    """Stripe webhook event data"""
    event_type: str
    data_object: dict
    user_id: Optional[str] = None


class UsageResponse(BaseModel):
    """Response for usage endpoint"""
    message_count: int
    is_premium: bool
    messages_remaining: Optional[int]
    billing_enabled: bool
    stripe_session_id: Optional[str] = None


class CheckoutResponse(BaseModel):
    """Response for checkout session creation"""
    url: str


class PortalResponse(BaseModel):
    """Response for portal session creation"""
    url: str


class WebhookResponse(BaseModel):
    """Response for webhook processing"""
    status: str = "success"