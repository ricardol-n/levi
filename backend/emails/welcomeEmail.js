const sendEmail = require("../utils/sendEmail");
const layout = require("./layout");

module.exports = async (email, username) => {

const html = layout({

title: "Welcome",

heading: `Welcome ${username}!`,

content: `
<p>
Thank you for joining TXLA Advisory.
</p>

<p>
Your investment account has been created successfully.
</p>

<p>
We are committed to providing secure and professional wealth management services.
</p>
`,

buttonText: "Access Dashboard",

buttonUrl: "https://txlaadvisory.com/login"

});

await sendEmail(
email,
"Welcome to TXLA Advisory",
html
);

};