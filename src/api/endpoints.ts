// src/api/endpoints.ts


export const API_URL = "https://dev.cyberduce.com/api";

export const auth = { login: "/login", logout: "/logout", me: "/me" };

export const academicYear = { academic_years: "/academic-years" };

export const assignment = { assignments: "/assignments" };

export const assignmentSubmission = {
  assignment_submissions: "assignment-submissions",
};

export const branch = { branches: "/branches" };

export const bulkPrintLog = { bulk_print_logs: "/bulk-print-logs" };

export const certificateTemplate = {
  certificate_templates: "/certificate-templates",
};

export const classes = { classes: "/classes" };

export const classRoom = {class_rooms: "/class-rooms"};

export const classSubject = { class_subject: "/class-subject" };

export const classTeacher = { class_teachers: "/class-teachers"};

export const teacher = {teachers: "/teachers"};

export const downloadContent = { download_contents: "/download-contents" };

export const downloadContentType = {
  download_content_types: "/download-content-types",
};

export const examShedule = { exam_shedules: "/exam-shedules" };

export const exam = {exams: "/exams"};

export const examResult = { exam_results: "/exam-results"}

export const feeGroup = { fee_groups: "/fee-groups" };

export const feeType = {fee_types: "/fee-types"};

export const feeStructure = { fee_structures: "/fee-structures" };

export const file = { files: "/files" };

export const generatedCertificate = {
  generated_certificates: "/generated-certificates",
};

export const message = { messages: "/messages" };

export const messageThread = { message_threads: "/message-threads" };

export const notification = { notifications: "/notifications" };

export const Payment = { payments: "/payments" };

export const section = { sections: "/sections" };

export const sharedContent = { shared_Contents: "/shared-Contents" };

export const staff = { staffs: "/staff" };

export const staffAttendance = {
  staff_attendances: "/staff-attendance",
};

export const staffDepartment = {
  staff_departments: "/staff-departments",
};

export const studentAttendance = {
  student_attendances: "/student-attendances",
};

export const student = { students: "/students", student: "/student", bulk: "/bulk" };

export const studentDocument = { student_documents: "/student-documents" };

export const studentFee = { student_fees: "/student-fees" };

export const studentParent = { student_parents: "/student-parents" };

export const studyMaterial = { study_materials: "/study-materials" };

export const studentCategory = {student_Categories: "/student-categories"};

export const studentMultiClass = {student_multi_classes: "/student-multi-classes"};

export const subject = { subjects: "/subjects" };

export const user = { users: "/users" };

export const video = { videos: "/videos" };

export const twoFactor = {
  confirm: "/2fa/confirm",
  verify: "/2fa/verify"
};

export const frontOffice = {
  complaints: "/front-office/complaints",
  phone_call_logs: "/front-office/phone-call-logs",
  postal_receives: "/front-office/postal-receives",
};

export const admissionQueries = { admission_queries: "/admission-queries" };

export const timeTable = {time_able: "/timeTables"};