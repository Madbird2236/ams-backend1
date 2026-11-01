import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Reports from './pages/Reports'
import InspectionLayout from './pages/InspectionLayout'
import HotelForm from './pages/HotelForm'
import Checklist from './pages/Checklist'
import Category from './pages/Category'
import ElementAssessment from './pages/ElementAssessment'
import Summary from './pages/Summary'
import BudgetPage from './pages/BudgetPage'
import ReportPage from './pages/ReportPage'
import { UpdatePrompt } from './components/UpdatePrompt'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/i/:id" element={<InspectionLayout />}>
          <Route index element={<HotelForm />} />
          <Route path="checklist" element={<Checklist />} />
          <Route path="summary" element={<Summary />} />
          <Route path="budget" element={<BudgetPage />} />
          <Route path="report" element={<ReportPage />} />
        </Route>
        <Route path="/i/:id/c/:catId" element={<Category />} />
        <Route path="/i/:id/c/:catId/z/:zoneId/e/:elementId" element={<ElementAssessment />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <UpdatePrompt />
    </BrowserRouter>
  )
}
