// import { useState } from "react"
// import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
// import { CustomSelect } from "../../../components/InputFields/CustomSelect"
// import { InputField } from "../../../components/InputFields/InputFields"
// import PopupScreen from "../../../components/PopupScreen/PopupScreen"
// import TableWrapper from "../../../components/TableWrapper"
// import DataTable, { type Column } from "../../../components/DataTable/DataTable"
// import AttendanceButton, { type StatusType } from "../../../components/AttendanceButton/AttendanceButton"
// import { useAddStudentAttendance, useFetchStudentAttendance, type CreateStudentAttendance } from "../../../hooks/useStudentAttendance"
// import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass"
// import { useFetchAllSections } from "../../../hooks/useSections"
// import "./StudentAttendance.scss"

// const StudentAttendance = () => {
//     const [page, setPage] = useState(1);
//     // const [selectedStatus, setSelectedStatus] = useState<StatusType>("present");
//     const columns: Column[] = [
//         { key: "sl", title: "SL" },
//         { key: "roll_no", title: "Roll No" },
//         { key: "photo", title: "Image" },
//         { key: "student_name", title: "Student Name" },
//         { key: "student_code", title: "Student ID" },
//     ];

//     const { data: studentClasses } = useFetchAllStudentClasses();
//     const classOptions = studentClasses?.map((cls: any) => ({
//         label: cls.name,
//         value: cls.id,
//     }));

//     // filter start
//     const { data: sections } = useFetchAllSections();
//     const sectionOptions = sections?.map((cls: any) => ({
//         label: cls.name,
//         value: cls.id,
//     }));

//     const initialFilter = {
//         class_id: "",
//         section_id: "",
//         attendance_date: new Date()
//     };

//     const [filterData, setFilterData] = useState(initialFilter);
//     const [filteredData, setFilteredData] = useState(initialFilter);
//     const handleSearch = () => {
//         setFilteredData({ ...filterData });
//     };

//     const handleResetFilterData = () => {
//         setFilterData(initialFilter);
//         setFilteredData(initialFilter);
//     };
//     // filter end

//     // const { data: sampleData, isLoading } = useFetchAllStudents(page, {
//     //     academic_year_id: filteredData.academic_year_id,
//     //     class_id: filteredData.class_id,
//     //     section_id: filteredData.section_id,
//     //     search: debouncedSearch || filteredData.name,
//     // });

//     const { data: studentAttendance } = useFetchStudentAttendance();
//     console.log("studentAttendance: ", studentAttendance);

//     const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
//     const handleAddAdmissionQuery = () => {
//         setIsAddAdmissionQuery(!isAddAdmissionQuery)
//     }

//     const [selectedStatuses, setSelectedStatuses] = useState<Record<string, StatusType>>({});


//     const { mutate: addStudentAttendance, isPending } = useAddStudentAttendance();

//     const handleSubmitAttendance = () => {
//         const payload: CreateStudentAttendance[] = [
//             {
//                 student_code: "ABC",
//                 class_id: 5,
//                 section_id: 3,
//                 date: "2026-08-14",
//                 status: "Late",
//                 note: "Late coming",
//                 academic_year_id: 1,
//             },
//             {
//                 student_code: "ABC",
//                 class_id: 5,
//                 section_id: 3,
//                 date: "2026-08-14",
//                 status: "Absent",
//                 note: "Absence",
//                 academic_year_id: 1,
//             },
//         ];

//         addStudentAttendance(payload);
//     };

//     return (
//         <div className="page_wrapper">
//             <div className="student_attendance">

//                 {isAddAdmissionQuery && <PopupScreen title="Add Admission Query" onClick={handleAddAdmissionQuery} >
//                     <div className="popup_body" >
//                         <div className="body_section" >
//                             <InputField type="text" label="Name" placeHolder="Enter name" />
//                             <InputField type="text" label="Phone" placeHolder="Enter phone number" />
//                             <InputField type="text" label="Email" placeHolder="Enter email address" />
//                         </div>
//                         <div className="body_section" >
//                             <InputField type="text" label="Address" placeHolder="Enter address" />
//                         </div>
//                         <div className="body_section" >
//                             <InputField type="text" label="Discription" placeHolder="Enter discription" />
//                         </div>
//                         <div className="body_section" >
//                             <InputField type="date" label="Date From" placeHolder="Select date" />
//                             <InputField type="date" label="Next Follow Up Date" placeHolder="Select date" />
//                             <InputField type="text" label="Assigned" placeHolder="Enter assignee name" />
//                         </div>

//                         <div className="buttons">
//                             <SecondaryButton />
//                             <PrimaryButton title="Save" />
//                         </div>
//                     </div>
//                 </PopupScreen>}

//                 <TableWrapper title="Student Attendance" >
//                     <div className="search_screen" >
//                         <p className="search_screen_title" >Select Criteria</p>
//                         <div className="popup_body" >
//                             <div className="fields_wrapper" >
//                                 <div className="body_section" >
//                                     <CustomSelect value={filterData?.class_id} label="Class" placeholder="Select class" options={classOptions || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, class_id: value }))} />
//                                     <CustomSelect value={filterData?.section_id} name="section_id" label="Section" placeholder="Select section" options={sectionOptions || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, section_id: value }))} />
//                                     {/* <CustomSelect label="Class" placeholder="Select Class" onChange={(val) => console.log("Selected:", val)} />
//                                     <CustomSelect label="Section" placeholder="Select Section" onChange={(val) => console.log("Selected:", val)} /> */}
//                                     {/* <InputField type="date" label="Attendance Date" placeHolder="Select Date" /> */}
//                                     <InputField name="attendance_date" type="date" label="Attendance Date" value={filterData.attendance_date} placeHolder="Select date" onChange={(value) => setFilterData((prev: any) => ({ ...prev, attendance_date: value }))} />

//                                 </div>
//                             </div>

//                             <div className="buttons">
//                                 <SecondaryButton title="Reset" onClick={handleResetFilterData} />
//                                 <PrimaryButton title="Search" onClick={handleSearch} />
//                             </div>
//                         </div>
//                     </div>
//                 </TableWrapper>
//                 <TableWrapper isSearchBar title="Student Attendance" >
//                     <DataTable
//                         columns={columns}
//                         data={studentAttendance}
//                         currentPage={page}
//                         totalPages={1}
//                         onPageChange={(p) => setPage(p)}
//                         attendance={(row) => {
//                             const backendStatus = row.status?.toLowerCase() as StatusType;
//                             const selectedStatus = selectedStatuses[row.id] ?? backendStatus ?? "present";

//                             return (
//                                 <div className="attendance_buttons">
//                                     <AttendanceButton status="present" title="Present"
//                                         active={selectedStatus === "present"}
//                                         onClick={(status) =>
//                                             setSelectedStatuses((prev) => ({
//                                                 ...prev,
//                                                 [row.id]: status,
//                                             }))
//                                         }
//                                     />

//                                     <AttendanceButton status="late" title="Late"
//                                         active={selectedStatus === "late"}
//                                         onClick={(status) =>
//                                             setSelectedStatuses((prev) => ({
//                                                 ...prev,
//                                                 [row.id]: status,
//                                             }))
//                                         }
//                                     />

//                                     <AttendanceButton status="absent" title="Absent"
//                                         active={selectedStatus === "absent"}
//                                         onClick={(status) =>
//                                             setSelectedStatuses((prev) => ({
//                                                 ...prev,
//                                                 [row.id]: status,
//                                             }))
//                                         }
//                                     />

//                                     <AttendanceButton status="half-day" title="Half Day"
//                                         active={selectedStatus === "half-day"}
//                                         onClick={(status) =>
//                                             setSelectedStatuses((prev) => ({
//                                                 ...prev,
//                                                 [row.id]: status,
//                                             }))
//                                         }
//                                     />

//                                     <AttendanceButton status="leave" title="Leave"
//                                         active={selectedStatus === "leave"}
//                                         onClick={(status) =>
//                                             setSelectedStatuses((prev) => ({
//                                                 ...prev,
//                                                 [row.id]: status,
//                                             }))
//                                         }
//                                     />
//                                 </div>
//                             );
//                         }}
//                         note={(row) => (
//                             <InputField value={row.note} type="text" placeHolder="Enter note" />
//                         )}
//                     />
//                     <div className="submit_attendance_button" >
//                         <PrimaryButton onClick={handleSubmitAttendance} title="Submit Attendance" />
//                     </div>
//                 </TableWrapper>
//             </div>
//         </div>
//     )
// }

// export default StudentAttendance;

import { useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { CustomSelect } from "../../../components/InputFields/CustomSelect"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import AttendanceButton, { type StatusType } from "../../../components/AttendanceButton/AttendanceButton"
import { useAddStudentAttendance, useFetchStudentAttendance, type CreateStudentAttendance } from "../../../hooks/useStudentAttendance"
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass"
import { useFetchAllSections } from "../../../hooks/useSections"
import "./StudentAttendance.scss"

const StudentAttendance = () => {
    const [page, setPage] = useState(1);
    // const [selectedStatus, setSelectedStatus] = useState<StatusType>("present");
    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "roll_no", title: "Roll No" },
        { key: "photo", title: "Image" },
        { key: "student_name", title: "Student Name" },
        { key: "student_code", title: "Student ID" },
    ];

    const { data: studentClasses } = useFetchAllStudentClasses();
    const classOptions = studentClasses?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    // filter start
    const { data: sections } = useFetchAllSections();
    const sectionOptions = sections?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    const initialFilter = {
        class_id: "",
        section_id: "",
        attendance_date: new Date()
    };

    const [filterData, setFilterData] = useState(initialFilter);
    const [filteredData, setFilteredData] = useState(initialFilter);
    const handleSearch = () => {
        setFilteredData({ ...filterData });
    };

    const handleResetFilterData = () => {
        setFilterData(initialFilter);
        setFilteredData(initialFilter);
    };
    // filter end

    // const { data: sampleData, isLoading } = useFetchAllStudents(page, {
    //     academic_year_id: filteredData.academic_year_id,
    //     class_id: filteredData.class_id,
    //     section_id: filteredData.section_id,
    //     search: debouncedSearch || filteredData.name,
    // });

    const { data: studentAttendance } = useFetchStudentAttendance();
    console.log("studentAttendance: ", studentAttendance);

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }

    const [selectedStatuses, setSelectedStatuses] = useState<Record<string | number, StatusType>>({});
    const [notes, setNotes] = useState<Record<string | number, string>>({});

    const { mutate: addStudentAttendance, isPending } = useAddStudentAttendance();

    const formatDate = (dateInput: any) => {
        if (!dateInput) return "";
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return String(dateInput);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const handleSubmitAttendance = () => {
        if (!studentAttendance || !Array.isArray(studentAttendance)) return;

        const formattedDate = formatDate(filterData.attendance_date);

        const toNum = (val: any) => {
            if (val === null || val === undefined || val === "") return undefined;
            const num = Number(val);
            return isNaN(num) ? val : num;
        };

        const payload: CreateStudentAttendance[] = studentAttendance.map((row: any) => {
            const backendStatus = row.status?.toLowerCase() as StatusType;
            const status = selectedStatuses[row.id] ?? backendStatus ?? "present";
            const note = notes[row.id] ?? row.note ?? "";

            const class_id = toNum(filterData.class_id) ?? toNum(row.class_id) ?? toNum(row.student?.class_id) ?? toNum(row.class?.id);
            const section_id = toNum(filterData.section_id) ?? toNum(row.section_id) ?? toNum(row.student?.section_id) ?? toNum(row.section?.id);
            // const academic_year_id = toNum((filterData as any).academic_year_id) ?? toNum(row.academic_year_id) ?? toNum(row.student?.academic_year_id) ?? toNum(row.class?.academic_year_id);

            return {
                student_code: row.student_code || row.student?.student_code || row.admission_no || row.student?.admission_no || String(row.student_id || row.id),
                class_id: class_id, 
                section_id: section_id,
                // academic_year_id: academic_year_id,
                date: formattedDate,
                status: status,
                note: note,
            };
        });

        console.log("Submitting Attendance Payload:", payload);
        addStudentAttendance(payload);
    };

    return (
        <div className="page_wrapper">
            <div className="student_attendance">

                {isAddAdmissionQuery && <PopupScreen title="Add Admission Query" onClick={handleAddAdmissionQuery} >
                    <div className="popup_body" >
                        <div className="body_section" >
                            <InputField type="text" label="Name" placeHolder="Enter name" />
                            <InputField type="text" label="Phone" placeHolder="Enter phone number" />
                            <InputField type="text" label="Email" placeHolder="Enter email address" />
                        </div>
                        <div className="body_section" >
                            <InputField type="text" label="Address" placeHolder="Enter address" />
                        </div>
                        <div className="body_section" >
                            <InputField type="text" label="Discription" placeHolder="Enter discription" />
                        </div>
                        <div className="body_section" >
                            <InputField type="date" label="Date From" placeHolder="Select date" />
                            <InputField type="date" label="Next Follow Up Date" placeHolder="Select date" />
                            <InputField type="text" label="Assigned" placeHolder="Enter assignee name" />
                        </div>

                        <div className="buttons">
                            <SecondaryButton />
                            <PrimaryButton title="Save" />
                        </div>
                    </div>
                </PopupScreen>}

                <TableWrapper title="Student Attendance" >
                    <div className="search_screen" >
                        <p className="search_screen_title" >Select Criteria</p>
                        <div className="popup_body" >
                            <div className="fields_wrapper" >
                                <div className="body_section" >
                                    <CustomSelect value={filterData?.class_id} label="Class" placeholder="Select class" options={classOptions || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, class_id: value }))} />
                                    <CustomSelect value={filterData?.section_id} name="section_id" label="Section" placeholder="Select section" options={sectionOptions || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, section_id: value }))} />
                                    {/* <CustomSelect label="Class" placeholder="Select Class" onChange={(val) => console.log("Selected:", val)} />
                                    <CustomSelect label="Section" placeholder="Select Section" onChange={(val) => console.log("Selected:", val)} /> */}
                                    {/* <InputField type="date" label="Attendance Date" placeHolder="Select Date" /> */}
                                    <InputField name="attendance_date" type="date" label="Attendance Date" value={filterData.attendance_date} placeHolder="Select date" onChange={(value) => setFilterData((prev: any) => ({ ...prev, attendance_date: value }))} />

                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton title="Reset" onClick={handleResetFilterData} />
                                <PrimaryButton title="Search" onClick={handleSearch} />
                            </div>
                        </div>
                    </div>
                </TableWrapper>
                <TableWrapper isSearchBar title="Student Attendance" >
                    <DataTable
                        columns={columns}
                        data={studentAttendance}
                        currentPage={page}
                        totalPages={1}
                        onPageChange={(p) => setPage(p)}
                        attendance={(row) => {
                            const backendStatus = row.status?.toLowerCase() as StatusType;
                            const selectedStatus = selectedStatuses[row.id] ?? backendStatus ?? "present";

                            return (
                                <div className="attendance_buttons">
                                    <AttendanceButton status="present" title="Present"
                                        active={selectedStatus === "present"}
                                        onClick={(status) =>
                                            setSelectedStatuses((prev) => ({
                                                ...prev,
                                                [row.id]: status,
                                            }))
                                        }
                                    />

                                    <AttendanceButton status="late" title="Late"
                                        active={selectedStatus === "late"}
                                        onClick={(status) =>
                                            setSelectedStatuses((prev) => ({
                                                ...prev,
                                                [row.id]: status,
                                            }))
                                        }
                                    />

                                    <AttendanceButton status="absent" title="Absent"
                                        active={selectedStatus === "absent"}
                                        onClick={(status) =>
                                            setSelectedStatuses((prev) => ({
                                                ...prev,
                                                [row.id]: status,
                                            }))
                                        }
                                    />

                                    <AttendanceButton status="half-day" title="Half Day"
                                        active={selectedStatus === "half-day"}
                                        onClick={(status) =>
                                            setSelectedStatuses((prev) => ({
                                                ...prev,
                                                [row.id]: status,
                                            }))
                                        }
                                    />

                                    <AttendanceButton status="leave" title="Leave"
                                        active={selectedStatus === "leave"}
                                        onClick={(status) =>
                                            setSelectedStatuses((prev) => ({
                                                ...prev,
                                                [row.id]: status,
                                            }))
                                        }
                                    />
                                </div>
                            );
                        }}
                        note={(row) => (
                            <InputField
                                value={notes[row.id] ?? row.note ?? ""}
                                type="text"
                                placeHolder="Enter note"
                                onChange={(val) => {
                                    const text = typeof val === "object" && val?.target ? val.target.value : val;
                                    setNotes((prev) => ({ ...prev, [row.id]: text }));
                                }}
                            />
                        )}
                    />
                    <div className="submit_attendance_button" >
                        <PrimaryButton onClick={handleSubmitAttendance} disabled={isPending} title={isPending ? "Submitting..." : "Submit Attendance"} />
                    </div>
                </TableWrapper>
            </div>
        </div>
    )
}

export default StudentAttendance;