export const eventData = [
  {
    title: "Event 1",
    start: new Date(),
    end: new Date().setHours(new Date().getHours() + 1),
    location: "New York",
    url: "https://www.google.com",
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
     dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea 
     commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla 
     pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est 
     laborum.`,
  },
  {
    title: "Event 2",
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 2) + 1),
    location: "New York",
    url: "https://www.google.com",
    description: "This is a description for event 2",
  },
  {
    title: "Event 3",
    start: new Date(),
    end: new Date().setHours(new Date().getHours() + 1),
    location: "New York",
    url: "https://www.google.com",
    description: "This is a description for event 3",
  },
  {
    title: "Event 4",
    start: new Date(),
    end: new Date().setHours(new Date().getHours() + 1),
    location: "New York",
    url: "https://www.google.com",
    description: "This is a description for event 4",
  },
  {
    title: "Event 5",
    start: new Date(),
    end: new Date().setHours(new Date().getHours() + 1),
    location: "New York",
    url: "https://www.google.com",
    description: "This is a description for event 5",
  },
];

export const freeTimes = [{}];

export const eventRange = {
  start: new Date(),
  end: new Date(new Date().setDate(new Date().getDate() + 16)),
};
