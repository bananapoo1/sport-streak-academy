/**
 * Shared constants for DrillZone app
 * Used by both client and server (edge functions mirror these values)
 */

// Daily training goal in minutes (10 = ideal "bite-sized" default)
export const DAILY_GOAL_MINUTES = 10;

// Maximum free drills per day for non-subscribers (3 gives a proper taste)
export const FREE_DRILL_LIMIT_PER_DAY = 3;

// XP multiplier (can be adjusted for events/promotions)
export const XP_MULTIPLIER = 1;

// Challenge XP bonus for winners
export const CHALLENGE_XP_BONUS = 50;
