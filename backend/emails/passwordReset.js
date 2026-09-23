const layout=require("./layout");
const sendEmail = require("../utils/sendEmail");

const sendPasswordResetEmail = async (
  email,
  username,
  resetUrl
) => {
  const html = layout({
    title: "Reset Your Password",

    heading: "Password Reset Request",

    content: `
      <p>
        Hello <strong style="color:#ffffff;">
          ${username || "there"}
        </strong>,
      </p>

      <p>
        We received a request to reset the password for your
        TXLA Advisory account.
      </p>

      <p>
        If you made this request, click the button below to
        securely create a new password.
      </p>

      <div
        style="
        margin:30px 0;
        padding:20px;
        background:#111827;
        border:1px solid #1e293b;
        border-radius:10px;
        "
      >

        <p
          style="
          margin:0;
          color:#94a3b8;
          font-size:14px;
          "
        >
          Security notice
        </p>

        <p
          style="
          margin:8px 0 0;
          color:#cbd5e1;
          font-size:14px;
          line-height:1.6;
          "
        >
          This password reset link will expire in
          <strong style="color:#D4AF37;">
            15 minutes
          </strong>
          and can only be used once.
        </p>

      </div>

      <p>
        If you did not request a password reset, you can safely
        ignore this email. Your password will remain unchanged.
      </p>

      <p
        style="
        margin-top:30px;
        color:#64748b;
        font-size:14px;
        "
      >
        For your security, never share this reset link with anyone.
      </p>
    `,

    buttonText: "Reset My Password",

    buttonUrl: resetUrl,
  });

  await sendEmail(
    email,
    "Reset your TXLA Advisory password",
    html
  );
};

module.exports = sendPasswordResetEmail;