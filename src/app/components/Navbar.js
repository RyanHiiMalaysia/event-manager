import Link from 'next/link' // Import Link component from Next.js for navigation
import Image from 'next/image' // Import Image component from Next.js for optimized images
import { auth, signIn, signOut } from '@/auth' // Import authentication functions

const Navbar = async () => {
    const session = await auth() // Get the current authentication session
  return (
    <header className='px-5 py-3 bg-white shadow-sm font-work-sans'> {/* Header with padding, background color, shadow, and font */}
        <nav className='flex justify-between items-center'> {/* Navigation bar with flexbox layout */}
            <Link href='/'> {/* Link to the home page */}
                <Image src='/logo.png' alt='logo' width={144} height={30} /> {/* Logo image */}
            </Link>

            <div className='flex items-center gap-5 text-black'> {/* Container for navigation items with flexbox layout */}
                {session && session.user ? ( // If the user is authenticated
                    <>
                        <Link href="/"> {/* Link to Events */}
                            <span>Events</span>
                        </Link>

                        <Link href="/calendar"> {/* Link to Calendar */}
                            <span>Calendar</span>
                        </Link>

                        <form action={async () => { // Form to handle sign out
                            "use server"
                            await signOut({ redirectTo: '/'}) // Sign out and redirect to home page
                        }}>
                            <button type='submit'>
                                Logout
                            </button>
                        </form>

                        <Link href={`/user/${session?.id}`}> {/* Link to the user's profile */}
                            <span>{session?.user?.name}</span> {/* Display the user's name */}
                        </Link>
                    </>
                ) : ( // If the user is not authenticated
                    <>
                        <form action={async () => { // Form to handle sign in
                            "use server"
                            await signIn('google') // Sign in with Google
                        }}>
                            <button type='submit'>
                                Login
                            </button>
                        </form>
                        <Link href="/signUp"> {/* Link to Sign-Up page */}
                            <button>Sign Up</button>
                        </Link>
                    </>
                )}

            </div>
        </nav>
    </header>
  )
}

export default Navbar // Export the Navbar component