import { Route, Routes } from 'react-router-dom'
import './App.scss'
import './components/components.scss'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard/Dashboard'
import Complaint from './pages/Complaint/Complaint'

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
              <Route path='/admin-section/complaint' element={<Complaint />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
