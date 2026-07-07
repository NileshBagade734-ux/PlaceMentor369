/**
 * Placement Event Controller
 * -------------------------------------------------------
 * Location in repo: backend/controllers/placementEventController.js
 *
 * Contains the business logic for the Placement Calendar CRUD APIs.
 * Kept thin and framework-agnostic: each function is a standard
 * Express (req, res) handler.
 */

const PlacementEvent = require('../models/PlacementEvent');

/**
 * GET /api/placement-events
 * Returns all events. Supports optional query params so the
 * frontend calendar/search/filter widgets can all reuse one endpoint:
 *   ?company=Google        -> case-insensitive partial match on company
 *   ?eventType=Interview   -> exact match on eventType
 *   ?start=YYYY-MM-DD&end=YYYY-MM-DD -> events within a date range
 */
exports.getAllEvents = async (req, res) => {
  try {
    const { company, eventType, start, end } = req.query;
    const query = {};

    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    if (eventType) {
      query.eventType = eventType;
    }

    if (start || end) {
      query.date = {};
      if (start) query.date.$gte = new Date(start);
      if (end) query.date.$lte = new Date(end);
    }

    const events = await PlacementEvent.find(query).sort({ date: 1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
  }
};

/**
 * GET /api/placement-events/:id
 * Returns a single event by its Mongo _id.
 */
exports.getEventById = async (req, res) => {
  try {
    const event = await PlacementEvent.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch event', error: error.message });
  }
};

/**
 * POST /api/placement-events
 * Creates a new placement event.
 * Expected body: { company, title, eventType, date, startTime, endTime, description, color }
 */
exports.createEvent = async (req, res) => {
  try {
    const { company, title, eventType, date } = req.body;

    // Basic validation up front for a clearer error than the schema would give
    if (!company || !title || !date) {
      return res.status(400).json({
        success: false,
        message: 'company, title and date are required fields',
      });
    }

    const newEvent = await PlacementEvent.create(req.body);
    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to create event', error: error.message });
  }
};

/**
 * PUT /api/placement-events/:id
 * Updates an existing event (full or partial update).
 */
exports.updateEvent = async (req, res) => {
  try {
    const updatedEvent = await PlacementEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update event', error: error.message });
  }
};

/**
 * PATCH /api/placement-events/:id/complete
 * Convenience endpoint used by the "Mark as completed" button so the
 * frontend doesn't need to resend the whole event object.
 * Body: { completed: true|false }  (defaults to true if omitted)
 */
exports.markEventCompleted = async (req, res) => {
  try {
    const completed = req.body.completed !== undefined ? req.body.completed : true;

    const updatedEvent = await PlacementEvent.findByIdAndUpdate(
      req.params.id,
      { completed },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, data: updatedEvent });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to update completion status', error: error.message });
  }
};

/**
 * DELETE /api/placement-events/:id
 * Deletes an event.
 */
exports.deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await PlacementEvent.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
};