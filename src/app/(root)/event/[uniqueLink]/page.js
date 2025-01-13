import EventDetailsPage from "./EventDetailsPage";

export async function generateMetadata({ params }) {
  const apiLink = `https://event-manager-opal.vercel.app/api/events?link=${(await params).uniqueLink}&metadata=true`;
  const {eventData} = await fetch(apiLink).then((res) => res.json());
  return {
    title: eventData[0].title,
    description: eventData[0].description,
  };
}

export default EventDetailsPage;
