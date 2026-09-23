const sendEmail = require("../utils/sendEmail");
const layout = require("./layout");

const sendDepositApprovedEmail = async ({
  email,
  username,
  amount,
  currency = "USD",
  method,
  balance,
}) => {
  const subject = "Deposit Approved • TXLA Advisory";

  const content = `
    <p>
      Hello <strong style="color:#ffffff;">${username}</strong>,
    </p>

    <p>
      Your recent deposit has been successfully reviewed and approved.
      The funds have now been credited to your TXLA Advisory wallet.
    </p>

    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        width:100%;
        margin:30px 0;
        border-collapse:collapse;
        background:#0f172a;
        border:1px solid #1e293b;
        border-radius:10px;
      "
    >

      <tr>
        <td
          style="
            padding:14px;
            border-bottom:1px solid #1e293b;
            color:#94a3b8;
          "
        >
          Deposit Amount
        </td>

        <td
          style="
            padding:14px;
            border-bottom:1px solid #1e293b;
            color:#F7D774;
            font-weight:bold;
            text-align:right;
          "
        >
          ${currency} ${Number(amount).toLocaleString()}
        </td>
      </tr>

      <tr>
        <td
          style="
            padding:14px;
            border-bottom:1px solid #1e293b;
            color:#94a3b8;
          "
        >
          Payment Method
        </td>

        <td
          style="
            padding:14px;
            border-bottom:1px solid #1e293b;
            color:#ffffff;
            text-align:right;
          "
        >
          ${method}
        </td>
      </tr>

      <tr>
        <td
          style="
            padding:14px;
            color:#94a3b8;
          "
        >
          Available Balance
        </td>

        <td
          style="
            padding:14px;
            color:#22c55e;
            font-weight:bold;
            text-align:right;
          "
        >
          ${currency} ${Number(balance).toLocaleString()}
        </td>
      </tr>

    </table>

    <p style="text-align:center;margin-top:40px;">

      <a
        href="https://txlaadvisory.com/dashboard"
        style="
          display:inline-block;
          padding:16px 36px;
          background:linear-gradient(
            135deg,
            #22c55e,
            #16a34a
          );
          color:#ffffff;
          text-decoration:none;
          border-radius:10px;
          font-weight:700;
          font-size:15px;
          box-shadow:0 8px 25px rgba(34,197,94,.25);
        "
      >
        View Dashboard
      </a>

    </p>

    <p
      style="
        margin-top:35px;
        color:#94a3b8;
        font-size:14px;
        line-height:1.8;
      "
    >
      Thank you for choosing TXLA Advisory.
      We appreciate your confidence in our investment platform.
    </p>
  `;

  const html = layout({
    title: subject,
    heading: "Deposit Approved",
    content,
    buttonText: null,
    buttonUrl: null,
  });

  await sendEmail(email, subject, html);
};

module.exports = sendDepositApprovedEmail;