class TimeRange {
    constructor(start, end) {
      this.start = start;
      this.end = end;
    }
  
    toString() {
      return `Start: ${this.start}, End: ${this.end}`;
    }
  }
  
  class VacantRange extends TimeRange {
    constructor(start, end, user) {
      super(start, end);
      this.user = user;
    }
  }
  
  class EventRange extends TimeRange {
    constructor(start, end) {
      super(start, end);
      this.users = [];
    }
  }
  
  class User {
    constructor(id) {
      this.id = id;
      this.vacantRanges = [];
    }
  
    addVacantRange(start, end) {
      this.vacantRanges.push(new VacantRange(start, end, this));
    }
  }
  
  class Event {
    constructor(duration) {
      this.users = [];
      this.duration = duration;
      this.eventRange = null;
      this.eventRanges = [];
    }
  
    addUser(user) {
      this.users.push(user);
    }
  
    setEventRange() {
      const userRanges = this.users.flatMap(user => user.vacantRanges);
  
      // Use set to get unique start times and sort them
      const startTimes = [...new Set(userRanges.map(({ start }) => start.getTime()))].sort((a, b) => a - b);
  
      // Create event ranges based on unique start times
      this.eventRanges = startTimes.map(start => new EventRange(new Date(start), new Date(start + this.duration)));
  
      // Assign users to event ranges
      this.eventRanges.forEach((eventRange) => {
        eventRange.users = userRanges
          .filter((vacantRange) => eventRange.start >= vacantRange.start && eventRange.end <= vacantRange.end)
          .map((vacantRange) => vacantRange.user);
      });
  
      // Find the event range with the maximum number of users
      this.eventRange = this.eventRanges.reduce(
        (max, range) => (range.users.length > max.users.length ? range : max),
        this.eventRanges[0]
      );
    }
  }
  
export function schedule(duration, usersAndFreeTimes) {
    const event = new Event(duration);
    
    const addUserAndFreeTimes = (event, userAndFreeTime) =>{
        const {user, ft_start, ft_end} = userAndFreeTime
        const new_user = new User(user);

        new_user.addVacantRange(ft_start, ft_end);
        event.addUser(new_user);
    }

    const addedUserEvent = usersAndFreeTimes.reduce((events, userAndFreeTime)=>{
        const {user, ft_start, ft_end} = userAndFreeTime
        const new_user = new User(user);

        new_user.addVacantRange(ft_start, ft_end);
        events.addUser(new_user);
    }, event)

    addedUserEvent.setEventRange();
}

  // Example usage
//   const duration = 120 * 60 * 1000; // 120 minutes in milliseconds
//   const event = new Event(duration);
  
//   for (let i = 0; i < 7; i++) {
//     const user = new User(i);
//     event.addUser(user);
//   }
  
//   event.users[0].addVacantRange(new Date(2024, 11, 18, 8, 0), new Date(2024, 11, 18, 10, 0));
//   event.users[1].addVacantRange(new Date(2024, 11, 18, 8, 0), new Date(2024, 11, 18, 11, 0));
//   event.users[2].addVacantRange(new Date(2024, 11, 18, 7, 0), new Date(2024, 11, 18, 9, 0));
//   event.users[3].addVacantRange(new Date(2024, 11, 18, 7, 0), new Date(2024, 11, 18, 10, 0));
//   event.users[4].addVacantRange(new Date(2024, 11, 18, 7, 0), new Date(2024, 11, 18, 12, 0));
//   event.users[5].addVacantRange(new Date(2024, 11, 18, 9, 0), new Date(2024, 11, 18, 12, 0));
//   event.users[6].addVacantRange(new Date(2024, 11, 18, 10, 0), new Date(2024, 11, 18, 12, 0));
  
//   event.setEventRange();
//   console.log(event.eventRange.toString());
//   for (let eventRange of event.eventRanges) {
//     console.log(eventRange.toString());
//     for (let user of eventRange.users) {
//       console.log(user.id);
//     }
//   }