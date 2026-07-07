import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent
} from "../controllers/calendarController.js";

const router = express.Router();

router.get("/events", verifyToken, getEvents);
router.post("/events", verifyToken, createEvent);
router.put("/events/:id", verifyToken, updateEvent);
router.delete("/events/:id", verifyToken, deleteEvent);

export default router;