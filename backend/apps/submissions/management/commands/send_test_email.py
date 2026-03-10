from django.core.management.base import BaseCommand
from django.conf import settings
from apps.email_utils import send_system_email


class Command(BaseCommand):
    help = "Send a test email using configured SMTP settings"

    def add_arguments(self, parser):
        parser.add_argument(
            "recipient",
            nargs="?",
            help="Recipient email address (defaults to DEFAULT_FROM_EMAIL)",
        )

    def handle(self, *args, **options):
        recipient = options.get("recipient") or settings.DEFAULT_FROM_EMAIL
        subject = "PMS Test Email"
        message = "This is a test email sent from the PMS management command."
        try:
            sent = send_system_email(subject=subject, message=message, recipients=[recipient])
            if sent:
                self.stdout.write(self.style.SUCCESS(f"Email sent to {recipient}"))
            else:
                self.stderr.write(self.style.ERROR("Email was not sent. Check SMTP settings."))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Failed to send email: {e}"))
