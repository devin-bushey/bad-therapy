from fastapi import Request
from jose import jwt
import os


def get_user_id_for_rate_limit(request: Request) -> str:
    """
    Extract user ID from JWT token for rate limiting.
    Falls back to IP address if user is not authenticated.
    """
    try:
        # Try to get JWT token from Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            # Decode without verification for rate limiting (just need user ID)
            payload = jwt.get_unverified_claims(token)
            if payload and "sub" in payload:
                return f"user:{payload['sub']}"
    except Exception:
        # If JWT parsing fails, fall back to IP
        pass
    
    # Fall back to IP address for unauthenticated requests
    return f"ip:{request.client.host}"


def get_remote_address(request: Request) -> str:
    """
    Get remote address for IP-based rate limiting.
    """
    return f"ip:{request.client.host}"