import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
    value?: Date | null;
    onChange: (date: Date | null) => void;
}

export const DatePicker = ({ value, onChange }: DatePickerProps) => {
    return (
        <div className="date_picker_container" >
            <ReactDatePicker
                dateFormat="dd/MM/yyyy"
                placeholderText="Select Date"
                selected={value}
                onChange={onChange}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                yearDropdownItemNumber={100}
                scrollableYearDropdown
                className="date_input_display"
                // calendarClassName="custom_calendar"
            />
        </div>
    );
};

// import { useState } from "react";

// export const DatePicker = ({ value, onChange }: any) => {
//     // const today = new Date();
//     const [show, setShow] = useState(false);

//     const [currentMonth, setCurrentMonth] = useState(
//         value ? new Date(value) : new Date()
//     );

//     const daysInMonth = new Date(
//         currentMonth.getFullYear(),
//         currentMonth.getMonth() + 1,
//         0
//     ).getDate();

//     const firstDay = new Date(
//         currentMonth.getFullYear(),
//         currentMonth.getMonth(),
//         1
//     ).getDay();

//     const handleSelect = (day: number) => {
//         const finalDate = new Date(
//             currentMonth.getFullYear(),
//             currentMonth.getMonth(),
//             day
//         );
//         onChange(finalDate);
//         setShow(false);
//     };

//     const prevMonth = () => {
//         setCurrentMonth(
//             new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
//         );
//     };

//     const nextMonth = () => {
//         setCurrentMonth(
//             new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
//         );
//     };

//     return (
//         <div className="date_picker_container" >
//             <div className={`date_input_display ${show ? "open" : ""}`} onClick={() => setShow((prev) => !prev)}>
//                 {/* {value ? value?.toLocaleDateString("en-GB") : "Select date"} */}
//                 {value ? new Date(value).toLocaleDateString("en-GB") : "Select date"}

//                 {show ?
//                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M6.75 3V5.25M17.25 3V5.25M3 18.75V7.5C3 6.90326 3.23705 6.33097 3.65901 5.90901C4.08097 5.48705 4.65326 5.25 5.25 5.25H18.75C19.3467 5.25 19.919 5.48705 20.341 5.90901C20.7629 6.33097 21 6.90326 21 7.5V18.75M3 18.75C3 19.3467 3.23705 19.919 3.65901 20.341C4.08097 20.7629 4.65326 21 5.25 21H18.75C19.3467 21 19.919 20.7629 20.341 20.341C20.7629 19.919 21 19.3467 21 18.75M3 18.75V11.25C3 10.6533 3.23705 10.081 3.65901 9.65901C4.08097 9.23705 4.65326 9 5.25 9H18.75C19.3467 9 19.919 9.23705 20.341 9.65901C20.7629 10.081 21 10.6533 21 11.25V18.75" stroke="#605DEC" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
//                     </svg>
//                     : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                         <path d="M6.75 3V5.25M17.25 3V5.25M3 18.75V7.5C3 6.90326 3.23705 6.33097 3.65901 5.90901C4.08097 5.48705 4.65326 5.25 5.25 5.25H18.75C19.3467 5.25 19.919 5.48705 20.341 5.90901C20.7629 6.33097 21 6.90326 21 7.5V18.75M3 18.75C3 19.3467 3.23705 19.919 3.65901 20.341C4.08097 20.7629 4.65326 21 5.25 21H18.75C19.3467 21 19.919 20.7629 20.341 20.341C20.7629 19.919 21 19.3467 21 18.75M3 18.75V11.25C3 10.6533 3.23705 10.081 3.65901 9.65901C4.08097 9.23705 4.65326 9 5.25 9H18.75C19.3467 9 19.919 9.23705 20.341 9.65901C20.7629 10.081 21 10.6533 21 11.25V18.75" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>}
//             </div>

//             {show && (
//                 <div className="calendar_popup">
//                     <div className="header">
//                         <button onClick={prevMonth}>←</button>

//                         <span className="month_label">
//                             {currentMonth.toLocaleString("en-US", { month: "long" })}{" "}
//                             {currentMonth.getFullYear()}
//                         </span>

//                         <button onClick={nextMonth}>→</button>
//                     </div>

//                     <div className="weekdays">
//                         {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
//                             <div key={d}>{d}</div>
//                         ))}
//                     </div>

//                     <div className="days">
//                         {Array(firstDay === 0 ? 6 : firstDay - 1)
//                             .fill("")
//                             .map((_, i) => (
//                                 <div key={i} className="empty"></div>
//                             ))}

//                         {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
//                             <div
//                                 key={day}
//                                 className={
//                                     value &&
//                                         day === value.getDate() &&
//                                         currentMonth.getMonth() === value.getMonth()
//                                         ? "day active"
//                                         : "day"
//                                 }
//                                 onClick={() => handleSelect(day)}
//                             >
//                                 {day}
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };
