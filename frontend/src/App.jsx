import { Routes, Route } from 'react-router-dom'
import UserView from './pages/UserView'
import AdminLogin from './pages/AdminLogin'
import AdminView from './pages/AdminView'
import RequireAdminAuth from './components/RequireAdminAuth'

function App() {
  return (
    <Routes>
      <Route path="/" element={<UserView />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/*"
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
