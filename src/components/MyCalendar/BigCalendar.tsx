import React, { useMemo, useState, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { toast } from "sonner";
import {
  Clock,
  MapPin,
  User,
  AlignLeft,
  ExternalLink,
} from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./BigCalendar.scss";
import PopupScreen from "../PopupScreen/PopupScreen";
import { InputField } from "../InputFields/InputFields";
import { CustomSelect } from "../InputFields/CustomSelect";
import { AddButton, PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import LoadingOverlay from "../Loadingoverlay";
import {
  useFetchEvents,
  useFetchEventById,
  useAddEvent,
  useUpdateEvent,
  useDeleteEvent,
  type CalendarEvent,
} from "../../hooks/useEvents";
import { useRoleOptions } from "../../hooks/useRoles";

const localizer = momentLocalizer(moment);

const EVENT_COLORS = [
  { label: "Purple", value: "#605dec" },
  { label: "Blue", value: "#2563eb" },
  { label: "Green", value: "#16a34a" },
  { label: "Red", value: "#dc2626" },
  { label: "Orange", value: "#ea580c" },
  { label: "Teal", value: "#0d9488" },
];

const initialFormState = {
  title: "",
  description: "",
  start_date: "",
  end_date: "",
  role: "",
  location: "",
  url: "",
  color: "#605dec",
};

const BigCalendar: React.FC = () => {
  // 1. GET: Fetch all events
  const { data: eventsList = [], isLoading } = useFetchEvents();
  const { options: roleOptions } = useRoleOptions(true);
  const addEventMutation = useAddEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  // Calendar controlled state (required for toolbar buttons to work in v1.x)
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<string>(Views.MONTH);

  const handleNavigate = useCallback((newDate: Date) => {
    setCalendarDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: string) => {
    setCalendarView(newView);
  }, []);

  // Modal and Form States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 2. GET by ID: View Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedFallbackEvent, setSelectedFallbackEvent] = useState<CalendarEvent | null>(null);

  const { data: fetchedEventDetail, isLoading: isLoadingDetail } = useFetchEventById(
    selectedEventId,
    isDetailsModalOpen
  );
  const activeEventDetail = fetchedEventDetail || selectedFallbackEvent;

  // 5. DELETE: Confirmation Modal State
  const [deleteTarget, setDeleteTarget] = useState<CalendarEvent | null>(null);

  // Map API events into react-big-calendar event structure
  const calendarEvents = useMemo(() => {
    if (!Array.isArray(eventsList)) return [];
    return eventsList.map((item: CalendarEvent) => {
      const start = item.start_date ? new Date(item.start_date) : new Date();
      const end = item.end_date
        ? new Date(item.end_date)
        : new Date(start.getTime() + 60 * 60 * 1000);
      return {
        id: item.id,
        title: item.title,
        start,
        end,
        allDay: false,
        resource: item,
      };
    });
  }, [eventsList]);

  // Event style / color getter
  const eventStyleGetter = (event: any) => {
    const backgroundColor = event.resource?.color || "#605dec";
    return {
      style: {
        backgroundColor,
        color: "#fff",
        borderRadius: "6px",
        border: "none",
        padding: "3px 6px",
      },
    };
  };

  // Click on Calendar Event -> Show Event Details (triggers GET by ID)
  const handleSelectEvent = (calEvent: any) => {
    setSelectedEventId(calEvent.id);
    setSelectedFallbackEvent(calEvent.resource || null);
    setIsDetailsModalOpen(true);
  };

  // Click on Empty Slot -> Open Add Event Modal
  const handleSelectSlot = ({ start, end }: any) => {
    setEditingEvent(null);
    setFormData({
      ...initialFormState,
      start_date: moment(start).format("YYYY-MM-DDTHH:mm"),
      end_date: moment(end).format("YYYY-MM-DDTHH:mm"),
    });
    setErrors({});
    setIsFormModalOpen(true);
  };

  // Open Add Modal from Button
  const handleOpenAddModal = () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    setEditingEvent(null);
    setFormData({
      ...initialFormState,
      start_date: moment(now).format("YYYY-MM-DDTHH:mm"),
      end_date: moment(oneHourLater).format("YYYY-MM-DDTHH:mm"),
    });
    setErrors({});
    setIsFormModalOpen(true);
  };

  // Open Edit Modal from Details view
  const handleOpenEditModal = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      start_date: event.start_date
        ? moment(event.start_date).format("YYYY-MM-DDTHH:mm")
        : "",
      end_date: event.end_date
        ? moment(event.end_date).format("YYYY-MM-DDTHH:mm")
        : "",
      role: event.role || "",
      location: event.location || "",
      url: event.url || "",
      color: event.color || "#605dec",
    });
    setErrors({});
    setIsDetailsModalOpen(false);
    setIsFormModalOpen(true);
  };

  // Close Form Modal
  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingEvent(null);
    setFormData(initialFormState);
    setErrors({});
  };

  // Close Details Modal
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedEventId(null);
    setSelectedFallbackEvent(null);
  };

  // Form Validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = "Event title is required";
    if (!formData.start_date.trim()) newErrors.start_date = "Start date & time is required";
    if (!formData.role.trim()) newErrors.role = "Role is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Add (POST) or Update (PUT)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      start_date: new Date(formData.start_date).toISOString(),
      end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
      role: formData.role.trim(),
      location: formData.location.trim(),
      url: formData.url ? formData.url.trim() : "",
      color: formData.color || "#605dec",
    };

    try {
      if (editingEvent) {
        await updateEventMutation.mutateAsync({
          id: editingEvent.id,
          ...payload,
        });
        toast.success("Event updated successfully");
      } else {
        await addEventMutation.mutateAsync(payload);
        toast.success("Event created successfully");
      }
      handleCloseFormModal();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save event";
      toast.error(errorMsg);
    }
  };

  // Delete Handlers (DELETE)
  const handleDeleteClick = (event: CalendarEvent) => {
    setDeleteTarget(event);
    setIsDetailsModalOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEventMutation.mutateAsync(deleteTarget.id);
      toast.success("Event deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete event";
      toast.error(errorMsg);
    }
  };

  const isSaving = addEventMutation.isPending || updateEventMutation.isPending;

  return (
    <>
      {isLoading && !eventsList.length && <LoadingOverlay isLoading={true} />}

      {/* CREATE / EDIT EVENT POPUP */}
      {isFormModalOpen && (
        <PopupScreen
          title={editingEvent ? "Edit Event" : "Add Event"}
          onClick={handleCloseFormModal}
        >
          <div className="popup_body">
            <div className="fields_wrapper">
              <div className="body_section">
                <InputField
                  type="text"
                  label="Event Title *"
                  placeHolder="Enter Event title"
                  value={formData.title}
                  error={errors.title}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, title: val }));
                    if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
                  }}
                />
                <CustomSelect
                  label="Role *"
                  placeholder="Select Role"
                  value={formData.role}
                  options={roleOptions}
                  onChange={(val) => {
                    setFormData((prev: any) => ({ ...prev, role: val }));
                    if (errors.role) setErrors((prev) => ({ ...prev, role: "" }));
                  }}
                />
                <InputField
                  type="text"
                  label="Event Location *"
                  placeHolder="Enter Event location"
                  value={formData.location}
                  error={errors.location}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, location: val }));
                    if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
                  }}
                />
              </div>

              <div className="body_section">
                <InputField
                  type="datetime-local"
                  label="Start Date & Time *"
                  placeHolder="Select start date and time"
                  value={formData.start_date}
                  error={errors.start_date}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, start_date: val }));
                    if (errors.start_date) setErrors((prev) => ({ ...prev, start_date: "" }));
                  }}
                />
                <InputField
                  type="datetime-local"
                  label="End Date & Time"
                  placeHolder="Select end date and time"
                  value={formData.end_date}
                  error={errors.end_date}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, end_date: val }));
                    if (errors.end_date) setErrors((prev) => ({ ...prev, end_date: "" }));
                  }}
                />
              </div>

              <div className="body_section">
                <InputField
                  type="text"
                  label="Description *"
                  placeHolder="Enter description"
                  value={formData.description}
                  error={errors.description}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, description: val }));
                    if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
                  }}
                />
              </div>

              <div className="body_section">
                <InputField
                  type="text"
                  label="URL (Optional)"
                  placeHolder="https://..."
                  value={formData.url}
                  onChange={(e: any) => {
                    const val = e?.target ? e.target.value : e;
                    setFormData((prev) => ({ ...prev, url: val }));
                  }}
                />
              </div>

              <div className="body_section">
                <div className="color_picker_container">
                  <label className="color_label">Event Color</label>
                  <div className="color_palette">
                    {EVENT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        className={`color_chip ${formData.color === c.value ? "active" : ""}`}
                        style={{ backgroundColor: c.value }}
                        onClick={() => setFormData((prev) => ({ ...prev, color: c.value }))}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="buttons">
              <SecondaryButton
                title={editingEvent ? "Cancel" : "Reset"}
                onClick={
                  editingEvent
                    ? handleCloseFormModal
                    : () => {
                      setFormData(initialFormState);
                      setErrors({});
                    }
                }
              />
              <PrimaryButton
                title={
                  isSaving
                    ? "Saving..."
                    : editingEvent
                      ? "Update Event"
                      : "Save Event"
                }
                onClick={handleSubmit}
                disabled={isSaving}
                isLoading={isSaving}
              />
            </div>
          </div>
        </PopupScreen>
      )}

      {/* EVENT DETAILS POPUP (GET by ID) */}
      {isDetailsModalOpen && (
        <PopupScreen
          title="Event Details"
          onClick={handleCloseDetailsModal}
        >
          <div className="popup_body">
            {isLoadingDetail && !activeEventDetail ? (
              <p style={{ padding: "20px", textAlign: "center" }}>Loading event details...</p>
            ) : activeEventDetail ? (
              <div className="event_details_view">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>
                    {activeEventDetail.title}
                  </h3>
                  <span
                    className="event_badge"
                    style={{ backgroundColor: activeEventDetail.color || "#605dec" }}
                  >
                    {activeEventDetail.role || "Event"}
                  </span>
                </div>

                <div className="detail_row">
                  <Clock size={18} className="detail_icon" />
                  <div className="detail_content">
                    <span className="detail_label">Time</span>
                    <span className="detail_value">
                      {moment(activeEventDetail.start_date).format("DD MMM YYYY, hh:mm A")}
                      {activeEventDetail.end_date &&
                        ` - ${moment(activeEventDetail.end_date).format("DD MMM YYYY, hh:mm A")}`}
                    </span>
                  </div>
                </div>

                <div className="detail_row">
                  <MapPin size={18} className="detail_icon" />
                  <div className="detail_content">
                    <span className="detail_label">Location</span>
                    <span className="detail_value">{activeEventDetail.location || "N/A"}</span>
                  </div>
                </div>

                <div className="detail_row">
                  <User size={18} className="detail_icon" />
                  <div className="detail_content">
                    <span className="detail_label">Role</span>
                    <span className="detail_value">{activeEventDetail.role || "All"}</span>
                  </div>
                </div>

                <div className="detail_row">
                  <AlignLeft size={18} className="detail_icon" />
                  <div className="detail_content">
                    <span className="detail_label">Description</span>
                    <span className="detail_value">{activeEventDetail.description || "No description provided."}</span>
                  </div>
                </div>

                {activeEventDetail.url && (
                  <div className="detail_row">
                    <ExternalLink size={18} className="detail_icon" />
                    <div className="detail_content">
                      <span className="detail_label">Link</span>
                      <span className="detail_value">
                        <a
                          href={activeEventDetail.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {activeEventDetail.url}
                        </a>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ padding: "20px", textAlign: "center" }}>Event details not found.</p>
            )}

            <div className="buttons">
              <SecondaryButton
                title="Delete"
                onClick={() => activeEventDetail && handleDeleteClick(activeEventDetail)}
              />
              <PrimaryButton
                title="Edit Event"
                onClick={() => activeEventDetail && handleOpenEditModal(activeEventDetail)}
              />
            </div>
          </div>
        </PopupScreen>
      )}

      {/* DELETE CONFIRMATION POPUP */}
      {deleteTarget && (
        <PopupScreen
          title="Delete Event"
          onClick={handleCancelDelete}
        >
          <div className="popup_body">
            <div className="body_section">
              <p>
                Are you sure you want to delete event{" "}
                <strong>"{deleteTarget.title}"</strong>?
              </p>
            </div>

            <div className="buttons">
              <SecondaryButton
                onClick={handleCancelDelete}
                title="Cancel"
                disable={deleteEventMutation.isPending}
              />
              <PrimaryButton
                onClick={handleConfirmDelete}
                disabled={deleteEventMutation.isPending}
                isLoading={deleteEventMutation.isPending}
                title={deleteEventMutation.isPending ? "Deleting..." : "Delete"}
              />
            </div>
          </div>
        </PopupScreen>
      )}

      {/* CALENDAR DISPLAY */}
      <div className="big-calendar hvr_zm_in">
        <div className="calendar_header_bar">
          <h2 className="calendar_heading">Events Calendar</h2>
          <AddButton title="Add Event" onClick={handleOpenAddModal} />
        </div>

        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          view={calendarView as any}
          date={calendarDate}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          views={["month", "week", "day", "agenda"]}
          popup
          selectable
          step={30}
          timeslots={2}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          style={{ height: "85vh" }}
        />
      </div>
    </>
  );
};

export default BigCalendar;
