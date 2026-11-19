const STORAGE_KEY = "techflow_lab_leads";
const validStatuses = ["new", "active", "qualified"];

function createId() {
  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Erro ao ler os leads:", error);
    return [];
  }
}

function writeStorage(leads) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export function getLeads() {
  return readStorage();
}

export function saveLead(data = {}) {
  if (!data.name || !data.need) {
    return { success: false, message: "Nome e necessidade são necessários para cadastrar o lead." };
  }
  const leads = readStorage();
  const lead = {
    id: createId(),
    name: String(data.name).trim(),
    company: String(data.company || "Não informado").trim(),
    need: String(data.need).trim(),
    source: data.source || "Laboratório TechFlow AI",
    status: "new",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  leads.unshift(lead);
  writeStorage(leads);
  return { success: true, lead, message: "Lead cadastrado com sucesso." };
}

export function updateLeadStatus(leadId, newStatus) {
  if (!validStatuses.includes(newStatus)) return { success: false, message: "Status inválido." };
  const leads = readStorage();
  const index = leads.findIndex((lead) => lead.id === leadId);
  if (index === -1) return { success: false, message: "Lead não encontrado." };
  leads[index].status = newStatus;
  leads[index].updatedAt = new Date().toISOString();
  writeStorage(leads);
  return { success: true, lead: leads[index] };
}

export function deleteLead(leadId) {
  const leads = readStorage();
  const filtered = leads.filter((lead) => lead.id !== leadId);
  if (filtered.length === leads.length) return { success: false, message: "Lead não encontrado." };
  writeStorage(filtered);
  return { success: true, message: "Lead removido." };
}

export function getCRMStats() {
  const leads = readStorage();
  return {
    total: leads.length,
    new: leads.filter((lead) => lead.status === "new").length,
    active: leads.filter((lead) => lead.status === "active").length,
    qualified: leads.filter((lead) => lead.status === "qualified").length,
  };
}

function createLeadCard(lead) {
  const card = document.createElement("article");
  card.className = "lead-card";

  const name = document.createElement("strong");
  name.textContent = lead.name;

  const company = document.createElement("p");
  company.textContent = lead.company;

  const need = document.createElement("p");
  need.textContent = lead.need;

  const date = document.createElement("small");
  date.textContent = new Date(lead.createdAt).toLocaleDateString("pt-BR");

  const select = document.createElement("select");
  select.setAttribute("aria-label", `Status de ${lead.name}`);
  [
    { value: "new", label: "Novo" },
    { value: "active", label: "Em atendimento" },
    { value: "qualified", label: "Qualificado" },
  ].forEach((status) => {
    const option = document.createElement("option");
    option.value = status.value;
    option.textContent = status.label;
    select.appendChild(option);
  });
  select.value = lead.status;
  select.addEventListener("change", () => {
    updateLeadStatus(lead.id, select.value);
    renderCRM();
  });

  card.append(name, company, need, date, select);
  return card;
}

export function renderCRM() {
  const leads = readStorage();
  const columns = {
    new: document.getElementById("newLeads"),
    active: document.getElementById("activeLeads"),
    qualified: document.getElementById("qualifiedLeads"),
  };
  Object.values(columns).forEach((column) => {
    if (column) column.replaceChildren();
  });
  leads.forEach((lead) => {
    const column = columns[lead.status];
    if (column) column.appendChild(createLeadCard(lead));
  });

  const stats = getCRMStats();
  const summary = document.getElementById("crmSummary");
  if (summary) summary.textContent = `${stats.total} leads cadastrados`;
  const newCounter = document.getElementById("newLeadCount");
  const activeCounter = document.getElementById("activeLeadCount");
  const qualifiedCounter = document.getElementById("qualifiedLeadCount");
  if (newCounter) newCounter.textContent = stats.new;
  if (activeCounter) activeCounter.textContent = stats.active;
  if (qualifiedCounter) qualifiedCounter.textContent = stats.qualified;
  return stats;
}

export function clearCRM() {
  localStorage.removeItem(STORAGE_KEY);
  return renderCRM();
}
