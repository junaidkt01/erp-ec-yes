// src/api/endpoints.ts

export const API_URL = (window as any).APP_CONFIG.API_URL;

export const auth = { login: "/login", logout:"/logout", me:"/me" };

export const academicYear = { academic_years: "/academic-years"};

export const assignment = {assignments: "/assignments"};

export const assignmentSubmission = {assignment_submissions: "assignment-submissions"};

export const branch = {branches: "/branches"};

export const bulkPrintLog = {bulk_print_logs: "/bulk-print-logs"};

export const certificateTemplate = {certificate_templates: "/certificate-templates"};

export const classes = {classes: "/classes"};

export const classSubject = {class_subject: "/class-subject"};

export const downloadContent = {download_contents: "/download-contents"};

export const downloadContentType = {download_content_types: "/download-content-types"};

export const examShedule = {exam_shedules: "/exam-shedules"};

export const feeGroup = {fee_groups: "/fee-groups"};

export const feeStructure = {fee_structures: "/fee-structures"};

export const file = {files: "/files"};

export const generatedCertificate = {generated_certificates: "/generated-certificates"};

export const message = {messages: "/messages"};

export const messageThread = {message_threads: "/message-threads"};

export const notification = {notifications: "/notifications"};

export const Payment = {payments: "/payments"};

export const section = {sections: "/sections"};

export const sharedContent = {shared_Contents: "/shared-Contents"};

export const staff = {staffs: "/staffs"};

export const studentAttendance = {student_attendances: "/student-attendances"};

export const student = {students: "/students"};

export const studentDocument = {student_documents: "/student-documents"};

export const studentFee = {student_fees: "/student-fees"};

export const studentParent = {student_parents: "/student-parents"};

export const studyMaterial = {study_materials: "/study-materials"};

export const subject = {subjects: "/subjects"};

export const user = {users: "/users"};

export const video = {videos: "/videos"};
