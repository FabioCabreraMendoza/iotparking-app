import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLogin from './pages/AdminLogin'
import AdminView from './pages/AdminView'
import RequireAdminAuth from './components/RequireAdminAuth'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/*"
        element={
          <RequireAdminAuth>
            <AdminView />
          </RequireAdminAuth>
        }
      />
    </Routes>
  )
}

export default App
