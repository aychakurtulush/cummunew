import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';
import { enGB } from 'date-fns/locale';

const BERLIN_TZ = 'Europe/Berlin';

/**
 * Formats a date string (ISO) into a localized date string in Berlin Time.
 * Example: "Sat, Oct 27"
 */
export const formatEventDate = (dateString?: string, formatStr: string = 'EEE, MMM d') => {
    if (!dateString) return "Date TBD";
    try {
        const date = new Date(dateString);
        const zonedDate = toZonedTime(date, BERLIN_TZ);
        return format(zonedDate, formatStr, { locale: enGB, timeZone: BERLIN_TZ });
    } catch (e) {
        return "Invalid Date";
    }
};

/**
 * Formats a date string (ISO) into a localized time string in Berlin Time.
 * Example: "10:00"
 */
export const formatEventTime = (dateString?: string) => {
    if (!dateString) return "00:00";
    try {
        const date = new Date(dateString);
        const zonedDate = toZonedTime(date, BERLIN_TZ);
        return format(zonedDate, 'HH:mm', { timeZone: BERLIN_TZ });
    } catch (e) {
        return "00:00";
    }
};

/**
 * Converts a UTC ISO string (from DB) to a generic ISO string representing Berlin Wall Clock Time.
 * Used for `datetime-local` inputs.
 * Example: DB "10:00Z" -> Berlin "11:00" -> Returns "YYYY-MM-DDTHH:mm" (representing 11:00)
 */
export const toBerlinInput = (utcDateString?: string) => {
    if (!utcDateString) return "";
    try {
        const date = new Date(utcDateString);
        const zonedDate = toZonedTime(date, BERLIN_TZ);
        return format(zonedDate, "yyyy-MM-dd'T'HH:mm", { timeZone: BERLIN_TZ });
    } catch (e) {
        return "";
    }
}

/**
 * Converts a Berlin Wall Clock Time string (from `datetime-local` input) to a UTC ISO string.
 * Used for saving to DB.
 * Example: Input "2023-10-27T11:00" (User means 11:00 Berlin) -> Returns "2023-10-27T10:00:00.000Z"
 */
export const parseBerlinInput = (berlinDateString: string) => {
    if (!berlinDateString) return null;
    try {
        // Treat the input string as belonging to Berlin timezone
        const date = fromZonedTime(berlinDateString, BERLIN_TZ);
        return date.toISOString();
    } catch (e) {
        return null;
    }
}
