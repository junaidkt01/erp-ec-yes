import { useEffect, useState } from "react"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import { useBlockStudent, useFetchAllStudents, useRemoveStudent } from "../../../hooks/useStudent"
import { useNavigate } from "react-router-dom"
import LoadingOverlay from "../../../components/Loadingoverlay"
import { toast } from "sonner"
import { CustomSelect } from "../../../components/InputFields/CustomSelect"
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear"
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass"
import { useFetchAllSections } from "../../../hooks/useSections"
import { useDebounce } from "../../../hooks/useDebounce"

const StudentList = () => {
    const navigate = useNavigate()
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const initialFilter = {
        academic_year_id: "",
        class_id: "",
        section_id: "",
        name: "",
        roll_no: "",
    };

    const [filterData, setFilterData] = useState(initialFilter);
    const [filteredData, setFilteredData] = useState(initialFilter);

    const { data: sampleData, isLoading } = useFetchAllStudents(page, {
        academic_year_id: filteredData.academic_year_id,
        class_id: filteredData.class_id,
        section_id: filteredData.section_id,
        search: debouncedSearch || filteredData.name,
    });
    // const { data: sampleData, isLoading } = useFetchAllStudents(
    //     page,
    //     filteredData.academic_year_id,
    //     filteredData.class_id,
    //     filteredData.section_id,
    //     searchTerm || filteredData.name,
    // );

    const handleSearch = () => {
        setFilteredData({ ...filterData });
    };

    const handleResetFilterData = () => {
        setFilterData(initialFilter);
        setFilteredData(initialFilter);
    };

    // const [filterData, setFilterData] = useState({
    //     academic_year_id: "",
    //     class_id: "",
    //     section_id: "",
    //     name: "",
    //     roll_no: "",
    // })

    // const [filteredData, setFilteredData] = useState({
    //     academic_year_id: "",
    //     class_id: "",
    //     section_id: "",
    //     name: "",
    //     roll_no: ""
    // })

    // const { data: sampleData, isLoading } = useFetchAllStudents(page, filteredData.academic_year_id, filteredData.class_id, filteredData.section_id, filteredData.name);
    // console.log("students: 02", sampleData, page);

    // const handleSearch = async () => {
    //     const { academic_year_id, class_id, section_id, name, roll_no } = filterData;
    //     setFilteredData({ academic_year_id: academic_year_id, class_id: class_id, section_id: section_id, name: name, roll_no: roll_no })
    // }

    // const handleResetFilterData = async () => {
    //     setFilterData({
    //         academic_year_id: "",
    //         class_id: "",
    //         section_id: "",
    //         name: "",
    //         roll_no: "",
    //     })
    //     setFilteredData({
    //         academic_year_id: "",
    //         class_id: "",
    //         section_id: "",
    //         name: "",
    //         roll_no: "",
    //     })
    // }

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


    // Delete Student
    const [deleteStudent, setDeleteStudent] = useState({ id: "", name: "" });
    const handleDeleteStudent = (studentId: string, studentName: string) => {
        setDeleteStudent({ id: studentId, name: studentName });
    }
    const { mutate: removeStudent, isPending } = useRemoveStudent();
    const handleConfirmDeleteStudent = (studentId: string) => {
        removeStudent(studentId, {
            onSuccess: () => {
                setDeleteStudent({ id: "", name: "" });
                toast('Student deleted successfully')
            },
            onError: (error: any) => {
                toast(error?.response?.data?.message || "Failed to delete student");
            },
        });
    };
    const handleCancelDeleteStudent = () => {
        setDeleteStudent({ id: "", name: "" });
    }


    // Block Student
    const [blockStudent, setBlockStudent] = useState({ id: "", name: "", reason: "" });
    const handleBlockStudent = (studentId: string, studentName: string, reason: string) => {
        setBlockStudent({ id: studentId, name: studentName, reason: reason });
    }

    const { mutate: updateStudent, isPending: isBlockPending } = useBlockStudent();

    const [blockingReason, setBlockingReason] = useState("");
    console.log("blockingReason",blockingReason)
    const handleConfirmBlockStudent = (studentId: string) => {
        updateStudent(
            {
                studentId: studentId,
                data: {
                    disable_reason: blockingReason || null,
                    is_disabled: 1,
                },
            },
            {
                onSuccess: (data) => {
                    console.log("BLOCKED", data);
                    toast('Student blocked successfully');
                    setBlockStudent({ id: "", name: "", reason: "" });
                    setBlockingReason("");
                },
                onError: (error: any) => {
                    toast(error?.response?.data?.message || "Failed to block student");
                    console.log("BLOCKED error", error);
                }
            }
        );
    };

    const handleCancelBlockStudent = () => {
        setBlockStudent({ id: "", name: "", reason: "" });
    }


    ///////////////////////////

    const { data: academicYears } = useFetchAllAcademicYears();
    const formattedData = academicYears?.map((item) => ({
        label: `${item.name} (${new Date(item.start_date).toLocaleString("default", { month: "short" })} - ${new Date(item.end_date).toLocaleString("default", { month: "short" })})`,
        value: item.id,
    }));

    const { data: studentClasses } = useFetchAllStudentClasses();
    const classOptions = studentClasses?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    const { data: sections } = useFetchAllSections();
    const sectionOptions = sections?.map((cls: any) => ({
        label: cls.name,
        value: cls.id,
    }));

    ///////////////////////////

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

                {blockStudent.id && <PopupScreen title={`Block ${blockStudent.name}`} onClick={handleCancelBlockStudent} >
                    <div className="popup_body" >
                        <div className="body_section" >
                            {/* <p>Type reasone to block this student</p> */}
                            {/* <InputField type="text" label="Admission Number" placeHolder="Enter admission number" name="admission_no" value={formData?.admission_no} onChange={handleChange} /> */}

                            <InputField value={blockingReason || blockStudent.reason} onChange={(e) => setBlockingReason(e.target.value)} type="text" label="Type reasone to block this student" placeHolder="Enter reasone" />
                        </div>

                        <div className="buttons">
                            <SecondaryButton onClick={handleCancelBlockStudent} title="Cancel" />
                            <PrimaryButton onClick={() => handleConfirmBlockStudent(blockStudent.id)} disabled={isBlockPending} title={isBlockPending ? "Blocking..." : "Block"} />
                        </div>
                    </div>
                </PopupScreen>}

                {deleteStudent.id && <PopupScreen title={`Delete ${deleteStudent.name}`} onClick={handleCancelDeleteStudent} >
                    <div className="popup_body" >
                        <div className="body_section" >
                            <p>Are you sure you want to delete this student?</p>
                        </div>

                        <div className="buttons">
                            <SecondaryButton onClick={handleCancelDeleteStudent} title="Cancel" />
                            <PrimaryButton onClick={() => handleConfirmDeleteStudent(deleteStudent.id)} disabled={isPending} title={isPending ? "Deleting..." : "Delete"} />
                        </div>

                    </div>
                </PopupScreen>}

                <TableWrapper isAddButton title={"Manage Students"} onClick={() => navigate("/student-info/add-student")} >
                    <div className="search_screen">
                        <p className="search_screen_title" >Select Criteria</p>
                        <div className="popup_body" >
                            <div className="fields_wrapper" >
                                <div className="body_section" >
                                    <CustomSelect value={filterData?.academic_year_id} name="academic_year_id" label="Academic year" placeholder="Select year" options={formattedData || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, academic_year_id: value }))} />
                                    <CustomSelect value={filterData?.class_id} label="Class" placeholder="Select class" options={classOptions || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, class_id: value }))} />
                                    <CustomSelect value={filterData?.section_id} name="section_id" label="Section" placeholder="Select section" options={sectionOptions || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, section_id: value }))} />
                                </div>
                                <div className="body_section" >
                                    <InputField name="name" value={filterData?.name} onChange={(e) => setFilterData((prev: any) => ({ ...prev, name: e.target.value }))} type="text" label="Search by Name" placeHolder="Enter name" />
                                    <InputField name="roll_no" value={filterData?.roll_no} onChange={(e) => setFilterData((prev: any) => ({ ...prev, roll_no: e.target.value }))} type="text" label="Search by Roll" placeHolder="Enter roll no" />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton title="Reset" onClick={handleResetFilterData} />
                                <PrimaryButton title="Search" onClick={handleSearch} />
                            </div>
                        </div>
                    </div>
                </TableWrapper>

                {/* <TableWrapper isAddButton onClick={() => navigate("/student-info/add-student")} isSearchBar searchValue={searchTerm} searchOnchange={setSearchTerm} title="Student List" > */}
                <TableWrapper isSearchBar searchValue={searchTerm} searchOnchange={setSearchTerm} title="Student List" >
                    <DataTable
                        columns={columns}
                        data={studentList}
                        currentPage={sampleData?.meta?.current_page || 0}
                        totalPages={sampleData?.meta?.total || 0}
                        onPageChange={(p) => setPage(p)}
                        actions={(row) => (
                            <div className="actions">
                                <button onClick={() => navigate(`/student-info/profile/${row?.full_data?.id}`)} ><img src="/svgs/eye_open.svg" alt="" /></button>
                                <button onClick={() => navigate(`/student-info/add-student/${row?.full_data?.id}`)} ><img src="/svgs/edit.svg" alt="" /></button>
                                <button onClick={() => handleDeleteStudent(row?.full_data?.id, `${row.full_data?.first_name} ${row.full_data?.last_name}`)} ><img src="/svgs/delete.svg" alt="" /></button>
                                <button onClick={() => handleBlockStudent(row?.full_data?.id, `${row.full_data?.first_name} ${row.full_data?.last_name}`, row?.full_data?.disable_reason)} >{row.full_data?.is_disabled ? <img src="/svgs/enable.svg" alt="" /> : <img src="/svgs/block.svg" alt="" />}</button>
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default StudentList;