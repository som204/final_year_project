import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

def send_dynamic_email(recipient_email: str, subject: str, html_content: str) -> bool:
    """
    Sends a dynamic email using SendGrid.

    Args:
        recipient_email (str): The email address of the recipient.
        subject (str): The subject line of the email.
        html_content (str): The HTML body of the email.

    Returns:
        bool: True if the email was sent successfully, False otherwise.
    """
    # 1. Get your API Key and Sender Email from environment variables
    sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
    sender_email = os.getenv('SENDER_EMAIL')

    # Fail fast if essential configuration is missing
    if not sendgrid_api_key or not sender_email:
        print("Error: Missing SENDGRID_API_KEY or SENDER_EMAIL in .env file.")
        return False

    # 2. Create the Mail object using the function's arguments
    message = Mail(
        from_email=sender_email,
        to_emails=recipient_email,
        subject=subject,
        html_content=html_content
    )

    try:
        # 3. Initialize the client and send the email
        sg = SendGridAPIClient(sendgrid_api_key)
        response = sg.send(message)

        # 4. Check the response status code to confirm success
        if 200 <= response.status_code < 300:
            print(f"Email sent successfully to {recipient_email}! Status Code: {response.status_code}")
            return True
        else:
            print(f"Failed to send email. Status Code: {response.status_code}")
            print(f"Response Body: {response.body}")
            return False
            
    except Exception as e:
        print(f"An error occurred: {e}")
        return False