"use client";

import React, { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarMenuToggle,
  NavbarMenuItem,
  NavbarMenu,
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

const NavbarClient = ({ session }) => {
  const currentPath = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderNavbarItem = (href, label) => (
    <NavbarItem isActive={currentPath === href}>
      <Link color={currentPath === href ? 'primary' : 'foreground'} href={href}>
        {label}
      </Link>
    </NavbarItem>
  );

  return (
    <Navbar isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} maxWidth={'full'}>
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle aria-label={isMenuOpen ? "Close menu" : "Open menu"} />
      </NavbarContent>

      <NavbarContent className="sm:hidden pr-3" justify="center">
        <NavbarBrand>
          <Link href="/" color="foreground">
            <p className="font-bold text-inherit">EVENT MANAGER</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="start">
        <NavbarBrand className="mr-4">
          <Link href="/" color="foreground">
            <p className="hidden sm:block font-bold text-inherit">EVENT MANAGER</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {session && session.user && (
          <>
            {renderNavbarItem('/event', 'Events')}
            {renderNavbarItem('/calendar', 'Calendar')}
          </>
        )}
      </NavbarContent>

      <NavbarContent justify="end">
        {session && session.user ? (
          <>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar referrerPolicy={'no-referrer'}
                  isBordered
                  as="button"
                  className="transition-transform"
                  color="primary"
                  size="md"
                  src={session.user.image}
                  showFallback
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
          </>
        ) : (
          <>
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
          </>
        )}
      </NavbarContent>

      <NavbarMenu>
        {session && session.user && (
          <>
            <NavbarMenuItem>
              <Link className="w-full" href="/event" size="lg">
                Events
              </Link>
            </NavbarMenuItem>
            <NavbarMenuItem>
              <Link className="w-full" href="/calendar" size="lg">
                Calendar
              </Link>
            </NavbarMenuItem>
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
};

export default NavbarClient;