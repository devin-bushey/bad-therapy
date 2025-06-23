"""
Billing Utilities Module

Contains billing-related constants, helpers, and response formatters.
"""

from typing import Dict, Any
from fastapi.responses import JSONResponse

# Billing Constants
FREE_MESSAGE_LIMIT = 10
PREMIUM_PLAN_PRICE = "$5/week"

# Error Types
ERROR_TYPE_MESSAGE_LIMIT = "MESSAGE_LIMIT_REACHED"

def create_message_limit_response(error_data: Dict[str, Any]) -> JSONResponse:
    """
    Create a standardized JSONResponse for message limit errors
    
    Args:
        error_data: Dictionary containing error details
        
    Returns:
        JSONResponse with 402 status code
    """
    return JSONResponse(
        status_code=402,
        content=error_data
    )

def format_billing_error_message(current_count: int, limit: int = FREE_MESSAGE_LIMIT) -> str:
    """
    Format a user-friendly billing error message
    
    Args:
        current_count: Current message count
        limit: Message limit (default: FREE_MESSAGE_LIMIT)
        
    Returns:
        Formatted error message string
    """
    return f"You've reached your {limit} free message limit. Upgrade to Premium for unlimited messages!"

def get_upgrade_required_response(
    current_count: int, 
    limit: int = FREE_MESSAGE_LIMIT,
    custom_message: str = None
) -> Dict[str, Any]:
    """
    Get standardized upgrade required response data
    
    Args:
        current_count: Current message count
        limit: Message limit
        custom_message: Optional custom message
        
    Returns:
        Dictionary with standardized error response structure
    """
    message = custom_message or format_billing_error_message(current_count, limit)
    
    return {
        "error_type": ERROR_TYPE_MESSAGE_LIMIT,
        "message": message,
        "current_count": current_count,
        "limit": limit,
        "upgrade_required": True
    }

def log_billing_action(action: str, user_id: str, details: Dict[str, Any] = None):
    """
    Log billing-related actions for monitoring and debugging
    
    Args:
        action: Action type (e.g., "message_limit_check", "count_increment")
        user_id: User identifier
        details: Additional details to log
    """
    import logging
    logger = logging.getLogger(__name__)
    
    log_data = {
        "action": action,
        "user_id": user_id,
        **(details or {})
    }
    
    logger.info(f"Billing action: {log_data}")

def is_message_valid_for_counting(prompt: str) -> bool:
    """
    Determine if a message should count towards usage limits
    
    Args:
        prompt: The user's message/prompt
        
    Returns:
        Boolean indicating if message should be counted
    """
    return bool(prompt and prompt.strip())

def calculate_messages_remaining(current_count: int, is_premium: bool, limit: int = FREE_MESSAGE_LIMIT) -> int:
    """
    Calculate remaining messages for a user
    
    Args:
        current_count: Current message count
        is_premium: Whether user is premium
        limit: Message limit for free users
        
    Returns:
        Number of remaining messages (None for premium users)
    """
    if is_premium:
        return None  # Unlimited for premium
    
    return max(0, limit - current_count)