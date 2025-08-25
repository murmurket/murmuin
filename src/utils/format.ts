// src/utils/format.ts
import { format } from "date-fns";

/**
 * Format a date string or object to yyyy-MM-dd format.
 * @param date - ISO string or Date object
 */
export const formatDate = (date: string | Date): string =>
  format(new Date(date), "yyyy-MM-dd");