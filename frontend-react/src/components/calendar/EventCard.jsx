import { CalendarDays, Clock3, MapPin, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  formatEventDateTime,
  getEventTypeMeta,
  getReminderLabel,
  getStatusMeta
} from "../../utils/calendarUtils.js";

const EventCard = ({ event, onClick, compact = false }) => {
  const typeMeta = getEventTypeMeta(event.eventType);
  const statusMeta = getStatusMeta(event.status);
  const reminder = getReminderLabel(event);

  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className={`group w-full text-left rounded-2xl border bg-white/90 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${compact ? "p-3" : "p-4"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${typeMeta.accent} text-white shadow-sm`}>
            <CalendarDays className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`font-semibold text-slate-900 truncate ${compact ? "text-sm" : "text-base"}`}>{event.title}</h4>
              {reminder && (
                <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600">
                  {reminder}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-slate-500 truncate">{event.company}</p>
          </div>
        </div>

        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusMeta.chip}`}>
          {statusMeta.label}
        </span>
      </div>

      <div className="mt-3 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-slate-400" />
          <span>{formatEventDateTime(event)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span className="truncate">{event.location || "No location set"}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-400">
        <span className="uppercase tracking-[0.2em]">{event.eventType}</span>
        <span className="inline-flex items-center gap-1 text-indigo-600 opacity-0 transition-all group-hover:opacity-100">
          Quick view <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>

      {event.status === "completed" && (
        <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Completed
        </div>
      )}
    </button>
  );
};

export default EventCard;