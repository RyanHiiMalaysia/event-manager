import { EmailTemplate } from '@/components/email-template';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    // Authentication (if needed)

    const { user_email, userFirstName, subject } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'Do not reply to this email (noreply@allocato.net) <noreply@allocato.net>', // 'Acme <noreply@allocato.net>'
      to: [user_email],
      subject: subject,
      react: EmailTemplate(userFirstName),
    });
    
    if (error) {
      console.log("this one")
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    //console.error('Error sending email:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}