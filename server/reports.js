const pool = require("./db");
module.exports = function registerReports(app) {
app.get("/api/admin/stats", async (_req, res) => {
    try {
        const [[{ users }]] = await pool.query("SELECT COUNT(*) AS users FROM users");
        const [[{ orders }]] = await pool.query("SELECT COUNT(*) AS orders FROM orders");
        const [[{ enrollments }]] = await pool.query("SELECT COUNT(*) AS enrollments FROM enrollments");
        const [[{ revenue }]] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) AS revenue FROM orders WHERE status != 'cancelled'");
        const [[{ contacts }]] = await pool.query("SELECT COUNT(*) AS contacts FROM contact_messages");
        const [[{ courses }]] = await pool.query("SELECT COUNT(*) AS courses FROM courses");
        const [[{ products }]] = await pool.query("SELECT COUNT(*) AS products FROM products");
        const [[{ applications }]] = await pool.query("SELECT COUNT(*) AS applications FROM job_applications");
        const [[{ subscribers }]] = await pool.query("SELECT COUNT(*) AS subscribers FROM subscribers");
        const [[{ services }]] = await pool.query("SELECT COUNT(*) AS services FROM services");

        // Calculate 20-day trend
        const [dailyActivity] = await pool.query(`
            SELECT DATE(d.date) AS day,
                   (
                       (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = d.date) +
                       (SELECT COUNT(*) FROM enrollments WHERE DATE(enrolled_at) = d.date) +
                       (SELECT COUNT(*) FROM contact_messages WHERE DATE(created_at) = d.date) +
                       (SELECT COUNT(*) FROM users WHERE DATE(created_at) = d.date)
                   ) AS total_events
            FROM (
                SELECT CURDATE() - INTERVAL (a.a + (10 * b.a)) DAY AS date
                FROM (SELECT 0 AS a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) AS a
                CROSS JOIN (SELECT 0 AS a UNION ALL SELECT 1) AS b
                LIMIT 20
            ) d
            ORDER BY d.date ASC
        `);

        // Baseline scale so the dashboard bar chart renders gracefully even on low volumes
        const trend = dailyActivity.map((r) => Number(r.total_events));

        res.json({
            users,
            orders,
            enrollments,
            revenue,
            contacts,
            courses,
            products,
            applications,
            subscribers,
            services,
            trend,
        });

    } catch (err) {
        console.error("Admin stats error:", err);
        res.status(500).json({ error: "Failed to load stats." });
    }
});

// ============================================================
//  COMPREHENSIVE REPORTS & DATA EXPORT SUITE
// ============================================================

app.get("/api/admin/reports/summary", async (_req, res) => {
    try {
        const [[{ total_users }]] = await pool.query("SELECT COUNT(*) AS total_users FROM users");
        const [[{ total_orders }]] = await pool.query("SELECT COUNT(*) AS total_orders FROM orders");
        const [[{ total_revenue }]] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status != 'cancelled'");
        const [[{ total_enrollments }]] = await pool.query("SELECT COUNT(*) AS total_enrollments FROM enrollments");
        const [[{ total_applications }]] = await pool.query("SELECT COUNT(*) AS total_applications FROM job_applications");
        const [[{ total_contacts }]] = await pool.query("SELECT COUNT(*) AS total_contacts FROM contact_messages");

        // Breakdown by order status
        const [orderStatuses] = await pool.query(
            "SELECT status, COUNT(*) AS count, COALESCE(SUM(total_amount), 0) AS amount FROM orders GROUP BY status"
        );

        // Top purchased products
        const [topProducts] = await pool.query(`
            SELECT name, COUNT(*) as orders_count, SUM(quantity) as total_qty, SUM(price * quantity) as total_spent
            FROM order_items
            GROUP BY name
            ORDER BY total_spent DESC
            LIMIT 5
        `);

        // Top popular courses
        const [topCourses] = await pool.query(`
            SELECT COALESCE(c.title, e.education, 'Training Program') AS title, COUNT(*) AS count
            FROM enrollments e
            LEFT JOIN courses c ON c.id = e.course_id
            GROUP BY title
            ORDER BY count DESC
            LIMIT 5
        `);

        res.json({
            kpi: {
                users: total_users,
                orders: total_orders,
                revenue: total_revenue,
                enrollments: total_enrollments,
                applications: total_applications,
                contacts: total_contacts,
            },
            metrics: {
                total_users,
                total_orders,
                total_revenue,
                total_enrollments,
                total_applications,
                total_contacts,
            },
            order_status: orderStatuses,
            orderStatuses,
            top_products: topProducts.map((p) => ({
                product_name: p.name,
                total_sold: Number(p.total_qty || 0),
                total_spent: Number(p.total_spent || 0),
            })),
            topProducts,
            enrollments_by_course: topCourses.map((c) => ({
                course_title: c.title,
                students: Number(c.count || 0),
            })),
            topCourses,
            generatedAt: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Report summary error:", err);
        res.status(500).json({ error: "Failed to generate summary report." });
    }
});


};
