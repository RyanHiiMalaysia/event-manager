import Navbar from "../components/Navbar";
import NewNavbar from "../components/NewNavbar";

export default function Layout({ children }) {
    return (
        <main className="font-work-sans">
            <NewNavbar />
            {children}
        </main>
    )
}