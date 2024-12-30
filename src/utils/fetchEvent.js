export async function fetchEvent(attribute_name, variable) {
    const response_event = await fetch(`${window.location.origin}/api/events`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        });

    if (!response_event.ok) throw new Error('Failed to fetch event details');

    const data_events = await response_event.json();

    const matchedEvent = data_events.events.find((event) => event[attribute_name] === variable);
    
    return matchedEvent;
  }