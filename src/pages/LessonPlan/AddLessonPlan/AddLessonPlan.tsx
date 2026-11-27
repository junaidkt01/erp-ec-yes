import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TableWrapper from "../../../components/TableWrapper";
import { InputField } from "../../../components/InputFields/InputFields";
import { CustomSelect } from "../../../components/InputFields/CustomSelect";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons/Buttons";
import {
    useCreateLessonPlan,
    useUpdateLessonPlan,
    useFetchLessonPlanById,
    type LessonPlanSchedule,
} from "../../../hooks/useLessonPlan";
import { toast } from "sonner";
import "./AddLessonPlan.scss";

const initialSchedule: LessonPlanSchedule = {
    monday: { class_assignment: "", home_assignment: "" },
    tuesday: { class_assignment: "", home_assignment: "" },
    wednesday: { class_assignment: "", home_assignment: "" },
    thursday: { class_assignment: "", home_assignment: "" },
    friday: { class_assignment: "", home_assignment: "" },
    saturday: { class_assignment: "", home_assignment: "" },
};

const AddLessonPlan = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEditing = Boolean(id);

    // Basic & Curriculum Info
    const [subject, setSubject] = useState("Science");
    const [lessonTitle, setLessonTitle] = useState("");
    const [planDate, setPlanDate] = useState("2026-11-27");
    const [className, setClassName] = useState("Class 8");
    const [sectionName, setSectionName] = useState("Section A");
    const [chapterNumber, setChapterNumber] = useState("");
    const [pageNumbers, setPageNumbers] = useState("");
    const [noOfPeriods, setNoOfPeriods] = useState<number | string>(6);

    // Pedagogy Fields
    const [objectives, setObjectives] = useState("");
    const [introductoryActivities, setIntroductoryActivities] = useState("");
    const [teachingAids, setTeachingAids] = useState("");

    // Weekly Schedule (Monday - Saturday)
    const [schedule, setSchedule] = useState<LessonPlanSchedule>(initialSchedule);

    const { data: existingPlan } = useFetchLessonPlanById(id);
    const createPlanMutation = useCreateLessonPlan();
    const updatePlanMutation = useUpdateLessonPlan();

    useEffect(() => {
        if (existingPlan) {
            setSubject(existingPlan.subject || "Science");
            setLessonTitle(existingPlan.lesson_title || "");
            setPlanDate(existingPlan.plan_date || "2026-11-27");
            setClassName(existingPlan.class_name || "Class 8");
            setSectionName(existingPlan.section_name || "Section A");
            setChapterNumber(existingPlan.chapter_number || "");
            setPageNumbers(existingPlan.page_numbers || "");
            setNoOfPeriods(existingPlan.no_of_periods || 6);
            setObjectives(existingPlan.objectives || "");
            setIntroductoryActivities(existingPlan.introductory_activities || "");
            setTeachingAids(existingPlan.teaching_aids || "");
            if (existingPlan.schedule) {
                setSchedule(existingPlan.schedule);
            }
        }
    }, [existingPlan]);

    const handleScheduleChange = (
        day: keyof LessonPlanSchedule,
        field: "class_assignment" | "home_assignment",
        value: string
    ) => {
        setSchedule((prev) => ({
            ...prev,
            [day]: {
                ...prev[day],
                [field]: value,
            },
        }));
    };

    const handleSave = async (submitStatus: "Draft" | "Submitted") => {
        if (!lessonTitle.trim()) {
            toast.error("Please enter the title of the lesson");
            return;
        }

        const payload = {
            subject,
            lesson_title: lessonTitle.trim(),
            plan_date: planDate,
            class_name: className,
            section_name: sectionName,
            chapter_number: chapterNumber.trim() || "Chapter 1",
            page_numbers: pageNumbers.trim() || "--",
            no_of_periods: noOfPeriods || 1,
            objectives: objectives.trim(),
            introductory_activities: introductoryActivities.trim(),
            teaching_aids: teachingAids.trim(),
            schedule,
            status: submitStatus,
            teacher_name: "Sarah Jenkins",
        };

        try {
            if (isEditing && id) {
                await updatePlanMutation.mutateAsync({
                    id,
                    ...payload,
                });
                toast.success(
                    submitStatus === "Submitted"
                        ? "Lesson plan updated and submitted for approval!"
                        : "Lesson plan draft updated successfully"
                );
            } else {
                await createPlanMutation.mutateAsync(payload);
                toast.success(
                    submitStatus === "Submitted"
                        ? "Lesson plan created and submitted for approval!"
                        : "Lesson plan saved as draft"
                );
            }
            navigate("/lesson-plan/lesson-plan-list");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to save lesson plan");
        }
    };

    const isPending = createPlanMutation.isPending || updatePlanMutation.isPending;

    return (
        <div className="page_wrapper">
            <div className="add_lesson_plan_page">
                {/* Header card with back navigation */}
                <TableWrapper title={isEditing ? "Edit Lesson Plan" : "Create Lesson Plan"}>
                    <div className="popup_body lesson_plan_form_body">
                        {/* 1. Header Information */}
                        <div className="form_section_block">
                            <h3 className="section_header_label">1. General & Curriculum Info</h3>
                            <div className="fields_wrapper">
                                <div className="body_section">
                                    <CustomSelect
                                        label="Subject"
                                        value={subject}
                                        options={[
                                            { label: "Science", value: "Science" },
                                            { label: "Mathematics", value: "Mathematics" },
                                            { label: "English", value: "English" },
                                            { label: "Social Science", value: "Social Science" },
                                            { label: "Hindi", value: "Hindi" },
                                        ]}
                                        onChange={(val: any) => setSubject(val)}
                                    />
                                    <InputField
                                        type="text"
                                        label="Title of Lesson"
                                        placeHolder="e.g. Photosynthesis & Plant Nutrition"
                                        value={lessonTitle}
                                        onChange={(e: any) => setLessonTitle(e.target.value)}
                                    />
                                    <InputField
                                        type="date"
                                        label="Date"
                                        placeHolder="Select date"
                                        value={planDate}
                                        onChange={(e: any) => setPlanDate(e.target.value)}
                                    />
                                </div>

                                <div className="body_section">
                                    <CustomSelect
                                        label="Class"
                                        value={className}
                                        options={[
                                            { label: "Class 6", value: "Class 6" },
                                            { label: "Class 7", value: "Class 7" },
                                            { label: "Class 8", value: "Class 8" },
                                            { label: "Class 9", value: "Class 9" },
                                            { label: "Class 10", value: "Class 10" },
                                        ]}
                                        onChange={(val: any) => setClassName(val)}
                                    />
                                    <CustomSelect
                                        label="Section"
                                        value={sectionName}
                                        options={[
                                            { label: "Section A", value: "Section A" },
                                            { label: "Section B", value: "Section B" },
                                            { label: "Section C", value: "Section C" },
                                        ]}
                                        onChange={(val: any) => setSectionName(val)}
                                    />
                                    <InputField
                                        type="text"
                                        label="Chapter Number"
                                        placeHolder="e.g. Chapter 4"
                                        value={chapterNumber}
                                        onChange={(e: any) => setChapterNumber(e.target.value)}
                                    />
                                </div>

                                <div className="body_section">
                                    <InputField
                                        type="text"
                                        label="Page Numbers"
                                        placeHolder="e.g. 42 - 58"
                                        value={pageNumbers}
                                        onChange={(e: any) => setPageNumbers(e.target.value)}
                                    />
                                    <InputField
                                        type="number"
                                        label="No. of periods"
                                        placeHolder="e.g. 6"
                                        value={noOfPeriods}
                                        onChange={(e: any) => setNoOfPeriods(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Instructional Content */}
                        <div className="form_section_block">
                            <h3 className="section_header_label">2. Pedagogical Content</h3>
                            <div className="pedagogy_grid">
                                <div className="input_group">
                                    <label className="input_label">Objectives</label>
                                    <textarea
                                        rows={4}
                                        className="custom_textarea"
                                        placeholder="List the key concepts and student learning outcomes..."
                                        value={objectives}
                                        onChange={(e) => setObjectives(e.target.value)}
                                    />
                                </div>

                                <div className="input_group">
                                    <label className="input_label">Introductory Activities</label>
                                    <textarea
                                        rows={4}
                                        className="custom_textarea"
                                        placeholder="Warm-up hook, recall questions, prior knowledge activation..."
                                        value={introductoryActivities}
                                        onChange={(e) => setIntroductoryActivities(e.target.value)}
                                    />
                                </div>

                                <div className="input_group">
                                    <label className="input_label">Teaching aids & Activities</label>
                                    <textarea
                                        rows={4}
                                        className="custom_textarea"
                                        placeholder="Teaching aids, digital board visuals, lab equipment, student group activities..."
                                        value={teachingAids}
                                        onChange={(e) => setTeachingAids(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Daily Execution Schedule (Monday to Saturday) */}
                        <div className="form_section_block">
                            <h3 className="section_header_label">
                                3. Weekly Execution Schedule (Monday - Saturday)
                            </h3>
                            <p className="section_desc">
                                Fill in the daily class activities and homework assignments corresponding to the template.
                            </p>

                            <div className="weekly_schedule_table_wrapper">
                                <table className="schedule_grid_table">
                                    <thead>
                                        <tr>
                                            <th className="row_type_col">Assignment Type</th>
                                            <th>Monday</th>
                                            <th>Tuesday</th>
                                            <th>Wednesday</th>
                                            <th>Thursday</th>
                                            <th>Friday</th>
                                            <th>Saturday</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="row_title">Class Assignment</td>
                                            {(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const).map(
                                                (day) => (
                                                    <td key={`class-${day}`}>
                                                        <textarea
                                                            rows={3}
                                                            className="schedule_cell_textarea"
                                                            placeholder={`In-class work for ${day}`}
                                                            value={schedule[day].class_assignment}
                                                            onChange={(e) =>
                                                                handleScheduleChange(day, "class_assignment", e.target.value)
                                                            }
                                                        />
                                                    </td>
                                                )
                                            )}
                                        </tr>
                                        <tr>
                                            <td className="row_title">Home Assignment</td>
                                            {(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const).map(
                                                (day) => (
                                                    <td key={`home-${day}`}>
                                                        <textarea
                                                            rows={3}
                                                            className="schedule_cell_textarea"
                                                            placeholder={`Homework for ${day}`}
                                                            value={schedule[day].home_assignment}
                                                            onChange={(e) =>
                                                                handleScheduleChange(day, "home_assignment", e.target.value)
                                                            }
                                                        />
                                                    </td>
                                                )
                                            )}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="form_action_bar">
                            <SecondaryButton title="Cancel" onClick={() => navigate("/lesson-plan/lesson-plan-list")} />
                            <div className="right_buttons">
                                <SecondaryButton
                                    title="Save as Draft"
                                    disable={isPending}
                                    onClick={() => handleSave("Draft")}
                                />
                                <PrimaryButton
                                    title={isPending ? "Submitting..." : "Submit for Approval"}
                                    disabled={isPending}
                                    isLoading={isPending}
                                    onClick={() => handleSave("Submitted")}
                                />
                            </div>
                        </div>
                    </div>
                </TableWrapper>
            </div>
        </div>
    );
};

export default AddLessonPlan;
