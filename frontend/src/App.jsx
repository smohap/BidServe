import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateRequest from './pages/consumer/CreateRequest'
import MyRequests from './pages/consumer/MyRequests'
import ViewOffers from './pages/consumer/ViewOffers'
import BrowseRequests from './pages/provider/BrowseRequests'
import MakeOffer from './pages/provider/MakeOffer'
import MyOffers from './pages/provider/MyOffers'
import Chat from './pages/chat/Chat'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Consumer routes */}
        <Route path="/consumer/requests/new" element={
          <ProtectedRoute role="consumer"><CreateRequest /></ProtectedRoute>
        } />
        <Route path="/consumer/requests" element={
          <ProtectedRoute role="consumer"><MyRequests /></ProtectedRoute>
        } />
        <Route path="/consumer/requests/:id" element={
          <ProtectedRoute role="consumer"><ViewOffers /></ProtectedRoute>
        } />

        {/* Provider routes */}
        <Route path="/provider/browse" element={
          <ProtectedRoute role="provider"><BrowseRequests /></ProtectedRoute>
        } />
        <Route path="/provider/offer/:id" element={
          <ProtectedRoute role="provider"><MakeOffer /></ProtectedRoute>
        } />
        <Route path="/provider/offers" element={
          <ProtectedRoute role="provider"><MyOffers /></ProtectedRoute>
        } />

        {/* Chat */}
        <Route path="/chat" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}