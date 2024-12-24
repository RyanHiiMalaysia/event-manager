"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState(null);

  async function handleSignUp(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('email');
    const name = formData.get('name');

    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    });

    if (response.ok) {
      router.push('/');
    } else {
      const result = await response.json();
      setError(result.message);
    }
  }

  return (
    <form onSubmit={handleSignUp}>
      <input type="text" placeholder="Name" name="name" required />
      <input type="email" placeholder="Email" name="email" required />
      <button type="submit">Sign Up</button>
      {error && <p>{error}</p>}
    </form>
  );
}