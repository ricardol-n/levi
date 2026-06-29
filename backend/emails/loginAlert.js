const sendEmail=require("../utils/sendEmail");
const layout=require("./layout");

module.exports=async(
email,
username,
ip
)=>{

const html=layout({

title:"Login Alert",

heading:"New Login Detected",

content:`

<p>Hello ${username},</p>

<p>

A successful login was detected.

</p>

<p>

<strong>IP Address:</strong> ${ip}

</p>

<p>

If this wasn't you, change your password immediately.

</p>

`

});

await sendEmail(
email,
"Security Alert",
html
);

};