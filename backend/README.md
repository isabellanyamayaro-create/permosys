# Backend Testing and Email Setup

## Email Configuration (Gmail SMTP)

Set these values in `backend/.env`:

- `EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_USE_TLS=True`
- `EMAIL_HOST_USER=<your-gmail-address>`
- `EMAIL_HOST_PASSWORD=<your-gmail-app-password>`
- `DEFAULT_FROM_EMAIL=<your-gmail-address>`

Use a Gmail App Password (Google account must have 2FA enabled).

## Where Email Is Sent

All notifications now use Django settings from `config/settings.py` through `apps/email_utils.py`.

- User account created (`POST /accounts/users`)
- Password changed (`POST /accounts/change-password`)
- Submission created (notifies M&E + admin reviewers)
- Submission approved (notifies entity users for that entity)
- Submission rejected (notifies entity users for that entity)
- Manual SMTP verification command: `python manage.py send_test_email <recipient>`

## Run Checks

```powershell
cd backend
& "venv/Scripts/python.exe" manage.py check
```

## Run Tests

```powershell
cd backend
& "venv/Scripts/python.exe" manage.py test
```

## Send a Test Email

```powershell
cd backend
& "venv/Scripts/python.exe" manage.py send_test_email your-email@example.com
```
