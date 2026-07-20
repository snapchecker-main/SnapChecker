from fastapi import APIRouter, Depends, HTTPException, Response, Request, Cookie 
from sqlalchemy.orm import Session
from app.security.dependencies import get_current_user
from app.models.schema import User
from app.security.limiter import limiter  

from app.auth.schemas import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
)
from app.auth.service import AuthService
from app.config import settings
from app.database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=201,
)
@limiter.limit("5/minute") 
def register(
    request: Request, 
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    try:
        return AuthService.register(db, data)

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post(
    "/login",
    response_model=TokenResponse,
)
@limiter.limit("5/minute")  
def login(
    request: Request,  
    data: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    try:
        result = AuthService.login(
            db,
            data.email,
            data.password,
        )

        response.set_cookie(
            key="refresh_token",
            value=result["refresh_token"],
            httponly=True,
            secure=settings.COOKIE_SECURE,
            samesite=settings.COOKIE_SAMESITE,
            path="/",
            max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        )

        return {
            "access_token": result["access_token"],
            "token_type": "bearer",
        }

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )
    

@router.get(
    "/me",
    response_model=UserResponse,
)
def me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post(
    "/refresh",
    response_model=TokenResponse,
)
def refresh(
    refresh_token: str | None = Cookie(default=None),
):
    if refresh_token is None:
        raise HTTPException(
            status_code=401,
            detail="Missing refresh token.",
        )

    try:
        access_token = AuthService.refresh(refresh_token)

        return {
            "access_token": access_token,
            "token_type": "bearer",
        }

    except ValueError as e:
        raise HTTPException(
            status_code=401,
            detail=str(e),
        )
    

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )

    return {
        "message": "Logged out successfully."
    }


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        return AuthService.verify_email(db, token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/forgot-password")
@limiter.limit("3/minute")  
def forgot_password(
    request: Request, 
    data: ForgotPasswordRequest, 
    db: Session = Depends(get_db)
):
    try:
        return AuthService.forgot_password(db, data.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset-password")
@limiter.limit("3/minute")  
def reset_password(
    request: Request,  
    data: ResetPasswordRequest, 
    db: Session = Depends(get_db)
):
    try:
        return AuthService.reset_password(db, data.token, data.new_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return AuthService.change_password(
            db,
            current_user,
            data.current_password,
            data.new_password,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )