import { CalendarOff, Plus } from "lucide-react";

const EmptyState = ({ onAddEvent }) => {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <CalendarOff className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-950">No placement events yet</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
        Create interview slots, deadlines, and reminders to keep every placement milestone in one place.
      </p>
      <button
        type="button"
        onClick={onAddEvent}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4" /> Add your first event
      </button>
    </div>
  );
};

export default EmptyState;