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
background:#f4f7fb;
font-family:Arial,Helvetica,sans-serif;
">

<table width="100%" cellpadding="0" cellspacing="0">

<tr>
<td align="center">

<table width="650"
style="
background:#ffffff;
border-radius:14px;
overflow:hidden;
box-shadow:0 8px 30px rgba(0,0,0,.08);
">

<tr>

<td
style="
background:#081321;
padding:35px;
text-align:center;
">

<img
src="https://txlaadvisory.com/tesla.png"
width="80"
/>

<h1
style="
color:white;
margin:15px 0 0;
font-size:28px;
">
TXLA Advisory
</h1>

</td>

</tr>

<tr>

<td style="padding:45px">

<h2
style="
color:#081321;
margin-top:0;
">
${heading}
</h2>

${content}

${
buttonUrl
? `
<p style="text-align:center;margin-top:35px">
<a
href="${buttonUrl}"
style="
background:#16a34a;
color:white;
padding:14px 32px;
border-radius:8px;
text-decoration:none;
font-weight:bold;
display:inline-block;
">
${buttonText}
</a>
</p>`
: ""
}

</td>

</tr>

<tr>

<td
style="
background:#f7f9fc;
padding:25px;
font-size:13px;
color:#64748b;
text-align:center;
">

© ${new Date().getFullYear()} TXLA Advisory

<br><br>

This is an automated security notification.

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;