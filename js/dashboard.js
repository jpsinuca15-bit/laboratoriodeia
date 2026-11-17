/**
 * TechFlow AI LAB - Painel Administrativo & Telemetria
 * Controla KPIs, feed de automações e estado operacional da equipe digital.
 */

const AdminDashboard = (() => {
  const STORAGE_KEY = "tf_lab_metrics";

  let metrics = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
    totalMessages: 142, // Valores iniciais realistas para demo
    leadsCaptured: 28,
    automationsRun: 64,
    estimatedHoursSaved: 18.5,
  };

  function saveMetrics() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(metrics));
  }

  function recordInteraction(type = "message") {
    metrics.totalMessages += 1;
    if (type === "lead") metrics.leadsCaptured += 1;
    if (type === "automation") {
      metrics.automationsRun += 1;
      metrics.estimatedHoursSaved = +(
        metrics.estimatedHoursSaved + 0.25
      ).toFixed(2);
    }
    saveMetrics();
    render();
  }

  function resetDemoData() {
    metrics = {
      totalMessages: 0,
      leadsCaptured: 0,
      automationsRun: 0,
      estimatedHoursSaved: 0,
    };
    if (window.AutomationEngine) window.AutomationEngine.clearLogs();
    saveMetrics();
    render();
  }

  /**
   * Renderiza os indicadores e logs nos containers do seu index.html
   * Adapta-se automaticamente aos IDs presentes no DOM.
   */
  function render() {
    // 1. Atualiza cards de KPI (caso existam no HTML)
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

    // 2. Atualiza o Feed de Logs de Automação (estilo console/n8n)
    const logContainer =
      document.getElementById("automation-logs-list") ||
      document.querySelector("[data-dashboard-logs]");
    if (logContainer && window.AutomationEngine) {
      const logs = window.AutomationEngine.getLogs();

      if (logs.length === 0) {
        logContainer.innerHTML = `<div class="log-empty">Nenhuma automação disparada nesta sessão. Converse com um agente para testar.</div>`;
        return;
      }

      logContainer.innerHTML = logs
        .map((log) => {
          const isBlocked = log.status.includes("BLOQUEADO");
          const badgeClass = isBlocked ? "badge-danger" : "badge-success";
          return `
                    <div class="log-item ${isBlocked ? "log-blocked" : ""}">
                        <div class="log-header">
                            <span class="log-id">[${log.id}]</span>
                            <span class="log-agent">${log.employeeName}</span>
                            <span class="log-badge ${badgeClass}">${log.status}</span>
                            <span class="log-time">${log.time}</span>
                        </div>
                        <div class="log-body">
                            <strong>Ação:</strong> ${log.action}
                            ${log.details ? `<p class="log-warn">${log.details}</p>` : ""}
                        </div>
                    </div>
                `;
        })
        .join("");
    }
  }

  // Escuta eventos automáticos disparados pelo motor de automação
  window.addEventListener("techflow:automation", () => {
    recordInteraction("automation");
  });

  return {
    render,
    recordInteraction,
    resetDemoData,
    getMetrics: () => ({ ...metrics }),
  };
})();

window.AdminDashboard = AdminDashboard;
