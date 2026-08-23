import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./BigCalendar.scss";
import PopupScreen from "../PopupScreen/PopupScreen";
import { InputField } from "../InputFields/InputFields";
import { PrimaryButton, SecondaryButton } from "../Buttons/Buttons";
import { useState } from "react";

const localizer = momentLocalizer(moment);
const myEventsList = [
    {
        id: 1,
        title: "Team Meeting",
        start: new Date(2026, 7, 20, 10, 0),
        end: new Date(2026, 7, 20, 11, 0),
    },
    {
        id: 2,
        title: "Client Meeting",
        start: new Date(2026, 7, 21, 14, 0),
        end: new Date(2026, 7, 21, 15, 30),
    },
    {
        id: 3,
        title: "Project Discussion",
        start: new Date(2026, 7, 22, 9, 30),
        end: new Date(2026, 7, 22, 11, 0),
    },
    {
        id: 4,
        title: "Lunch",
        start: new Date(2026, 7, 23, 13, 0),
        end: new Date(2026, 7, 23, 14, 0),
    },
    {
        id: 5,
        title: "Workshop",
        start: new Date(2026, 7, 24, 10, 0),
        end: new Date(2026, 7, 24, 16, 0),
    },
    {
        id: 6,
        title: "Conference",
        start: new Date(2026, 7, 25),
        end: new Date(2026, 7, 26),
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

    const [addPopup, setAddPopup] = useState(false)
    const [title, setTitle] = useState("")

    const handleAddPopup = (title: string) => {
        setAddPopup(!addPopup)
        setTitle(title)
    }

    const handleSelectSlot = ({ start, end }: any) => {
        const newTitle = `From ${moment(start).format("DD MMM YYYY hh:mm A")} To ${moment(
            end
        ).format("DD MMM YYYY hh:mm A")}`
        handleAddPopup(newTitle)
    };

    const eventStyleGetter = (event: any) => {
        let backgroundColor = "#9333ea";

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
        }

        return {
            style: {
                backgroundColor,
                color: "#fff",
            },
        };
    };

    return (
        <>
            {addPopup && <PopupScreen title={`Add Event ${title}`} onClick={handleAddPopup} >
                <div className="popup_body" >
                    <div className="body_section" >
                        <InputField type="text" label="Event Title" placeHolder="Enter Event title" />
                        <InputField type="text" label="Role" placeHolder="Enter Role" />
                        <InputField type="text" label="Event location" placeHolder="Enter Event location" />
                    </div>
                    <div className="body_section" >
                        <InputField type="textarea" label="Description" placeHolder="Enter discription" />
                    </div>
                    <div className="body_section" >
                        <InputField type="text" label="URL" placeHolder="Enter URL" />
                    </div>

                    <div className="buttons">
                        <SecondaryButton />
                        <PrimaryButton title="Save" />
                    </div>
                </div>
            </PopupScreen>}
            <div className="big-calendar">

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
                    defaultDate={new Date(2026, 7, 20)}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    eventPropGetter={eventStyleGetter}
                    style={{ height: "90vh" }}
                />
            </div>
        </>
    );
};

export default BigCalendar;



// import { Calendar, momentLocalizer } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";

// const localizer = momentLocalizer(moment);

// const myEventsList = [
//     {
//         id: 1,
//         title: "Team Meeting",
//         start: new Date(2026, 7, 20, 10, 0),
//         end: new Date(2026, 7, 20, 11, 0),
//     },
//     {
//         id: 2,
//         title: "Client Meeting",
//         start: new Date(2026, 7, 21, 14, 0),
//         end: new Date(2026, 7, 21, 15, 30),
//     },
//     {
//         id: 3,
//         title: "Project Discussion",
//         start: new Date(2026, 7, 22, 9, 30),
//         end: new Date(2026, 7, 22, 11, 0),
//     },
//     {
//         id: 4,
//         title: "Lunch",
//         start: new Date(2026, 7, 23, 13, 0),
//         end: new Date(2026, 7, 23, 14, 0),
//     },
//     {
//         id: 5,
//         title: "Workshop",
//         start: new Date(2026, 7, 24, 10, 0),
//         end: new Date(2026, 7, 24, 16, 0),
//     },
//     {
//         id: 6,
//         title: "Conference",
//         start: new Date(2026, 7, 25),
//         end: new Date(2026, 7, 26),
//         allDay: true,
//     },
// ];

// const BigCalendar = () => {
//     const handleSelectEvent = (event: any) => {
//         alert(`Title: ${event.title}
//             Start: ${moment(event.start).format("DD MMM YYYY hh:mm A")}
//             End: ${moment(event.end).format("DD MMM YYYY hh:mm A")}
//   `);
//     };

//     const handleSelectSlot = ({ start, end }: any) => {
//         alert(
//             `Selected\n${moment(start).format("DD MMM YYYY hh:mm A")}\n-\n${moment(
//                 end
//             ).format("DD MMM YYYY hh:mm A")}`
//         );
//     };

//     const eventStyleGetter = (event: any) => {
//         let backgroundColor = "#3174ad";

//         switch (event.title) {
//             case "Team Meeting":
//                 backgroundColor = "#2563eb";
//                 break;

//             case "Workshop":
//                 backgroundColor = "#16a34a";
//                 break;

//             case "Conference":
//                 backgroundColor = "#dc2626";
//                 break;

//             default:
//                 backgroundColor = "#9333ea";
//         }

//         return {
//             style: {
//                 backgroundColor,
//                 color: "#fff",
//                 borderRadius: "6px",
//                 border: "none",
//                 padding: "2px 4px",
//             },
//         };
//     };
//     return (
//         <div
//             style={{
//                 height: "100vh",
//                 padding: "20px",
//                 background: "#fff",
//             }}
//         >
//             <Calendar
//                 localizer={localizer}
//                 events={myEventsList}
//                 startAccessor="start"
//                 endAccessor="end"
//                 titleAccessor="title"
//                 defaultView="month"
//                 views={["month", "week", "day", "agenda"]}
//                 popup
//                 selectable
//                 step={30}
//                 timeslots={2}
//                 defaultDate={new Date()}
//                 style={{ height: "90vh" }}

//                 onSelectEvent={handleSelectEvent}

//                 onSelectSlot={handleSelectSlot}

//                 eventPropGetter={eventStyleGetter}
//             />
//         </div>
//     );
// };

// export default BigCalendar;