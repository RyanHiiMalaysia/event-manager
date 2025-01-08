
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    // Authentication (if needed)

    const { user_email, layout, subject } = await req.json();
    //const htmlContent = ReactDOMServer.renderToString(layout);
    

    const { data, error } = await resend.emails.send({
      from: 'Do not reply to this email <noreply@allocato.net>', // 'Acme <noreply@allocato.net>'
      to: [user_email],
      subject: subject,
      html: layout,
    });
    
    if (error) {

      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    //console.log(layout)
    console.log(htmlContent);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}