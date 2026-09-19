/**
 * Marker placed inside every placeholder string. The integrity tests fail if it
 * appears in anything published, so placeholder text cannot reach production.
 * Internal: deliberately not part of the public API.
 */
export const DRAFT_MARKER = "[[DRAFT]]";
