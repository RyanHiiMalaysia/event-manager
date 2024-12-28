import NavbarClient from "./NavbarClient";
import { auth } from '@/auth'; // Import authentication functions

const Navbar = async () => {
  const session = await auth(); // Get the current authentication session

  return <NavbarClient session={session} />;
};

export default Navbar;