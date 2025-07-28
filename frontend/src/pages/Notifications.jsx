import emailjs from "emailjs-com";

export const sendEmail = (userEmail, message) => {
    emailjs.send(
        "your_service_id", // Replace with Email.js Service ID
        "your_template_id", // Replace with Email.js Template ID
        { email: userEmail, message: message },
        "your_public_key" // Replace with your Public Key
    )
    .then((response) => {
        console.log("Email Sent!", response.status, response.text);
    })
    .catch((err) => console.error("Email Error:", err));
};
