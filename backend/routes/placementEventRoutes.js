/**
 * Placement Event Routes
 * -------------------------------------------------------
 * Location in repo: backend/routes/placementEventRoutes.js
 *
 * Maps REST endpoints to controller functions.
 * Mount this router in your main app file (e.g. app.js / server.js) with:
 *
 *   const placementEventRoutes = require('./routes/placementEventRoutes');
 *   app.use('/api/placement-events', placementEventRoutes);
 */

const express = require('express');
const router = express.Router();

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  markEventCompleted,
  deleteEvent,
} = require('../controllers/placementEventController');

// GET    /api/placement-events          -> list events (supports filters via query params)
// POST   /api/placement-events          -> create a new event
router.route('/')
  .get(getAllEvents)
  .post(createEvent);

// GET    /api/placement-events/:id      -> fetch a single event
// PUT    /api/placement-events/:id      -> update an event
// DELETE /api/placement-events/:id      -> delete an event
router.route('/:id')
  .get(getEventById)
  .put(updateEvent)
  .delete(deleteEvent);

// PATCH  /api/placement-events/:id/complete -> toggle/mark completion status
router.patch('/:id/complete', markEventCompleted);

module.exports = router;