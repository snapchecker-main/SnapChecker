from sqlalchemy.orm import Session

from app.models.schema import User
from app.security.password import hash_password, verify_password
from app.security.jwt import create_token, decode_token 
from app.services.email_service import EmailService


class AuthService:

    @staticmethod
    def register(db: Session, data):
        normalized_email = data.email.strip().lower()
        
        domain = normalized_email.split("@")[-1]
        allowed_public_domains = {"gmail.com", "yahoo.com", "outlook.com", "hotmail.com"}
        
        is_academic = domain.endswith(".edu") or domain.endswith(".edu.ph")
        is_public = domain in allowed_public_domains

        if not (is_academic or is_public):
            raise ValueError("Registration is restricted to official university emails or verified providers (Gmail, Yahoo, Outlook).")

        # 🚨 ADDED: Password Policy
        if len(data.password) < 8:
            raise ValueError("Password must be at least 8 characters long.")

        existing_user = db.query(User).filter(User.email == normalized_email).first()
        if existing_user:
            raise ValueError("Email already registered.")

        user = User(
            email=normalized_email,
            password_hash=hash_password(data.password),
            full_name=data.full_name,
            school_name=data.school_name,
            department=data.department,
            is_verified=False, 
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        verify_token = create_token(user.id, user.email, "verify_email")
        EmailService.send_verification_email(user.email, verify_token)

        return user
    
    @staticmethod
    def login(db: Session, email: str, password: str):
        # 🚨 Normalized Email Processing
        normalized_email = email.strip().lower()
        user = db.query(User).filter(User.email == normalized_email).first()

        if not user or not verify_password(password, user.password_hash):
            raise ValueError("Invalid email or password.")
            
        if not user.is_verified:
            raise ValueError("Please verify your email address before logging in.")

        access_token = create_token(user.id, user.email, "access")
        refresh_token = create_token(user.id, user.email, "refresh")

        return {
            "user": user,
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    
    @staticmethod
    def refresh(refresh_token: str):
        from app.security.jwt import decode_token, create_token

        payload = decode_token(refresh_token)

        if payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token.")

        access_token = create_token(
            user_id=int(payload["sub"]),
            email=payload["email"],
            token_type="access",
        )

        return access_token

    @staticmethod
    def verify_email(db: Session, token: str):
        try:
            payload = decode_token(token)
            if payload.get("type") != "verify_email":
                raise ValueError("Invalid token type.")
        except Exception:
            raise ValueError("Invalid or expired verification token.")

        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            raise ValueError("User not found.")

        if user.is_verified:
            return {"message": "Email is already verified."}

        user.is_verified = True
        db.commit()
        return {"message": "Email verified successfully. You can now log in."}

    @staticmethod
    def forgot_password(db: Session, email: str):
        normalized_email = email.strip().lower()
        user = db.query(User).filter(User.email == normalized_email).first()
        if not user:
            # Prevent email enumeration attacks
            return {"message": "If an account exists, a password reset link has been sent."}

        reset_token = create_token(user.id, user.email, "reset_password")
        EmailService.send_password_reset_email(user.email, reset_token)
        
        return {"message": "If an account exists, a password reset link has been sent."}

    @staticmethod
    def reset_password(db: Session, token: str, new_password: str):
        try:
            payload = decode_token(token)
            if payload.get("type") != "reset_password":
                raise ValueError("Invalid token type.")
        except Exception:
            raise ValueError("Invalid or expired reset token.")

        if len(new_password) < 8:
            raise ValueError("Password must be at least 8 characters long.")

        user = db.query(User).filter(User.id == int(payload["sub"])).first()
        if not user:
            raise ValueError("User not found.")

        user.password_hash = hash_password(new_password)
        db.commit()
        return {"message": "Password reset successfully. You can now log in."}

    @staticmethod
    def change_password(
        db: Session,
        user: User,
        current_password: str,
        new_password: str,
    ):
        if not verify_password(current_password, user.password_hash):
            raise ValueError("Current password is incorrect.")

        if len(new_password) < 8:
            raise ValueError("Password must be at least 8 characters long.")

        if verify_password(new_password, user.password_hash):
            raise ValueError(
                "New password must be different from your current password."
            )

        user.password_hash = hash_password(new_password)
        db.commit()

        return {
            "message": "Password updated successfully."
        }