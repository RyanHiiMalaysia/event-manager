import { Resend } from 'resend';
import { CreateEvent} from '@/components/email/CreateEvent';
import { SignUpAccount } from '@/components/email/SignUpAccount';
import { CancelEvent } from '@/components/email/CancelEvent';
import { DeadlineRemind } from '@/components/email/DeadlineRemind';
import { AllocateRemind } from '@/components/email/AllocateRemind';
import { InvitedToEvent } from '@/components/email/InvitedToEvent';
import { AdminChange } from '@/components/email/AdminChange';

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
            time, 
            timeType,
            deadline,
            becomeAdmin } = await req.json();
    
    let layout;
    switch (layout_choice) {
      case 'CreateEvent':
        layout = CreateEvent(userName, event_link, eventName);
        break;
      case 'SignUp':
        layout = SignUpAccount(userName);
        break;
      case 'CancelEvent':
        layout = CancelEvent(eventName, userName, time, timeType);
        break;
      case 'Deadline':
        layout = DeadlineRemind(eventName, deadline, event_link);
        break;
      case 'Allocate':
        layout = AllocateRemind(eventName, time, event_link);
        break;
      case 'Invited':
        layout = InvitedToEvent(userName, event_link);
        break;
      case 'Admin':
        layout = AdminChange(becomeAdmin, eventName, event_link);
        break;
      default:
        console.log('This should not be printed out')
        break;
    }

    const { data, error } = await resend.emails.send({
      from: 'Allocato <noreply@allocato.net>',
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