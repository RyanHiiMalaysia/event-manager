"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  DropdownItem,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  Avatar,
  Button,
} from "@nextui-org/react";
import { signIn, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const ClientAuthLinks = ({ session }) => {
  const currentPath = usePathname();

  const renderNavbarItem = (href, label) => (
    <NavbarItem isActive={currentPath === href}>
      <Link color={currentPath === href ? 'primary' : 'foreground'} href={href}>
        {label}
      </Link>
    </NavbarItem>
  );

  return (
    <Navbar isBordered maxWidth={'full'}>
      <NavbarContent justify="start">
        <NavbarBrand className="mr-4">
          <Link href="/" color="foreground">
            <p className="hidden sm:block font-bold text-inherit">EVENT MANAGER</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>
      <>
        {session && session.user ? (
          <>
            <NavbarContent justify="center">
              {renderNavbarItem('/event', 'Events')}
              {renderNavbarItem('/calendar', 'Calendar')}
            </NavbarContent>
            <NavbarContent as="div" justify="end">
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Avatar referrerPolicy={'no-referrer'}
                    isBordered
                    as="button"
                    className="transition-transform"
                    color="secondary"
                    name={session.user.name}
                    size="md"
                    src={session.user.image}
                  />
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions" variant="flat">
                  <DropdownItem key="signed_in" className="h-14 gap-2" textValue="Signed in as">
                    <p className="font-semibold">Signed in as</p>
                    <p className="font-semibold">{session.user.email}</p>
                  </DropdownItem>
                  <DropdownItem key="profile" href="/profile" textValue="Profile">Profile</DropdownItem>
                  <DropdownItem key="logout" color="danger" onPress={() => signOut({ redirectTo: '/' })} textValue="Log Out">
                    Log Out
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </NavbarContent>
          </>
        ) : (
          <>
            <NavbarContent justify="end">
              <NavbarItem>
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