export interface Event {
  _id: string;
  created: Date; // datetime in GEvent
  description: string;
  end: Date; // datetime in GEvent; format: 1985-04-12T23:20:50.52Z
  recurringEventId: string | null; // id of the recurring event to which this event belongs
  start: Date; // datetime in GEvent; format: 1985-04-12T23:20:50.52Z
  title: string; // summary in GEvent
}
