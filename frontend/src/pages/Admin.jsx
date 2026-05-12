import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { localTokenService as tokenService } from '../services/localTokenService';
import authService from '../appwrite/auth';
import appLogo from '../assets/Screenshot 2026-04-14 142037.png';

const SERVICE_TYPES = [
  { value: "form_submission", label: "Form Submission" },
  { value: "document_verification", label: "Document Verification" },
  { value: "fee_payment", label: "Fee Payment" },
  { value: "id_card", label: "ID Card" },
  { value: "transcript_request", label: "Transcript Request" },
];

const COUNTERS = ["Counter 1", "Counter 2", "Counter 3", "Counter 4"];

const STATUS_META = {
  pending: { label: "Pending", color: "#92400e", bg: "#fef3c7" },
  calling: { label: "Calling", color: "#1e40af", bg: "#dbeafe" },
  serving: { label: "Serving", color: "#166534", bg: "#dcfce7" },
  done: { label: "Done", color: "#6b7280", bg: "#f3f4f6" },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const serviceLabel = (val) =>
  SERVICE_TYPES.find((s) => s.value === val)?.label ?? val;

// ── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        padding: "3px 9px",
        borderRadius: 99,
        color: meta.color,
        background: meta.bg,
      }}
    >
      {meta.label}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        background: accent ?? "var(--color-background-secondary, #f8f8f7)",
        borderRadius: 10,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ fontSize: 12, color: "#888", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 600, color: "#111", lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}

function TokenRow({ token, isOwn, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [callTime, setCallTime] = useState(token.callTime || "");

  const handleTimeChange = (e) => {
    const val = e.target.value;
    setCallTime(val);
    if (token.status === "calling") {
      onStatusChange(token.id, "calling", token.counter, { callTime: val });
    }
  };

  return (
    <div
      style={{
        border: isOwn ? "1.5px solid #111" : "1px solid #e5e5e5",
        borderRadius: 10,
        overflow: "hidden",
        transition: "box-shadow 0.15s",
      }}
    >
      {/* Header row */}
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 14px",
          cursor: "pointer",
          background: isOwn ? "#fafafa" : "transparent",
          userSelect: "none",
        }}
      >
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 26,
            fontWeight: 600,
            minWidth: 52,
            color: "#111",
          }}
        >
          #{token.tokenNumber}
        </div>

        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {token.studentName}
            {isOwn && (
              <span style={{ marginLeft: 6, fontSize: 11, color: "#888", fontWeight: 400 }}>(you)</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {serviceLabel(token.serviceType)}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <StatusBadge status={token.status} />
          {token.estimatedWait != null && token.status === "pending" && (
            <span style={{ fontSize: 11, color: "#aaa" }}>~{token.estimatedWait} min</span>
          )}
          {token.counter && token.status !== "pending" && (
            <span style={{ fontSize: 11, color: "#aaa" }}>{token.counter}</span>
          )}
        </div>

        <div style={{ fontSize: 16, color: "#bbb", marginLeft: 4 }}>{open ? "▲" : "▼"}</div>
      </div>

      {/* Expanded detail */}
      {open && (
        <div
          style={{
            borderTop: "1px solid #f0f0f0",
            padding: "12px 14px",
            background: "#fafafa",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
            <div>
              <div style={{ color: "#aaa", marginBottom: 2 }}>Token ID</div>
              <div style={{ fontFamily: "'DM Mono', monospace", color: "#555", fontSize: 12 }}>{token.id}</div>
            </div>
            <div>
              <div style={{ color: "#aaa", marginBottom: 2 }}>Requested at</div>
              <div style={{ color: "#555" }}>{formatTime(token.createdAt)}</div>
            </div>
          </div>

          {/* Admin controls */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingTop: 4 }}>
            {["pending", "calling", "serving", "done"].map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(token.id, s)}
                disabled={token.status === s}
                style={{
                  fontSize: 12,
                  padding: "5px 12px",
                  borderRadius: 6,
                  border: "1px solid #e0e0e0",
                  background: token.status === s ? "#111" : "white",
                  color: token.status === s ? "white" : "#555",
                  cursor: token.status === s ? "default" : "pointer",
                  fontFamily: "inherit",
                  fontWeight: 500,
                }}
              >
                {STATUS_META[s].label}
              </button>
            ))}
            {["calling", "serving"].includes(token.status) && (
              <select
                defaultValue={token.counter ?? ""}
                onChange={(e) => onStatusChange(token.id, token.status, e.target.value, { callTime })}
                style={{
                  fontSize: 12,
                  padding: "5px 10px",
                  borderRadius: 6,
                  border: "1px solid #e0e0e0",
                  background: "white",
                  color: "#555",
                  fontFamily: "inherit",
                }}
              >
                <option value="">Assign counter…</option>
                {COUNTERS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
            
            {token.status === "calling" && (
               <input 
                  type="time" 
                  value={callTime}
                  onChange={handleTimeChange}
                  placeholder="Arrival time"
                  style={{
                    fontSize: 12,
                    padding: "5px 10px",
                    borderRadius: 6,
                    border: "1px solid #e0e0e0",
                    background: "white",
                    color: "#555",
                    fontFamily: "inherit",
                  }}
               />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RequestForm({ onSubmit }) {
  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!name.trim() || !service) return;
    setLoading(true);
    try {
      const id = "student-" + Math.random().toString(36).substr(2, 6);
      const token = await tokenService.requestToken(id, name.trim(), service);
      setResult(token.id);
      onSubmit?.({ name, service, tokenId: token.id });
      setName("");
      setService("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontSize: 12, color: "#888", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
          Student Name
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          style={{
            width: "100%",
            fontSize: 14,
            padding: "9px 12px",
            borderRadius: 8,
            border: "1px solid #e0e0e0",
            fontFamily: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: 12, color: "#888", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
          Service Type
        </div>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          style={{
            width: "100%",
            fontSize: 14,
            padding: "9px 12px",
            borderRadius: 8,
            border: "1px solid #e0e0e0",
            fontFamily: "inherit",
            background: "white",
            boxSizing: "border-box",
          }}
        >
          <option value="">Select a service…</option>
          {SERVICE_TYPES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!name.trim() || !service || loading}
        style={{
          marginTop: 4,
          padding: "11px 0",
          borderRadius: 8,
          border: "none",
          background: !name.trim() || !service || loading ? "#e5e5e5" : "linear-gradient(to right, #0d9488, #2563eb)",
          color: !name.trim() || !service || loading ? "#aaa" : "white",
          fontSize: 14,
          fontWeight: 600,
          cursor: !name.trim() || !service || loading ? "default" : "pointer",
          fontFamily: "inherit",
          letterSpacing: "0.02em",
          transition: "all 0.3s ease",
          boxShadow: !name.trim() || !service || loading ? "none" : "0 4px 14px 0 rgba(13, 148, 136, 0.39)",
        }}
      >
        {loading ? "Requesting…" : "Request Token"}
      </button>

      {result && (
        <div
          style={{
            fontSize: 13,
            color: "#166534",
            background: "#dcfce7",
            borderRadius: 8,
            padding: "9px 12px",
            textAlign: "center",
          }}
        >
          Token issued — ID: <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{result}</span>
        </div>
      )}
    </div>
  );
}

function SeasonalTokensChart({ tokens }) {
  const [hovered, setHovered] = useState(null);

  const monthlyData = {};
  const serviceCounts = {};

  tokens.forEach(t => {
    // For patterns:
    if (t.serviceType) {
      serviceCounts[t.serviceType] = (serviceCounts[t.serviceType] || 0) + 1;
    }

    // For chart:
    if (!t.createdAt) return;
    const date = new Date(t.createdAt);
    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
  });

  const chartData = Object.entries(monthlyData).map(([label, count]) => ({ label, count }));
  chartData.sort((a, b) => new Date("01 " + a.label) - new Date("01 " + b.label));

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // Prepare Donut Chart Data
  const donutColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1"];
  const totalServices = Object.values(serviceCounts).reduce((a, b) => a + b, 0);

  let currentAngle = 0;
  const donutStops = [];
  const legendItems = [];

  Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1]) // highest first
    .forEach(([service, count], idx) => {
      const percentage = totalServices === 0 ? 0 : (count / totalServices) * 100;
      const color = donutColors[idx % donutColors.length];
      donutStops.push(`${color} ${currentAngle}% ${currentAngle + percentage}%`);
      currentAngle += percentage;
      legendItems.push({ service, count, percentage, color });
    });

  const donutGradient = donutStops.length > 0 ? `conic-gradient(${donutStops.join(", ")})` : `conic-gradient(#e5e5e5 0% 100%)`;

  if (chartData.length === 0) return (
    <div style={{ marginBottom: "2rem", background: "white", padding: "1.5rem", borderRadius: 14, border: "1px solid #e5e5e5", textAlign: "center", color: "#888", fontSize: 13 }}>
      No seasonal data available yet.
    </div>
  );

  return (
    <div style={{ marginBottom: "2rem", background: "white", padding: "1.5rem", borderRadius: 14, border: "1px solid #e5e5e5" }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#111", letterSpacing: "0.02em", marginBottom: "1.25rem" }}>
        Seasonal Analysis & Patterns
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "flex-end" }}>

        {/* Chart Side */}
        <div style={{ flex: "2 1 300px", display: "flex", gap: "12px", alignItems: "flex-end", height: "140px", overflowX: "auto", paddingBottom: "10px" }}>
          {chartData.map(item => {
            const heightPercent = `${(item.count / maxCount) * 100}%`;
            const isHovered = hovered === item.label;
            return (
              <div
                key={item.label}
                onMouseEnter={() => setHovered(item.label)}
                onMouseLeave={() => setHovered(null)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: "50px", flex: 1, gap: 8, cursor: "pointer" }}
              >
                <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%', position: "relative" }}>
                  {isHovered && (
                    <div style={{ position: "absolute", top: "-28px", background: "#111", color: "white", fontSize: 11, padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap", zIndex: 10 }}>
                      {item.count} request{item.count > 1 ? 's' : ''}
                    </div>
                  )}
                  <div style={{
                    width: 'min(100%, 45px)',
                    height: heightPercent,
                    backgroundColor: isHovered ? '#111' : '#e5e5e5',
                    borderRadius: '8px 8px 0 0',
                    minHeight: '4px',
                    transition: 'all 0.2s ease',
                  }}></div>
                </div>
                <span style={{ fontSize: 11, color: isHovered ? '#111' : '#888', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Service Analysis Donut Chart */}
        <div style={{ flex: "1 1 250px", padding: "1.25rem", borderRadius: "10px", background: "#f9f9f8", border: "1px dashed #e0e0e0", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            Service Analysis
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Doughnut */}
            <div style={{
              width: "84px", height: "84px", borderRadius: "50%",
              background: donutGradient, position: "relative", flexShrink: 0
            }}>
              <div style={{
                position: "absolute", inset: "25%", background: "#f9f9f8", borderRadius: "50%",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ fontSize: 13, fontWeight: "bold", color: "#111", lineHeight: 1 }}>{totalServices}</span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, overflowY: "auto", maxHeight: "100px", paddingRight: "4px" }}>
              {legendItems.length === 0 && <span style={{ fontSize: 11, color: "#888" }}>No data yet</span>}
              {legendItems.map(item => (
                <div key={item.service} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: 11, color: "#555", cursor: "default" }} title={`${item.service}: ${item.count} requests`}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color, flexShrink: 0 }}></div>
                  <div style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.service}
                  </div>
                  <div style={{ fontWeight: 600, color: "#111" }}>{Math.round(item.percentage)}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function TokenQueueSystem() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tokens, setTokens] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [adminName, setAdminName] = useState("Admin User");
  const [profilePhoto, setProfilePhoto] = useState(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePhoto(url);
    }
  };

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      if (user) {
        setAdminName(user.name || user.email.split('@')[0] || "Admin User");
        if (user.profileImage) {
          setProfilePhoto(user.profileImage.startsWith('http') ? user.profileImage : `/temp/${user.profileImage}`);
        }
      }
    });

    const unsub = tokenService.subscribeToTokens(setTokens);
    return unsub;
  }, []);

  const handleStatusChange = useCallback(async (tokenId, status, counter, extraData = {}) => {
    await tokenService.updateTokenStatus(tokenId, status, counter, extraData);
  }, []);

  const handleNewToken = useCallback(({ name, service }) => {
    // The subscription will automatically pick up the new token
  }, []);

  const displayed = tokens.filter((t) => {
    const matchFilter = filter === "all" || t.status === filter;
    const matchSearch =
      !search ||
      t.studentName.toLowerCase().includes(search.toLowerCase()) ||
      String(t.tokenNumber).includes(search);
    return matchFilter && matchSearch;
  });

  const counts = {
    total: tokens.length,
    pending: tokens.filter((t) => t.status === "pending").length,
    active: tokens.filter((t) => ["calling", "serving"].includes(t.status)).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900/80 via-cyan-900/80 to-blue-900/80 font-sans w-full flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 px-6 py-3 flex justify-between items-center shadow-lg relative z-10 w-full mb-8">
        <div className="flex items-center gap-2">
          <div className="text-black w-8 h-8 flex items-center justify-center">
            <img src={appLogo} alt="Logo" className="w-[120%] h-[120%] min-w-[32px] object-contain" />
          </div>
          <span className="font-bold text-xl text-black tracking-tight ml-1">E-Token</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="text-sm font-semibold text-gray-800 leading-tight text-right w-36 px-1 truncate">
              {adminName}
            </div>
            <span className="text-[10px] font-bold text-gray-100 bg-[#111] px-2 rounded-full mt-0.5 tracking-wide">ADMIN</span>
          </div>

          {/* Profile Photo Upload */}
          <label className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden border border-blue-200 cursor-pointer relative group" title="Upload Profile Photo">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl pt-1">👨‍💼</span>
            )}
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </label>

          <button
            onClick={() => navigate('/token')}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            title="Go to Token Landing Page"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
            </svg>

          </button>
        </div>
      </header>

      <div style={{ flex: 1, width: '100%', padding: '0 1rem 2rem' }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>

          {/* Page header */}
          <div style={{ marginBottom: "2rem" }}>
            <h1 style={{ fontSize: 32, fontWeight: 700, color: "white", margin: 0, textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
              College Management
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
              Student services · Live token tracker
            </p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12, marginBottom: "1.5rem" }}>
            <StatCard label="Total tokens" value={counts.total} />
            <StatCard label="In queue" value={counts.pending} accent="#fef9ec" />
            <StatCard label="Being served" value={counts.active} accent="#f0fdf4" />
          </div>

          {/* Seasonal / Monthly Analysis */}
          <SeasonalTokensChart tokens={tokens} />

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, alignItems: "start" }}>

            {/* Left — queue list */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e5e5",
                borderRadius: 14,
                padding: "1.25rem",
              }}
            >
              {/* Toolbar */}
              <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
                <input
                  type="text"
                  placeholder="Search name or token…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: 140,
                    fontSize: 13,
                    padding: "7px 11px",
                    borderRadius: 7,
                    border: "1px solid #e0e0e0",
                    fontFamily: "inherit",
                  }}
                />
                {["all", "pending", "calling", "serving", "done"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      padding: "7px 13px",
                      borderRadius: 7,
                      border: "1px solid " + (filter === f ? "#111" : "#e0e0e0"),
                      background: filter === f ? "#111" : "white",
                      color: filter === f ? "white" : "#555",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textTransform: "capitalize",
                      transition: "all 0.12s",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Token rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {displayed.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2.5rem 0", color: "#bbb", fontSize: 14 }}>
                    No tokens found
                  </div>
                ) : (
                  displayed
                    .sort((a, b) => a.tokenNumber - b.tokenNumber)
                    .map((t) => (
                      <TokenRow
                        key={t.id}
                        token={t}
                        isOwn={t.studentId === "mock-user-id"}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                )}
              </div>
            </div>

            {/* Right — request form */}
            <div
              style={{
                background: "white",
                border: "1px solid #e5e5e5",
                borderRadius: 14,
                padding: "1.25rem",
                position: "sticky",
                top: "1rem",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111", letterSpacing: "0.02em", marginBottom: "1rem" }}>
                Request a token
              </div>
              <RequestForm onSubmit={handleNewToken} />

              {/* Counter status */}
              <div style={{ marginTop: "1.5rem" }}>
                <div style={{ fontSize: 12, color: "#aaa", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
                  Counters
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {COUNTERS.map((c) => {
                    const serving = tokens.find(
                      (t) => t.counter === c && t.status === "serving"
                    );
                    return (
                      <div
                        key={c}
                        style={{
                          padding: "9px 10px",
                          borderRadius: 8,
                          background: serving ? "#f0fdf4" : "#f9f9f8",
                          border: "1px solid " + (serving ? "#bbf7d0" : "#efefef"),
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {c}
                        </div>
                        {serving ? (
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#166534", marginTop: 2 }}>
                            #{serving.tokenNumber}
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: "#ccc", marginTop: 2 }}>Open</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
