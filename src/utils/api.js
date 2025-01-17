export const getData = async (link) => {
  const headers = {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  };
  const response = await fetch(link, headers);
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch");
  }
  return result;
};

const getParticipantLink = (eventLink, session, params) => {
  const baseLink = `/api/user-event?findIsUserIn=true&link=${eventLink}&email=${session.user.email}`;
  return params ? `${baseLink}&${params}` : baseLink;
};

export const checkParticipant = async (eventLink, session, params = "") => {
  const link = getParticipantLink(eventLink, session, params);
  const participantData = await getData(link);
  return participantData.result;
};

export const checkAdmin = async (eventLink, session) => {
  return checkParticipant(eventLink, session, "isAdmin=true");
};

export const getEvents = (session) => async (param) => {
  const result = await getData(`/api/user-event?email=${session.user.email}&${param}`);
  return result.eventData;
};
