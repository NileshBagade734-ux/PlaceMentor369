import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import CalendarToolbar from "../../components/calendar/CalendarToolbar.jsx";
import MonthView from "../../components/calendar/MonthView.jsx";
import WeekView from "../../components/calendar/WeekView.jsx";
import UpcomingEventsSidebar from "../../components/calendar/UpcomingEventsSidebar.jsx";
import EventModal from "../../components/calendar/EventModal.jsx";
import LoadingSkeleton from "../../components/calendar/LoadingSkeleton.jsx";
import EmptyState from "../../components/calendar/EmptyState.jsx";
import { usePlacementEvents } from "../../hooks/usePlacementEvents.js";

const PlacementCalendarPage = () => {
  const [view, setView] = useState("month");
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [toasts, setToasts] = useState([]);

  const {
    loading,
    saving,
    error,
    filters,
    setFilters,
    groupedEvents,
    upcomingEvents,
    summary,
    nextInterview,
    isModalOpen,
    selectedEvent,
    modalMode,
    openCreateModal,
    openViewModal,
    openEditModal,
    closeModal,
    saveEvent,
    removeEvent,
    markCompleted,
    exportCalendar,
    loadEvents
  } = usePlacementEvents({ view, referenceDate });

  const title = useMemo(() => {
    return new Intl.DateTimeFormat("en-IN", {
      month: "long",
      year: "numeric"
    }).format(referenceDate);
  }, [referenceDate]);

  const clearFilters = () => {
    setFilters({ search: "", company: "", eventType: "", status: "", date: "" });
    pushToast("Filters cleared", "success");
  };

  const pushToast = (message, tone = "success") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 2800);
  };

  const goPrevious = () => {
    setReferenceDate((current) => {
      const next = new Date(current);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const goNext = () => {
    setReferenceDate((current) => {
      const next = new Date(current);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const handleSave = async (payload) => {
    try {
      await saveEvent(payload);
      pushToast(modalMode === "edit" ? "Event updated" : "Event created", "success");
    } catch (submitError) {
      pushToast(submitError.message || "Failed to save event", "error");
    }
  };

  const handleDelete = async (eventId) => {
    try {
      await removeEvent(eventId);
      pushToast("Event deleted", "success");
    } catch (submitError) {
      pushToast(submitError.message || "Failed to delete event", "error");
    }
  };

  const handleComplete = async (event) => {
    try {
      await markCompleted(event);
      pushToast("Marked completed", "success");
    } catch (submitError) {
      pushToast(submitError.message || "Failed to update event", "error");
    }
  };

  const handleExport = () => {
    const fileContent = exportCalendar();
    const blob = new Blob([fileContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "placement-calendar.ics";
    link.click();
    URL.revokeObjectURL(link.href);
    pushToast("Calendar exported", "success");
  };

  const content = summary.total === 0 && !loading ? (
    <EmptyState onAddEvent={() => openCreateModal(referenceDate)} />
  ) : view === "week" ? (
    <WeekView
      referenceDate={referenceDate}
      groupedEvents={groupedEvents}
      onOpenEvent={openViewModal}
      onCreateForDate={openCreateModal}
    />
  ) : (
    <MonthView
      referenceDate={referenceDate}
      groupedEvents={groupedEvents}
      onOpenEvent={openViewModal}
      onCreateForDate={openCreateModal}
    />
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.10),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <CalendarToolbar
          view={view}
          setView={setView}
          filters={filters}
          setFilters={setFilters}
          onAddEvent={() => openCreateModal(referenceDate)}
          onExport={handleExport}
          onClearFilters={clearFilters}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Today" value={summary.reminders.today} tone="from-emerald-500 to-teal-500" />
          <SummaryCard label="Tomorrow" value={summary.reminders.tomorrow} tone="from-indigo-500 to-violet-500" />
          <SummaryCard label="This week" value={summary.reminders.thisWeek} tone="from-orange-500 to-amber-500" />
          <SummaryCard label="Overdue" value={summary.reminders.overdue} tone="from-rose-500 to-red-500" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.65fr_0.72fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-xl">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Calendar view</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">{title}</h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrevious}
                  className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setReferenceDate(new Date())}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4" /> Today
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 transition hover:bg-slate-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {loading ? <LoadingSkeleton /> : content}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <UpcomingEventsSidebar events={upcomingEvents} onQuickView={openViewModal} />

            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">Completion</p>
              <h3 className="mt-1 text-2xl font-semibold">{summary.completionRate}% done</h3>
              <p className="mt-2 text-sm text-white/65">Keep every event updated to maintain a clean placement timeline.</p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-400" style={{ width: `${summary.completionRate}%` }} />
              </div>
              <div className="mt-4 text-sm text-white/60">
                {nextInterview ? `Next interview: ${nextInterview.title}` : "No upcoming interview yet."}
              </div>
            </div>
          </div>
        </div>

        <EventModal
          isOpen={isModalOpen}
          mode={modalMode}
          event={selectedEvent}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          onMarkCompleted={handleComplete}
          saving={saving}
        />

        <ToastStack toasts={toasts} />
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, tone }) => (
  <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
    <div className={`inline-flex rounded-2xl bg-gradient-to-r ${tone} px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white`}>
      {label}
    </div>
    <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
  </div>
);

const ToastStack = ({ toasts }) => {
  return (
    <div className="fixed right-4 top-4 z-[90] space-y-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`min-w-[280px] max-w-sm rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-xl transition-all ${toast.tone === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
        >
          <p className="text-sm font-semibold">{toast.message}</p>
        </div>
      ))}
    </div>
  );
};

export default PlacementCalendarPage;