/**
 * TechFlow AI LAB - Motor de automação (corrigido)
 * Corrige: o cargo do funcionário agora é mapeado para a permissão correta,
 * em vez de comparar o título ("Gerente Administrativo") com chaves como "sdr".
 */
const AutomationEngine = (() => {
  const ROLE_BY_EMPLOYEE = {
    manager: "ops",
    secretary: "suporte",
    sales: "closer",
    technology: "suporte",
    marketing: "sdr",
  };

  const ROLE_PERMISSIONS = {
    sdr: ["qualificar_lead", "agendar_reuniao", "enviar_whatsapp", "consultar_crm"],
    suporte: ["abrir_ticket", "consultar_base_conhecimento", "escalar_humano", "consultar_crm"],
    closer: ["qualificar_lead", "agendar_reuniao", "gerar_proposta", "aplicar_desconto", "fechar_contrato", "consultar_crm"],
    ops: ["auditar_fluxos", "gerar_relatorio", "reiniciar_agente", "acesso_total"],
  };

  const WORKFLOWS = {
    qualificar_lead: { name: "Qualificação e registro no CRM", steps: ["Analisar intenção", "Registrar contato", "Notificar equipe"], latencyMs: 650 },
    agendar_reuniao: { name: "Agendamento de reunião", steps: ["Verificar disponibilidade", "Reservar horário", "Enviar confirmação"], latencyMs: 800 },
    abrir_ticket: { name: "Abertura de chamado", steps: ["Classificar prioridade", "Gerar protocolo", "Notificar fila"], latencyMs: 500 },
    gerar_proposta: { name: "Geração de proposta", steps: ["Montar escopo", "Calcular valores", "Gerar resumo"], latencyMs: 1100 },
    gerar_relatorio: { name: "Relatório de indicadores", steps: ["Coletar interações", "Calcular conversão", "Atualizar painel"], latencyMs: 400 },
  };

  let logs = [];
  try { logs = JSON.parse(localStorage.getItem("tf_automation_logs")) || []; } catch (e) { logs = []; }

  function saveLogs() {
    if (logs.length > 50) logs = logs.slice(-50);
    localStorage.setItem("tf_automation_logs", JSON.stringify(logs));
  }

  function roleOf(employee) {
    return ROLE_BY_EMPLOYEE[employee?.id] || null;
  }

  function hasPermission(roleKey, actionKey) {
    const allowed = ROLE_PERMISSIONS[roleKey] || [];
    return allowed.includes(actionKey) || allowed.includes("acesso_total");
  }

  function dispatchUpdate(entry) {
    window.dispatchEvent(new CustomEvent("techflow:automation", { detail: entry }));
  }

  async function triggerWorkflow(employee, actionKey, payload = {}) {
    if (!employee) return { success: false, reason: "Funcionário não informado." };
    const roleKey = roleOf(employee);
    const time = new Date().toLocaleTimeString("pt-BR");
    const id = `EXEC-${Date.now().toString().slice(-4)}`;

    if (!roleKey || !hasPermission(roleKey, actionKey)) {
      const denied = {
        id, time, employeeName: employee.name, action: actionKey,
        status: "BLOQUEADO (RBAC)",
        details: `O funcionário ${employee.name} não tem permissão para '${actionKey}'.`,
      };
      logs.push(denied); saveLogs(); dispatchUpdate(denied);
      return { success: false, log: denied };
    }

    const wf = WORKFLOWS[actionKey] || { name: actionKey, steps: ["Processar", "Concluir"], latencyMs: 500 };
    await new Promise((resolve) => setTimeout(resolve, wf.latencyMs));

    const ok = { id, time, employeeName: employee.name, action: wf.name, status: "CONCLUÍDO", steps: wf.steps, payload };
    logs.push(ok); saveLogs(); dispatchUpdate(ok);
    return { success: true, log: ok };
  }

  function getLogs() { return [...logs].reverse(); }
  function clearLogs() { logs = []; saveLogs(); }

  return { hasPermission, triggerWorkflow, getLogs, clearLogs, ROLE_PERMISSIONS, ROLE_BY_EMPLOYEE };
})();

window.AutomationEngine = AutomationEngine;
