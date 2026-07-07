import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, ArrowRight, CheckCircle2 } from "lucide-react";
import { fetchCalendarEvents } from "../../services/calendarService.js";
import { getDaysUntil, getNextInterview, getUpcomingEvents } from "../../utils/calendarUtils.js";

const CalendarDashboardWidget = ({ onOpenCalendar }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const payload = await fetchCalendarEvents({ status: "pending", limit: 12 });
        setEvents(payload.events || []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => {
    const nextInterview = getNextInterview(events);
    const completionRate = events.length
      ? Math.round((events.filter((event) => event.status === "completed").length / events.length) * 100)
      : 0;

    return {
      nextInterview,
      completionRate,
      upcomingEvents: getUpcomingEvents(events, 5)
    };
  }, [events]);

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-5 text-white shadow-2xl shadow-slate-300/20 md:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="space-y-5 lg:max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            <CalendarDays className="h-3.5 w-3.5" /> Placement Calendar
          </div>

          <div>
            <h3 className="text-2xl font-semibold md:text-3xl">Stay ahead of every placement milestone.</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
              Track interviews, deadlines, and offer steps from a single dashboard card with live reminders and quick calendar access.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label="Next Interview" value={summary.nextInterview?.title || "No interview scheduled"} subtext={summary.nextInterview ? `${summary.nextInterview.company} • ${getDaysUntil(summary.nextInterview.date)} days left` : "Add an interview or deadline to begin tracking."} />
            <Stat label="Completion" value={`${summary.completionRate}%`} subtext="Placement events marked completed" icon={<CheckCircle2 className="h-4 w-4" />} />
          </div>
        </div>

        <div className="flex min-h-[280px] flex-1 flex-col justify-between rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/45">Upcoming events</p>
            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="space-y-3">
                  <div className="h-16 animate-pulse rounded-2xl bg-white/10" />
                  <div className="h-16 animate-pulse rounded-2xl bg-white/10" />
                  <div className="h-16 animate-pulse rounded-2xl bg-white/10" />
                </div>
              ) : summary.upcomingEvents.length > 0 ? (
                summary.upcomingEvents.map((event) => (
                  <div key={event._id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{event.title}</p>
                      <p className="truncate text-xs text-white/55">{event.company} • {event.eventType}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                      <Clock3 className="h-4 w-4" /> {getDaysUntil(event.date)}d
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/55">
                  No events scheduled yet.
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenCalendar}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Quick View Calendar <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ label, value, subtext, icon }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{label}</p>
      {icon}
    </div>
    <p className="mt-3 text-lg font-semibold text-white">{value}</p>
    <p className="mt-1 text-xs leading-5 text-white/60">{subtext}</p>
  </div>
);

export default CalendarDashboardWidget;