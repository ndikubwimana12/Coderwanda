import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom'
const Home = lazy(() => import('./Pages/Home'));
const AboutUs = lazy(() => import('./Pages/AboutUs'));
const Contact = lazy(() => import('./Pages/Contact'));
const Services = lazy(() => import('./Pages/Services'));
const Ecommerce = lazy(() => import('./Pages/Ecommerce'));
const Cart = lazy(() => import('./Pages/Cart'));
const Login = lazy(() => import('./Pages/Login'));
const Register = lazy(() => import('./Pages/Register'));
const Checkout = lazy(() => import('./Pages/Checkout'));
const TrainingRoom = lazy(() => import('./Pages/TrainingRoom'));
const CourseDetails = lazy(() => import('./Pages/CourseDetails'));
const Enrollment = lazy(() => import('./Pages/Enrollment'));
const Careers = lazy(() => import('./Pages/Careers'));

const AdminLayout = lazy(() => import('./Admin/Components/AdminLayout'));
const AdminDashboard = lazy(() => import('./Admin/Pages/AdminDashboard'));
const UsersPage = lazy(() => import('./Admin/Pages/Users'));
const RolesPage = lazy(() => import('./Admin/Pages/Roles'));
const ServicesPage = lazy(() => import('./Admin/Pages/Services'));
const ProjectsPage = lazy(() => import('./Admin/Pages/Projects'));
const ProductsPage = lazy(() => import('./Admin/Pages/Products'));
const OrdersPage = lazy(() => import('./Admin/Pages/Orders'));
const CoursesPage = lazy(() => import('./Admin/Pages/Courses'));
const EnrollmentsPage = lazy(() => import('./Admin/Pages/Enrollments'));
const CareersPage = lazy(() => import('./Admin/Pages/Careers'));
const ApplicationsPage = lazy(() => import('./Admin/Pages/Applications'));
const BlogPostsPage = lazy(() => import('./Admin/Pages/BlogPosts'));
const TestimonialsPage = lazy(() => import('./Admin/Pages/Testimonials'));
const PartnersPage = lazy(() => import('./Admin/Pages/Partners'));
const SubscribersPage = lazy(() => import('./Admin/Pages/Subscribers'));
const ContactsPage = lazy(() => import('./Admin/Pages/Contacts'));
const AnalyticsPage = lazy(() => import('./Admin/Pages/Analytics'));
const ActivityLogsPage = lazy(() => import('./Admin/Pages/ActivityLogs'));
const SettingsPage = lazy(() => import('./Admin/Pages/Settings'));

const StudentDashboard = lazy(() => import('./Learning/StudentDashboard'));
const CoursePlayer = lazy(() => import('./Learning/CoursePlayer'));
const Assessment = lazy(() => import('./Learning/Assessment'));
const ActivateAccount = lazy(() => import('./Learning/ActivateAccount'));
const Certificate = lazy(() => import('./Learning/Certificate'));
const AdminLearning = lazy(() => import('./Learning/AdminLearning'));
const AdminStudents = lazy(() => import('./Learning/AdminStudents'));

const Playground = lazy(() => import('./Learning/Playground'));
const PracticeWorkspace = lazy(() => import('./Learning/PracticeWorkspace'));
const TrainerStudio = lazy(() => import('./Learning/TrainerStudio'));
const SubmissionReview = lazy(() => import('./Learning/SubmissionReview'));
const Classroom = lazy(() => import('./Learning/Classroom'));
const App = () => {
  return (
    <div>
      <Suspense fallback={<p className="p-8 text-center">Loading page…</p>}><Routes>
        {/* Learning routes */}
        <Route path="/learn/playground" element={<Playground />} />
        <Route path="/learn/practice/:exerciseId" element={<PracticeWorkspace />} />
        <Route path="/learn/courses/:courseId/chat" element={<Classroom />} />
        <Route path="/teach" element={<TrainerStudio />} />
        <Route path="/teach/submissions/:submissionId" element={<SubmissionReview />} />
        <Route path="/learn" element={<StudentDashboard />} />
        <Route path="/learn/courses/:courseId" element={<CoursePlayer />} />
        <Route path="/learn/assessments/:assessmentId" element={<Assessment />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/certificates/:code" element={<Certificate />} />
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
          <Route path="learning" element={<AdminLearning />} />
          <Route path="practice" element={<TrainerStudio embedded />} />
          <Route path="students" element={<AdminStudents />} />
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
      <Route path="*" element={<main className="p-12 text-center"><h1>Page not found</h1><a href="/">Return home</a></main>} /></Routes></Suspense>
    </div>
  )
}

export default App