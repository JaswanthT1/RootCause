 
import { useState } from "react";
import "./App.css";

function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeSection, setActiveSection] = useState("Overview");

  async function analyzeLogs() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/analyze`
);

      if (!response.ok) {
        throw new Error("The server returned an error.");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch {
      setError(
        "Could not connect to RootCause. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  
async function uploadAndAnalyze() {
  if (!selectedFile) {
    setError("Please select a .log or .txt file first.");
    return;
  }

  setLoading(true);
  setError("");
  setAnalysis(null);

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

   const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/analyze-upload`,
  {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "File analysis failed.");
    }

    setAnalysis(data);
  } catch (err) {
    setError(
      err.message || "Could not connect to the RootCause backend."
    );
  } finally {
    setLoading(false);
  }
}

  const incident = analysis?.incidents?.[0];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">R</span>
          <span>RootCause</span>
        </div>

        <p className="nav-label">WORKSPACE</p>
    
<button
  className={`nav-item ${activeSection === "Overview" ? "active" : ""}`}
  onClick={() => {
    setActiveSection("Overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
>
  ◈ &nbsp; Overview
</button>

<button
  className={`nav-item ${activeSection === "Log analysis" ? "active" : ""}`}
  onClick={() => {
    setActiveSection("Log analysis");
    document.querySelector(".welcome")?.scrollIntoView({ behavior: "smooth" });
  }}
>
  ⌁ &nbsp; Log analysis
</button>

<button
  className={`nav-item ${activeSection === "Incidents" ? "active" : ""}`}
  onClick={() => {
    setActiveSection("Incidents");
    document.querySelector(".panel")?.scrollIntoView({ behavior: "smooth" });
  }}
>
  ◎ &nbsp; Incidents
</button>



        <div className="sidebar-bottom">
          <span className="status-dot" />
          Local environment
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">OBSERVABILITY / OVERVIEW</p>
            <h1>Incident dashboard</h1>
          </div>
          <span className="connection">
            <span className="status-dot" /> API workspace
          </span>
        </header>

        <section className="welcome">
          <div>
            <p className="eyebrow">LOG INTELLIGENCE</p>
            <h2>Find the cause. Fix the issue.</h2>
            <p>
              Analyze application logs, detect incidents, and discover
              probable root causes.
            </p>
          </div>
         
<div className="upload-controls">
  <label className="file-picker">
    <span>{selectedFile ? selectedFile.name : "Choose a .log or .txt file"}</span>
    <input
      type="file"
      accept=".log,.txt,text/plain"
      onChange={(event) =>
        setSelectedFile(event.target.files?.[0] ?? null)
      }
    />
  </label>

<button
  onClick={uploadAndAnalyze}
  disabled={loading}
>
  {loading ? "Analyzing..." : "Upload & Analyze"}
</button>

  <button onClick={analyzeLogs} disabled={loading}>
    {loading ? "Analyzing..." : "Analyze sample logs"}
  </button>
</div>
        </section>

        {error && <div className="error-message">{error}</div>}

        <section className="metrics">
          <div className="metric-card">
            <p>Total events</p>
            <strong>{analysis?.total_events ?? "—"}</strong>
            <span>Parsed log entries</span>
          </div>
          <div className="metric-card">
            <p>Errors detected</p>
            <strong>{analysis?.error_count ?? "—"}</strong>
            <span>Events marked ERROR</span>
          </div>
          <div className="metric-card">
            <p>Incidents</p>
            <strong>{analysis?.incidents?.length ?? "—"}</strong>
            <span>Detected groups</span>
          </div>
          <div className="metric-card">
            <p>Highest severity</p>
            <strong className="severity-text">
              {incident?.severity ?? "—"}
            </strong>
            <span>Based on current rules</span>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Detected incidents</h3>
              <p>Probable causes and recommended investigation steps</p>
            </div>
            {incident && (
              <span className="severity-badge">{incident.severity}</span>
            )}
          </div>

          
        {!analysis ? (
          <div className="empty-state">
            <div className="empty-icon">⌕</div>
            <h3>No analysis loaded</h3>
            <p>Run an analysis to inspect your application logs.</p>
          </div>
        ) : !incident ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>
            <h3>No incidents detected</h3>
            <p>
              No incidents were detected in the analyzed logs.
              Your application appears healthy based on the available log entries.
            </p>
          </div>
        ) : (

            <div className="incident-content">
              <p className="incident-id">{incident.incident_id}</p>
              <h2>{incident.probable_root_cause}</h2>
              <p className="muted">
                {incident.error_count} related errors detected
              </p>

              <h4>Related errors</h4>
              <div className="error-list">
                {incident.related_errors.map((item, index) => (
                  <div className="log-row" key={`${item.line}-${index}`}>
                    <span className="error-tag">{item.level}</span>
                    <span>{item.message}</span>
                    <span className="line-number">Line {item.line}</span>
                  </div>
                ))}
              </div>


              
<h4>Detection evidence</h4>

<div className="evidence-keywords">
  {(incident.matched_keywords ?? []).length > 0 ? (
    incident.matched_keywords.map((keyword) => (
      <span className="keyword-badge" key={keyword}>
        {keyword}
      </span>
    ))
  ) : (
    <p className="muted">No database-related keywords matched.</p>
  )}
</div>

<div className="evidence-list">
  {(incident.evidence ?? []).map((item, index) => (
    <div className="evidence-row" key={`${item.line}-${index}`}>
      <span className="line-number">
        {item.line != null ? `Line ${item.line}` : "Line unavailable"}
      </span>
      <div className="evidence-detail">
        <strong>{item.level}</strong>
        <p>{item.message}</p>
        {item.matched_keywords?.length > 0 && (
          <span className="evidence-match">
            Matched: {item.matched_keywords.join(", ")}
          </span>
        )}
      </div>
    </div>
  ))}
</div>


              <h4>Recommended actions</h4>
              <ul className="action-list">
                {incident.recommended_actions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>

              <h4>Analysis report</h4>
              <div className="ai-report">
                {incident.ai_analysis ||
                  "No analysis report is available yet."}
              </div>
              {incident.ai_analysis_error && (
                <p className="muted">{incident.ai_analysis_error}</p>
              )}
            </div>
          )}
        </section>

        <footer>RootCause · Local log intelligence workspace</footer>
      </main>
    </div>
  );
}

export default App;
 
