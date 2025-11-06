import { Routes } from 'react-router-dom'
import './App.scss'
import './components/components.scss'
import Sidebar from './components/Sidebar'
import Header from './components/header'

function App() {

  return (
    <div className='app' >
      <div style={{ display: "flex", position: "sticky", top: "0" }} >
        <div>
          <Sidebar />
        </div>
        <Header />
      </div>
      <Routes>
      </Routes>
    </div>
  )
}

export default App
