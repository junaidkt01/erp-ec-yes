import { Route, Routes } from 'react-router-dom'
import './App.scss'
import './components/components.scss'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard/Dashboard'
import Complaint from './pages/AdminSection/Complaint/Complaint'
import AdmissionQuery from './pages/AdminSection/AdmissionQuery/AdmissionQuery'
import PostalReceive from './pages/AdminSection/PostalReceive/PostalReceive'
import PostalDispatch from './pages/AdminSection/PostalDispatch/PostalDispatch'
import PhoneCallLog from './pages/AdminSection/PhoneCallLog/PhoneCallLog'
import IDCard from './pages/AdminSection/IDCard/IDCard'
import Certificate from './pages/AdminSection/Certificate/Certificate'
import GenerateCertificate from './pages/AdminSection/GenerateCertificate/GenerateCertificate'
import GenerateIDCard from './pages/AdminSection/GenerateIDCard/GenerateIDCard'
import OptionalSubject from './pages/Academics/OptionalSubject/OptionalSubject'
import Section from './pages/Academics/Section/Section'
import Class from './pages/Academics/Class/Class'
import Subjects from './pages/Academics/Subjects/Subjects'
import AssignClassTeacher from './pages/Academics/AssignClassTeacher/AssignClassTeacher'
import ClassRoom from './pages/Academics/ClassRoom/ClassRoom'

function App() {
  return (
    <div className='app' >
      <div style={{ display: "flex", position: "sticky", top: "0" }} >
        <div>
          <Sidebar />
        </div>
        <div style={{ width: "100%" }} >
          <Header />
          <div style={{ height: "calc(100% - 64.5px)", overflowY: "auto" }} >
            <Routes>
              <Route path='/dashboard' element={<Dashboard />} />

              {/* Admin Section Routes */}
              <Route path='/admin-section/complaint' element={<Complaint />} />
              <Route path='/admin-section/admission-query' element={<AdmissionQuery />} />
              <Route path='/admin-section/postal-receive' element={<PostalReceive />} />
              <Route path='/admin-section/postal-dispatch' element={<PostalDispatch />} />
              <Route path='/admin-section/phone-call-log' element={<PhoneCallLog />} />
              <Route path='/admin-section/id-card' element={<IDCard />} />
              <Route path='/admin-section/certificate' element={<Certificate />} />
              <Route path='/admin-section/generate-certificate' element={<GenerateCertificate />} />
              <Route path='/admin-section/generate-id-card' element={<GenerateIDCard />} />

              {/* Academics Routes */}
              <Route path='/Academics/optional-subject' element={<OptionalSubject />} />
              <Route path='/Academics/section' element={<Section />} />
              <Route path='/Academics/class' element={<Class />} />
              <Route path='/Academics/subjects' element={<Subjects />} />
              <Route path='/Academics/assign-class-teacher' element={<AssignClassTeacher />} />
              <Route path='/Academics/class-room' element={<ClassRoom />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
