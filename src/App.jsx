import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Login from './PAGES/Login'
import SignUp from './PAGES/SignUp'
import Home from './PAGES/Home'
import Courses from './PAGES/Courses'
import Dashboard from './PAGES/Dashboard'
import Profile from './PAGES/Profile'
import Contact from './PAGES/Contact'
import Admin from './PAGES/Admin'
import Sessions from './PAGES/Sessions'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AIAssistant from './components/AIAssistant'

import { LanguageProvider } from './LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>

          {/* PUBLIC */}
          <Route
            path="/"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<SignUp />}
          />

          {/* HOME */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Home />
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* COURSES */}
          <Route
            path="/courses"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Courses />
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Dashboard />
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Profile />
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* CONTACT */}
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Contact />
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* SESSIONS */}
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Sessions />
                  <Footer />
                </>
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />

        </Routes>

        <AIAssistant />

      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
