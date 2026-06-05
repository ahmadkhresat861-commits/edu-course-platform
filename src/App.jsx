import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './PAGES/Login'
import Home from './PAGES/Home'
import Courses from './PAGES/Courses'
import Dashboard from './PAGES/Dashboard'
import Profile from './PAGES/Profile'
import Navbar from './components/Navbar'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<><Navbar /><Home /></>} />
        <Route path="/courses" element={<><Navbar /><Courses /></>} />
        <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
        <Route path="/profile" element={<><Navbar /><Profile /></>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App