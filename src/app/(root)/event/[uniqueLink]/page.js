// pages/[uniqueLink]/page.js

export default async function Page({ params }) {
  const uniqueLink = (await params).uniqueLink
  return <div>My Post: {uniqueLink}</div>
}

// export default async function Page() {
//     const router = useRouter();
//     console.log(router);
//     const { uniqueLink } = router.query; // Get the dynamic parameter from the URL
//     const [isMounted, setIsMounted] = useState(false);
//     const [eventDetails, setEventDetails] = useState(null);
  
//     // To ensure code only runs client-side (after mounting)
//     useEffect(() => {
//       setIsMounted(true);
//     }, []);
  
//     useEffect(() => {
//       // Prevent fetching if uniqueLink is undefined or empty, and wait for mounting
//       if (!isMounted || !uniqueLink) return;

//       const fetchEventDetails = async () => {
//         try {
//           const response = await fetch(`/api/events/${uniqueLink}`);
//           if (response.ok) {
//             const data = await response.json();
//             setEventDetails(data); // Set the event details in state
//           } else {
//             console.error("Failed to fetch event details");
//           }
//         } catch (error) {
//           console.error("Error fetching event details:", error);
//         }
//       };
  
//       fetchEventDetails();
//     }, [uniqueLink, isMounted]);
  
//     if (!eventDetails) return <div>Loading...</div>;

//     return (
//       <div>
//         <h1>{eventDetails.event_name}</h1>
//         <p>{eventDetails.event_description}</p>
//         {/* Display other event details as needed */}
//       </div>
//     );
// }
