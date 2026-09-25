import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import AboutUs from './Pages/AboutUs'
import Contact from './Pages/Contact'
import Services from './Pages/Services'
import Ecommerce from './Pages/Ecommerce'
import Cart from './Pages/Cart'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Checkout from './Pages/Checkout'
import TrainingRoom from './Pages/TrainingRoom'
import CourseDetails from './Pages/CourseDetails'
import Enrollment from './Pages/Enrollment'
import Careers from './Pages/Careers'

import AdminLayout from './Admin/Components/AdminLayout'
import AdminDashboard from './Admin/Pages/AdminDashboard'
import UsersPage from './Admin/Pages/Users'
import RolesPage from './Admin/Pages/Roles'
import ServicesPage from './Admin/Pages/Services'
import ProjectsPage from './Admin/Pages/Projects'
import ProductsPage from './Admin/Pages/Products'
import OrdersPage from './Admin/Pages/Orders'
import CoursesPage from './Admin/Pages/Courses'
import EnrollmentsPage from './Admin/Pages/Enrollments'
import CareersPage from './Admin/Pages/Careers'
import ApplicationsPage from './Admin/Pages/Applications'
import BlogPostsPage from './Admin/Pages/BlogPosts'
import TestimonialsPage from './Admin/Pages/Testimonials'
import PartnersPage from './Admin/Pages/Partners'
import SubscribersPage from './Admin/Pages/Subscribers'
import ContactsPage from './Admin/Pages/Contacts'
import AnalyticsPage from './Admin/Pages/Analytics'
import ActivityLogsPage from './Admin/Pages/ActivityLogs'
import SettingsPage from './Admin/Pages/Settings'

const App = () => {
  return (
    <div>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/services" element={<Services />} />
        <Route path="/ecommerce" element={<Ecommerce />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/training" element={<TrainingRoom />} />
        <Route path="/training-room" element={<TrainingRoom />} />
        <Route path="/training/courses" element={<TrainingRoom />} />
        <Route path="/training-room/courses" element={<TrainingRoom />} />
        <Route path="/training-room/course/:courseId" element={<CourseDetails />} />
        <Route path="/training/courses/:courseId" element={<CourseDetails />} />
        <Route path="/training-room/enroll/:slug" element={<Enrollment />} />
        <Route path="/training/enroll/:slug" element={<Enrollment />} />
        <Route path="/careers" element={<Careers />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="enrollments" element={<EnrollmentsPage />} />
          <Route path="careers" element={<CareersPage />} />
          <Route path="applications" element={<ApplicationsPage />} />
          <Route path="blog" element={<BlogPostsPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="subscribers" element={<SubscribersPage />} />
          <Route path="contacts" element={<ContactsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="activity-logs" element={<ActivityLogsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App