import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Search, Edit3, Trash2, Book, Hash, Tag, IndianRupee, Layers, X, 
  CheckCircle2, AlertCircle, Type, User, AlertTriangle, BookOpen, 
  Eye, Star, TrendingUp, Plus, Bell, Sparkles, LayoutGrid, List
} from "lucide-react";
import { Server_URL } from "../../utils/config";
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";
import "./viewbook.css";

const ViewBooks = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    price: "",
    totalCopies: "",
  });

  useEffect(() => { fetchBooks(); }, []);

  useEffect(() => {
    if (!Array.isArray(books)) return;
    const filtered = books.filter(b => 
      (b.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.author || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.isbn || "").includes(searchTerm)
    );
    setFilteredBooks(filtered);
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      const url = Server_URL + "books";
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      setBooks(Array.isArray(response.data.books) ? response.data.books : []);
    } catch (error) {
      showErrorToast("Failed to fetch inventory");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this book from the collection?")) return;
    try {
      await axios.delete(`${Server_URL}books/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      showSuccessToast("Book removed successfully");
      fetchBooks();
    } catch (error) {
      showErrorToast("Deletion failed");
    }
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      price: book.price,
      totalCopies: book.totalCopies,
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${Server_URL}books/update/${selectedBook._id}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      showSuccessToast("Inventory updated");
      setShowModal(false);
      fetchBooks();
    } catch (error) {
      showErrorToast("Update failed");
    }
  };

  // Compute stats
  const totalBooks = books.length;
  const availableBooks = books.filter(b => b.availableCopies > 0).length;
  const borrowedBooks = books.reduce((acc, curr) => acc + (curr.totalCopies - curr.availableCopies), 0);
  const categoriesCount = new Set(books.map(b => b.category)).size;

  return (
    <div className="inventory-container">
      {/* ── HERO HEADER ── */}
      <header className="inventory-hero">
        <div className="hero-title-container">
          <h1 className="hero-title">Library Inventory</h1>
          <p className="hero-subtitle">Explore and manage your entire collection of books</p>
        </div>
        
        <div className="hero-actions">
          <button className="btn-add-book" onClick={() => navigate('/admin/addbook')}>
            <Plus size={18} /> Add Book
          </button>
        </div>
      </header>

      {/* ── SEARCH & FILTER BAR ── */}
      <div className="toolbar-container">
        <div className="search-bar-wrapper">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by title, author, or ISBN..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} className="search-icon" />
          <button className="btn-ai-search">
            <Sparkles size={12} /> AI Search
          </button>
        </div>
        
        <select className="filter-dropdown">
          <option value="all">All Categories</option>
          <option value="fiction">Fiction</option>
          <option value="non-fiction">Non-Fiction</option>
          <option value="science">Science</option>
        </select>
        
        <select className="filter-dropdown">
          <option value="newest">Sort by: Newest</option>
          <option value="popular">Sort by: Popular</option>
          <option value="title">Sort by: Title</option>
        </select>
        
      </div>

      {/* ── STATS CARDS ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><BookOpen size={20} /></div>
          <div className="stat-info">
            <h4>Total Books</h4>
            <p>{totalBooks}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle2 size={20} /></div>
          <div className="stat-info">
            <h4>Available Books</h4>
            <p>{availableBooks}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><Layers size={20} /></div>
          <div className="stat-info">
            <h4>Borrowed Books</h4>
            <p>{borrowedBooks}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Tag size={20} /></div>
          <div className="stat-info">
            <h4>Categories</h4>
            <p>{categoriesCount}</p>
          </div>
        </div>
      </div>

      {/* ── BOOK GRID ── */}
      <div className="books-grid">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <div key={book._id} className="premium-book-card">
              <div className="pbc-glow-sweep"></div>
              
              {/* Main Split Layout */}
              <div className="pbc-main-content">
                
                {/* Left: Cover */}
                <div className="pbc-image-wrapper">
                  <img
                    src={book.coverImage || "https://images.unsplash.com/photo-1543005139-014524090bb0?w=800"}
                    alt={book.title}
                    className="pbc-image"
                  />
                  <div className="category-pill">{book.category}</div>
                </div>
                
                {/* Right: Details */}
                <div className="pbc-details">
                  <div>
                    <h3 className="pbc-title">{book.title}</h3>
                    <p className="pbc-author">by {book.author}</p>
                    
                    <div className="pbc-meta-compact">
                      <span><Hash size={10} /> {book.isbn}</span>
                      <span><IndianRupee size={10} /> {book.price}</span>
                    </div>

                    <div className="pbc-analytics-compact">
                      <span title="Views"><Eye size={10} /> 1.2k</span>
                      <span title="Rating"><Star size={10} /> 4.8</span>
                      <span title="Copies"><Book size={10} /> {book.totalCopies}</span>
                      <span title="Trending" style={{ color: '#00FFB2' }}><TrendingUp size={10} /></span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="pbc-status-compact">
                    {book.availableCopies > 0 ? (
                      <span className="status-badge available">
                        <span className="status-dot"></span> Available ({book.availableCopies})
                      </span>
                    ) : (
                      <span className="status-badge out-of-stock">
                        <span className="status-dot"></span> Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Row */}
              <div className="pbc-actions-row">
                <button className="premium-btn btn-edit" onClick={() => handleEdit(book)}>
                  <Edit3 size={14} /> Edit
                </button>
                <button className="premium-btn btn-delete" onClick={() => handleDelete(book._id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '6rem 0' }}>
             <AlertCircle size={48} style={{ color: '#6B7280', margin: '0 auto 1rem' }} />
             <h2 style={{ color: '#F3F4F6', fontSize: '1.5rem', marginBottom: '0.5rem' }}>No matches found</h2>
             <p style={{ color: '#9CA3AF' }}>Try refining your search terms or filters.</p>
          </div>
        )}
      </div>

      {/* ── EDIT MODAL ── */}
      {showModal && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 2000, 
          background: 'rgba(5, 8, 22, 0.8)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ 
            width: '100%', maxWidth: '650px', background: 'rgba(17, 24, 39, 0.95)',
            borderRadius: '24px', border: '1px solid rgba(138, 91, 255, 0.3)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 40px rgba(123, 47, 247, 0.2)',
            overflow: 'hidden' 
          }}>
            <div style={{ 
              padding: '2rem', background: 'linear-gradient(135deg, rgba(123, 47, 247, 0.15), rgba(0, 212, 255, 0.1))', 
              color: '#F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'rgba(123, 47, 247, 0.2)', padding: '10px', borderRadius: '12px' }}>
                  <Edit3 size={20} color="#8A5BFF" />
                </div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Update Inventory</h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: '8px' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '2.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}><Type size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Book Title</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}><User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Author</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                    value={formData.author} 
                    onChange={e => setFormData({...formData, author: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}><Tag size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Category</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}><Hash size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> ISBN</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                    value={formData.isbn} 
                    onChange={e => setFormData({...formData, isbn: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}><IndianRupee size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Price</label>
                  <input 
                    type="number" 
                    style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 600 }}><Layers size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} /> Copies</label>
                  <input 
                    type="number" 
                    style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none' }}
                    value={formData.totalCopies} 
                    onChange={e => setFormData({...formData, totalCopies: e.target.value})} 
                  />
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowModal(false)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.05)', color: '#F3F4F6', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                  Cancel
                </button>
                <button onClick={handleUpdate} style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #7B2FF7, #5D26FF)', color: '#ffffff', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 15px rgba(123, 47, 247, 0.4)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewBooks;