'use client'

import Link from 'next/link';
import React from 'react';
import { useState } from "react";


const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Events/Activites</h1>
        <div className="space-x-4">
          
          <Link href="/availability">
            <span>Set Availability</span>
          </Link>

          <Link href="/CreateEvent">
            <span>Create Event</span>
          </Link>
          
        </div>
      </nav>
    </header>
  );
};

export default Header;
