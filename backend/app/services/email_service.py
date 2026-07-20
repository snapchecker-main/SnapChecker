import logging

import resend

from app.config import settings

logger = logging.getLogger(__name__)

resend.api_key = settings.RESEND_API_KEY


class EmailService:

    @staticmethod
    def _send_email(
        to_email: str,
        subject: str,
        html_content: str,
    ):
        if not settings.RESEND_API_KEY:
            logger.warning("RESEND_API_KEY is not configured.")
            return

        try:
            resend.Emails.send(
                {
                    "from": f"SnapChecker <{settings.EMAIL_FROM}>",
                    "to": [to_email],
                    "subject": subject,
                    "html": html_content,
                }
            )

            logger.info(f"Email sent successfully to {to_email}")

        except Exception:
            logger.exception("Failed to send email")

    @staticmethod
    def send_verification_email(
        email: str,
        token: str,
    ):
        link = f"{settings.FRONTEND_URL}/?verify_token={token}"

        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding:20px;">
                <h2>Welcome to SnapChecker!</h2>

                <p>
                    Please verify your account by clicking the button below.
                </p>

                <a
                    href="{link}"
                    style="
                        display:inline-block;
                        padding:10px 20px;
                        background:#2563eb;
                        color:white;
                        text-decoration:none;
                        border-radius:6px;
                    "
                >
                    Verify Email
                </a>

                <p style="margin-top:20px;color:#666;font-size:12px;">
                    If you didn't create this account, you can safely ignore this email.
                </p>
            </body>
        </html>
        """

        EmailService._send_email(
            email,
            "Verify your SnapChecker Account",
            html,
        )

    @staticmethod
    def send_password_reset_email(
        email: str,
        token: str,
    ):
        link = f"{settings.FRONTEND_URL}/?reset_token={token}"

        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding:20px;">
                <h2>Reset your SnapChecker Password</h2>

                <p>
                    Click the button below to reset your password.
                </p>

                <a
                    href="{link}"
                    style="
                        display:inline-block;
                        padding:10px 20px;
                        background:#dc2626;
                        color:white;
                        text-decoration:none;
                        border-radius:6px;
                    "
                >
                    Reset Password
                </a>

                <p style="margin-top:20px;color:#666;font-size:12px;">
                    If you didn't request a password reset, you can ignore this email.
                </p>
            </body>
        </html>
        """

        EmailService._send_email(
            email,
            "Reset your SnapChecker Password",
            html,
        )