/**
 * TechFlow AI LAB - Orquestrador Principal (script.js)
 * Integrado com chat, CRM, automações e voz inteligente de transferência.
 */

import { employees, getEmployee, getPublicEmployees } from "./js/employees.js";
import {
  createConversation,
  processMessage,
  switchEmployee,
  getConversationHistory,
} from "./js/conversation-engine.js";
import { SpeechEngine } from "./js/speech.js";

document.addEventListener("DOMContentLoaded", () => {
  let state = JSON.parse(localStorage.getItem("techflow_lab_state")) || {
    conversationsCount: 0,
    leads: [],
    activities: [],
  };

  function saveState() {
    localStorage.setItem("techflow_lab_state", JSON.stringify(state));
    updateStats();
  }

  function addActivity(text) {
    const time = new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    state.activities.unshift({ text, time });
    if (state.activities.length > 25) state.activities.pop();
    saveState();
    renderAutomation();
  }

  function addLead(leadData, employeeName) {
    const newLead = {
      id: "LEAD-" + Date.now().toString().slice(-4),
      name: leadData.name || "Visitante",
      company: leadData.company || "Não informada",
      need: leadData.niche
        ? `${leadData.niche} - ${leadData.need}`
        : leadData.need || "Interesse geral",
      status: "new",
      employeeName: employeeName || "Equipe TechFlow",
      timestamp: new Date().toLocaleDateString("pt-BR"),
    };
    state.leads.unshift(newLead);
    addActivity(`Novo lead capturado: ${newLead.name} (${newLead.company})`);
    saveState();
    renderCRM();
  }

  // 1. NAVEGAÇÃO ENTRE ABAS
  const navItems = document.querySelectorAll(".nav-item");
  const pageSections = document.querySelectorAll(".page-section");
  const pageTitle = document.getElementById("pageTitle");
  const mobileMenuBtn = document.getElementById("mobileMenu");
  const sidebar = document.getElementById("sidebar");

  const pageNames = {
    dashboard: "Dashboard",
    employees: "Funcionários IA",
    chat: "Central de atendimento",
    crm: "CRM e oportunidades",
    automation: "Automações",
  };

  function switchPage(pageId) {
    navItems.forEach((item) => {
      item.classList.toggle(
        "active",
        item.getAttribute("data-page") === pageId,
      );
    });

    pageSections.forEach((section) => {
      section.classList.toggle("active", section.id === pageId + "Page");
    });

    if (pageTitle && pageNames[pageId]) {
      pageTitle.textContent = pageNames[pageId];
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    if (sidebar) sidebar.classList.remove("open");
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const page = item.getAttribute("data-page");
      if (page) switchPage(page);
    });
  });

  document.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const target = btn.getAttribute("data-go");
      if (target) switchPage(target);
    });
  });

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener("click", () =>
      sidebar.classList.toggle("open"),
    );
  }

  // 2. RENDERIZAÇÃO DOS FUNCIONÁRIOS
  let currentSession = createConversation("manager");

  function renderEmployees() {
    const dashboardEmployeesEl = document.getElementById("dashboardEmployees");
    const allEmployeesEl = document.getElementById("allEmployees");
    const chatEmployeeListEl = document.getElementById("chatEmployeeList");

    const publicEmployees = getPublicEmployees();

    const cardHTML = (emp) => `
            <article class="employee-card">
                <div class="employee-avatar" style="background: linear-gradient(135deg, ${emp.color}22, ${emp.color}11); border-color: ${emp.color}44;">
                    ${emp.avatar}
                </div>
                <h3>${emp.fullName}</h3>
                <div class="employee-role">${emp.role}</div>
                <p>${emp.description}</p>
                <button class="primary-button" data-chat-with="${emp.id}">
                    Conversar com ${emp.name} →
                </button>
            </article>
        `;

    if (dashboardEmployeesEl) {
      dashboardEmployeesEl.innerHTML = publicEmployees
        .slice(0, 3)
        .map(cardHTML)
        .join("");
    }
    if (allEmployeesEl) {
      allEmployeesEl.innerHTML = publicEmployees.map(cardHTML).join("");
    }
    if (chatEmployeeListEl) {
      chatEmployeeListEl.innerHTML = employees
        .map(
          (emp) => `
                <button class="chat-employee ${emp.id === currentSession.employeeId ? "active" : ""}" data-select-chat="${emp.id}">
                    <div class="mini-avatar">${emp.avatar}</div>
                    <div>
                        <strong>${emp.name}</strong>
                        <small>${emp.role}</small>
                    </div>
                </button>
            `,
        )
        .join("");
    }

    document.querySelectorAll("[data-chat-with]").forEach((btn) => {
      btn.addEventListener("click", () =>
        startChatWith(btn.getAttribute("data-chat-with")),
      );
    });

    document.querySelectorAll("[data-select-chat]").forEach((btn) => {
      btn.addEventListener("click", () =>
        startChatWith(btn.getAttribute("data-select-chat")),
      );
    });
  }

  // 3. CENTRAL DE ATENDIMENTO
  const chatMessagesEl = document.getElementById("chatMessages");
  const chatInputEl = document.getElementById("chatInput");
  const sendMessageBtn = document.getElementById("sendMessage");
  const chatFormEl = document.getElementById("chatForm");
  const chatHeaderEl = document.getElementById("chatHeader");

  function startChatWith(empId) {
    const res = switchEmployee(currentSession, empId);
    if (res.success) {
      const emp = getEmployee(empId);
      if (emp) {
        currentSession.history = [
          {
            sender: "bot",
            message: emp.greeting,
            employeeId: emp.id,
            timestamp: new Date().toISOString(),
          },
        ];
      }
      state.conversationsCount++;
      saveState();
      switchPage("chat");
      renderChat();
      renderEmployees();
    }
  }

  function renderChat() {
    if (!chatMessagesEl || !chatHeaderEl) return;

    const activeEmp = getEmployee(currentSession.employeeId);
    if (activeEmp) {
      chatHeaderEl.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="font-size: 28px; width: 44px; height: 44px; display: grid; place-items: center; background: ${activeEmp.color}22; border-radius: 12px;">${activeEmp.avatar}</div>
                        <div>
                            <h3>${activeEmp.fullName} — <span style="color: ${activeEmp.color};">${activeEmp.role}</span></h3>
                            <p>${activeEmp.description}</p>
                        </div>
                    </div>
                </div>
            `;
    }

    const history = getConversationHistory(currentSession);
    if (history.length === 0) {
      chatMessagesEl.innerHTML = `
                <div class="empty-chat">
                    <div>✦</div>
                    <h3>Experimente nossa equipe de IA</h3>
                    <p>Escolha um funcionário e comece uma conversa.</p>
                </div>
            `;
    } else {
      chatMessagesEl.innerHTML = history
        .map((h) => {
          const isBot = h.sender === "bot";
          const timeStr = new Date(h.timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          });
          return `
                    <div class="message ${isBot ? "bot" : "user"}">
                        <div>${h.message}</div>
                        <span class="message-meta" style="margin-top: 6px; display: block;">${timeStr}</span>
                    </div>
                `;
        })
        .join("");
    }

    if (chatInputEl) {
      chatInputEl.disabled = false;
      chatInputEl.placeholder = `Conversar com ${activeEmp ? activeEmp.name : "funcionário"}...`;
    }
    if (sendMessageBtn) sendMessageBtn.disabled = false;
    chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  }

  function handleSendMessage(text) {
    if (!text.trim()) return;

    const response = processMessage(text, currentSession);
    currentSession = response.session;

    if (response.shouldCreateLead || response.transferred) {
      if (response.shouldCreateLead) {
        addLead(response.lead, response.employeeName);
      }

      // 🎯 O MOMENTO MÁGICO DA VOZ NO ENCERRAMENTO/TRANSFERÊNCIA PARA O CEO!
      const transferAudioText = `Agora te encaminharei para João Paulo, nosso CEO e diretor administrativo da TechFlow, para fechar os melhores resultados do seu negócio.`;

      // Adiciona a fala de transferência no chat de forma elegante
      currentSession.history.push({
        sender: "bot",
        message: `📢 **Transferência Executiva:** ${transferAudioText}`,
        timestamp: new Date().toISOString(),
      });

      // Dispara a voz apenas neste momento de ouro
      setTimeout(() => {
        SpeechEngine.speakTransfer(transferAudioText);
      }, 500);
    }

    addActivity(`Interação com ${response.employeeName}`);
    renderChat();
    renderEmployees();
  }

  if (chatFormEl) {
    chatFormEl.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!chatInputEl) return;
      const text = chatInputEl.value;
      chatInputEl.value = "";
      handleSendMessage(text);
    });
  }

  // 4. CRM COMERCIAL
  function renderCRM() {
    const newLeadsEl = document.getElementById("newLeads");
    const activeLeadsEl = document.getElementById("activeLeads");
    const qualifiedLeadsEl = document.getElementById("qualifiedLeads");
    const crmSummaryEl = document.getElementById("crmSummary");

    if (crmSummaryEl) {
      crmSummaryEl.innerHTML = `
                <div>
                    <span>Total de Oportunidades</span>
                    <strong>${state.leads.length}</strong>
                </div>
                <div>
                    <span>Leads Qualificados</span>
                    <strong>${state.leads.filter((l) => l.status === "qualified").length}</strong>
                </div>
                <div>
                    <span>Taxa de Conversão</span>
                    <strong>${state.leads.length ? Math.round((state.leads.filter((l) => l.status === "qualified").length / state.leads.length) * 100) : 0}%</strong>
                </div>
            `;
    }

    const renderLeadCard = (lead) => `
            <div class="lead-card">
                <strong>${lead.name} (${lead.company})</strong>
                <p>Necessidade: ${lead.need}</p>
                <p><small>Atendido por: ${lead.employeeName} - ${lead.timestamp}</small></p>
                <select data-lead-id="${lead.id}">
                    <option value="new" ${lead.status === "new" ? "selected" : ""}>Novos leads</option>
                    <option value="active" ${lead.status === "active" ? "selected" : ""}>Em atendimento</option>
                    <option value="qualified" ${lead.status === "qualified" ? "selected" : ""}>Qualificados</option>
                </select>
            </div>
        `;

    const newL = state.leads.filter((l) => l.status === "new");
    const activeL = state.leads.filter((l) => l.status === "active");
    const qualL = state.leads.filter((l) => l.status === "qualified");

    if (newLeadsEl)
      newLeadsEl.innerHTML = newL.length
        ? newL.map(renderLeadCard).join("")
        : `<div class="empty-leads">Nenhum lead novo.</div>`;
    if (activeLeadsEl)
      activeLeadsEl.innerHTML = activeL.length
        ? activeL.map(renderLeadCard).join("")
        : `<div class="empty-leads">Nenhum em atendimento.</div>`;
    if (qualifiedLeadsEl)
      qualifiedLeadsEl.innerHTML = qualL.length
        ? qualL.map(renderLeadCard).join("")
        : `<div class="empty-leads">Nenhum qualificado.</div>`;

    document.querySelectorAll("[data-lead-id]").forEach((select) => {
      select.addEventListener("change", () => {
        const leadId = select.getAttribute("data-lead-id");
        const lead = state.leads.find((l) => l.id === leadId);
        if (lead) {
          lead.status = select.value;
          saveState();
          renderCRM();
        }
      });
    });
  }

  // 5. CENTRAL DE AUTOMAÇÕES
  function renderAutomation() {
    const automationFlowEl = document.getElementById("automationFlow");
    const activityListEl = document.getElementById("activityList");

    if (automationFlowEl) {
      automationFlowEl.innerHTML = `
                <div class="flow-node">
                    <strong>1. Mensagem do Visitante</strong>
                    <span>Capturada na Central de Atendimento</span>
                </div>
                <div class="flow-arrow">↓</div>
                <div class="flow-node">
                    <strong>2. Identificação de Nicho & Contexto</strong>
                    <span>Mapeamento inteligente do setor e dor do cliente</span>
                </div>
                <div class="flow-arrow">↓</div>
                <div class="flow-node">
                    <strong>3. Registro no CRM & Ação</strong>
                    <span>Geração de lead qualificado e histórico</span>
                </div>
            `;
    }

    if (activityListEl) {
      if (state.activities.length === 0) {
        activityListEl.innerHTML = `<div class="activity-item"><span>Nenhuma atividade registrada ainda. Interaja no chat para gerar eventos.</span></div>`;
      } else {
        activityListEl.innerHTML = state.activities
          .map(
            (act) => `
                    <div class="activity-item">
                        <p>${act.text}</p>
                        <span>${act.time}</span>
                    </div>
                `,
          )
          .join("");
      }
    }
  }

  // 6. ESTATÍSTICAS
  function updateStats() {
    const totalEmployeesEl = document.getElementById("totalEmployees");
    const totalConversationsEl = document.getElementById("totalConversations");
    const totalLeadsEl = document.getElementById("totalLeads");

    if (totalEmployeesEl) totalEmployeesEl.textContent = employees.length;
    if (totalConversationsEl)
      totalConversationsEl.textContent = state.conversationsCount;
    if (totalLeadsEl) totalLeadsEl.textContent = state.leads.length;
  }

  renderEmployees();
  renderChat();
  renderCRM();
  renderAutomation();
  updateStats();
});
