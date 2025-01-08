import { EmailTemplate } from '../../../components/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    // authenthication
    
    const { user_email, userFirstName } = await req.json();
    
    const { data, error } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // 'Acme <noreply@allocato.net>'
      to: [user_email],
      subject: 'Hello world',
      react: EmailTemplate(userFirstName),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
