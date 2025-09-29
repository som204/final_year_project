import os
import jinja2
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv

load_dotenv()


template_loader = jinja2.FileSystemLoader(searchpath='./Templates')
template_env = jinja2.Environment(loader=template_loader)

def send_email(recipient_email: str, subject: str, template_name: str, context: dict) -> bool:
    """
    Sends an email using a specified Jinja2 template.
    """
    sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
    sender_email = os.getenv('SENDER_EMAIL')
    # print(context)
    if not sendgrid_api_key or not sender_email:
        print("Error: Missing SendGrid configuration.")
        return False

    try:
        # 1. Use the 'template_name' variable to load the correct template
        template = template_env.get_template(template_name)
        
        # 2. Render the template with the provided context data
        html_content = template.render(context)

        # 3. Create and send the email
        message = Mail(
            from_email=sender_email,
            to_emails=recipient_email,
            subject=subject,
            html_content=html_content
        )
        
        sg = SendGridAPIClient(sendgrid_api_key)
        response = sg.send(message)

        if 200 <= response.status_code < 300:
            print(f"Email '{subject}' sent successfully to {recipient_email}!")
            return True
        else:
            print(f"Failed to send email. Status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

