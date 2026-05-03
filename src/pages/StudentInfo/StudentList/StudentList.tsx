import { useEffect, useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import { useFetchAllStudents } from "../../../hooks/useStudent"
import { useNavigate } from "react-router-dom"
import LoadingOverlay from "../../../components/Loadingoverlay"

const StudentList = () => {
    const navigate = useNavigate()
    const [page, setPage] = useState(1);

    const { data: sampleData, isLoading } = useFetchAllStudents(page);
    console.log("students: 02", sampleData, page);

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "admission_no", title: "Admission No" },
        { key: "name", title: "Name" },
        { key: "father_name", title: "Father Name" },
        { key: "date_of_birth", title: "Date of birth" },
        { key: "class_and_section", title: "Class & Section" },
        { key: "gender", title: "Gender" },
        { key: "type", title: "Type" },
    ];

    const [studentList, setStudentList] = useState<any>([])

    useEffect(() => {
        if (!sampleData?.data) return;

        const mappedDat = sampleData?.data?.map((student: any) => student)
        console.log("mappedDat: ", mappedDat)
        const mappedData = sampleData?.data?.map((student: any, index: number) => ({
            sl: index + 1,
            admission_no: student.admission_no || "",
            name: `${student.first_name || ""} ${student.last_name || ""}`.trim(),
            father_name: student.parents?.father_name || "",
            date_of_birth: student.dob || "",
            class_and_section: `${student?.class?.name || ""} ${student?.section?.name || ""}`.trim(),
            gender: student.gender || "",
            type: "-",

            full_data: student,
        }))

        setStudentList(mappedData);
    }, [sampleData]);

    const [isAddAdmissionQuery, setIsAddAdmissionQuery] = useState(false)
    const handleAddAdmissionQuery = () => {
        setIsAddAdmissionQuery(!isAddAdmissionQuery)
    }

    if (isLoading) {
        return <LoadingOverlay isLoading={true} />
    }


    return (
        <div className="page_wrapper" >
            <div className="student_list" >
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

                {/* <TableWrapper isAddButton title={"Manage Students"} onClick={handleAddAdmissionQuery} >
                    <div className="search_screen">
                        <p className="search_screen_title" >Select Criteria</p>
                        <div className="popup_body" >
                            <div className="fields_wrapper" >
                                <div className="body_section" >
                                    <InputField type="date" label="Date From" placeHolder="Select date" />
                                    <InputField type="date" label="Date From" placeHolder="Select date" />
                                    <InputField type="date" label="Date To" placeHolder="Select date" />
                                </div>
                                <div className="body_section" >
                                    <CustomSelect label="Choose Enquiry Source" placeholder="Select source" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                    <CustomSelect label="Choose Status" placeholder="Select status" options={["Pending", "Solved", "In Progress", "Closed"]} onChange={(val) => console.log("Selected:", val)} />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton />
                                <PrimaryButton onClick={handleSubmit} title="sample" />
                                <PrimaryButton title="Search" />
                            </div>
                        </div>
                    </div>
                </TableWrapper> */}

                <TableWrapper isAddButton onClick={() => navigate("/student-info/add-student")} isSearchBar title="Student List" >
                    <DataTable
                        columns={columns}
                        data={studentList}
                        currentPage={sampleData?.meta?.current_page || 0}
                        totalPages={sampleData?.meta?.total || 0}
                        onPageChange={(p) => setPage(p)}
                        actions={(row) => (
                            <div className="actions">
                                <button><img src="/svgs/eye_open.svg" alt="" /></button>
                                <button onClick={() => navigate(`/student-info/add-student/${row?.full_data?.id}`)} ><img src="/svgs/edit.svg" alt="" /></button>
                                <button><img src="/svgs/delete.svg" alt="" /></button>
                                <button><img src="/svgs/block.svg" alt="" /></button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default StudentList;