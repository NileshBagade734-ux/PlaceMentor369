import { Search, Plus, Download, CalendarRange, ListFilter } from "lucide-react";

const eventTypes = [
  "",
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

const statuses = ["", "pending", "completed"];

const CalendarToolbar = ({
  view,
  setView,
  filters,
  setFilters,
  onAddEvent,
  onExport,
  onClearFilters
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur-xl md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">Placement Calendar</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Placement Calendar & Interview Scheduler</h1>
          <p className="mt-1 text-sm text-slate-500">Track deadlines, interviews, offer steps, and joining milestones in one timeline.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView("month")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${view === "month" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Month
          </button>
          <button
            type="button"
            onClick={() => setView("week")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${view === "week" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Week
          </button>
          <button
            type="button"
            onClick={onExport}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" /> Export .ics
          </button>
          <button
            type="button"
            onClick={onAddEvent}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Event
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto]">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
            placeholder="Search event title, company, location..."
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <ListFilter className="h-4 w-4 text-slate-400" />
          <select
            value={filters.eventType}
            onChange={(event) => setFilters((current) => ({ ...current, eventType: event.target.value }))}
            className="w-full bg-transparent outline-none"
          >
            {eventTypes.map((type) => (
              <option key={type || "all-event-types"} value={type}>
                {type || "All Event Types"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <CalendarRange className="h-4 w-4 text-slate-400" />
          <input
            value={filters.company}
            onChange={(event) => setFilters((current) => ({ ...current, company: event.target.value }))}
            className="w-full bg-transparent outline-none placeholder:text-slate-400"
            placeholder="Filter by company"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <CalendarRange className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={filters.date}
            onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
            className="w-full bg-transparent outline-none"
          />
        </label>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
          <ListFilter className="h-4 w-4 text-slate-400" />
          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="w-full bg-transparent outline-none"
          >
            {statuses.map((status) => (
              <option key={status || "all-statuses"} value={status}>
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : "All Statuses"}
              </option>
            ))}
          </select>
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClearFilters}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarToolbar;