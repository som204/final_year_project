institute_reg_template = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Reportify!</title>
  
  <style type="text/css">
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f4f4f4; }
    table { border-collapse: collapse; }
    td { font-family: Helvetica, Arial, sans-serif; }
    a { color: #00C49A; }

    /* --- Responsive Styles --- */
    @media screen and (max-width: 600px) {
      .content-wrapper {
        width: 100% !important;
        border-radius: 0 !important;
      }
      .content-padding {
        padding: 20px 15px !important;
      }
      h1 {
        font-size: 22px !important;
      }
      .cta-button {
        display: block !important;
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f4f4;">
    <tr>
      <td align="center">
        
        <table class="content-wrapper" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <tr>
            <td align="center" style="padding: 40px 0 20px 0; border-bottom: 1px solid #eeeeee;">
              <img src="https://i.imgur.com/your-logo.png" alt="Reportify Logo" width="180" style="display: block;">
            </td>
          </tr>

          <tr>
            <td class="content-padding" style="padding: 40px 30px 40px 30px; color: #333333; font-size: 16px; line-height: 24px;">
              <h1 style="color: #0A2540; font-size: 24px; margin: 0 0 20px 0;">Welcome Aboard!</h1>
              <p style="margin: 0 0 15px 0;">Hello <strong>{{{admin_full_name}}}</strong>,</p>
              <p style="margin: 0 0 25px 0;">
                The institute, <strong>{{{institute_name}}}</strong>, has been successfully registered on the Annual Report Portal. An administrative account has been created for you.
              </p>

              <div style="background-color: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #555;">Here are your initial login credentials:</p>
                <p style="margin: 0 0 5px 0;"><strong>Email:</strong> <span style="color: #0A2540;">{{{admin_email}}}</span></p>
                <p style="margin: 0;"><strong>Temporary Password:</strong> <span style="color: #0A2540; font-weight: bold;">{{{temporary_password}}}</span></p>
              </div>

              <p style="margin: 0 0 30px 0; font-size: 14px; color: #d93025; font-weight: bold;">
                For security reasons, you will be required to change this temporary password upon your first login.
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="{{{login_url}}}" target="_blank" class="cta-button" style="display: inline-block; padding: 14px 28px; background-color: #00C49A; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; border-radius: 8px;">
                      Login to Your Account
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 20px 30px 30px 30px; background-color: #0A2540; color: #c0c8d1; font-size: 12px; border-radius: 0 0 12px 12px;">
              <p style="margin: 0;">If you have any questions, please contact our support team.</p>
              <p style="margin: 10px 0 0 0;">&copy; 2025 Reportify. All rights reserved.</p>
              
              <div data-role="module-unsubscribe" style="color:#c0c8d1; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;">
                <p style="font-size:12px; line-height:20px;">
                  <a href="{{{unsubscribe}}}" target="_blank" style="font-family:sans-serif;text-decoration:none; color: #c0c8d1;">Unsubscribe</a>
                  -
                  <a href="{{{unsubscribe_preferences}}}" target="_blank" style="font-family:sans-serif;text-decoration:none; color: #c0c8d1;">Unsubscribe Preferences</a>
                </p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""