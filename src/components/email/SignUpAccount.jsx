export const SignUpAccount = (firstName) => (
  <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
    <h1 style={{ color: '#000080' }}>Welcome, {firstName}!</h1>
    <p>Thank you for signing up for Allocato!</p>
    <p>We are excited to have you on board. As a new member, you are now on our <strong>Free Plan</strong>.</p>
    <p>With the Free Plan, you can:</p>
    <ul>
      <li>Create up to <strong>5 events</strong></li>
      <li>Join as many events as you are invited to.</li>
    </ul>
    <p>We hope you enjoy using Allocato!</p>
  </div>
);