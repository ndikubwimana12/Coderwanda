export const navLinks = [
  { label: "Dashboard", path: "/admin", icon: "LayoutDashboard" },
  {
    label: "Users & Access",
    icon: "Users",
    children: [
      { label: "Users", path: "/admin/users", icon: "User" },
      { label: "Roles", path: "/admin/roles", icon: "ShieldCheck" },
    ],
  },
  {
    label: "Business",
    icon: "Briefcase",
    children: [
      { label: "Services", path: "/admin/services", icon: "Wrench" },
      { label: "Projects", path: "/admin/projects", icon: "FolderKanban" },
    ],
  },
  {
    label: "Ecommerce",
    icon: "ShoppingBag",
    children: [
      { label: "Products", path: "/admin/products", icon: "Package" },
      { label: "Orders", path: "/admin/orders", icon: "ShoppingCart" },
    ],
  },
  {
    label: "Training",
    icon: "GraduationCap",
    children: [
      { label: "Courses", path: "/admin/courses", icon: "BookOpen" },
      { label: "Enrollments", path: "/admin/enrollments", icon: "ClipboardList" },
    ],
  },
  {
    label: "Careers",
    icon: "Landmark",
    children: [
      { label: "Job Listings", path: "/admin/careers", icon: "Briefcase" },
      { label: "Applications", path: "/admin/applications", icon: "FileText" },
    ],
  },
  {
    label: "Content",
    icon: "Newspaper",
    children: [
      { label: "Blog Posts", path: "/admin/blog", icon: "PenLine" },
      { label: "Testimonials", path: "/admin/testimonials", icon: "MessageSquare" },
      { label: "Partners", path: "/admin/partners", icon: "Handshake" },
    ],
  },
  {
    label: "Engagement",
    icon: "Bell",
    children: [
      { label: "Subscribers", path: "/admin/subscribers", icon: "Mail" },
      { label: "Contacts", path: "/admin/contacts", icon: "Phone" },
    ],
  },
  { label: "Analytics", path: "/admin/analytics", icon: "BarChart2" },
  { label: "Activity Logs", path: "/admin/activity-logs", icon: "ScrollText" },
  { label: "Settings", path: "/admin/settings", icon: "Settings" },
];

export const stats = [
  { label: "Total Users", value: "1,284", change: "+12%", trend: "up", icon: "Users", color: "purple" },
  { label: "Orders", value: "348", change: "+5%", trend: "up", icon: "ShoppingCart", color: "blue" },
  { label: "Enrollments", value: "920", change: "+18%", trend: "up", icon: "GraduationCap", color: "green" },
  { label: "Revenue", value: "$24,500", change: "-3%", trend: "down", icon: "DollarSign", color: "yellow" },
];

export const recentUsers = [
  { id: 1, name: "Alice Uwimana", email: "alice@example.com", role: "Student", joined: "2025-06-01", avatar: null },
  { id: 2, name: "Bob Nkurunziza", email: "bob@example.com", role: "Customer", joined: "2025-06-03", avatar: null },
  { id: 3, name: "Claire Mukamana", email: "claire@example.com", role: "Student", joined: "2025-06-05", avatar: null },
  { id: 4, name: "David Habimana", email: "david@example.com", role: "Admin", joined: "2025-06-07", avatar: null },
  { id: 5, name: "Eva Ingabire", email: "eva@example.com", role: "Customer", joined: "2025-06-09", avatar: null },
];

export const recentActivity = [
  { id: 1, action: "New user registered", user: "Alice Uwimana", time: "2 min ago", type: "user" },
  { id: 2, action: "Order #1042 placed", user: "Bob Nkurunziza", time: "15 min ago", type: "order" },
  { id: 3, action: "Enrolled in Web Dev", user: "Claire Mukamana", time: "1 hr ago", type: "enrollment" },
  { id: 4, action: "Contact message sent", user: "David Habimana", time: "3 hr ago", type: "contact" },
  { id: 5, action: "Blog post published", user: "Admin", time: "5 hr ago", type: "content" },
  { id: 6, action: "New job application", user: "Eva Ingabire", time: "1 day ago", type: "career" },
];

export const quickActions = [
  { label: "Add Product", path: "/admin/products/new", icon: "Plus", color: "blue" },
  { label: "Add Course", path: "/admin/courses/new", icon: "Plus", color: "green" },
  { label: "Post Job", path: "/admin/careers/new", icon: "Plus", color: "purple" },
  { label: "Write Blog", path: "/admin/blog/new", icon: "PenLine", color: "yellow" },
];
