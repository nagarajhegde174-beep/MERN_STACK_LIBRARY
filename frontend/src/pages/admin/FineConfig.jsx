import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Settings, 
  IndianRupee, 
  Calendar, 
  ShieldAlert, 
  Save, 
  Info,
  CheckCircle2,
  Zap,
  AlertCircle
} from "lucide-react";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { showSuccessToast, showErrorToast } from "../../utils/toasthelper";
import "./fineconfig.css"; // Using the new premium CSS file

function FineConfig() {
  const [config, setConfig]   = useState({ ratePerDay: 5, maxFineCap: 500, gracePeriod: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const role = localStorage.getItem("role");
  const canEdit = role === "admin" || role === "librarian";

  const headers = { Authorization: `Bearer ${getAuthToken()}` };

  const fetchConfig = async () => {
    try {
      const res = await axios.get(`${Server_URL}admin/fine-config`, { headers });
      setConfig(res.data.config);
    } catch { showErrorToast("Failed to load fine config"); }
    finally { setLoading(false); }
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      showErrorToast("You do not have permission to update fine settings.");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put(`${Server_URL}admin/fine-config`, config, { headers });
      showSuccessToast(res.data.message);
      setConfig(res.data.config);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  useEffect(() => { fetchConfig(); }, []);

  // Calculate sample fine for 10 days late
  const sampleOverdueDays = 10;
  const billableDays = Math.max(0, sampleOverdueDays - config.gracePeriod);
  const sampleFine = Math.min(config.ratePerDay * billableDays, config.maxFineCap);

  return (
    <div className="fc-page-wrapper">
      <div className="fc-content">
        
        {/* HERO HEADER */}
        <header className="fc-header">
          <div className="fc-badge">
             <Settings size={14} /> Configuration
          </div>
          <h1 className="fc-title">System Rules & Fines</h1>
          <p className="fc-subtitle">Global configuration for overdue books, grace periods, and maximum penalty caps.</p>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
             <div className="fc-spinner" />
          </div>
        ) : (
          
          <div className="fc-grid">
            {/* LEFT COLUMN: Config Form */}
            <div className="fc-glass-card">
              <div className="fc-card-header">
                <div className="fc-card-icon">
                  <Settings size={20} />
                </div>
                <h2 className="fc-card-title">Fine Rules Configuration</h2>
              </div>
              
              <form onSubmit={saveConfig}>
                
                {/* Fine Rate */}
                <div className="fc-form-group">
                  <label className="fc-label">
                    <IndianRupee size={16} /> Fine Rate (₹ per day)
                  </label>
                  <div className="fc-input-wrapper">
                    <input
                      type="number" min="0" step="0.5"
                      className="fc-input"
                      value={config.ratePerDay}
                      onChange={e => setConfig({ ...config, ratePerDay: Number(e.target.value) })}
                      disabled={!canEdit}
                      required
                    />
                  </div>
                  <p className="fc-helper">Amount charged for every day a book is kept past its due date.</p>
                </div>

                {/* Max Cap */}
                <div className="fc-form-group">
                  <label className="fc-label">
                    <ShieldAlert size={16} /> Maximum Fine Cap (₹)
                  </label>
                  <div className="fc-input-wrapper">
                    <input
                      type="number" min="0"
                      className="fc-input"
                      value={config.maxFineCap}
                      onChange={e => setConfig({ ...config, maxFineCap: Number(e.target.value) })}
                      disabled={!canEdit}
                      required
                    />
                  </div>
                  <p className="fc-helper">The absolute highest possible fine amount per book.</p>
                </div>

                {/* Grace Period */}
                <div className="fc-form-group">
                  <label className="fc-label">
                    <Calendar size={16} /> Grace Period (Days)
                  </label>
                  <div className="fc-input-wrapper">
                    <input
                      type="number" min="0"
                      className="fc-input"
                      value={config.gracePeriod}
                      onChange={e => setConfig({ ...config, gracePeriod: Number(e.target.value) })}
                      disabled={!canEdit}
                      required
                    />
                  </div>
                  <p className="fc-helper">Allowed delay after the due date before fines begin to accrue.</p>
                </div>

                {/* Action Area */}
                {canEdit ? (
                  <button type="submit" className="fc-save-btn" disabled={saving}>
                    {saving ? (
                      <><div className="fc-spinner" /> Saving Changes...</>
                    ) : (
                      <><Save size={18} /> Save Configuration</>
                    )}
                  </button>
                ) : (
                  <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <p className="fc-helper" style={{ margin: 0, justifyContent: 'center' }}>
                      <AlertCircle size={14} /> Fine rules are view-only for your role.
                    </p>
                  </div>
                )}
              </form>
            </div>


            {/* RIGHT COLUMN: Logic Previews */}
            <div>
              <div className="fc-glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
                <div className="fc-card-header" style={{ marginBottom: '20px' }}>
                  <div className="fc-card-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa', borderColor: 'rgba(139,92,246,0.2)' }}>
                    <Zap size={20} />
                  </div>
                  <h2 className="fc-card-title">Live Logic Preview</h2>
                </div>
                
                <div className="fc-mini-cards">
                  
                  <div className="fc-mini-card">
                    <div className="fc-mini-icon fc-icon-rate"><IndianRupee size={24} /></div>
                    <div className="fc-mini-info">
                      <span className="fc-mini-title">Active Rate</span>
                      <span className="fc-mini-value">₹{config.ratePerDay} / day</span>
                    </div>
                  </div>

                  <div className="fc-mini-card">
                    <div className="fc-mini-icon fc-icon-cap"><ShieldAlert size={24} /></div>
                    <div className="fc-mini-info">
                      <span className="fc-mini-title">Ceiling Limit</span>
                      <span className="fc-mini-value">Max ₹{config.maxFineCap}</span>
                    </div>
                  </div>

                  <div className="fc-mini-card">
                    <div className="fc-mini-icon fc-icon-grace"><Calendar size={24} /></div>
                    <div className="fc-mini-info">
                      <span className="fc-mini-title">Grace Period</span>
                      <span className="fc-mini-value">{config.gracePeriod} Days Free</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Sample Calculation Card */}
              <div className="fc-calc-card">
                <IndianRupee className="fc-calc-bg-icon" size={150} />
                <div className="fc-calc-label"><Info size={14} /> Sample Scenario</div>
                
                <div className="fc-calc-scenario">
                  If a book is returned <strong>10 days</strong> late:
                </div>
                
                <div className="fc-calc-result">
                  <CheckCircle2 size={32} color="var(--fc-accent-emerald)" /> 
                  ₹{sampleFine}
                </div>
                
                <div className="fc-calc-formula">
                  ({config.ratePerDay} × (10 - {config.gracePeriod})) capped @ ₹{config.maxFineCap}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FineConfig;