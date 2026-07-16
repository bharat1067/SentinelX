from fastapi import Header, HTTPException, status, Depends
from typing import List, Optional
from app.core.auth.token import decode_access_token

def get_current_user(authorization: Optional[str] = Header(None, description="Bearer authorization token")) -> dict:
    """
    Decodes and verifies bearer token, returning authenticated user payload.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization credentials are required."
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication scheme must be Bearer token."
        )
        
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Clearance expired or security signature mismatch."
        )
    return payload

class RoleGuard:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user)) -> dict:
        """
        Guards endpoints by cross-referencing user roles with permitted roles.
        """
        user_role = user.get("role")
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Resource access forbidden for role: {user_role}. Permitted: {self.allowed_roles}"
            )
        return user
