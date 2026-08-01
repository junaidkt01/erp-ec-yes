import { Route, Routes } from 'react-router-dom'
import './App.scss'
import './components/components.scss'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard/Dashboard'

{/* Admin Section Routes */ }
import Complaint from './pages/AdminSection/Complaint/Complaint'
import AdmissionQuery from './pages/AdminSection/AdmissionQuery/AdmissionQuery'
import PostalReceive from './pages/AdminSection/PostalReceive/PostalReceive'
import PostalDispatch from './pages/AdminSection/PostalDispatch/PostalDispatch'
import PhoneCallLog from './pages/AdminSection/PhoneCallLog/PhoneCallLog'
import IDCard from './pages/AdminSection/IDCard/IDCard'
import Certificate from './pages/AdminSection/Certificate/Certificate'
import GenerateCertificate from './pages/AdminSection/GenerateCertificate/GenerateCertificate'
import GenerateIDCard from './pages/AdminSection/GenerateIDCard/GenerateIDCard'

{/* Academics Routes */ }
import OptionalSubject from './pages/Academics/OptionalSubject/OptionalSubject'
import Section from './pages/Academics/Section/Section'
import Class from './pages/Academics/Class/Class'
import Subjects from './pages/Academics/Subjects/Subjects'
import AssignClassTeacher from './pages/Academics/AssignClassTeacher/AssignClassTeacher'
import ClassRoom from './pages/Academics/ClassRoom/ClassRoom'

{/* Study Material Routes */ }
import UploadContent from './pages/StudyMaterial/UploadContent/UploadContent'
import Assignment from './pages/StudyMaterial/Assignment/Assignment'
import Syllabus from './pages/StudyMaterial/Syllabus/Syllabus'
import OtherDownloads from './pages/StudyMaterial/OtherDownloads/OtherDownloads'
import ContentType from './pages/DownloadCenter/ContentType/ContentType'
import ContentList from './pages/DownloadCenter/ContentList/ContentList'
import SharedContentList from './pages/DownloadCenter/SharedContentList/SharedContentList'
import VideoList from './pages/DownloadCenter/VideoList/VideoList'
import StudentCategory from './pages/StudentInfo/StudentCategory/StudentCategory'
import StudentList from './pages/StudentInfo/StudentList/StudentList'
import MultiClassStudent from './pages/StudentInfo/MultiClassStudent/MultiClassStudent'
import DeleteStudentRecord from './pages/StudentInfo/DeleteStudentRecord/DeleteStudentRecord'
import UnassignedStudent from './pages/StudentInfo/UnassignedStudent/UnassignedStudent'
import StudentGroup from './pages/StudentInfo/StudentGroup/StudentGroup'
import StudentPromote from './pages/StudentInfo/StudentPromote/StudentPromote'
import DisabledStudents from './pages/StudentInfo/DisabledStudents/DisabledStudents'
import StudentAttendance from './pages/StudentInfo/StudentAttendance/StudentAttendance'
import Incidents from './pages/BehaviourRecords/Incidents/Incidents'
import AssignIncident from './pages/BehaviourRecords/AssignIncident/AssignIncident'
// import ProtectedRoute from './api/ProtectedRoute'
import Login from './pages/Auth/Login'
import { ProtectedRoute } from './api/ProtectedRoute'
import AddStudent from './pages/StudentInfo/AddStudent/AddStudent'
import { Toaster } from 'sonner'
import AddStaff from './pages/HR/AddStaff/AddStaff'
import StaffList from './pages/HR/StaffList/StaffList'
import FeesGroup from './pages/Fees/FeesGroup/FeesGroup'
import LoadingOverlay, { ErrorStatusOverlay } from './components/Loadingoverlay'
import { useOverlayStore } from './stores/loadingOverlay'
import StudentProfilePage from './pages/StudentInfo/StudentList/StudentProfilePage'
import StaffProfilePage from './pages/HR/StaffList/StaffProfilePage'
// import GeneralSettings from './pages/SettingsSection/GeneralSettings/GeneralSettings'
import UpdateGeneralSettings from './pages/SettingsSection/GeneralSettings/UpdateGeneralSettings'
import { useFetchGeneralSettings } from './hooks/useGeneralSettings'
import useSiteSettings from './hooks/useSiteSettings'
import GeneralSettings from './pages/SettingsSection/GeneralSettings/GeneralSettings'

function App() {
  const { open, statusCode, message, hide } = useOverlayStore();
  console.log("test: ", open, statusCode, message, hide);

  const { data, isLoading, error } = useFetchGeneralSettings();
  useSiteSettings(data?.data);

  if (isLoading) {
    return <LoadingOverlay />
  }

  if (error) {
    return <ErrorStatusOverlay isError={true} status={404} message={"error"} />
  }

  return (
    <div className='app'>
      {open && (
        <ErrorStatusOverlay
          isError={true}
          status={404}
          message={"data.message"}
        />
      )}

      {/* {data?.open && (
        <ErrorStatusOverlay
          isError={data.open}
          status={data.status}
          message={data.message}
        />
      )} */}

      <Toaster />
      <Routes><Route path="/" element={<Login />} /></Routes>
      <div style={{ display: "flex", position: "sticky", top: "0" }} >
        {/* <ProtectedRoute> */}
        <div><Sidebar /></div>
        {/* </ProtectedRoute> */}
        <div style={{ width: "100%" }} >
          {/* <ProtectedRoute> */}
          <Header />
          {/* </ProtectedRoute> */}
          <div style={{ height: "calc(100% - 64.5px)", overflowY: "auto" }} >
            <Routes>
              <Route path='/dashboard' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

              {/* 1. Admin Section Routes */}
              <Route path='/admin-section/complaint' element={<ProtectedRoute><Complaint /></ProtectedRoute>} />
              <Route path='/admin-section/admission-query' element={<AdmissionQuery />} />
              <Route path='/admin-section/postal-receive' element={<PostalReceive />} />
              <Route path='/admin-section/postal-dispatch' element={<PostalDispatch />} />
              <Route path='/admin-section/phone-call-log' element={<PhoneCallLog />} />
              <Route path='/admin-section/id-card' element={<IDCard />} />
              <Route path='/admin-section/certificate' element={<Certificate />} />
              <Route path='/admin-section/generate-certificate' element={<GenerateCertificate />} />
              <Route path='/admin-section/generate-id-card' element={<GenerateIDCard />} />

              {/* 2. Academics Routes */}
              <Route path='/Academics/optional-subject' element={<OptionalSubject />} />
              <Route path='/Academics/section' element={<Section />} />
              <Route path='/Academics/class' element={<Class />} />
              <Route path='/Academics/subjects' element={<Subjects />} />
              <Route path='/Academics/assign-class-teacher' element={<AssignClassTeacher />} />
              <Route path='/Academics/class-room' element={<ClassRoom />} />

              {/* 3. Study Material Routes */}
              <Route path='/study-material/upload-content' element={<UploadContent />} />
              <Route path='/study-material/assignment' element={<Assignment />} />
              <Route path='/study-material/syllabus' element={<Syllabus />} />
              <Route path='/study-material/other-downloads' element={<OtherDownloads />} />

              {/* 4. Download Center Routes */}
              <Route path='/download-center/content-type' element={<ContentType />} />
              <Route path='/download-center/content-list' element={<ContentList />} />
              <Route path='/download-center/shared-Content-List' element={<SharedContentList />} />
              <Route path='/download-center/video-list' element={<VideoList />} />

              {/* 5. Student Info */}
              <Route path='/student-info/student-category' element={<StudentCategory />} />
              <Route path='/student-info/add-student' element={<div><AddStudent /></div>} />
              <Route path='/student-info/add-student/:student_id' element={<div><AddStudent /></div>} />
              <Route path='/student-info/student-list' element={<StudentList />} />
              <Route path='/student-info/multi-class-student' element={<MultiClassStudent />} />
              <Route path='/student-info/delete-student-record' element={<DeleteStudentRecord />} />
              <Route path='/student-info/unassigned-student' element={<UnassignedStudent />} />
              <Route path='/student-info/student-attendance' element={<div>student-attendance</div>} /> {/* pending */}
              <Route path='/student-info/student-group' element={<StudentGroup />} />
              <Route path='/student-info/student-promote' element={<StudentPromote />} />
              <Route path='/student-info/disabled-students' element={<DisabledStudents />} />
              <Route path='/student-info/subject-wise-attendance' element={<StudentAttendance />} />
              <Route path='/student-info/student-export' element={<div>student-export</div>} />
              <Route path='/student-info/sms-sending-time' element={<div>sms-sending-time</div>} />
              <Route path='/student-info/student-settings' element={<div>student-settings</div>} />
              <Route path='/student-info/profile/:student_id' element={<StudentProfilePage />} />


              {/* 6. Fees */}
              <Route path='/fees/fees-group' element={<FeesGroup />} />
              <Route path='/fees/fees-type' element={<div>fees-type</div>} />
              <Route path='/fees/fees-invoice' element={<div>fees-invoice</div>} />
              <Route path='/fees/bank-payment' element={<div>bank-payment</div>} />
              <Route path='/fees/fees-carry-forward' element={<div>fees-carry-forward</div>} />

              {/* 6. Human Resource */}
              <Route path='/human-resource/add-staff' element={<AddStaff />} />
              <Route path='/human-resource/add-staff/:staff_id' element={<AddStaff />} />
              <Route path='/human-resource/staff-list' element={<StaffList />} />
              <Route path='/human-resource/profile/:staff_id' element={<StaffProfilePage />} />


              {/* 7. Behaviour Records */}
              <Route path='/behaviour-records/incidents' element={<Incidents />} />
              <Route path='/behaviour-records/assign-incident' element={<AssignIncident />} />
              <Route path='/behaviour-records/student-incident-report' element={<div>Student Incident Report</div>} />
              <Route path='/behaviour-records/behaviour-report' element={<div>Behaviour Report</div>} />
              <Route path='/behaviour-records/incident-wise-report' element={<div>Incident Wise report</div>} />
              <Route path='/behaviour-records/settings' element={<div>Settings</div>} />

              {/* 8. Settings Section */}
              <Route path='/settings-section/general-settings' element={<GeneralSettings />} />
              <Route path='/settings-section/update-general-settings' element={<UpdateGeneralSettings />} />

              {/* Error page */}
              <Route path='/error-page-404' element={<div>Error 404</div>} />
              <Route path='/error-page-500' element={<div>Error 500</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App;
