import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Users, Award, Clock, MapPin, Activity, Bookmark } from 'lucide-react';
import api from '../../lib/api';

const AboutUs = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/home");
        if (alive) setData(res.data?.data || res.data || {});
      } catch (e) {
        console.error("Failed to load home data", e);
      }
    })();
    return () => (alive = false);
  }, []);
  return (
    <div style={styles.page}>
      
      {/* ── HERO SECTION ── */}
      <section style={styles.heroSection}>
        <div style={styles.glowTopRight} />
        <div style={styles.glowBottomLeft} />
        
        <div style={styles.heroContent}>
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={styles.badge}
          >
            <span style={styles.badgeDot} />
            ABOUT LIBNOVA
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={styles.heroTitle}
          >
            Discover Knowledge <br/>
            <span style={styles.textGradient}>Beyond Books.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={styles.heroSubtitle}
          >
            LibNova is dedicated to supporting the academic and research needs of our students and faculty, providing equitable access to information resources and fostering information literacy.
          </motion.p>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section style={styles.section}>
        <div style={styles.statsGrid}>
          {[
            { icon: BookOpen, count: data?.booksCount || data?.totalBooks || 0, label: "Total Books", color: "#8B5CF6" },
            { icon: Users, count: data?.borrowersCount || data?.totalActiveStudents || 0, label: "Active Users", color: "#EC4899" },
            { icon: Activity, count: data?.issuedCount || data?.totalIssued || 0, label: "Books Issued", color: "#3B82F6" },
            { icon: Bookmark, count: data?.categoriesCount || data?.totalCategories || 0, label: "Categories", color: "#10B981" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              style={styles.statCard}
            >
              <div style={{ ...styles.statIconBox, color: stat.color, background: `${stat.color}15` }}>
                <stat.icon size={28} />
              </div>
              <h3 style={styles.statCount}>{stat.count}</h3>
              <p style={styles.statLabel}>{stat.label}</p>
              <div style={{ ...styles.statGlow, background: `radial-gradient(circle at top right, ${stat.color}20, transparent 70%)` }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HISTORY TIMELINE ── */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Our Journey</h2>
        </div>
        <div style={styles.timelineContainer}>
          {[
            { year: "1965", title: "Foundation", desc: "Established with a modest collection of 2,000 books to serve the newly founded institution.", color: "#8B5CF6" },
            { year: "1992", title: "Expansion", desc: "Moved to its current location with expanded space and resources.", color: "#EC4899" },
            { year: "2010", title: "Digital Transformation", desc: "Implemented our first digital catalog system and began offering e-resources.", color: "#3B82F6" },
            { year: "2022", title: "Modernization", desc: "Completed comprehensive renovation with state-of-the-art study spaces.", color: "#10B981" }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={styles.timelineItem}
            >
              <div style={{ ...styles.timelineDot, background: item.color, boxShadow: `0 0 15px ${item.color}80` }} />
              <div style={styles.timelineContent}>
                <span style={{ ...styles.timelineYear, color: item.color }}>{item.year}</span>
                <h3 style={styles.timelineTitle}>{item.title}</h3>
                <p style={styles.timelineDesc}>{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FACILITIES SECTION ── */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Our Facilities</h2>
        </div>
        <div style={styles.facilitiesGrid}>
          {[
            { img: "/assets/readingroom.png", title: "Main Reading Room", desc: "Quiet study space with natural lighting and comfortable seating for 200 students." },
            { img: "/assets/computerlab.png", title: "Computer Lab", desc: "40 workstations with academic software and high-speed internet access." },
            { img: "/assets/groupstudyroom.png", title: "Group Study Rooms", desc: "12 bookable rooms equipped with whiteboards and presentation displays." }
          ].map((fac, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              style={styles.facilityCard}
            >
              <div style={styles.facilityImgWrapper}>
                <img src={fac.img} alt={fac.title} style={styles.facilityImg} />
              </div>
              <div style={styles.facilityContent}>
                <h3 style={styles.facilityTitle}>{fac.title}</h3>
                <p style={styles.facilityDesc}>{fac.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaGlow} />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          style={styles.ctaCard}
        >
          <h2 style={styles.ctaTitle}>Experience Our Library</h2>
          <p style={styles.ctaSubtitle}>Visit us today and discover all the resources we have to offer.</p>
          <div style={styles.ctaButtons}>
            <Link to="/contactus" style={styles.btnPrimary}>
              <MapPin size={18} /> Visit Us
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#0B1120",
    color: "#F8FAFC",
    fontFamily: "'Inter', sans-serif",
    overflowX: "hidden",
  },
  heroSection: {
    position: "relative",
    padding: "100px 24px 60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    minHeight: "50vh",
  },
  glowTopRight: {
    position: "absolute",
    top: "-10%",
    right: "-5%",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  glowBottomLeft: {
    position: "absolute",
    bottom: "-10%",
    left: "-5%",
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
  },
  heroContent: {
    maxWidth: "800px",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(139,92,246,0.1)",
    border: "1px solid rgba(139,92,246,0.2)",
    padding: "6px 16px",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#A78BFA",
    marginBottom: "24px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#A78BFA",
    boxShadow: "0 0 10px #A78BFA",
  },
  heroTitle: {
    fontSize: "clamp(40px, 5vw, 64px)",
    fontWeight: "800",
    lineHeight: "1.1",
    marginBottom: "24px",
    color: "#F8FAFC",
  },
  textGradient: {
    background: "linear-gradient(135deg, #A78BFA 0%, #F472B6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "18px",
    color: "#94A3B8",
    lineHeight: "1.6",
    maxWidth: "600px",
  },
  section: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "60px 24px",
  },
  sectionHeader: {
    marginBottom: "40px",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#F8FAFC",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  statCard: {
    position: "relative",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "20px",
    padding: "32px 24px",
    textAlign: "center",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  statIconBox: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  statCount: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "15px",
    color: "#94A3B8",
    fontWeight: "500",
  },
  statGlow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.5,
    pointerEvents: "none",
  },
  timelineContainer: {
    position: "relative",
    maxWidth: "800px",
    margin: "0 auto",
    paddingLeft: "30px",
    borderLeft: "2px solid rgba(255,255,255,0.1)",
  },
  timelineItem: {
    position: "relative",
    marginBottom: "40px",
    paddingLeft: "30px",
  },
  timelineDot: {
    position: "absolute",
    left: "-37px",
    top: "0px",
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    border: "2px solid #0B1120",
  },
  timelineContent: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    padding: "24px",
    borderRadius: "16px",
  },
  timelineYear: {
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "8px",
    display: "block",
  },
  timelineTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#F8FAFC",
    marginBottom: "12px",
  },
  timelineDesc: {
    fontSize: "15px",
    color: "#94A3B8",
    lineHeight: "1.6",
  },
  facilitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
  },
  facilityCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "20px",
    overflow: "hidden",
  },
  facilityImgWrapper: {
    height: "200px",
    overflow: "hidden",
  },
  facilityImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
  },
  facilityContent: {
    padding: "24px",
  },
  facilityTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#F8FAFC",
    marginBottom: "12px",
  },
  facilityDesc: {
    fontSize: "15px",
    color: "#94A3B8",
    lineHeight: "1.6",
  },
  ctaSection: {
    position: "relative",
    padding: "80px 24px",
    display: "flex",
    justifyContent: "center",
  },
  ctaGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "400px",
    background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 60%)",
    pointerEvents: "none",
  },
  ctaCard: {
    position: "relative",
    background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "32px",
    padding: "60px 40px",
    textAlign: "center",
    maxWidth: "800px",
    width: "100%",
    backdropFilter: "blur(20px)",
  },
  ctaTitle: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: "16px",
  },
  ctaSubtitle: {
    fontSize: "18px",
    color: "#94A3B8",
    marginBottom: "40px",
  },
  ctaButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 28px",
    background: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
    color: "#fff",
    borderRadius: "100px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "15px",
    boxShadow: "0 10px 25px rgba(139,92,246,0.3)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
};

export default AboutUs;