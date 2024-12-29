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

export const UserIcon = ({ fill = "currentColor", size, height, width, ...props }) => {
  return (
    <svg
      data-name="Iconly/Curved/Profile"
      height={size || height || 24}
      viewBox="0 0 24 24"
      width={size || width || 24}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g
        fill="none"
        stroke={fill}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      >
        <path
          d="M11.845 21.662C8.153 21.662 5 21.088 5 18.787s3.133-4.425 6.845-4.425c3.692 0 6.845 2.1 6.845 4.4s-3.134 2.9-6.845 2.9z"
          data-name="Stroke 1"
        />
        <path d="M11.837 11.174a4.372 4.372 0 10-.031 0z" data-name="Stroke 3" />
      </g>
    </svg>
  );
};

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

  const renderNavbarMenuItem = (href, label) => (
    <NavbarMenuItem>
      <Link className="w-full" href={href} size="lg" color={currentPath === href ? 'primary' : 'foreground'}>
        {label}
      </Link>
    </NavbarMenuItem>
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
        {renderNavbarItem('/pricing', 'Pricing')}
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
              <Button startContent={<UserIcon />}
                as="button"
                color="primary"
                variant="flat"
                onPress={() => signIn('google')}
              >
                Login
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      <NavbarMenu>
        {session && session.user && (
          <>
            {renderNavbarMenuItem('/pricing', 'Pricing')}
            {renderNavbarMenuItem('/event', 'Events')}
            {renderNavbarMenuItem('/calendar', 'Calendar')}
          </>
        )}
      </NavbarMenu>
    </Navbar>
  );
};

export default NavbarClient;