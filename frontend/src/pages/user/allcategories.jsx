import { useState, useEffect } from "react";
import { Server_URL } from "../../utils/config";
import axios from "axios";
import "./allcategories.css";
import { Link } from "react-router-dom";
import Loader from "../../components/Preloader";
import { showErrorToast } from "../../utils/toasthelper";
import { FiGrid, FiArrowRight, FiFilter } from "react-icons/fi";

export default function ViewAllCategories() {
  const [books, setBooks] = useState([]);
  const [filterBooks, setFilteredBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const url = Server_URL + "books";
      const response = await axios.get(url);
      const { error, message, books } = response.data;

      if (error) {
        showErrorToast(message);
      } else {
        setBooks(books);
        setFilteredBooks(books);

        const categoryCountMap = {};
        books.forEach((book) => {
          const cat = book.category || "General";
          categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
        });

        setCategoryCounts(categoryCountMap);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      showErrorToast("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (selectedCategory) => {
    setActiveCategory(selectedCategory);
    if (selectedCategory === "All") {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(
        (book) => (book.category || "General") === selectedCategory
      );
      setFilteredBooks(filtered);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const uniqueCategories = ["All", ...new Set(books.map((book) => book.category || "General"))];

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--secondary-soft)" }}>
      <Loader />
    </div>
  );

  return (
    <div className="categories-viewport" style={{ background: "var(--secondary-soft)", minHeight: "100vh" }}>
      <div className="section-viewport" style={{ display: "flex", gap: "3rem", alignItems: "flex-start" }}>
        
        {/* SIDEBAR NAVIGATION */}
        <aside style={{ 
          width: "280px", 
          position: "sticky", 
          top: "2rem",
          background: "var(--glass-bg)",
          backdropFilter: "blur(20px)",
          padding: "2rem",
          borderRadius: "24px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--card-shadow)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "2rem", color: "var(--primary-deep)" }}>
            <FiFilter size={20} />
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Filter</h3>
          </div>
          
          <ul style={{ listStyle: "none" }}>
            {uniqueCategories.map((cat) => (
              <li 
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  padding: "12px 16px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  marginBottom: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: activeCategory === cat ? "var(--primary-glow)" : "transparent",
                  color: activeCategory === cat ? "var(--accent-purple)" : "var(--text-muted)"
                }}
              >
                <span>{cat}</span>
                {cat !== "All" && (
                  <span style={{ 
                    fontSize: "0.75rem", 
                    background: activeCategory === cat ? "var(--accent-purple)" : "rgba(255, 255, 255, 0.05)", 
                    color: activeCategory === cat ? "#fff" : "var(--text-muted)",
                    padding: "2px 8px", 
                    borderRadius: "10px" 
                  }}>
                    {categoryCounts[cat] || 0}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN CONTENT GRID */}
        <main style={{ flex: 1 }}>
          <div style={{ marginBottom: "3rem" }}>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--primary-deep)", marginBottom: "0.75rem" }}>Explore Categories</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
              Showing {activeCategory === "All" ? "all" : activeCategory} resources in the library
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2rem"
          }}>
            {[...new Set(filterBooks.map((book) => book.category || "General"))].map((cat) => (
              <div key={cat} className="cotton-card" style={{ overflow: "hidden" }}>
                <div style={{ height: "240px", overflow: "hidden", position: "relative" }}>
                  <img
                    src={filterBooks.find((b) => (b.category || "General") === cat)?.coverImage || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80"}
                    alt={cat}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))"
                  }} />
                </div>
                <div style={{ padding: "2rem" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--primary-deep)", marginBottom: "0.5rem" }}>{cat}</h3>
                  <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                    {categoryCounts[cat] || 0} books available
                  </p>
                  <Link 
                    to={`/books?category=${encodeURIComponent(cat)}`} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px", 
                      textDecoration: "none", 
                      color: "var(--accent-purple)", 
                      fontWeight: 700,
                      fontSize: "0.95rem"
                    }}
                  >
                    View Books <FiArrowRight />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filterBooks.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
              <FiGrid size={48} style={{ marginBottom: "1rem", opacity: 0.3 }} />
              <p>No books found in this collection.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
