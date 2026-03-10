import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXTAUTH_URL || "https://album-familiar-2026.vercel.app";

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: "Album Familiar <onboarding@resend.dev>",
      to: email,
      subject: "Restablecer tu contraseña - Álbum Familiar",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #6366f1; text-align: center;">¡Hola!</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Has solicitado restablecer la contraseña de tu cuenta en **Álbum Familiar**.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            Este enlace caducará en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} Álbum Familiar. El lugar de los tuyos.
          </p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { error: "No se pudo enviar el correo de recuperación" };
  }
};
