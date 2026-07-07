/**
 * PlacementEvent Model
 * -------------------------------------------------------
 * Location in repo: backend/models/PlacementEvent.js
 *
 * Represents a single placement-related event on the
 * Placement Calendar (e.g. a company test, interview,
 * pre-placement talk, or workshop).
 */

const mongoose = require('mongoose');

const placementEventSchema = new mongoose.Schema(
  {
    // Name of the recruiting company (used for search-by-company)
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },

    // Short title shown on the calendar (e.g. "Online Aptitude Test")
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },

    // Type of event - drives both the filter dropdown and the event color
    eventType: {
      type: String,
      required: true,
      enum: ['Test', 'Interview', 'PPT', 'Workshop', 'Other'],
      default: 'Other',
    },

    // Date of the event (day component is what FullCalendar keys off)
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },

    // Optional start/end time, stored as "HH:mm" strings for simple display
    startTime: {
      type: String, // e.g. "10:00"
      default: null,
    },
    endTime: {
      type: String, // e.g. "12:00"
      default: null,
    },

    // Free-text details (venue, round info, instructions, etc.)
    description: {
      type: String,
      trim: true,
      default: '',
    },

    // Hex color for this event on the calendar. If not supplied,
    // the frontend derives a default color from eventType.
    color: {
      type: String,
      default: null,
    },

    // Whether the student has marked this event as completed/attended
    completed: {
      type: Boolean,
      default: false,
    },

    // Which student this event belongs to (optional - useful once
    // auth/session wiring is added; left nullable for now so the
    // feature also works with globally shared placement events)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt automatically
  }
);

// Helpful index for the common query pattern: filter by date range
placementEventSchema.index({ date: 1 });
placementEventSchema.index({ company: 1 });

module.exports = mongoose.model('PlacementEvent', placementEventSchema);