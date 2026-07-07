import mongoose from "mongoose";
import CalendarEvent from "../models/calendarEvent.js";
import Student from "../models/student.js";

const normalize = (value) => String(value || "").trim().toLowerCase();

const buildDateRange = (query) => {
  const startDate = query.startDate ? new Date(query.startDate) : null;
  const endDate = query.endDate ? new Date(query.endDate) : null;

  if (startDate && Number.isNaN(startDate.getTime())) return null;
  if (endDate && Number.isNaN(endDate.getTime())) return null;

  return { startDate, endDate };
};

const getAccessibleFilter = async (req) => {
  if (req.user.role === "student") {
    const studentProfile = await Student.findOne({ user: req.user.id }).select("_id");
    if (!studentProfile) {
      return { error: { status: 400, message: "Complete your profile first" } };
    }

    return { filter: { studentId: studentProfile._id } };
  }

  return { filter: { createdBy: req.user.id } };
};

const buildQuery = (baseFilter, query) => {
  const filter = { ...baseFilter };

  if (query.studentId && mongoose.Types.ObjectId.isValid(query.studentId)) {
    filter.studentId = query.studentId;
  }

  if (query.company) {
    filter.company = { $regex: normalize(query.company), $options: "i" };
  }

  if (query.eventType) {
    filter.eventType = query.eventType;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    const search = query.search.trim();
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { eventType: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } }
    ];
  }

  const dateRange = buildDateRange(query);
  if (dateRange === null) {
    return { error: { status: 400, message: "Invalid date range" } };
  }

  if (dateRange?.startDate || dateRange?.endDate) {
    filter.date = {};
    if (dateRange.startDate) filter.date.$gte = dateRange.startDate;
    if (dateRange.endDate) filter.date.$lte = dateRange.endDate;
  }

  return { filter };
};

const ensureOwnEvent = async (req, eventId) => {
  const event = await CalendarEvent.findById(eventId);
  if (!event) {
    return { error: { status: 404, message: "Calendar event not found" } };
  }

  if (req.user.role === "student") {
    const studentProfile = await Student.findOne({ user: req.user.id }).select("_id");
    if (!studentProfile || String(event.studentId) !== String(studentProfile._id)) {
      return { error: { status: 403, message: "Access denied" } };
    }
  } else if (String(event.createdBy) !== String(req.user.id)) {
    return { error: { status: 403, message: "You can only manage events you created" } };
  }

  return { event };
};

export const getEvents = async (req, res) => {
  try {
    const accessible = await getAccessibleFilter(req);
    if (accessible.error) {
      return res.status(accessible.error.status).json({ message: accessible.error.message });
    }

    const queryResult = buildQuery(accessible.filter, req.query);
    if (queryResult.error) {
      return res.status(queryResult.error.status).json({ message: queryResult.error.message });
    }

    const limit = Math.min(Number(req.query.limit) || 0, 50);
    const sort = req.query.sort === "oldest" ? 1 : -1;

    let eventsQuery = CalendarEvent.find(queryResult.filter)
      .populate("studentId", "name branch cgpa status")
      .populate("createdBy", "name role")
      .sort({ date: 1, time: 1 });

    if (limit > 0) {
      eventsQuery = eventsQuery.limit(limit);
    }

    const events = await eventsQuery;

    res.status(200).json({
      success: true,
      events,
      total: events.length,
      sort
    });
  } catch (err) {
    console.error("GET EVENTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch calendar events" });
  }
};

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      company,
      eventType,
      date,
      time,
      location,
      description,
      meetingLink,
      status,
      priority,
      studentId
    } = req.body;

    if (!title || !company || !eventType || !date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let resolvedStudentId = studentId;

    if (req.user.role === "student") {
      const studentProfile = await Student.findOne({ user: req.user.id }).select("_id");
      if (!studentProfile) {
        return res.status(400).json({ message: "Complete your profile first" });
      }
      resolvedStudentId = studentProfile._id;
    }

    if (!resolvedStudentId || !mongoose.Types.ObjectId.isValid(resolvedStudentId)) {
      return res.status(400).json({ message: "Valid studentId is required" });
    }

    const event = await CalendarEvent.create({
      title,
      company,
      eventType,
      date,
      time,
      location,
      description,
      meetingLink,
      status: status === "completed" ? "completed" : "pending",
      priority: priority || "medium",
      createdBy: req.user.id,
      studentId: resolvedStudentId
    });

    const populated = await CalendarEvent.findById(event._id)
      .populate("studentId", "name branch cgpa status")
      .populate("createdBy", "name role");

    res.status(201).json({
      success: true,
      event: populated
    });
  } catch (err) {
    console.error("CREATE EVENT ERROR:", err);
    res.status(500).json({ message: "Failed to create calendar event" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const ownership = await ensureOwnEvent(req, id);
    if (ownership.error) {
      return res.status(ownership.error.status).json({ message: ownership.error.message });
    }

    const allowedFields = [
      "title",
      "company",
      "eventType",
      "date",
      "time",
      "location",
      "description",
      "meetingLink",
      "status",
      "priority",
      "studentId"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        ownership.event[field] = req.body[field];
      }
    });

    if (req.body.studentId && req.user.role !== "student") {
      if (!mongoose.Types.ObjectId.isValid(req.body.studentId)) {
        return res.status(400).json({ message: "Invalid studentId" });
      }
      ownership.event.studentId = req.body.studentId;
    }

    await ownership.event.save();

    const event = await CalendarEvent.findById(id)
      .populate("studentId", "name branch cgpa status")
      .populate("createdBy", "name role");

    res.status(200).json({
      success: true,
      event
    });
  } catch (err) {
    console.error("UPDATE EVENT ERROR:", err);
    res.status(500).json({ message: "Failed to update calendar event" });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const ownership = await ensureOwnEvent(req, id);
    if (ownership.error) {
      return res.status(ownership.error.status).json({ message: ownership.error.message });
    }

    await ownership.event.deleteOne();

    res.status(200).json({ success: true, message: "Event deleted successfully" });
  } catch (err) {
    console.error("DELETE EVENT ERROR:", err);
    res.status(500).json({ message: "Failed to delete calendar event" });
  }
};