// src/utils/emailSender.js
const nodemailer = require('nodemailer');
require('dotenv').config(); // Asegura que process.env tenga las variables de .env

// Configuración del "transporter" de Nodemailer
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // ej. 'gmail'
    host: process.env.EMAIL_HOST,       // ej. 'smtp.gmail.com'
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : (process.env.EMAIL_SECURE === 'true' ? 465 : 587),
    secure: process.env.EMAIL_SECURE === 'true', // true para puerto 465, false para otros como 587
    auth: {
        user: process.env.EMAIL_USER,     // Tu dirección de correo
        pass: process.env.EMAIL_PASS,     // Tu contraseña de aplicación o contraseña normal
    },
    // Opcional: para desarrollo local si hay problemas de certificado con un servidor SMTP local
    // tls: {
    //  rejectUnauthorized: false
    // }
});

/**
 * Envía un correo electrónico para el restablecimiento de contraseña.
 * @param {string} toEmail - La dirección de correo del destinatario.
 * @param {string} username - El nombre de usuario del destinatario (para personalizar el correo).
 * @param {string} token - El token de restablecimiento único.
 */
const sendPasswordResetEmail = async (toEmail, username, token) => {
    const appName = process.env.EMAIL_FROM_NAME || "Tu Aplicación";
    // Construye la URL completa que el usuario usará en el frontend para ingresar el token
    // Esta URL llevará al usuario a la página del frontend donde puede ingresar el token y la nueva contraseña.
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
        from: `"${appName}" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Restablecimiento de Contraseña para ${appName}`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #333;">Solicitud de Restablecimiento de Contraseña</h2>
                <p>Hola ${username || 'usuario'},</p>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>${appName}</strong>.</p>
                <p>Puedes usar el siguiente código para establecer una nueva contraseña. Este código es válido por <strong>1 hora</strong>:</p>
                <div style="background-color: #f0f0f0; border-left: 5px solid #007bff; padding: 15px; margin: 20px 0; text-align: center;">
                    <strong style="font-size: 20px; letter-spacing: 2px;">${token}</strong>
                </div>
                <p>Para restablecer tu contraseña, ingresa este código en la página de restablecimiento o haz clic en el botón de abajo:</p>
                <p style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        Restablecer Contraseña Ahora
                    </a>
                </p>
                <p>Si no solicitaste este cambio, por favor ignora este correo electrónico. Tu contraseña actual seguirá siendo la misma.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 0.9em; color: #777;">
                    Si tienes problemas con el botón, copia y pega la siguiente URL en tu navegador:<br />
                    <a href="${resetUrl}">${resetUrl}</a>
                </p>
                <p>Gracias,<br />El equipo de ${appName}</p>
            </div>
        `,
        // Opcional: versión en texto plano para clientes de correo que no soportan HTML
        // text: `Hola ${username},\n\nHas solicitado restablecer tu contraseña.\nTu código de restablecimiento es: ${token}\nEste código es válido por 1 hora.\n\nVisita el siguiente enlace para restablecer tu contraseña: ${resetUrl}\n\nSi no solicitaste esto, ignora este mensaje.\n\nGracias,\nEl equipo de ${appName}`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[emailSender] Correo de restablecimiento enviado a: ${toEmail}. Message ID: ${info.messageId}`);
        return info; // Devuelve la información del envío si es necesario
    } catch (error) {
        console.error('[emailSender] Error al enviar correo de restablecimiento:', error.message);
        // Es importante que este error se maneje en el authService para no bloquear al usuario
        // si el envío de correo falla, pero sí para registrar el problema.
        throw new Error('No se pudo enviar el correo de restablecimiento. Por favor, inténtalo de nuevo más tarde o contacta a soporte.');
    }
};

module.exports = {
    sendPasswordResetEmail
};