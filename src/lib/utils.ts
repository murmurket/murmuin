// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind-class merge helper
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safe JSON.parse wrapper.
 * - Accepts string or unknown.
 * - Returns parsed value (typed) or null on any failure.
 * - Does NOT throw.
 */
export function safeJSONParse<T = unknown>(value: unknown): T | null {
  try {
    if (typeof value === "string") {
      return JSON.parse(value) as T;
    }
    // If a Request/Response body was already parsed, pass it through.
    if (value !== null && typeof value === "object") {
      return value as T;
    }
    return null;
  } catch {
    return null;
  }
}