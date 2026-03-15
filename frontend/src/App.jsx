import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/common/Sidebar'
import DashboardPage from './pages/DashboardPage'
import MedicamentsPage from './pages/MedicamentsPage'
import VentesPage from './pages/VentesPage'
import CategoriesPage from './pages/CategoriesPage'
import { useAlertes } from './hooks/useMedicaments'

const Layout = ({ children }) => {
  const { count } = useAlertes()
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar alertCount={count} />
      <main style={{
        flex: 1,
        padding: '32px',
        overflowY: 'auto',
        maxWidth: '100%',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

const App = () => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/medicaments" element={<MedicamentsPage />} />
        <Route path="/ventes" element={<VentesPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
      </Routes>
    </Layout>
  </BrowserRouter>
)

export default App
