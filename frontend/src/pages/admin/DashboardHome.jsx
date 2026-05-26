import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { PlusCircle, BookOpen, UserPlus, FileText, CheckCircle2, Clock, AlertCircle, Activity, Users, TrendingUp, BookMarked, Wallet } from "lucide-react";
import "./AdminDashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

// Reusable Sparkline Component
const Sparkline = ({ data, color }) => {
  const chartData = {
    labels: ['1','2','3','4','5','6','7'],
    datasets: [{
      data,
      borderColor: color,
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0
    }]
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false, min: 0 } }
  };
  return <Line data={chartData} options={options} />;
};

const generateSparklineData = (val) => {
  if (!val || val === 0) return [0, 0, 0, 0, 0, 0, 0];
  if (val <= 3) return [0, 1, 0, 1, val - 1 > 0 ? val - 1 : 0, val, val];
  return [
    Math.round(val * 0.4),
    Math.round(val * 0.6),
    Math.round(val * 0.5),
    Math.round(val * 0.8),
    Math.round(val * 0.7),
    Math.round(val * 0.9),
    val
  ];
};

export default function DashboardHome() {
  const navigate = useNavigate();
  const context = useOutletContext();
  const [totalUser, setTotalUser] = useState(0);
  const [totalBooks, setTotalBooks] = useState(0);
  const [availableBooks, setAvailableBooks] = useState(0);
  const [categoryData, setCategoryData] = useState({
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#00E5FF', '#9D4EDD', '#FF4D9D', '#F59E0B', '#10B981'], borderWidth: 0, hoverOffset: 4 }],
  });
  const [occupancyPercent, setOccupancyPercent] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState(0);
  const [opStats, setOpStats] = useState({ overdueBooks: 0, unpaidFines: 0, pendingReturns: 0, pendingReservations: 0 });
  const [pendingIssuesCount, setPendingIssuesCount] = useState(0);
  const [activeLibrariansCount, setActiveLibrariansCount] = useState(0);
  const [recentIssuedBooks, setRecentIssuedBooks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const role = localStorage.getItem("role");
  const adminName = localStorage.getItem("name") || (role === "librarian" ? "Librarian" : "Administrator");

  useEffect(() => {
    const fetchData = async () => {
      try {
        let users = [];
        const userRes = await axios.get(Server_URL + "users");
        if (!userRes.data.error) {
          users = userRes.data.user || [];
          setTotalUser(users.filter((u) => u.role === "user").length);
          setActiveLibrariansCount(users.filter((u) => u.role === "librarian").length);
        }

        let totalCopiesFromBooks = 0;
        let totalAvailFromBooks = 0;
        let allBooks = [];
        const bookRes = await axios.get(Server_URL + "books");
        if (!bookRes.data.error && bookRes.data.books) {
          setTotalBooks(bookRes.data.totalBooks || 0);
          allBooks = bookRes.data.books || [];
          totalCopiesFromBooks = allBooks.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
          totalAvailFromBooks = allBooks.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
          setAvailableBooks(totalAvailFromBooks);

          const categoryCount = allBooks.reduce((acc, b) => {
            const cat = b?.category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
          }, {});

          setCategoryData({
            labels: Object.keys(categoryCount),
            datasets: [{
              data: Object.values(categoryCount),
              backgroundColor: ['#00E5FF', '#9D4EDD', '#FF4D9D', '#F59E0B', '#10B981'],
              borderWidth: 0,
              hoverOffset: 4
            }],
          });
        }

        const homeRes = await axios.get(Server_URL + "home");
        if (!homeRes.data.error) {
          const borrowed = homeRes.data.borrowedCount ?? homeRes.data.issuedCount ?? 0;
          const totalCopies = homeRes.data.totalCopies ?? totalCopiesFromBooks;
          setBorrowedBooks(borrowed);
          const percent = totalCopies
            ? Math.min(100, Math.round((borrowed / totalCopies) * 100))
            : 0;
          setOccupancyPercent(percent);
        }

        try {
          const statsRes = await axios.get(Server_URL + "admin/dashboard-stats", {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          if (!statsRes.data.error) {
            setOpStats(statsRes.data);
          }
        } catch (_) {}

        let issuedRequests = [];
        try {
          const issueRes = await axios.get(Server_URL + "librarian/issuerequest", {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          if (!issueRes.data.error && issueRes.data.requests) {
            setPendingIssuesCount(issueRes.data.requests.length);
          }
          
          const bookIssuedRes = await axios.get(Server_URL + "librarian/bookissued", {
            headers: { Authorization: `Bearer ${getAuthToken()}` },
          });
          if (!bookIssuedRes.data.error && bookIssuedRes.data.requests) {
            issuedRequests = bookIssuedRes.data.requests;
            const formatted = issuedRequests.slice(0, 5).map(req => ({
              id: req._id.substring(req._id.length - 6).toUpperCase(),
              student: req.userId?.name || "Unknown",
              book: req.bookId?.title || "Unknown",
              issueDate: req.issueDate ? new Date(req.issueDate).toISOString().split('T')[0] : "N/A",
              dueDate: req.dueDate ? new Date(req.dueDate).toISOString().split('T')[0] : "N/A",
              status: "Active"
            }));
            setRecentIssuedBooks(formatted);
          }
        } catch (_) {}

        // Build Activity Feed
        let activities = [];
        allBooks.slice(0, 3).forEach(b => {
          activities.push({ date: new Date(b.createdAt || Date.now()), text: `New book '${b.title}' added`, type: "add" });
        });
        users.filter(u => u.role === "user").slice(0, 2).forEach(u => {
          activities.push({ date: new Date(u.createdAt || Date.now()), text: `New member ${u.name} joined`, type: "user" });
        });
        issuedRequests.slice(0, 5).forEach(req => {
          activities.push({ date: new Date(req.issueDate || req.createdAt || Date.now()), text: `${req.userId?.name || 'Someone'} borrowed '${req.bookId?.title || 'a book'}'`, type: "borrow" });
        });
        
        activities.sort((a, b) => b.date - a.date);
        
        const formatTime = (d) => {
          const diff = Math.floor((new Date() - d) / 60000);
          if (diff < 60) return diff <= 0 ? "Just now" : `${diff} mins ago`;
          const hrs = Math.floor(diff / 60);
          if (hrs < 24) return `${hrs} hours ago`;
          return `${Math.floor(hrs/24)} days ago`;
        };

        setRecentActivity(activities.slice(0, 5).map((act, i) => {
          let IconComponent = PlusCircle;
          if (act.type === 'borrow') IconComponent = BookOpen;
          if (act.type === 'user') IconComponent = UserPlus;
          return {
            id: i,
            text: act.text,
            time: formatTime(act.date),
            type: act.type,
            icon: <IconComponent size={16} />
          };
        }));

      } catch (e) {
        console.error("Dashboard fetch error:", e);
      }
    };
    fetchData();
  }, []);

  // -- Realistic Mock Data & Charts --
  
  // 1. Borrow Activity (Vertical Bar)
  const barChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Borrow Activity',
      data: [120, 190, 150, 220, 180, 250],
      backgroundColor: '#00E5FF',
      borderRadius: 4,
      barThickness: 12,
    }]
  };
  const barOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8b8b9f', font: { size: 10 } } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b8b9f', font: { size: 10 } }, min: 0 }
    }
  };

  // 2. Members Growth (Smooth Line)
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      data: [30, 45, 60, 65, 80, 95],
      borderColor: '#00E5FF',
      backgroundColor: 'rgba(0, 229, 255, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0
    }]
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8b8b9f' } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b8b9f' }, min: 0 }
    }
  };

  // 3. Fine Analytics (Area)
  const fineAreaData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      data: [50, 20, 100, 40],
      borderColor: '#FF4D9D',
      backgroundColor: 'rgba(255, 77, 157, 0.2)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 0
    }]
  };

  // 4. Reservations (Stacked Area)
  const resStackedData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Active',
        data: [5, 10, 8, 15, 12],
        borderColor: '#9D4EDD',
        backgroundColor: 'rgba(157, 78, 221, 0.5)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      },
      {
        label: 'Completed',
        data: [2, 4, 3, 8, 5],
        borderColor: '#00E5FF',
        backgroundColor: 'rgba(0, 229, 255, 0.5)',
        fill: true,
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };
  const stackedOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8b8b9f' } },
      y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8b8b9f' }, min: 0 }
    }
  };

  // Calculations for Overdue Ring
  const totalBorrowed = borrowedBooks || 1; // avoid division by zero
  const overduePercent = Math.min(100, Math.round(((opStats?.overdueBooks || 0) / totalBorrowed) * 100)) || 0;

  return (
    <div className="admin-dashboard-container">
      
      {/* ── TOP SECTION ── */}
      <div className="dash-hero-grid">
        
        {/* Welcome Hero */}
        <div className="hero-card">
          <div className="hero-content">
            <div className="hero-header">
              <img src={context?.profile?.profilePicture || (role === "librarian" ? "https://ui-avatars.com/api/?name=Librarian&background=9D4EDD&color=fff" : "/admin-profile.png")} alt="Avatar" className="hero-avatar" onError={(e) => e.target.src='https://ui-avatars.com/api/?name=Admin&background=9D4EDD&color=fff'} />
              <div>
                <span className="hero-sub">Welcome back</span>
                <h2 className="hero-name">{adminName}!</h2>
              </div>
            </div>
            <div className="hero-stats">
              <div className="h-stat">
                <span className="hs-val">{Number(totalBooks || 0).toLocaleString()}</span>
                <span className="hs-lbl">Total Books</span>
              </div>
              <div className="h-stat">
                <span className="hs-val">{Number(availableBooks || 0).toLocaleString()}</span>
                <span className="hs-lbl">Available</span>
              </div>
              <div className="h-stat">
                <span className="hs-val">{Number(occupancyPercent || 0)}%</span>
                <span className="hs-lbl">Borrow Rate</span>
              </div>
            </div>
          </div>
          <div className="hero-illustration">
            <div className="glowing-shape shape-purple"></div>
            <div className="glowing-shape shape-cyan"></div>
            <BookMarked size={70} className="hero-icon" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-action-card">
          <h3 className="section-title">Quick Actions</h3>
          <div className="qa-grid-new">
            <button className="qa-btn-new" onClick={() => navigate('/admin/addbook')}><PlusCircle size={18} className="icon-cyan"/> Add Book</button>
            <button className="qa-btn-new" onClick={() => navigate('/admin/issuerequest')}><CheckCircle2 size={18} className="icon-pink"/> Issue Book</button>
            <button className="qa-btn-new" onClick={() => navigate('/admin/members')}><UserPlus size={18} className="icon-purple"/> Manage Member</button>
            <button className="qa-btn-new" onClick={() => navigate('/admin/addlibrarian')}><Users size={18} className="icon-orange"/> Add Librarian</button>
            <button className="qa-btn-new" onClick={() => navigate('/admin/reports')}><FileText size={18} className="icon-green"/> Report</button>
          </div>
        </div>

      </div>

      {/* ── SPARKLINE SUMMARY CARDS ── */}
      <div className="sparkline-grid">
        <div className="spark-card">
          <div className="sc-header">
            <div className="sc-info">
              <span className="sc-lbl">Pending Issues</span>
              <h4 className="sc-val">{Number(pendingIssuesCount || 0)}</h4>
            </div>
            <div className="sc-icon bg-cyan-soft"><Clock size={16} className="icon-cyan"/></div>
          </div>
          <div className="sc-chart"><Sparkline data={generateSparklineData(Number(pendingIssuesCount || 0))} color="#00E5FF" /></div>
        </div>

        <div className="spark-card">
          <div className="sc-header">
            <div className="sc-info">
              <span className="sc-lbl">Return Requests</span>
              <h4 className="sc-val">{Number(opStats?.pendingReturns || 0)}</h4>
            </div>
            <div className="sc-icon bg-pink-soft"><AlertCircle size={16} className="icon-pink"/></div>
          </div>
          <div className="sc-chart"><Sparkline data={generateSparklineData(Number(opStats?.pendingReturns || 0))} color="#FF4D9D" /></div>
        </div>

        <div className="spark-card">
          <div className="sc-header">
            <div className="sc-info">
              <span className="sc-lbl">Total Members</span>
              <h4 className="sc-val">{Number(totalUser || 0)}</h4>
            </div>
            <div className="sc-icon bg-purple-soft"><Users size={16} className="icon-purple"/></div>
          </div>
          <div className="sc-chart"><Sparkline data={generateSparklineData(Number(totalUser || 0))} color="#9D4EDD" /></div>
        </div>

        <div className="spark-card">
          <div className="sc-header">
            <div className="sc-info">
              <span className="sc-lbl">Total Books</span>
              <h4 className="sc-val">{Number(totalBooks || 0)}</h4>
            </div>
            <div className="sc-icon bg-orange-soft"><BookOpen size={16} className="icon-orange"/></div>
          </div>
          <div className="sc-chart"><Sparkline data={generateSparklineData(Number(totalBooks || 0))} color="#F59E0B" /></div>
        </div>

        <div className="spark-card">
          <div className="sc-header">
            <div className="sc-info">
              <span className="sc-lbl">Active Librarians</span>
              <h4 className="sc-val">{Number(activeLibrariansCount || 0)}</h4>
            </div>
            <div className="sc-icon bg-green-soft"><UserPlus size={16} className="icon-green"/></div>
          </div>
          <div className="sc-chart"><Sparkline data={generateSparklineData(Number(activeLibrariansCount || 0))} color="#10B981" /></div>
        </div>

        <div className="spark-card">
          <div className="sc-header">
            <div className="sc-info">
              <span className="sc-lbl">Issued Books</span>
              <h4 className="sc-val">{Number(borrowedBooks || 0)}</h4>
            </div>
            <div className="sc-icon bg-cyan-soft"><BookOpen size={16} className="icon-cyan"/></div>
          </div>
          <div className="sc-chart"><Sparkline data={generateSparklineData(Number(borrowedBooks || 0))} color="#00E5FF" /></div>
        </div>
      </div>

      {/* ── MIDDLE 6 CORE GRAPHS ── */}
      <div className="core-charts-grid">
        
        {/* 1. Borrow Activity */}
        <div className="graph-panel">
          <h3 className="panel-title">Borrow Activity</h3>
          <div className="graph-wrapper"><Bar data={barChartData} options={barOptions} /></div>
        </div>

        {/* 2. Book Categories */}
        <div className="graph-panel">
          <h3 className="panel-title">Book Categories</h3>
          <div className="graph-wrapper donut-wrapper">
            <Doughnut data={categoryData} options={{ cutout: '75%', responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#F3F4FF' } } } }} />
          </div>
        </div>

        {/* 3. Members Growth */}
        <div className="graph-panel">
          <h3 className="panel-title">Members Growth</h3>
          <div className="graph-wrapper"><Line data={lineChartData} options={lineOptions} /></div>
        </div>

        {/* 4. Fine Analytics */}
        <div className="graph-panel">
          <h3 className="panel-title">Fine Analytics</h3>
          <div className="graph-wrapper"><Line data={fineAreaData} options={lineOptions} /></div>
        </div>

        {/* 5. Reservations */}
        <div className="graph-panel">
          <h3 className="panel-title">Reservations</h3>
          <div className="graph-wrapper"><Line data={resStackedData} options={stackedOptions} /></div>
        </div>

        {/* 6. Overdue Books (Radial Ring) */}
        <div className="graph-panel radial-panel">
          <h3 className="panel-title">Overdue Books</h3>
          <div className="radial-wrapper">
            <svg viewBox="0 0 100 100" className="radial-svg">
              <circle cx="50" cy="50" r="40" className="radial-bg" />
              <circle cx="50" cy="50" r="40" className="radial-fill" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * overduePercent) / 100} />
            </svg>
            <div className="radial-center">
              <span className="rc-val">{Number(opStats?.overdueBooks || 0)}</span>
              <span className="rc-lbl">Overdue</span>
            </div>
          </div>
          <div className="radial-footer">
            <span>{Number(overduePercent || 0)}% of all borrowed books are overdue.</span>
          </div>
        </div>

      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="bottom-workflow-grid">
        
        {/* Table */}
        <div className="graph-panel table-panel">
          <div className="panel-header-flex">
            <h3 className="panel-title">Recent Issued Books</h3>
            <button className="glass-btn" onClick={() => navigate('/admin/issued')}>View All</button>
          </div>
          <div className="table-responsive">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Book Title</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentIssuedBooks.map((row, i) => (
                  <tr key={i}>
                    <td>{row.student}</td>
                    <td className="text-highlight">{row.book}</td>
                    <td className="text-dim">{row.issueDate}</td>
                    <td className="text-dim">{row.dueDate}</td>
                    <td>
                      <span className={`pill-badge ${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="graph-panel feed-panel">
          <h3 className="panel-title">Live Activity Feed</h3>
          <div className="feed-timeline">
            {recentActivity.map((act) => (
              <div className="feed-item" key={act.id}>
                <div className={`feed-icon ${act.type}`}>{act.icon}</div>
                <div className="feed-content">
                  <p>{act.text}</p>
                  <span>{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
