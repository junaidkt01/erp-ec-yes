import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons"
import { InputField } from "../../../components/InputFields/InputFields"
import TableWrapper from "../../../components/TableWrapper"
import DataTable, { type Column } from "../../../components/DataTable/DataTable"
import { useFetchAllStudents } from "../../../hooks/useStudent"
import { useNavigate } from "react-router-dom"
import LoadingOverlay from "../../../components/Loadingoverlay"
import { CustomSelect } from "../../../components/InputFields/CustomSelect"
import { useFetchAllAcademicYears } from "../../../hooks/useAcademicYear"
import { useFetchAllStudentClasses } from "../../../hooks/useStudentClass"
import { useFetchAllSections } from "../../../hooks/useSections"
import { useDebounce } from "../../../hooks/useDebounce"
import { BASE_URL } from "../../../api/endpoints"
import PopupScreen from "../../../components/PopupScreen/PopupScreen"
import {
    useFetchAllIncidents,
    useAssignStudentIncident,
} from "../../../hooks/useIncidents"

const AssignIncident = () => {
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

    // Queries
    const { data: sampleData, isLoading, isFetching } = useFetchAllStudents(page, {
        academic_year_id: filteredData.academic_year_id,
        class_id: filteredData.class_id,
        section_id: filteredData.section_id,
        search: debouncedSearch || filteredData.name,
    });

    const { data: incidentsData, isLoading: isIncidentsLoading } = useFetchAllIncidents(1, "", 100);
    const assignIncidentMutation = useAssignStudentIncident();

    // Incident select options
    const incidentOptions = useMemo(() => {
        const list: any[] = Array.isArray(incidentsData?.data?.data)
            ? incidentsData.data.data
            : Array.isArray(incidentsData?.data)
            ? incidentsData.data
            : Array.isArray(incidentsData)
            ? incidentsData
            : [];

        return list.map((item: any) => {
            const pointDisplay = item.point
                ? ` (${item.is_negative ? `-${item.point}` : `+${item.point}`} pts)`
                : "";
            return {
                label: `${item.title}${pointDisplay}`,
                value: item.id,
            };
        });
    }, [incidentsData]);

    // Modal state for assigning incident
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [assignForm, setAssignForm] = useState({
        incident_id: "",
        date: new Date(),
        description: "",
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    const handleOpenAssignModal = (studentRow: any) => {
        setSelectedStudent(studentRow);
        setAssignForm({
            incident_id: "",
            date: new Date(),
            description: "",
        });
        setFormErrors({});
        setIsAssignModalOpen(true);
    };

    const handleCloseAssignModal = () => {
        setIsAssignModalOpen(false);
        setSelectedStudent(null);
        setFormErrors({});
    };

    const handleAssignSubmit = async () => {
        const errors: { [key: string]: string } = {};
        if (!assignForm.incident_id) {
            errors.incident_id = "Please select an incident";
        }
        if (!selectedStudent?.full_data?.id) {
            errors.student = "Student information is missing";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        const dateStr =
            assignForm.date instanceof Date
                ? new Date(assignForm.date.getTime() - assignForm.date.getTimezoneOffset() * 60000)
                      .toISOString()
                      .split("T")[0]
                : assignForm.date || new Date().toISOString().split("T")[0];

        try {
            await assignIncidentMutation.mutateAsync({
                incident_id: Number(assignForm.incident_id),
                student_id: Number(selectedStudent.full_data.id),
                date: dateStr,
                description: assignForm.description.trim() || undefined,
            });

            toast.success("Incident assigned to student successfully");
            handleCloseAssignModal();
        } catch (err: any) {
            const errorMsg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to assign incident";
            toast.error(errorMsg);
        }
    };

    const isFiltering = isFetching && (filterData.academic_year_id !== "" || filterData.class_id !== "" || filterData.section_id !== "" || filterData.name !== "" || filterData.roll_no !== "");

    const handleSearch = () => {
        setFilteredData({ ...filterData });
    };

    const handleResetFilterData = () => {
        setFilterData(initialFilter);
        setFilteredData(initialFilter);
    };

    const columns: Column[] = [
        { key: "sl", title: "SL" },
        { key: "photo", title: "Image" },
        { key: "admission_no", title: "Admission No" },
        { key: "name", title: "Name" },
        { key: "father_name", title: "Father Name" },
        { key: "date_of_birth", title: "Date of birth" },
        { key: "class_and_section", title: "Class & Section" },
        { key: "gender", title: "Gender" },
        { key: "type", title: "Type" },
    ];

    const [studentList, setStudentList] = useState<any[]>([])

    useEffect(() => {
        if (!sampleData?.data) return;

        const mappedData = sampleData?.data?.map((student: any, index: number) => ({
            sl: index + 1,
            photo: student.photo ? `${BASE_URL}/public/${student.photo}` : "/student.png",
            admission_no: student.admission_no || "",
            name: (student.full_name || `${student.first_name || ""} ${student.last_name || ""}`).trim(),
            father_name: student.parents?.father_name || "",
            date_of_birth: student.dob || "",
            class_and_section: `${student?.class?.name || ""} ${student?.section?.name || ""}`.trim(),
            gender: student.gender || "",
            type: "-",
            full_data: student,
        }))

        setStudentList(mappedData);
    }, [sampleData]);

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
    const sectionOptions = useMemo(() => {
        if (!filterData?.class_id) return [];
        return (
            sections
                ?.filter((sec: any) => String(sec.class_id) === String(filterData.class_id))
                ?.map((cls: any) => ({
                    label: cls.name,
                    value: cls.id,
                })) || []
        );
    }, [sections, filterData?.class_id]);

    if (isLoading) {
        return <LoadingOverlay isLoading={true} />
    }

    return (
        <div className="page_wrapper" >
            <div className="student_list" >

                {isAssignModalOpen && (
                    <PopupScreen title={"Assign Incident"} onClick={handleCloseAssignModal} >
                        <div className="popup_body" >
                            <div className="body_section" >
                                <CustomSelect
                                    value={assignForm.incident_id}
                                    onChange={(value: any) => {
                                        setAssignForm((prev) => ({ ...prev, incident_id: value }));
                                        if (formErrors.incident_id) {
                                            setFormErrors((prev) => ({ ...prev, incident_id: "" }));
                                        }
                                    }}
                                    label="Select Incident Type"
                                    options={incidentOptions}
                                    placeholder={isIncidentsLoading ? "Loading incidents..." : "Select incident type"}
                                    error={formErrors.incident_id}
                                />
                                <InputField
                                    value={selectedStudent?.name || ""}
                                    type="text"
                                    label="Student"
                                    readOnly={true}
                                    placeHolder="Selected student"
                                />
                            </div>

                            <div className="body_section">
                                <InputField
                                    value={assignForm.date}
                                    onChange={(date: any) => setAssignForm((prev) => ({ ...prev, date }))}
                                    type="date"
                                    label="Date"
                                    placeHolder="Select date"
                                />
                                <InputField
                                    value={assignForm.description}
                                    onChange={(e: any) => setAssignForm((prev) => ({ ...prev, description: e.target.value }))}
                                    type="text"
                                    label="Description"
                                    placeHolder="Enter remark note (optional)"
                                />
                            </div>

                            <div className="buttons" >
                                <SecondaryButton
                                    onClick={handleCloseAssignModal}
                                    title="Cancel"
                                    disable={assignIncidentMutation.isPending}
                                />
                                <PrimaryButton
                                    onClick={handleAssignSubmit}
                                    title="Assign"
                                    isLoading={assignIncidentMutation.isPending}
                                    disabled={assignIncidentMutation.isPending}
                                />
                            </div>
                        </div>
                    </PopupScreen>
                )}

                <TableWrapper title={"Manage Students"} onClick={() => navigate("/student-info/add-student")} >
                    <div className="search_screen">
                        <p className="search_screen_title" >Select Criteria</p>
                        <div className="popup_body" >
                            <div className="fields_wrapper" >
                                <div className="body_section" >
                                    <CustomSelect value={filterData?.academic_year_id} name="academic_year_id" label="Academic year" placeholder="Select year" options={formattedData || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, academic_year_id: value }))} />
                                    <CustomSelect value={filterData?.class_id} label="Class" placeholder="Select class" options={classOptions || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, class_id: value, section_id: "" }))} />
                                    <CustomSelect value={filterData?.section_id} name="section_id" label="Section" placeholder={filterData?.class_id ? "Select section" : "Select a class first"} options={sectionOptions || []} onChange={(value) => setFilterData((prev: any) => ({ ...prev, section_id: value }))} />
                                </div>
                                <div className="body_section" >
                                    <InputField name="name" value={filterData?.name} onChange={(e) => setFilterData((prev: any) => ({ ...prev, name: e.target.value }))} type="text" label="Search by Name" placeHolder="Enter name" />
                                    <InputField name="roll_no" value={filterData?.roll_no} onChange={(e) => setFilterData((prev: any) => ({ ...prev, roll_no: e.target.value }))} type="text" label="Search by Roll" placeHolder="Enter roll no" />
                                </div>
                            </div>

                            <div className="buttons">
                                <SecondaryButton title="Reset" onClick={handleResetFilterData} />
                                <PrimaryButton isLoading={isFiltering} title="Search" onClick={handleSearch} />
                            </div>
                        </div>
                    </div>
                </TableWrapper>

                <TableWrapper isSearchBar searchValue={searchTerm} searchOnchange={setSearchTerm} title="Student List" >
                    <DataTable
                        columns={columns}
                        data={studentList}
                        currentPage={sampleData?.meta?.current_page || 0}
                        totalPages={Math.ceil(Number(sampleData?.meta?.total) / Number(sampleData?.meta?.per_page)) || 0}
                        onPageChange={(p) => setPage(p)}
                        actions={(row) => (
                            <div>
                                <PrimaryButton
                                    title="Assign Incident"
                                    onClick={() => handleOpenAssignModal(row)}
                                />
                            </div>
                        )}
                    />
                </TableWrapper>
            </div>
        </div>
    )
}

export default AssignIncident;