import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    @staticmethod
    def _send_email(to_email: str, subject: str, html_content: str):
        # Skip sending if credentials aren't set (fail-safe for local dev without email setup)
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning("SMTP credentials not set. Email not sent.")
            logger.info(f"Would have sent: {subject} to {to_email}")
            return

        msg = MIMEMultipart()
        msg["From"] = settings.SMTP_USER
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(html_content, "html"))

        try:
            # Connect securely to the SMTP server
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
            server.quit()
        except Exception as e:
            logger.exception(e)

    @staticmethod
    def send_verification_email(email: str, token: str):
        # 🚨 Notice how it dynamically uses FRONTEND_URL from your .env!
        link = f"{settings.FRONTEND_URL}/?verify_token={token}"
        
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome to SnapChecker!</h2>
                <p>Please click the button below to verify your SnapChecker account.</p>
                <a href="{link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
            </body>
        </html>
        """
        EmailService._send_email(email, "Verify your SnapChecker Account", html)

    @staticmethod
    def send_password_reset_email(email: str, token: str):
        link = f"{settings.FRONTEND_URL}/?reset_token={token}"
        
        html = f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>SnapChecker Password Reset</h2>
                <p>We received a request to reset the password for your account.</p>
                <a href="{link}" style="display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
            </body>
        </html>
        """
        EmailService._send_email(email, "Reset your SnapChecker Password", html)