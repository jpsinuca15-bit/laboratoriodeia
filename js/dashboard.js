/**
 * TechFlow AI LAB - Painel Administrativo & Telemetria (corrigido)
 * Agora renderiza ao carregar a página, em vez de só após a primeira automação.
 */
const AdminDashboard = (() => {
  const STORAGE_KEY = "tf_lab_metrics";

  let metrics;
  try {
    metrics = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      totalMessages: 142,
      leadsCaptured: 28,
      automationsRun: 64,
      estimatedHoursSaved: 18.5,
    };
  } catch (e) {
    metrics = { totalMessages: 142, leadsCaptured: 28, automationsRun: 64, estimatedHoursSaved: 18.5 };
  }

  function saveMetrics() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  }

  function recordInteraction(type = "message") {
    metrics.totalMessages += 1;
    if (type === "lead") metrics.leadsCaptured += 1;
    if (type === "automation") {
      metrics.automationsRun += 1;
      metrics.estimatedHoursSaved = +(metrics.estimatedHoursSaved + 0.25).toFixed(2);
    }
    saveMetrics();
    render();
  }

  function resetDemoData() {
    metrics = { totalMessages: 0, leadsCaptured: 0, automationsRun: 0, estimatedHoursSaved: 0 };
    if (window.AutomationEngine) window.AutomationEngine.clearLogs();
    saveMetrics();
    render();
  }

  function escapeHTML(t) {
    return String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function render() {
    const kpiMap = {
      "kpi-messages": metrics.totalMessages,
      "kpi-leads": metrics.leadsCaptured,
      "kpi-automations": metrics.automationsRun,
      "kpi-hours": `${metrics.estimatedHoursSaved}h`,
    };
    Object.entries(kpiMap).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });

    const logContainer = document.getElementById("automation-logs-list") || document.querySelector("[data-dashboard-logs]");
    if (logContainer && window.AutomationEngine) {
      const logs = window.AutomationEngine.getLogs();
      if (logs.length === 0) {
        logContainer.innerHTML = `<div class="log-empty">Nenhuma automação disparada nesta sessão. Converse com um agente para testar.</div>`;
        return;
      }
      logContainer.innerHTML = logs.map((log) => {
        const isBlocked = String(log.status).includes("BLOQUEADO");
        const badgeClass = isBlocked ? "badge-danger" : "badge-success";
        return `
          <div class="log-item ${isBlocked ? "log-blocked" : ""}">
            <div class="log-header">
              <span class="log-id">[${escapeHTML(log.id)}]</span>
              <span class="log-agent">${escapeHTML(log.employeeName)}</span>
              <span class="log-badge ${badgeClass}">${escapeHTML(log.status)}</span>
              <span class="log-time">${escapeHTML(log.time)}</span>
            </div>
            <div class="log-body">
              <strong>Ação:</strong> ${escapeHTML(log.action)}
              ${log.details ? `<p class="log-warn">${escapeHTML(log.details)}</p>` : ""}
            </div>
          </div>`;
      }).join("");
    }
  }

  window.addEventListener("techflow:automation", () => recordInteraction("automation"));

  return {
    render,
    recordInteraction,
    resetDemoData,
    getMetrics: () => ({ ...metrics }),
  };
})();

window.AdminDashboard = AdminDashboard;
AdminDashboard.render();
