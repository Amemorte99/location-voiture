const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

let transporter = null;
let isEthereal = false;

const getTransporter = async () => {
  if (transporter) return transporter;

  // 1. Si identifiants SMTP réels fournis (ex: Gmail, SendGrid, Hostinger)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    logger.info(`[MAIL] Serveur SMTP configuré avec succès : ${process.env.SMTP_USER}`);
    return transporter;
  }

  // 2. Sinon, initialisation automatique d'un compte de test Ethereal (zéro config requise)
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    isEthereal = true;
    logger.info(`[MAIL] Boîte de test automatique Ethereal prête (${testAccount.user})`);
    return transporter;
  } catch (err) {
    logger.warn(`[MAIL] Mode simulation actif (${err.message})`);
    return null;
  }
};

const sendBookingConfirmation = async (booking, recipientEmail) => {
  const mailer = await getTransporter();
  if (!mailer) {
    logger.info(`[MAIL] Notification réservation pour ${recipientEmail} : SMTP non initialisé, mode simulation.`);
    return;
  }

  try {
    const formattedStart = booking.startDate ? new Date(booking.startDate).toLocaleDateString('fr-FR') : '-';
    const formattedEnd = booking.endDate ? new Date(booking.endDate).toLocaleDateString('fr-FR') : '-';
    const refCode = booking._id ? `LF-${String(booking._id).substring(0, 8).toUpperCase()}` : 'LF-CONFIRMED';
    const senderEmail = process.env.SMTP_USER || 'contact@locafes.ma';
    const carName = booking.car?.name || 'Véhicule de Tourisme';
    const formattedTotal = Number(booking.totalPrice || 0).toLocaleString('fr-FR');
    const paymentLabel = booking.paymentMethod === 'card' ? 'Carte bancaire en ligne' : 'Règlement en espèces à la prise en charge';

    const mailOptions = {
      from: `"LocaGawa Prestige" <${senderEmail}>`,
      to: recipientEmail,
      subject: `Confirmation de votre réservation ${refCode} — LocaGawa`,
      html: `
        <div style="background-color: #F8FAFC; padding: 30px 15px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            
            <!-- Header Or & Marine -->
            <div style="background: linear-gradient(135deg, #0B1329 0%, #111E3D 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #E3383C;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 1px;">
                LOCA<span style="color: #E3383C;">GAWA</span>
              </h1>
              <p style="color: #E3383C; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin: 6px 0 0 0;">
                Location Automobile de Prestige • Fès
              </p>
            </div>

            <!-- Contenu -->
            <div style="padding: 32px 28px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background-color: #ECFDF5; color: #059669; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 6px 16px; border-radius: 50px; border: 1px solid #A7F3D0;">
                  Réservation Confirmée
                </span>
                <h2 style="font-size: 20px; font-weight: 800; color: #0F172A; margin: 16px 0 6px 0;">
                  Votre véhicule vous attend à Fès
                </h2>
                <p style="color: #64748B; font-size: 13px; margin: 0;">
                  Dossier enregistré sous la référence <strong style="color: #0F172A;">${refCode}</strong>
                </p>
              </div>

              <!-- Bloc Récapitulatif -->
              <div style="background-color: #F8F5F0; border: 1px solid #E8DDD0; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                  <tr>
                    <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Conducteur :</td>
                    <td style="padding: 8px 0; color: #0F172A; font-weight: 700; text-align: right;">${booking.fullName || 'Client LocaGawa'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Véhicule réservé :</td>
                    <td style="padding: 8px 0; color: #0F172A; font-weight: 700; text-align: right;">${carName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Période :</td>
                    <td style="padding: 8px 0; color: #0F172A; font-weight: 700; text-align: right;">Du ${formattedStart} au ${formattedEnd}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Prise en charge :</td>
                    <td style="padding: 8px 0; color: #0F172A; font-weight: 700; text-align: right;">${booking.pickupLocation || 'Aéroport Fès-Saïss'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #64748B; font-weight: 600;">Paiement :</td>
                    <td style="padding: 8px 0; color: #0F172A; font-weight: 700; text-align: right;">${paymentLabel}</td>
                  </tr>
                  <tr style="border-top: 2px solid #E8DDD0;">
                    <td style="padding: 14px 0 4px 0; color: #0F172A; font-weight: 800; font-size: 15px;">TOTAL RÉGLÉ (TTC) :</td>
                    <td style="padding: 14px 0 4px 0; color: #B48E5F; font-weight: 900; font-size: 18px; text-align: right;">${formattedTotal} DH</td>
                  </tr>
                </table>
              </div>

              <!-- Assistance Conciergerie -->
              <div style="background-color: #F1F5F9; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #334155;">
                  Besoin d'une modification ou d'un accueil personnalisé à l'aéroport ?
                </p>
                <p style="margin: 0; font-size: 13px; font-weight: 800; color: #0F172A;">
                  Ligne Conciergerie 24/7 : <span style="color: #059669;">+212 668 89 82 45</span> (Appel & WhatsApp)
                </p>
              </div>

              <p style="color: #94A3B8; font-size: 11px; text-align: center; line-height: 1.5; margin: 0;">
                LocaGawa SARL • Boulevard Allal Ben Abdellah, Quartier Atlas, 30000 Fès, Maroc<br/>
                Email : contact@locafes.ma • Tél : +212 535 62 10 20
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await mailer.sendMail(mailOptions);
    logger.info(`[MAIL] Email de confirmation envoyé avec succès à ${recipientEmail} (ID: ${info.messageId})`);

    if (isEthereal) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        logger.info(`[MAIL] Aperçu web de l'email test généré : ${previewUrl}`);
      }
    }
  } catch (error) {
    logger.error(`[MAIL] Erreur envoi email confirmation: ${error.message}`);
  }
};

module.exports = { sendBookingConfirmation };
