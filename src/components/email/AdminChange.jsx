export const AdminChange = (becomeAdmin, eventName, eventLink) => (

    <div>
      <h1>{becomeAdmin ? 'You became an Admin' : 'You have been removed as an admin'}</h1>
      <p>You {becomeAdmin ? " became an admin for " : " have been removed as an admin in "}{eventName}.</p>
      <p>Here is the link :{eventLink}</p>
    </div>
    );