const sendEmail = require("../utils/sendEmail");
const layout=require("./layout");

const sendDepositApprovedEmail = async ({
  email,
  username,
  amount,
  currency = "USD",
  method,
  balance,
}) => {
  const subject = "Deposit Approved • TXLA Advisory";

  const html = `
  <div style="font-family:Arial,sans-serif;background:#f4f7fb;padding:40px;">
    <div style="max-width:650px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,.08);">

      <div style="background:#0f172a;padding:30px;text-align:center;">
        <h1 style="margin:0;color:#ffffff;">
          TXLA Advisory
        </h1>

        <p style="margin-top:8px;color:#cbd5e1;">
          Wealth Management & Investment Solutions
        </p>
      </div>

      <div style="padding:40px;">

        <h2 style="margin-top:0;color:#111827;">
          Deposit Approved
        </h2>

        <p style="color:#475569;font-size:15px;">
          Hello <strong>${username}</strong>,
        </p>

        <p style="color:#475569;font-size:15px;line-height:1.8;">
          Your recent deposit has been successfully reviewed and approved.
          The funds have now been credited to your TXLA Advisory wallet.
        </p>

        <table style="width:100%;margin:30px 0;border-collapse:collapse;">
          <tr>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
              Deposit Amount
            </td>

            <td style="padding:12px;border-bottom:1px solid #e5e7eb;font-weight:600;text-align:right;">
              ${currency} ${Number(amount).toLocaleString()}
            </td>
          </tr>

          <tr>
            <td style="padding:12px;border-bottom:1px solid #e5e7eb;">
              Payment Method
            </td>

            <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;">
              ${method}
            </td>
          </tr>

          <tr>
            <td style="padding:12px;">
              Available Balance
            </td>

            <td style="padding:12px;font-weight:bold;color:#16a34a;text-align:right;">
              ${currency} ${Number(balance).toLocaleString()}
            </td>
          </tr>
        </table>

        <div style="margin-top:30px;text-align:center;">

          <a href="https://txlaadvisory.com/dashboard"
             style="
               display:inline-block;
               padding:14px 28px;
               background:#2563eb;
               color:#ffffff;
               text-decoration:none;
               border-radius:8px;
               font-weight:600;
             ">
             View Dashboard
          </a>

        </div>

        <p style="margin-top:35px;color:#64748b;font-size:14px;line-height:1.8;">
          Thank you for choosing TXLA Advisory.
          We appreciate your confidence in our investment platform.
        </p>

      </div>

      <div style="
        background:#f8fafc;
        padding:24px;
        text-align:center;
        font-size:13px;
        color:#94a3b8;
      ">
        © ${new Date().getFullYear()} TXLA Advisory.
        All Rights Reserved.
      </div>

    </div>
  </div>
  `;

  await sendEmail(email, subject, html);
};

module.exports = sendDepositApprovedEmail;