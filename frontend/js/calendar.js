/**
 * Placement Calendar - Frontend Logic
 * -------------------------------------------------------
 * Location in repo: frontend/js/calendar.js
 *
 * Responsibilities:
 *   1. Fetch placement events from the backend REST API
 *   2. Render them on a FullCalendar instance (month/week views)
 *   3. Support search-by-company and filter-by-event-type
 *   4. Render an "Upcoming Events" side panel
 *   5. Support create / edit / delete / mark-completed via a modal
 *
 * No frameworks (React/Vue/Angular/jQuery/Bootstrap) are used -
 * everything below is vanilla JS + the FullCalendar library.
 */

(function () {
  'use strict';

  // ---------------------------------------------------------
  // Config
  // ---------------------------------------------------------

  // Base URL for the Placement Event REST API.
  // Adjust if the backend is served from a different origin/port.
  const API_BASE_URL = '/api/placement-events';

  // Maps eventType -> CSS className used for color-coding in calendar.css
  const EVENT_TYPE_CLASS = {
    Test: 'event-test',
    Interview: 'event-interview',
    PPT: 'event-ppt',
    Workshop: 'event-workshop',
    Other: 'event-other',
  };

  // ---------------------------------------------------------
  // State
  // ---------------------------------------------------------

  let calendar = null;       // FullCalendar instance
  let allEvents = [];        // Full, unfiltered list of events fetched from the API
  let searchTerm = '';       // Current company search text
  let typeFilter = '';       // Current event-type filter

  // ---------------------------------------------------------
  // DOM references
  // ---------------------------------------------------------

  const calendarEl = document.getElementById('placementCalendar');
  const companySearchEl = document.getElementById('companySearch');
  const eventTypeFilterEl = document.getElementById('eventTypeFilter');
  const upcomingListEl = document.getElementById('upcomingEventsList');

  const addEventBtn = document.getElementById('addEventBtn');
  const eventModal = document.getElementById('eventModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const eventForm = document.getElementById('eventForm');
  const modalTitle = document.getElementById('modalTitle');
  const deleteEventBtn = document.getElementById('deleteEventBtn');

  const eventIdInput = document.getElementById('eventId');
  const eventCompanyInput = document.getElementById('eventCompany');
  const eventTitleInput = document.getElementById('eventTitle');
  const eventTypeInput = document.getElementById('eventType');
  const eventDateInput = document.getElementById('eventDate');
  const eventStartTimeInput = document.getElementById('eventStartTime');
  const eventEndTimeInput = document.getElementById('eventEndTime');
  const eventDescriptionInput = document.getElementById('eventDescription');

  // ---------------------------------------------------------
  // API helpers
  // ---------------------------------------------------------

  /**
   * Thin wrapper around fetch() that parses JSON and throws on error
   * responses so callers can use a single try/catch.
   */
  async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok || body.success === false) {
      throw new Error(body.message || `Request failed with status ${response.status}`);
    }

    return body;
  }

  function fetchAllEvents() {
    return apiRequest(API_BASE_URL).then((res) => res.data);
  }

  function createEvent(payload) {
    return apiRequest(API_BASE_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then((res) => res.data);
  }

  function updateEvent(id, payload) {
    return apiRequest(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }).then((res) => res.data);
  }

  function deleteEventById(id) {
    return apiRequest(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
  }

  function setEventCompleted(id, completed) {
    return apiRequest(`${API_BASE_URL}/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    }).then((res) => res.data);
  }

  // ---------------------------------------------------------
  // Rendering helpers
  // ---------------------------------------------------------

  /**
   * Applies the current search + filter state to the full event list.
   */
  function getVisibleEvents() {
    return allEvents.filter((evt) => {
      const matchesSearch =
        !searchTerm || evt.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !typeFilter || evt.eventType === typeFilter;
      return matchesSearch && matchesType;
    });
  }

  /**
   * Converts a PlacementEvent (from the API) into a FullCalendar event object.
   */
  function toFullCalendarEvent(evt) {
    const classNames = [EVENT_TYPE_CLASS[evt.eventType] || 'event-other'];
    if (evt.completed) classNames.push('event-completed');

    return {
      id: evt._id,
      title: `${evt.company} - ${evt.title}`,
      start: evt.startTime ? `${evt.date.slice(0, 10)}T${evt.startTime}` : evt.date,
      end: evt.endTime ? `${evt.date.slice(0, 10)}T${evt.endTime}` : undefined,
      classNames,
      backgroundColor: evt.color || undefined,
      borderColor: evt.color || undefined,
      extendedProps: { ...evt },
    };
  }

  /**
   * Pushes the currently-visible events into the FullCalendar instance.
   */
  function renderCalendarEvents() {
    if (!calendar) return;
    const visible = getVisibleEvents();
    calendar.removeAllEvents();
    calendar.addEventSource(visible.map(toFullCalendarEvent));
  }

  /**
   * Renders the "Upcoming Events" sidebar: the next 5 non-completed
   * events (from today onward), respecting the current search/filter.
   */
  function renderUpcomingPanel() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = getVisibleEvents()
      .filter((evt) => new Date(evt.date) >= today && !evt.completed)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);

    upcomingListEl.innerHTML = '';

    if (upcoming.length === 0) {
      upcomingListEl.innerHTML = '<li class="upcoming-list__empty">No upcoming events.</li>';
      return;
    }

    upcoming.forEach((evt) => {
      const li = document.createElement('li');
      li.className = 'upcoming-list__item';
      li.dataset.id = evt._id;

      const dateLabel = new Date(evt.date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      li.innerHTML = `
        <div class="upcoming-list__item-title">${escapeHtml(evt.company)} - ${escapeHtml(evt.title)}</div>
        <div class="upcoming-list__item-meta">${dateLabel} · ${escapeHtml(evt.eventType)}</div>
      `;

      li.addEventListener('click', () => openModalForEdit(evt));
      upcomingListEl.appendChild(li);
    });
  }

  function refreshUI() {
    renderCalendarEvents();
    renderUpcomingPanel();
  }

  /** Minimal HTML-escaping to keep user-entered text safe when injected via innerHTML. */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---------------------------------------------------------
  // Data loading
  // ---------------------------------------------------------

  async function loadEvents() {
    try {
      allEvents = await fetchAllEvents();
      refreshUI();
    } catch (error) {
      console.error('Failed to load placement events:', error);
      upcomingListEl.innerHTML = '<li class="upcoming-list__empty">Could not load events.</li>';
    }
  }

  // ---------------------------------------------------------
  // Modal handling (Add / Edit / Delete / Mark completed)
  // ---------------------------------------------------------

  function openModalForCreate(prefilledDate) {
    modalTitle.textContent = 'Add Event';
    eventForm.reset();
    eventIdInput.value = '';
    deleteEventBtn.hidden = true;

    if (prefilledDate) {
      eventDateInput.value = prefilledDate;
    }

    eventModal.hidden = false;
  }

  function openModalForEdit(evt) {
    modalTitle.textContent = 'Edit Event';
    eventIdInput.value = evt._id;
    eventCompanyInput.value = evt.company;
    eventTitleInput.value = evt.title;
    eventTypeInput.value = evt.eventType;
    eventDateInput.value = evt.date.slice(0, 10);
    eventStartTimeInput.value = evt.startTime || '';
    eventEndTimeInput.value = evt.endTime || '';
    eventDescriptionInput.value = evt.description || '';
    deleteEventBtn.hidden = false;

    eventModal.hidden = false;
  }

  function closeModal() {
    eventModal.hidden = true;
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    const payload = {
      company: eventCompanyInput.value.trim(),
      title: eventTitleInput.value.trim(),
      eventType: eventTypeInput.value,
      date: eventDateInput.value,
      startTime: eventStartTimeInput.value || null,
      endTime: eventEndTimeInput.value || null,
      description: eventDescriptionInput.value.trim(),
    };

    const id = eventIdInput.value;

    try {
      if (id) {
        await updateEvent(id, payload);
      } else {
        await createEvent(payload);
      }
      closeModal();
      await loadEvents();
    } catch (error) {
      alert(`Could not save event: ${error.message}`);
    }
  }

  async function handleDeleteClick() {
    const id = eventIdInput.value;
    if (!id) return;

    if (!confirm('Delete this event? This cannot be undone.')) return;

    try {
      await deleteEventById(id);
      closeModal();
      await loadEvents();
    } catch (error) {
      alert(`Could not delete event: ${error.message}`);
    }
  }

  /**
   * Handles clicking an event on the calendar itself: offers a quick
   * "mark completed" toggle, or opens the edit modal for anything else.
   */
  async function handleCalendarEventClick(info) {
    const evt = info.event.extendedProps;

    const wantsToggleCompletion = confirm(
      evt.completed
        ? `"${evt.company} - ${evt.title}" is marked completed.\n\nClick OK to mark it as NOT completed, or Cancel to edit the event.`
        : `Mark "${evt.company} - ${evt.title}" as completed?\n\nClick OK to mark completed, or Cancel to edit the event instead.`
    );

    if (wantsToggleCompletion) {
      try {
        await setEventCompleted(evt._id, !evt.completed);
        await loadEvents();
      } catch (error) {
        alert(`Could not update event: ${error.message}`);
      }
    } else {
      openModalForEdit(evt);
    }
  }

  // ---------------------------------------------------------
  // FullCalendar initialization
  // ---------------------------------------------------------

  function initCalendar() {
    calendar = new FullCalendar.Calendar(calendarEl, {
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek', // Month View + Week View
      },
      initialView: 'dayGridMonth',
      height: 'auto',
      firstDay: 1, // Monday
      dateClick: (info) => openModalForCreate(info.dateStr),
      eventClick: handleCalendarEventClick,
    });

    calendar.render();
  }

  // ---------------------------------------------------------
  // Event listeners
  // ---------------------------------------------------------

  function bindEventListeners() {
    companySearchEl.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      refreshUI();
    });

    eventTypeFilterEl.addEventListener('change', (e) => {
      typeFilter = e.target.value;
      refreshUI();
    });

    addEventBtn.addEventListener('click', () => openModalForCreate());
    closeModalBtn.addEventListener('click', closeModal);
    eventModal.addEventListener('click', (e) => {
      if (e.target === eventModal) closeModal(); // click outside content closes modal
    });

    eventForm.addEventListener('submit', handleFormSubmit);
    deleteEventBtn.addEventListener('click', handleDeleteClick);
  }

  // ---------------------------------------------------------
  // Init
  // ---------------------------------------------------------

  document.addEventListener('DOMContentLoaded', () => {
    initCalendar();
    bindEventListeners();
    loadEvents();
  });
})();