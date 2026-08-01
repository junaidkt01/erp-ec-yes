import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const myEventsList = [
    {
        id: 1,
        title: "Team Meeting",
        start: new Date(2026, 6, 20, 10, 0),
        end: new Date(2026, 6, 20, 11, 0),
    },
    {
        id: 2,
        title: "Client Meeting",
        start: new Date(2026, 6, 21, 14, 0),
        end: new Date(2026, 6, 21, 15, 30),
    },
    {
        id: 3,
        title: "Project Discussion",
        start: new Date(2026, 6, 22, 9, 30),
        end: new Date(2026, 6, 22, 11, 0),
    },
    {
        id: 4,
        title: "Lunch",
        start: new Date(2026, 6, 23, 13, 0),
        end: new Date(2026, 6, 23, 14, 0),
    },
    {
        id: 5,
        title: "Workshop",
        start: new Date(2026, 6, 24, 10, 0),
        end: new Date(2026, 6, 24, 16, 0),
    },
    {
        id: 6,
        title: "Conference",
        start: new Date(2026, 6, 25),
        end: new Date(2026, 6, 26),
        allDay: true,
    },
];

const BigCalendar = () => {
    const handleSelectEvent = (event: any) => {
        alert(`Title: ${event.title}
            Start: ${moment(event.start).format("DD MMM YYYY hh:mm A")}
            End: ${moment(event.end).format("DD MMM YYYY hh:mm A")}
  `);
    };

    const handleSelectSlot = ({ start, end }: any) => {
        alert(
            `Selected\n${moment(start).format("DD MMM YYYY hh:mm A")}\n-\n${moment(
                end
            ).format("DD MMM YYYY hh:mm A")}`
        );
    };

    const eventStyleGetter = (event: any) => {
        let backgroundColor = "#3174ad";

        switch (event.title) {
            case "Team Meeting":
                backgroundColor = "#2563eb";
                break;

            case "Workshop":
                backgroundColor = "#16a34a";
                break;

            case "Conference":
                backgroundColor = "#dc2626";
                break;

            default:
                backgroundColor = "#9333ea";
        }

        return {
            style: {
                backgroundColor,
                color: "#fff",
                borderRadius: "6px",
                border: "none",
                padding: "2px 4px",
            },
        };
    };
    return (
        <div
            style={{
                height: "100vh",
                padding: "20px",
                background: "#fff",
            }}
        >
            <Calendar
                localizer={localizer}
                events={myEventsList}
                startAccessor="start"
                endAccessor="end"
                titleAccessor="title"
                defaultView="month"
                views={["month", "week", "day", "agenda"]}
                popup
                selectable
                step={30}
                timeslots={2}
                defaultDate={new Date()}
                style={{ height: "90vh" }}

                onSelectEvent={handleSelectEvent}

                onSelectSlot={handleSelectSlot}

                eventPropGetter={eventStyleGetter}
            />
        </div>
    );
};

export default BigCalendar;