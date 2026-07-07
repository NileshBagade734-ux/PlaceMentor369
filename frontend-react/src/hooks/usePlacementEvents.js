import { useEffect, useMemo, useState } from "react";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  fetchCalendarEvents,
  updateCalendarEvent
} from "../services/calendarService.js";
import {
  buildICSFile,
  getNextInterview,
  getRangeForView,
  getReminderLabel,
  getUpcomingEvents,
  groupEventsByDate,
  sortEvents
} from "../utils/calendarUtils.js";

const defaultFilters = {
  search: "",
  company: "",
  eventType: "",
  status: "",
  date: ""
};

export const usePlacementEvents = ({ view, referenceDate }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalMode, setModalMode] = useState("view");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    setError("");

    try {
      const range = getRangeForView(view, referenceDate);
      const payload = await fetchCalendarEvents({
        ...filters,
        startDate: filters.date || range.startDate.toISOString(),
        endDate: filters.date || range.endDate.toISOString()
      });

      setEvents(sortEvents(payload.events || []));
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, referenceDate, filters.search, filters.company, filters.eventType, filters.status, filters.date]);

  const openCreateModal = (date = new Date()) => {
    setSelectedEvent({
      title: "",
      company: "",
      eventType: "Technical Interview",
      date: new Date(date).toISOString().slice(0, 10),
      time: "09:00",
      location: "",
      description: "",
      meetingLink: "",
      status: "pending",
      priority: "medium",
      studentId: ""
    });
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openViewModal = (event) => {
    setSelectedEvent(event);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const openEditModal = (event) => {
    setSelectedEvent({
      ...event,
      date: new Date(event.date).toISOString().slice(0, 10),
      studentId: event.studentId?._id || event.studentId || ""
    });
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedEvent(null);
      setModalMode("view");
    }, 150);
  };

  const saveEvent = async (payload) => {
    setSaving(true);
    try {
      if (modalMode === "edit" && selectedEvent?._id) {
        await updateCalendarEvent(selectedEvent._id, payload);
      } else {
        await createCalendarEvent(payload);
      }

      await loadEvents();
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const markCompleted = async (event) => {
    setSaving(true);
    try {
      await updateCalendarEvent(event._id, { status: "completed" });
      await loadEvents();
    } finally {
      setSaving(false);
    }
  };

  const removeEvent = async (eventId) => {
    setSaving(true);
    try {
      await deleteCalendarEvent(eventId);
      await loadEvents();
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const exportCalendar = () => buildICSFile(events);

  const upcomingEvents = useMemo(() => getUpcomingEvents(events, 5), [events]);
  const groupedEvents = useMemo(() => groupEventsByDate(events), [events]);
  const nextInterview = useMemo(() => getNextInterview(events), [events]);

  const summary = useMemo(() => {
    const total = events.length;
    const completed = events.filter((event) => event.status === "completed").length;

    return {
      total,
      completed,
      completionRate: total ? Math.round((completed / total) * 100) : 0,
      reminders: {
        today: events.filter((event) => getReminderLabel(event) === "Today").length,
        tomorrow: events.filter((event) => getReminderLabel(event) === "Tomorrow").length,
        thisWeek: events.filter((event) => getReminderLabel(event) === "This week").length,
        overdue: events.filter((event) => getReminderLabel(event) === "Overdue").length
      }
    };
  }, [events]);

  return {
    events,
    loading,
    saving,
    error,
    filters,
    setFilters,
    selectedEvent,
    modalMode,
    isModalOpen,
    setIsModalOpen,
    summary,
    upcomingEvents,
    groupedEvents,
    nextInterview,
    loadEvents,
    openCreateModal,
    openViewModal,
    openEditModal,
    closeModal,
    saveEvent,
    removeEvent,
    markCompleted,
    exportCalendar
  };
};