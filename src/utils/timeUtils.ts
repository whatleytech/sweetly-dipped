/**
 * Parses a time string in various formats and returns a Date object
 * Supports formats like "8:00 AM", "12:00 PM", "5:30 PM"
 */
function parseTimeString(timeStr: string): Date {
  const cleanTime = timeStr.trim().toUpperCase();
  const match = cleanTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  
  if (!match) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  
  const [, hourStr, minuteStr, period] = match;
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  
  // Validate hour and minute ranges
  if (hour < 1 || hour > 12) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  if (minute < 0 || minute > 59) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  
  // Convert to 24-hour format
  if (period === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period === 'AM' && hour === 12) {
    hour = 0;
  }
  
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

/**
 * Formats a Date object to a time string in 12-hour format
 */
function formatTimeString(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleTimeString('en-US', options);
}

/**
 * Generates 15-minute intervals within a time window
 * @param timeWindow - A string like "8:00 AM - 10:00 AM"
 * @returns Array of time strings in 15-minute intervals
 */
export function generateTimeIntervals(timeWindow: string): string[] {
  const [startTimeStr, endTimeStr] = timeWindow.split(' - ').map(s => s.trim());
  
  if (!startTimeStr || !endTimeStr) {
    throw new Error(`Invalid time window format: ${timeWindow}`);
  }
  
  const startTime = parseTimeString(startTimeStr);
  const endTime = parseTimeString(endTimeStr);
  
  // Handle case where end time is on the next day (e.g., "11:00 PM - 1:00 AM")
  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }
  
  const intervals: string[] = [];
  const current = new Date(startTime);
  
  while (current <= endTime) {
    intervals.push(formatTimeString(current));
    current.setMinutes(current.getMinutes() + 15);
  }
  
  return intervals;
}

/**
 * Parses a time window string and returns start and end times
 * @param timeWindow - A string like "8:00 AM - 10:00 AM" 
 * @returns Object with start and end time strings
 */
export function parseTimeWindow(timeWindow: string): { start: string; end: string } {
  const [start, end] = timeWindow.split(' - ').map(s => s.trim());
  
  if (!start || !end) {
    throw new Error(`Invalid time window format: ${timeWindow}`);
  }
  
  return { start, end };
}

/**
 * Formats a Time object to a time string in 12-hour format
 * @param time - Time object with hour, minute, timeOfDay
 * @returns String in format "8:00 AM" or "5:00 PM"
 */
export function formatTimeObject(time: { hour: number; minute: number; timeOfDay: "morning" | "evening" }): string {
  const period = time.timeOfDay === "morning" ? 'AM' : 'PM';
  const displayHour = time.hour === 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour;
  const displayMinute = time.minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Converts a TimeSlot object to a window string
 * @param timeSlot - TimeSlot object with startTime and endTime as Time objects
 * @returns String in format "8:00 AM - 10:00 AM"
 */
export function timeSlotToWindow(timeSlot: { 
  startTime: { hour: number; minute: number; timeOfDay: "morning" | "evening" }; 
  endTime: { hour: number; minute: number; timeOfDay: "morning" | "evening" } 
}): string {
  const startTimeStr = formatTimeObject(timeSlot.startTime);
  const endTimeStr = formatTimeObject(timeSlot.endTime);
  return `${startTimeStr} - ${endTimeStr}`;
}
