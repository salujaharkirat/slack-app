import { format, isToday, isYesterday } from "date-fns";

export const TIME_THRESHOLD = 5;

export const formatDatelabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return "Today";
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "EEEE, MMMM d");
}
