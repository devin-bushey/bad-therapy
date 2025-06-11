from langchain_core.tools import StructuredTool
from pydantic import BaseModel, Field
import requests
from urllib.parse import urlparse
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

TOOL_VALIDATE_RESOURCE = "validate_resource"

class ValidateResourceInput(BaseModel):
    url: str = Field(..., description="The URL to validate")
    timeout: int = Field(default=10, description="Request timeout in seconds")

def _validate_resource(url: str, timeout: int = 10) -> Dict[str, Any]:
    """Validate a resource URL for accessibility and basic safety"""
    try:
        # Parse URL to check if it's valid
        parsed_url = urlparse(url)
        if not all([parsed_url.scheme, parsed_url.netloc]):
            return {
                "is_valid": False,
                "is_accessible": False,
                "status_code": None,
                "error": "Invalid URL format",
                "safety_score": 0.0,
                "content_type": None
            }
        
        # Check if URL uses HTTPS (preferred for mental health resources)
        is_secure = parsed_url.scheme == 'https'
        
        # Make HEAD request to check accessibility without downloading content
        try:
            response = requests.head(url, timeout=timeout, allow_redirects=True)
            is_accessible = response.status_code == 200
            status_code = response.status_code
            content_type = response.headers.get('content-type', '').lower()
            
            # If HEAD fails, try GET with minimal content
            if not is_accessible:
                response = requests.get(url, timeout=timeout, stream=True, allow_redirects=True)
                is_accessible = response.status_code == 200
                status_code = response.status_code
                content_type = response.headers.get('content-type', '').lower()
                
        except requests.RequestException as e:
            return {
                "is_valid": True,
                "is_accessible": False,
                "status_code": None,
                "error": str(e),
                "safety_score": 0.0,
                "content_type": None
            }
        
        # Calculate safety score based on various factors
        safety_score = _calculate_safety_score(parsed_url, is_secure, content_type, status_code)
        
        return {
            "is_valid": True,
            "is_accessible": is_accessible,
            "status_code": status_code,
            "error": None,
            "safety_score": safety_score,
            "content_type": content_type,
            "is_secure": is_secure
        }
        
    except Exception as e:
        logger.error(f"Error validating resource {url}: {e}")
        return {
            "is_valid": False,
            "is_accessible": False,
            "status_code": None,
            "error": str(e),
            "safety_score": 0.0,
            "content_type": None
        }

def _calculate_safety_score(parsed_url, is_secure: bool, content_type: str, status_code: int) -> float:
    """Calculate safety score for a mental health resource"""
    score = 0.0
    
    # Base score for accessibility
    if status_code == 200:
        score += 0.3
    
    # Security bonus
    if is_secure:
        score += 0.2
    
    # Domain reputation (known mental health organizations)
    trusted_domains = {
        'psychologytoday.com': 0.3,
        'mayoclinic.org': 0.4,
        'nimh.nih.gov': 0.4,
        'apa.org': 0.4,
        'nami.org': 0.3,
        'mentalhealthamerica.net': 0.3,
        'samhsa.gov': 0.4,
        'cdc.gov': 0.4,
        'who.int': 0.3,
        'healthline.com': 0.25,
        'webmd.com': 0.2,
        'verywellmind.com': 0.3,
        'betterhelp.com': 0.25,
        'talkspace.com': 0.25,
        'headspace.com': 0.3,
        'calm.com': 0.3,
        'youtube.com': 0.15,  # Lower due to variable quality
        'youtu.be': 0.15
    }
    
    domain = parsed_url.netloc.lower()
    for trusted_domain, domain_score in trusted_domains.items():
        if trusted_domain in domain:
            score += domain_score
            break
    else:
        # Unknown domain gets minimal score
        score += 0.1
    
    # Content type bonus
    if content_type:
        if 'text/html' in content_type:
            score += 0.1
        elif any(media_type in content_type for media_type in ['video', 'audio']):
            score += 0.05
    
    # Cap the score at 1.0
    return min(score, 1.0)

validate_resource_tool = StructuredTool.from_function(
    func=_validate_resource,
    args_schema=ValidateResourceInput,
    name=TOOL_VALIDATE_RESOURCE,
    description=(
        "Validate a resource URL for accessibility, security, and basic safety. "
        "Use this tool to verify links before including them in tips. "
        "Returns validation status, accessibility, safety score, and other metadata."
    ),
)