export const InvitedToEvent = (creatorName, eventLink) => (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
        <h1 style={{ color: 'navy' }}>You've been invited to {creatorName}'s event!</h1>
        <p>Here is the invitation link: <a href={eventLink} style={{ color: '#1E90FF' }}>{eventLink}</a></p>
        <p>We hope you enjoy the event!</p>
    </div>
);