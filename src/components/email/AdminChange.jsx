export const AdminChange = (becomeAdmin, eventLink) => (

    <div>
      <h1>{becomeAdmin ? 'You became an Admin' : 'You became normal participant'}</h1>
      <p>You became {becomeAdmin ? "an admin" : "a normal participant"}.</p>
      <p>Here is the link :{eventLink}</p>
    </div>
    );