"use client";

import { Navbar, NavbarContent, NavbarItem, Link, Button } from "@nextui-org/react";
import { signIn, signOut } from 'next-auth/react';

const ClientAuthLinks = ({ session }) => {
  return (
    <Navbar>
    <>
      {session && session.user ? (
        <>
          <NavbarContent justify="end">
            <NavbarItem>
              <Link color="foreground" href="/">
                Events
              </Link>
            </NavbarItem>
            <NavbarItem isActive>
              <Link aria-current="page" href="/calendar">
                Calendar
              </Link>
            </NavbarItem>
            <NavbarItem className="hidden lg:flex">
              <Link href="/profile">{session.user.name}</Link>
            </NavbarItem>
            <NavbarItem>
              <Button
                as="button"
                color="primary"
                variant="flat"
                onPress={() => signOut({ redirectTo: '/' })}
              >
                Logout
              </Button>
            </NavbarItem>
          </NavbarContent>
        </>
      ) : (
        <>
          <NavbarContent justify="end">
            <NavbarItem className="hidden lg:flex">
              <Button
                as="button"
                color="primary"
                variant="flat"
                onPress={() => signIn('google')}
              >
                Login
              </Button>
            </NavbarItem>
            <NavbarItem>
              <Button as={Link} href="/signUp" color="primary" variant="flat">
                Sign Up
              </Button>
            </NavbarItem>
          </NavbarContent>
        </>
      )}
    </>
    </Navbar>
  );
};

export default ClientAuthLinks;