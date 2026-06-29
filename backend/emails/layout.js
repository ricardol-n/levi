module.exports = ({
  title,
  heading,
  content,
  buttonText,
  buttonUrl,
}) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${title}</title>
</head>

<body style="
margin:0;
padding:40px;
background:#050816;
font-family:Arial,Helvetica,sans-serif;
">

<table
width="100%"
cellpadding="0"
cellspacing="0"
style="max-width:700px;margin:auto;">

<tr>

<td
style="
background:#0b1220;
border:1px solid #1e293b;
border-radius:18px;
overflow:hidden;
box-shadow:
0 20px 60px rgba(0,0,0,.45);
">

<!-- HEADER -->

<div
style="
padding:45px 40px;
text-align:center;
background:
linear-gradient(
135deg,
#0f172a,
#111827,
#020617
);
">

<img
src="https://txlaadvisory.com/tesla.png"
width="90"
style="display:block;margin:auto;"
/>

<h1
style="
margin:18px 0 6px;
color:#ffffff;
font-size:30px;
font-weight:700;
letter-spacing:.5px;
">
TXLA Advisory
</h1>

<p
style="
margin:0;
font-size:14px;
color:#94a3b8;
">
Wealth Management • Investment Solutions
</p>

</div>

<!-- GOLD LUXURY BAR -->

<div
style="
height:4px;
background:linear-gradient(
90deg,
#D4AF37,
#F7D774,
#D4AF37
);
">
</div>

<!-- BODY -->

<div
style="
padding:45px;
color:#cbd5e1;
font-size:16px;
line-height:1.8;
">

<h2
style="
margin-top:0;
color:#ffffff;
font-size:26px;
">
${heading}
</h2>

${content}

${
buttonUrl
? `
<div
style="
text-align:center;
margin-top:45px;
">

<a
href="${buttonUrl}"
style="
display:inline-block;
padding:16px 36px;
background:
linear-gradient(
135deg,
#22c55e,
#16a34a
);
color:white;
text-decoration:none;
border-radius:10px;
font-weight:700;
font-size:15px;
box-shadow:
0 8px 25px rgba(34,197,94,.35);
">
${buttonText}
</a>

</div>
`
: ""
}

</div>

<!-- FOOTER -->

<div
style="
padding:30px;
text-align:center;
background:#07101d;
border-top:1px solid rgba(255,255,255,.06);
">

<p
style="
margin:0;
color:#94a3b8;
font-size:13px;
">

© ${new Date().getFullYear()} TXLA Advisory

</p>

<p
style="
margin:12px 0;
font-size:13px;
color:#64748b;
">

This is an automated security notification.
Please do not reply to this email.

</p>

<p
style="
margin-top:20px;
">

<a
href="https://txlaadvisory.com"
style="
color:#22c55e;
text-decoration:none;
font-weight:bold;
">
www.txlaadvisory.com
</a>

</p>

</div>

</td>

</tr>

</table>

</body>

</html>
`;