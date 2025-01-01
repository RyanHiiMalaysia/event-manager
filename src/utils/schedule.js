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

export { Event, EventRange, User, VacantRange };