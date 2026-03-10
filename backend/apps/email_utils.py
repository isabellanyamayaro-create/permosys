import logging
from typing import Iterable

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def send_system_email(subject: str, message: str, recipients: Iterable[str]) -> int:
    """Send email using configured Django SMTP settings.

    Returns number of successfully delivered messages.
    """
    recipient_list = [r for r in recipients if r]
    if not recipient_list:
        return 0

    from_email = settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER
    if not from_email:
        logger.warning("Email skipped: DEFAULT_FROM_EMAIL/EMAIL_HOST_USER is not configured")
        return 0

    try:
        return send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
    except Exception:
        logger.exception("Failed to send email")
        return 0
