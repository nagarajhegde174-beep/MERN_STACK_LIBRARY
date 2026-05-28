import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Users, Clock, Star, Play, Activity, CheckCircle, ChevronRight, Bookmark } from "lucide-react";
import api from "../../lib/api";

export default function Home() {
  const [data, setData] = useState(null);
  const [userStats, setUserStats] = useState({
    activeBorrows: 0,
    overdue: 0,
    reservations: 0,
    activeBorrowsList: [],
    timelineEvents: []
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/home");
        if (alive) setData(res.data?.data || res.data || {});
        
        if (token) {
           const headers = { Authorization: `Bearer ${token}` };
           const [borrowsRes, reservationsRes] = await Promise.all([
             api.get(`/users/myborrows`, { headers }).catch(() => ({ data: { borrows: [] } })),
             api.get(`/reservations/my`, { headers }).catch(() => ({ data: { reservations: [] } }))
           ]);
           const borrowsData = borrowsRes.data?.borrows || borrowsRes.data?.requests || [];
           const reservationsData = reservationsRes.data?.reservations || [];
           
           let activeBorrows = 0;
           let overdue = 0;
           let activeBorrowsList = [];
           let timelineEvents = [];
           
           borrowsData.forEach(b => {
             if (b.status === "Issued") {
               activeBorrows++;
               if (b.bookId) activeBorrowsList.push(b.bookId);
               
               const dueDate = new Date(b.dueDate);
               const now = new Date();
               const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
               
               if (diffDays < 0) {
                 overdue++;
                 timelineEvents.push({
                   id: `overdue-${b._id}`,
                   type: 'reminder',
                   text: `"${b.bookId?.title || 'A book'}" is overdue by ${Math.abs(diffDays)} days.`,
                   time: 'Urgent',
                   color: '#EF4444'
                 });
               } else if (diffDays <= 2) {
                 timelineEvents.push({
                   id: `duesoon-${b._id}`,
                   type: 'reminder',
                   text: `"${b.bookId?.title || 'A book'}" is due in ${diffDays} days.`,
                   time: 'Soon',
                   color: '#F59E0B'
                 });
               }
             }
           });

           const activeReservations = reservationsData.filter(
             r => r.status === "Pending" || r.status === "Notified"
           ).length;

           reservationsData.forEach(r => {
             if (r.status === "Notified") {
               timelineEvents.push({
                 id: `res-${r._id}`,
                 type: 'success',
                 text: `Reservation approved for "${r.bookId?.title || 'a book'}".`,
                 time: 'Update',
                 color: '#EC4899'
               });
             }
           });
           
           if(alive) {
             setUserStats({
               activeBorrows, overdue, reservations: activeReservations, activeBorrowsList, timelineEvents
             });
           }
        }
      } catch (e) {
        console.error("Failed to load home data", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => (alive = false);
  }, [token]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
      </div>
    );
  }

  const books = Array.isArray(data?.books) ? data.books : [];
  const continueReadingBooks = token ? userStats.activeBorrowsList : [];
  const trendingBooks = books.slice(2, 8);
  const newArrivals = books.slice(5, 12);
  
  const stats = token ? [
    { title: "Books Issued", value: userStats.activeBorrows, icon: BookOpen, color: "#8B5CF6", size: "large" },
    { title: "Overdue", value: userStats.overdue, icon: Activity, color: "#EF4444", size: "small" },
    { title: "Reserved", value: userStats.reservations, icon: Bookmark, color: "#8B5CF6", size: "medium" },
  ] : [
    { title: "Total Library Books", value: data?.booksCount || data?.totalBooks || 0, icon: BookOpen, color: "#8B5CF6", size: "large" },
    { title: "Active Users", value: data?.borrowersCount || data?.totalActiveStudents || 0, icon: Users, color: "#EC4899", size: "small" },
    { title: "Books Issued", value: data?.issuedCount || data?.totalIssued || 0, icon: Activity, color: "#EF4444", size: "small" },
    { title: "Categories", value: data?.categoriesCount || data?.totalCategories || 0, icon: Bookmark, color: "#8B5CF6", size: "medium" },
  ];

  let dynamicTimeline = token ? (userStats.timelineEvents || []) : [];
  
  if (books.length > 0 && dynamicTimeline.length < 3) {
    dynamicTimeline.push({
      id: 'new-books',
      type: 'update',
      text: `${books.length} new books available in the library.`,
      time: 'New',
      color: '#8B5CF6'
    });
  }

  if (dynamicTimeline.length === 0) {
    dynamicTimeline.push({
      id: 'welcome',
      type: 'info',
      text: 'Welcome to LibNova! Start exploring books.',
      time: 'Now',
      color: '#8B5CF6'
    });
  }

  return (
    <div style={styles.page}>
      
      {/* ── HERO SECTION ── */}
      <section style={styles.heroSection}>
        {/* Animated Glow Backgrounds */}
        <div style={styles.glowMesh1} />
        <div style={styles.glowMesh2} />

        <div style={styles.heroContainer}>
          <div style={styles.heroLeft}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div style={styles.badgeLabel}>
                <span style={styles.badgeDot} /> NEW SEMESTER UPDATES
              </div>
              <h1 style={styles.heroTitle}>
                Discover Knowledge<br />
                <span style={styles.textGradient}>Beyond Books.</span>
              </h1>
              <p style={styles.heroSubtitle}>
                Your ultimate digital academic hub. Explore premium resources, track your reading progress, and stay ahead of your curriculum.
              </p>
              <div style={styles.heroButtons}>
                <Link to="/books" style={styles.primaryBtn}>
                  Browse Library <ChevronRight size={16} />
                </Link>
                <Link to="/my-books" style={styles.secondaryBtn}>
                  <Play size={14} fill="#F8FAFC" /> Continue Reading
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div style={styles.heroRight}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              style={styles.heroImgWrapper}
            >
              {/* Floating Overlays */}
              <img src="/student-3d.png" alt="Student" style={styles.heroImg} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── MAIN DASHBOARD CONTAINER ── */}
      <div style={styles.dashboardContainer}>
        
        {/* ── BENTO GRID STATS ── */}
        <section style={styles.statsBento}>
          {stats.map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              style={{
                ...styles.bentoCard,
                ...(s.size === "large" ? styles.bentoLarge : s.size === "medium" ? styles.bentoMedium : styles.bentoSmall)
              }}
            >
              <div style={{ ...styles.bentoIcon, color: s.color, boxShadow: `0 0 20px ${s.color}40` }}>
                <s.icon size={22} />
              </div>
              <div style={styles.bentoInfo}>
                <h3 style={styles.bentoValue}>{s.value}</h3>
                <p style={styles.bentoTitle}>{s.title}</p>
              </div>
              <div style={{ ...styles.bentoGlow, background: `radial-gradient(circle at top right, ${s.color}20, transparent 70%)` }} />
            </motion.div>
          ))}
        </section>

        <div style={styles.layoutGrid}>
          
          {/* LEFT COLUMN: CAROUSELS */}
          <div style={styles.leftCol}>
            
            {/* Continue Reading */}
            {continueReadingBooks.length > 0 && (
              <section style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.sectionTitle}>Continue Reading</h2>
                  <Link to="/my-books" style={styles.viewAll}>View All</Link>
                </div>
                <div style={styles.horizontalScroll}>
                  {continueReadingBooks.map((b, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} style={styles.continueCard}>
                      <img src={b.coverImage || "https://via.placeholder.com/150"} alt={b.title} style={styles.continueImg} />
                      <div style={styles.continueOverlay}>
                        <div style={styles.progressTrack}>
                          <div style={{...styles.progressBar, width: `${((i + 1) * 20) % 60 + 20}%`}} />
                        </div>
                        <h4 style={styles.cardTitle}>{b.title}</h4>
                        <p style={styles.cardAuthor}>{b.author}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Trending / Netflix Style */}
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Trending Now</h2>
              </div>
              <div style={styles.horizontalScroll}>
                {trendingBooks.map((b, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05 }} style={styles.netflixCard}>
                    <img src={b.coverImage || "https://via.placeholder.com/150"} alt={b.title} style={styles.netflixImg} />
                    <div style={styles.netflixOverlay}>
                      <div style={styles.netflixTags}>
                        <span style={styles.tagPrimary}>98% Match</span>
                        <span style={styles.tagSecondary}>{b.category || "Sci-Fi"}</span>
                      </div>
                      <h4 style={styles.cardTitle}>{b.title}</h4>
                      <button style={styles.borrowBtn}>Borrow Now</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: TIMELINE */}
          <div style={styles.rightCol}>
            <section style={styles.timelineSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Activity & Alerts</h2>
              </div>
              <div style={styles.timelineCard}>
                {dynamicTimeline.map((item, idx) => (
                  <div key={item.id} style={styles.timelineItem}>
                    {/* Vertical line connecting dots */}
                    {idx !== dynamicTimeline.length - 1 && <div style={styles.timelineLine} />}
                    
                    <div style={{ ...styles.timelineDot, boxShadow: `0 0 10px ${item.color}80`, background: item.color }} />
                    <div style={styles.timelineContent}>
                      <p style={styles.timelineText}>{item.text}</p>
                      <span style={styles.timelineTime}>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

        </div>
        
        {/* New Arrivals Bottom Carousel */}
        <section style={{...styles.section, marginTop: "20px"}}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>New Arrivals</h2>
          </div>
          <div style={styles.horizontalScroll}>
            {newArrivals.map((b, i) => (
              <motion.div key={i} whileHover={{ scale: 1.05 }} style={styles.netflixCard}>
                <img src={b.coverImage || "https://via.placeholder.com/150"} alt={b.title} style={styles.netflixImg} />
                <div style={styles.netflixOverlay}>
                  <div style={styles.netflixTags}>
                    <span style={styles.tagNew}>NEW</span>
                  </div>
                  <h4 style={styles.cardTitle}>{b.title}</h4>
                  <button style={styles.borrowBtn}>View Details</button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#0B1120",
    color: "#F8FAFC",
    minHeight: "100vh",
    paddingBottom: "80px",
    overflowX: "hidden",
  },
  loadingContainer: {
    height: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0B1120",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #8B5CF6",
    borderTopColor: "transparent",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  
  // HERO
  heroSection: {
    position: "relative",
    padding: "80px 24px 60px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  glowMesh1: {
    position: "absolute",
    top: "-20%",
    left: "10%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(11,17,32,0) 70%)",
    filter: "blur(60px)",
    zIndex: 0,
  },
  glowMesh2: {
    position: "absolute",
    bottom: "-10%",
    right: "5%",
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, rgba(11,17,32,0) 70%)",
    filter: "blur(60px)",
    zIndex: 0,
  },
  heroContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "60px",
    position: "relative",
    zIndex: 2,
    "@media (max-width: 1024px)": { flexDirection: "column" },
  },
  heroLeft: {
    flex: "1 1 50%",
  },
  badgeLabel: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "6px 14px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#94A3B8",
    letterSpacing: "1px",
    marginBottom: "24px",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#8B5CF6",
    boxShadow: "0 0 10px #8B5CF6",
  },
  heroTitle: {
    fontSize: "clamp(40px, 6vw, 68px)",
    fontWeight: "800",
    lineHeight: "1.1",
    marginBottom: "24px",
    letterSpacing: "-1.5px",
  },
  textGradient: {
    background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "17px",
    lineHeight: "1.6",
    color: "#94A3B8",
    marginBottom: "40px",
    maxWidth: "500px",
  },
  heroButtons: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  primaryBtn: {
    background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
    color: "#fff",
    padding: "16px 32px",
    borderRadius: "100px",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 10px 30px rgba(236,72,153,0.3)",
    transition: "transform 0.2s",
  },
  secondaryBtn: {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#F8FAFC",
    padding: "16px 32px",
    borderRadius: "100px",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "background 0.2s",
  },
  heroRight: {
    flex: "1 1 50%",
    position: "relative",
    display: "flex",
    justifyContent: "center",
  },
  heroImgWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: "500px",
  },
  heroImg: {
    width: "100%",
    height: "auto",
    objectFit: "contain",
    filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))",
  },
  streakOverlay: {
    position: "absolute",
    top: "20%",
    left: "-10%",
    background: "rgba(17,24,39,0.8)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "12px 20px",
    borderRadius: "16px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#F8FAFC",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    zIndex: 10,
  },

  // DASHBOARD CONTAINER
  dashboardContainer: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 24px",
    position: "relative",
    zIndex: 5,
  },

  // BENTO STATS
  statsBento: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "60px",
  },
  bentoCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "24px",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backdropFilter: "blur(20px)",
  },
  bentoLarge: { gridColumn: "span 2", minHeight: "180px" },
  bentoMedium: { gridColumn: "span 1", minHeight: "180px" },
  bentoSmall: { gridColumn: "span 1", minHeight: "180px" },
  bentoIcon: {
    width: "48px",
    height: "48px",
    background: "rgba(17,24,39,0.5)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.05)",
    marginBottom: "20px",
  },
  bentoInfo: {
    position: "relative",
    zIndex: 2,
  },
  bentoValue: {
    fontSize: "32px",
    fontWeight: "800",
    margin: "0 0 4px 0",
    letterSpacing: "-1px",
  },
  bentoTitle: {
    fontSize: "14px",
    color: "#94A3B8",
    fontWeight: "500",
    margin: 0,
  },
  bentoGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
    opacity: 0.5,
  },

  // MAIN GRID
  layoutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 350px",
    gap: "40px",
    "@media (max-width: 1024px)": {
      gridTemplateColumns: "1fr",
    }
  },
  leftCol: {
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  },
  rightCol: {
    display: "flex",
    flexDirection: "column",
  },

  // SECTIONS
  section: {
    display: "flex",
    flexDirection: "column",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    margin: 0,
  },
  viewAll: {
    fontSize: "13px",
    color: "#8B5CF6",
    textDecoration: "none",
    fontWeight: "600",
  },
  horizontalScroll: {
    display: "flex",
    gap: "20px",
    overflowX: "auto",
    paddingBottom: "16px",
  },

  // CARDS (Continue & Netflix)
  continueCard: {
    minWidth: "280px",
    height: "160px",
    borderRadius: "20px",
    position: "relative",
    overflow: "hidden",
    background: "#111827",
    cursor: "pointer",
  },
  continueImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.4,
  },
  continueOverlay: {
    position: "absolute",
    inset: 0,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    background: "linear-gradient(to top, rgba(11,17,32,0.9), transparent)",
  },
  progressTrack: {
    width: "100%",
    height: "4px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "4px",
    marginBottom: "12px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    background: "#EC4899",
    borderRadius: "4px",
    boxShadow: "0 0 10px #EC4899",
  },
  
  netflixCard: {
    minWidth: "160px",
    width: "160px",
    aspectRatio: "2/3",
    borderRadius: "16px",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    background: "#111827",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  netflixImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  netflixOverlay: {
    position: "absolute",
    inset: 0,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    background: "linear-gradient(to top, rgba(11,17,32,0.95) 0%, rgba(11,17,32,0.2) 50%, transparent 100%)",
    opacity: 0,
    transition: "opacity 0.3s",
    ":hover": { opacity: 1 }, // Note: inline styles don't support pseudo-classes perfectly, using Framer Motion helps but we simulate static overlay here instead.
  },
  netflixTags: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
  },
  tagPrimary: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#EC4899",
    background: "rgba(236,72,153,0.15)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  tagSecondary: {
    fontSize: "10px",
    fontWeight: "600",
    color: "#94A3B8",
    background: "rgba(255,255,255,0.1)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  tagNew: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#EF4444",
    background: "rgba(239,68,68,0.15)",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    margin: "0 0 4px 0",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: "1.2",
  },
  cardAuthor: {
    fontSize: "12px",
    color: "#94A3B8",
    margin: 0,
  },
  borrowBtn: {
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(4px)",
    color: "#fff",
    border: "none",
    padding: "8px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "background 0.2s",
    marginTop: "auto",
  },

  // TIMELINE
  timelineSection: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "24px",
    padding: "24px",
    backdropFilter: "blur(20px)",
  },
  timelineCard: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  timelineItem: {
    display: "flex",
    gap: "16px",
    position: "relative",
  },
  timelineDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: "4px",
    position: "relative",
    zIndex: 2,
  },
  timelineLine: {
    position: "absolute",
    left: "5px",
    top: "16px",
    bottom: "-24px",
    width: "2px",
    background: "rgba(255,255,255,0.1)",
    zIndex: 1,
  },
  timelineContent: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  timelineText: {
    fontSize: "14px",
    color: "#F8FAFC",
    margin: 0,
    fontWeight: "500",
    lineHeight: "1.4",
  },
  timelineTime: {
    fontSize: "12px",
    color: "#94A3B8",
  },
};