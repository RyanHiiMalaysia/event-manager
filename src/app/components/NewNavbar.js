import ClientAuthLinks from "./ClientAuthLinks";
import { auth } from '@/auth'; // Import authentication functions

const NewNavbar = async () => {
  const session = await auth(); // Get the current authentication session

  return <ClientAuthLinks session={session} />;
};

export default NewNavbar;