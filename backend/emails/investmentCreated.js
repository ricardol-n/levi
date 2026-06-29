const sendEmail=require("../utils/sendEmail");
const layout=require("./layout");

module.exports=async(
email,
username,
plan,
amount
)=>{

const html=layout({

title:"Investment Created",

heading:"Investment Confirmed",

content:`

<p>

Hello ${username},

</p>

<p>

Your investment has been activated.

</p>

<ul>

<li>Plan: ${plan}</li>

<li>Amount: $${amount}</li>

</ul>

`

});

await sendEmail(
email,
"Investment Activated",
html
);

};