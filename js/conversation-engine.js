// TechFlow AI LAB - Motor de conversa (corrigido)
import { getEmployee } from "./employees.js";
import {
  findIntent, searchServices, searchFAQ, getQuickReplies,
  getPriceList, normalizeText, hasKeyword, companyInfo,
} from "./knowledge-base.js";

const STAGES = { OPEN: "open", NAME: "collect_name", COMPANY: "collect_company", DONE: "done" };

const NICHES = [
  { keys: ["deposito", "material de construcao", "ferragem", "construtora"], name: "material de construção", pain: "controle de estoque e atendimento rápido no WhatsApp" },
  { keys: ["farmacia", "drogaria", "remedio"], name: "farmácia", pain: "entregas, estoque e dúvidas dos clientes" },
  { keys: ["posto", "combustivel", "gasolina"], name: "posto de combustíveis", pain: "fidelização de clientes e controle da conveniência" },
  { keys: ["mercado", "supermercado", "mercearia", "atacarejo", "loja", "comercio"], name: "comércio", pain: "pedidos, promoções e atendimento fora do horário" },
  { keys: ["advocacia", "advogado", "juridico", "escritorio"], name: "escritório jurídico", pain: "triagem de clientes e controle de prazos" },
  { keys: ["clinica", "dentista", "odontologia", "medico", "consultorio"], name: "clínica", pain: "faltas em consultas e agendamentos" },
  { keys: ["fabrica", "blocos", "industria", "pre moldado", "producao"], name: "indústria", pain: "controle de pedidos, produção e entregas" },
];

const ROUTING = {
  websites: "technology", landing: "marketing", automation: "technology",
  agents: "manager", marketing: "marketing", videos: "marketing", systems: "technology",
};

const nameOf = (id) => {
  const e = getEmployee(id);
  return e ? e.fullName : "nossa equipe";
};

export function createConversation(employeeId = "manager") {
  const e = getEmployee(employeeId);
  return {
    employeeId: e ? e.id : "manager",
    stage: STAGES.OPEN,
    niche: null,
    nicheAnswered: false,
    firstNeed: "",
    lead: { name: "", company: "", need: "", niche: "" },
    history: [],
  };
}

function saveHistory(session, sender, message) {
  session.history.push({ sender, message, timestamp: new Date().toISOString() });
  if (session.history.length > 60) session.history = session.history.slice(-60);
}

function reply(session, text, extra = {}) {
  saveHistory(session, "bot", text);
  return {
    text,
    employeeId: session.employeeId,
    employeeName: nameOf(session.employeeId),
    session,
    quickReplies: extra.quickReplies || getQuickReplies(),
    transferred: !!extra.transferred,
    shouldCreateLead: !!extra.shouldCreateLead,
    lead: { ...session.lead },
    matchedServices: extra.matchedServices || [],
  };
}

function detectNiche(text) {
  const n = normalizeText(text);
  return NICHES.find((niche) => niche.keys.some((k) => hasKeyword(n, k))) || null;
}

function asksPrice(text) {
  return hasKeyword(normalizeText(text), "quanto custa") || /\b(preco|precos|valor|valores)\b/.test(normalizeText(text));
}

export function processMessage(message, currentSession = null) {
  const session = currentSession || createConversation();
  const text = String(message || "").trim().slice(0, 500);

  if (!text) return reply(session, "Pode me contar um pouco mais sobre o que você precisa?");
  saveHistory(session, "user", text);

  // Coleta de dados para o lead (nome e empresa)
  if (session.stage === STAGES.NAME) {
    session.lead.name = text.slice(0, 80);
    session.stage = STAGES.COMPANY;
    return reply(session, `Prazer, ${session.lead.name}! Qual é o nome da sua empresa?`);
  }
  if (session.stage === STAGES.COMPANY) {
    session.lead.company = text.slice(0, 80);
    session.lead.need = session.firstNeed || "Interesse geral";
    session.lead.niche = session.niche ? session.niche.name : "";
    session.stage = STAGES.DONE;
    session.employeeId = "sales";
    return reply(
      session,
      `Tudo certo, ${session.lead.name}! Registrei o seu interesse para a ${session.lead.company}. Nosso consultor comercial entra em contato em até 2 horas no horário comercial.`,
      { transferred: true, shouldCreateLead: true }
    );
  }
  if (session.stage === STAGES.DONE) {
    return reply(session, "Seu contato já está registrado com a equipe comercial. Quer tirar mais alguma dúvida enquanto isso?");
  }

  // Fluxo aberto: guarda a primeira necessidade e identifica o segmento
  if (!session.firstNeed && text.length > 3) session.firstNeed = text.slice(0, 120);
  const niche = detectNiche(text);
  if (niche) session.niche = niche;

  const intent = findIntent(text);
  if (intent && (intent.id === "quote" || intent.id === "human")) {
    session.stage = STAGES.NAME;
    return reply(session, intent.response);
  }

  if (asksPrice(text)) {
    return reply(session, `Aqui estão os valores de referência:\n${getPriceList()}\n\nQuer que eu registre seu interesse para um consultor montar a proposta exata?`);
  }

  const services = searchServices(text);
  if (services.length) {
    session.employeeId = ROUTING[services[0].id] || session.employeeId;
    const list = services.slice(0, 3).map((s) => `• ${s.name}: ${s.description} ${s.price}`).join("\n");
    const intro = niche && !session.nicheAnswered
      ? `Entendi, ${niche.name}. Nesse segmento, o maior gargalo costuma ser ${niche.pain}.\n\n`
      : "";
    session.nicheAnswered = session.nicheAnswered || !!niche;
    return reply(session, `${intro}${list}\n\nQuer que eu registre seu interesse para montar uma proposta?`, { matchedServices: services });
  }

  const faqs = searchFAQ(text);
  if (faqs.length) return reply(session, faqs[0].answer);

  if (niche) {
    session.nicheAnswered = true;
    return reply(session, `Entendi, ${niche.name}. Nesse segmento, o maior gargalo costuma ser ${niche.pain}. O que você gostaria de resolver primeiro?`);
  }

  if (intent && intent.response) return reply(session, intent.response);

  return reply(session, "Posso te ajudar com sites, sistemas, automação com IA, funcionários de IA ou marketing digital. Qual deles faz mais sentido para você?");
}

export function switchEmployee(session, employeeId) {
  const employee = getEmployee(employeeId);
  if (!employee) return { success: false, session, message: "Funcionário não encontrado." };
  session.employeeId = employee.id;
  session.stage = STAGES.OPEN;
  return { success: true, session, message: `Agora você está conversando com ${employee.fullName}.`, greeting: employee.greeting };
}

export function getConversationHistory(session) {
  return session?.history || [];
}

export function resetConversation(employeeId = "manager") {
  return createConversation(employeeId);
}
