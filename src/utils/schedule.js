class TimeRange {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  toString() {
    return `Start: ${this.start}, End: ${this.end}`;
  }
}
class FreeTime extends TimeRange {
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
  constructor(id, isAdmin = false) {
    this.id = id;
    this.freeTimes = [];
    this.isAdmin = isAdmin;
  }
  addFreeTime(start, end) {
    this.freeTimes.push(new FreeTime(start, end, this));
  }
}
class Event {
  constructor(duration, forceAdmin = false) {
    this.users = [];
    this.duration = duration;
    this.eventRange = null;
    this.eventRanges = [];
    this.forceAdmin = forceAdmin;
  }
  addUser(user) {
    this.users.push(user);
  }

  setEventRange() {
    // Helper function to build start times
    const buildStartTimes =
      (duration) =>
      ({ start, end }) => {
        const times = [];
        for (let i = start.getTime(); i <= end.getTime() - duration; i += 900000) {
          times.push(i);
        }
        return times;
      };

    // Helper function to allocate users into event ranges
    const allocateEventRange = (freeTimes) => (eventRange) => {
      const inRange = ({ start, end }) => eventRange.start >= start && eventRange.end <= end;
      eventRange.users = freeTimes.filter(inRange).map(({ user }) => user);
    };

    // Get all free times and priority free times, where priority free times are free times of admin users
    const freeTimes = this.users.flatMap((user) => user.freeTimes);
    const priorityTimes = this.users
      .filter(({ isAdmin }) => !this.forceAdmin || isAdmin)
      .flatMap((user) => user.freeTimes);

    // Use set to get unique start times and sort them
    const startTimes = [...new Set(priorityTimes.flatMap(buildStartTimes(this.duration)))].sort((a, b) => a - b);

    // Create event ranges based on unique start times
    this.eventRanges = startTimes.map((start) => new EventRange(new Date(start), new Date(start + this.duration)));

    // Assign priority users to event ranges
    this.eventRanges.forEach(allocateEventRange(priorityTimes));

    // If forceAdmin is true, remove event ranges that do not have all admin users and assign users to event ranges
    if (this.forceAdmin) {
      const adminCount = this.users.filter((user) => user.isAdmin).length;
      this.eventRanges = this.eventRanges.filter((eventRange) => eventRange.users.length === adminCount);
      this.eventRanges.forEach(allocateEventRange(freeTimes));
    }

    // Find the earliest event range with the maximum number of users
    // If there are multiple event ranges with the same number of users, the earliest one will be selecte due to reduce
    // taking from left to right in an increasing sorted array
    // If there are no event ranges, it will be undefined and the event will not be allocated
    this.eventRange = this.eventRanges.reduce(
      (max, range) => (range.users.length > max.users.length ? range : max),
      this.eventRanges[0]
    );
  }
}

export { Event, EventRange, User, FreeTime as VacantRange };
