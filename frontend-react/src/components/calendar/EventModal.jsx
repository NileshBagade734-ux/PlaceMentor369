import { useEffect, useState } from "react";
import { X, Trash2, CheckCircle2, ExternalLink, Save, CalendarPlus } from "lucide-react";
import { formatLongDate, formatTime, getEventTypeMeta } from "../../utils/calendarUtils.js";

const eventTypes = [
  "Job Application Deadline",
  "Aptitude Test",
  "Technical Interview",
  "HR Interview",
  "Group Discussion",
  "Coding Round",
  "Offer Letter",
  "Offer Acceptance Deadline",
  "Document Verification",
  "Joining Date"
];

const priorities = ["low", "medium", "high"];
const statuses = ["pending", "completed"];

const defaultForm = {
  title: "",
  company: "",
  eventType: "Technical Interview",
  date: new Date().toISOString().slice(0, 10),
  time: "09:00",
  location: "",
  description: "",
  meetingLink: "",
  status: "pending",
  priority: "medium",
  studentId: ""
};

const EventModal = ({
  isOpen,
  mode,
  event,
  onClose,
  onSave,
  onDelete,
  onMarkCompleted,
  saving
}) => {
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (event) {
      setForm({
        ...defaultForm,
        ...event,
        date: event.date ? new Date(event.date).toISOString().slice(0, 10) : defaultForm.date,
        studentId: event.studentId?._id || event.studentId || ""
      });
    } else {
      setForm(defaultForm);
    }
  }, [event, isOpen]);

  useEffect(() => {
    const handleEscape = (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isViewMode = mode === "view";
  const typeMeta = getEventTypeMeta(form.eventType);

  const submit = (submitEvent) => {
    submitEvent.preventDefault();
    onSave({
      ...form,
      studentId: form.studentId || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm sm:items-center">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
        <div className={`h-2 bg-gradient-to-r ${typeMeta.accent}`} />

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {mode === "create" ? "Add Event" : mode === "edit" ? "Edit Event" : "Event Details"}
            </p>
            <h3 className="mt-1 text-xl font-semibold text-slate-950">{form.title || "Placement Event"}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event title" required>
                <input
                  disabled={isViewMode}
                  value={form.title}
                  onChange={(eventValue) => setForm((current) => ({ ...current, title: eventValue.target.value }))}
                  className="input-field"
                  placeholder="Technical Interview Round 2"
                />
              </Field>

              <Field label="Company" required>
                <input
                  disabled={isViewMode}
                  value={form.company}
                  onChange={(eventValue) => setForm((current) => ({ ...current, company: eventValue.target.value }))}
                  className="input-field"
                  placeholder="Google"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event type" required>
                <select
                  disabled={isViewMode}
                  value={form.eventType}
                  onChange={(eventValue) => setForm((current) => ({ ...current, eventType: eventValue.target.value }))}
                  className="input-field"
                >
                  {eventTypes.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </Field>

              <Field label="Priority">
                <select
                  disabled={isViewMode}
                  value={form.priority}
                  onChange={(eventValue) => setForm((current) => ({ ...current, priority: eventValue.target.value }))}
                  className="input-field"
                >
                  {priorities.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date" required>
                <input
                  disabled={isViewMode}
                  type="date"
                  value={form.date}
                  onChange={(eventValue) => setForm((current) => ({ ...current, date: eventValue.target.value }))}
                  className="input-field"
                />
              </Field>
              <Field label="Time" required>
                <input
                  disabled={isViewMode}
                  type="time"
                  value={form.time}
                  onChange={(eventValue) => setForm((current) => ({ ...current, time: eventValue.target.value }))}
                  className="input-field"
                />
              </Field>
            </div>

            <Field label="Location">
              <input
                disabled={isViewMode}
                value={form.location}
                onChange={(eventValue) => setForm((current) => ({ ...current, location: eventValue.target.value }))}
                className="input-field"
                placeholder="Online / Campus Placement Cell / Company Office"
              />
            </Field>

            <Field label="Meeting link">
              <input
                disabled={isViewMode}
                value={form.meetingLink}
                onChange={(eventValue) => setForm((current) => ({ ...current, meetingLink: eventValue.target.value }))}
                className="input-field"
                placeholder="https://meet.google.com/..."
              />
            </Field>

            <Field label="Description">
              <textarea
                disabled={isViewMode}
                value={form.description}
                onChange={(eventValue) => setForm((current) => ({ ...current, description: eventValue.target.value }))}
                className="input-field min-h-[120px] resize-none"
                placeholder="Interview instructions, reporting time, required documents..."
              />
            </Field>

            <Field label="Student Id / Profile Id">
              <input
                disabled={isViewMode}
                value={form.studentId}
                onChange={(eventValue) => setForm((current) => ({ ...current, studentId: eventValue.target.value }))}
                className="input-field"
                placeholder="Optional for recruiters/admins"
              />
            </Field>
          </div>

          <div className="space-y-4 rounded-[1.75rem] bg-slate-50 p-4 sm:p-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Preview</p>
              <div className={`mt-3 inline-flex rounded-2xl bg-gradient-to-br ${typeMeta.accent} px-4 py-3 text-white shadow-sm`}>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/80">{form.eventType}</p>
                  <p className="mt-1 text-lg font-semibold">{form.company}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>{formatLongDate(form.date)} • {formatTime(form.time)}</p>
                <p>{form.location || "No location set"}</p>
                <p className="leading-6 text-slate-500">{form.description || "No description provided yet."}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Actions</p>
              <div className="mt-4 space-y-3">
                {isViewMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onMarkCompleted(event)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Mark completed
                    </button>
                    <a
                      href={event?.meetingLink || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ExternalLink className="h-4 w-4" /> Open meeting link
                    </a>
                    <button
                      type="button"
                      onClick={() => onDelete(event._id)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" /> Delete event
                    </button>
                    <button
                      type="button"
                      onClick={() => onSave({ ...form, status: "pending" })}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      <CalendarPlus className="h-4 w-4" /> Duplicate as event
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save event"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, required = false, children }) => {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
};

export default EventModal;