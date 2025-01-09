import { Resend } from 'resend';
import { CreateEvent, SignUpAccount, CancelEvent, DeadlineRemind, AllocateRemind } from '@/components/email/CreateEvent';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  
  try {
    // Authentication (if needed)

    const { user_email, 
            layout_choice, 
            subject, 
            userName, 
            event_link, 
            eventName, 
            eventOwnerName, 
            time, 
            timeType,
            deadline } = await req.json();
    
    let layout;
    switch (layout_choice) {
      case 'CreateEvent':
        layout = CreateEvent(userName, event_link);
        break;
      case 'SignUp':
        layout = SignUpAccount(userName);
        break;
      case 'CancelEvent':
        layout = CancelEvent(eventName, eventOwnerName, time, timeType);
        break;
      case 'Deadline':
        layout = DeadlineRemind(eventName, deadline, event_link);
        break;
      case 'Allocate':
        layout = AllocateRemind(eventName, time, event_link);
        break;
      default:
        console.log('This should not be printed out')
        break;
    }
    console.log('Layout:', layout);

    const { data, error } = await resend.emails.send({
      from: 'Do not reply to this email <noreply@allocato.net>', // 'Acme <noreply@allocato.net>'
      to: Array.isArray(user_email) ? user_email : [user_email],
      subject: subject,
      react: layout,
    });
    

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}