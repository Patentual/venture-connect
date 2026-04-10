export type MeetingType = 'team' | 'investor' | 'external';
export type MeetingStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed';

export interface Meeting {
  id: string;
  projectId: string;
  projectTitle: string;
  title: string;
  description: string;
  type: MeetingType;

  // Scheduling
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  timezone: string;  // IANA timezone of the organiser

  // Participants
  organizerId: string;
  attendeeIds: string[];

  // Location
  location: string;       // physical address or video link
  locationType: 'physical' | 'virtual' | 'hybrid';

  // Status
  status: MeetingStatus;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO datetime
  end: string;   // ISO datetime
  type: 'meeting' | 'busy';
  meetingId?: string;
  projectTitle?: string;
}

export interface AvailabilityBlock {
  userId: string;
  dayOfWeek: number; // 0=Sun … 6=Sat
  startHour: number; // 0-23 (in user's local tz)
  endHour: number;
  timezone: string;
}

export interface AvailableSlot {
  start: string; // ISO datetime
  end: string;   // ISO datetime
  durationMinutes: number;
}
