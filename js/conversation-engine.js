import { getEmployee } from "./employees.js";
import {
  findIntent,
  searchServices,
  searchFAQ,
  getQuickReplies
} from "./knowledge-base.js";

const serviceRouting = {
  websites: "technology",
  systems: "technology",
  automation: "technology",
  "ai-agents": "technology",
  marketing: "marketing"
};

// 🎯 DICIONÁRIO DE NICHOS INTELIGENTES (Sem API externa)
const BUSINESS_NICHES = [
  { keys: ['deposito', 'material de construção', 'construcao', 'ferragem', 'obra'], name: 'Material de Construção / Depósito', pain: 'controle de estoque, entrega de pedidos e atendimento rápido no balcão/WhatsApp' },
  { keys: ['farmacia', 'drogaria', 'remedio', 'medicamento'], name: 'Farmácia / Drogaria', pain: 'gestão de entregas (delivery), convênios e estoque de medicamentos' },
  { keys: ['posto', 'combustivel', 'gasolina', 'conveniencia'], name: 'Posto de Combustíveis', pain: 'fidelização de clientes, automação de pista e controle de caixa da conveniência' },
  { keys: ['supermercado', 'mercado', 'mercearia', 'atacarejo'], name: 'Supermercado / Comércio de Alimentos', pain: 'ofertas diárias no WhatsApp, controle de validade e pedidos em escala' },
  { keys: ['advocacia', 'advogado', 'escritorio juridico', 'direito'], name: 'Escritório de Advocacia', pain: 'triagem de clientes, gestão de prazos e acompanhamento de processos' },
  { keys: ['odontologia', 'dentista', 'clinica', 'medico', 'saude'], name: 'Clínica / Consultório de Saúde', pain: 'redução de faltas com confirmação automática de consultas e agendamento' },
  { keys: ['fabrica', 'blocos', 'pre-moldados', 'industria', 'producao'], name: 'Indústria / Fábrica de Pré-moldados', pain: 'controle de pedidos sob medida, logística de entrega pesada e escala comercial' }
];

const defaultSession = () => ({
  employeeId: "manager",
  stage: "consulting",
  contextScore: 0,
  detectedNiche: null,
  lead: {
    name: "",
    company: "",
    need: "",
    niche: "",
    source: "Laboratório TechFlow AI"
  },
  history: []
});

export function createConversation(employeeId = "manager") {
  const employee = getEmployee(employeeId);
  return {
    ...defaultSession(),
    employeeId: employee ? employee.id : "manager"
  };
}

function cleanMessage(message) {
  return String(message || "").trim().slice(0, 1000);
}

function saveHistory(session, sender, message) {
  session.history.push({
    sender,
    message,
    timestamp: new Date().toISOString()
  });
  if (session.history.length > 50) {
    session.history = session.history.slice(-50);
  }
}

function getEmployeeName(employeeId) {
  const employee = getEmployee(employeeId);
  return employee ? employee.fullName : "nossa equipe";
}

function detectNicheInText(text) {
  const lower = text.toLowerCase();
  for (const niche of BUSINESS_NICHES) {
    if (niche.keys.some(k => lower.includes(k))) {
      return niche;
    }
  }
  return null;
}

function makeResponse(session, text, options = {}) {
  return {
    text,
    employeeId: session.employeeId,
    employeeName: getEmployeeName(session.employeeId),
    session,
    quickReplies: options.quickReplies || getQuickReplies(),
    transferred: options.transferred || false,
    shouldCreateLead: options.shouldCreateLead || false,
    lead: { ...session.lead },
    matchedServices: options.matchedServices || []
  };
}

/**
 * Motor Consultivo com Inteligência de Nicho Integrada
 */
function generateConsultativeResponse(text, session) {
  const lower = text.toLowerCase();
  
  // Tenta detectar o nicho caso ainda não tenha sido mapeado
  if (!session.detectedNiche) {
    const foundNiche = detectNicheInText(text);
    if (foundNiche) {
      session.detectedNiche = foundNiche;
      session.lead.niche = foundNiche.name;
    }
  }

  if (session.stage === "consulting") {
    session.contextScore++;

    // Se identificou o nicho na primeira ou segunda mensagem, o agente dá uma aula de propriedade sobre o negócio do cara!
    if (session.detectedNiche && session.contextScore <= 1) {
      return makeResponse(
        session,
        `Excelente! Segmento de **${session.detectedNiche.name}** exige agilidade extrema. Na prática, sabemos que o maior gargalo costuma ser o *${session.detectedNiche.pain}*.\n\nPara desenharmos a solução perfeita aqui na TechFlow: hoje vocês já conseguem automatizar parte desse fluxo pelo WhatsApp ou ainda dependem de processos 100% manuais no balcão/telefone?`
      );
    }

    if (session.contextScore === 2) {
      return makeResponse(
        session,
        `Compreendido perfeitamente. Esse cenário é ideal para implementarmos um agente virtual de triagem conectado a um painel de gestão.\n\nPara eu dimensionar o volume de operação de vocês: qual é a média aproximada de atendimentos ou orçamentos diários que sua equipe lida hoje?`
      );
    }

    session.stage = "collect_name";
    return makeResponse(
      session,
      `Perfeito! O diagnóstico para o seu modelo de negócio está claríssimo. Temos tecnologias de automação que vão resolver exatamente esses pontos.\n\nPara formalizarmos a estratégia e gerar a proposta, como você se chama?`
    );
  }

  if (session.stage === "collect_name") {
    session.lead.name = text;
    session.stage = "collect_company";
    return makeResponse(
      session,
      `Muito prazer, ${text}! E qual é o nome da sua empresa/estabelecimento?`
    );
  }

  if (session.stage === "collect_company") {
    session.lead.company = text;
    session.stage = "complete";

    session.employeeId = "sales";
    const salesEmp = getEmployee("sales");

    return makeResponse(
      session,
      `Tudo registrado com sucesso, ${session.lead.name}!\n\nRepassei o escopo completo para o **${salesEmp ? salesEmp.fullName : 'Gabriel Oliveira'}** (Consultor Comercial). Ele já sabe que o foco é otimizar a operação da *${text}* (${session.lead.niche || 'Comércio/Serviços'}).\n\nSua oportunidade foi gravada no CRM da TechFlow. Na versão final com backend, esses dados já estariam despachados no painel gerencial! 🚀`,
      {
        transferred: true,
        shouldCreateLead: true
      }
    );
  }

  return makeResponse(
    session,
    `Estou à disposição para detalhar qualquer outra solução ou calcular prazos de implantação para a sua empresa, ${session.lead.name || 'parceiro'}!`
  );
}

export function processMessage(message, currentSession = null) {
  const text = cleanMessage(message);
  const session = currentSession || createConversation();

  if (!text) {
    return makeResponse(session, "Pode me explicar um pouco melhor para que eu possa te ajudar?");
  }

  saveHistory(session, "user", text);

  if (session.stage !== "idle" && session.stage !== "complete") {
    const consultativeRes = generateConsultativeResponse(text, session);
    if (consultativeRes) {
      saveHistory(session, "bot", consultativeRes.text);
      return consultativeRes;
    }
  }

  const matchedServices = searchServices(text);
  if (matchedServices.length > 0) {
    const destination = serviceRouting[matchedServices[0].id] || "sales";
    if (destination !== session.employeeId) session.employeeId = destination;

    const response = makeResponse(
      session,
      `Analisando a sua necessidade, encontrei a solução exata:\n\n${matchedServices.map(s => `• **${s.name}**: ${s.description} (${s.price})`).join("\n")}\n\nGostaria de entender como aplicar isso na prática no seu segmento?`,
      { matchedServices }
    );
    saveHistory(session, "bot", response.text);
    return response;
  }

  const matchedFAQ = searchFAQ(text);
  if (matchedFAQ.length > 0) {
    const response = makeResponse(session, matchedFAQ[0].answer);
    saveHistory(session, "bot", response.text);
    return response;
  }

  const intent = findIntent(text);
  if (intent && intent.id === "quote") {
    session.stage = "collect_name";
    const response = makeResponse(session, "Excelente iniciativa! Para começarmos, qual é o seu nome?");
    saveHistory(session, "bot", response.text);
    return response;
  }

  const employee = getEmployee(session.employeeId);
  const fallback = employee
    ? `Como ${employee.role} da TechFlow AI, achei muito interessante. Para sermos bem assertivos no seu nicho, me conte: qual é o principal objetivo que você quer alcançar nos próximos meses com automação?`
    : "Compreendi. Poderia detalhar um pouco mais para direcionarmos a melhor solução?";

  const response = makeResponse(session, fallback);
  saveHistory(session, "bot", response.text);
  return response;
}

export function switchEmployee(session, employeeId) {
  const employee = getEmployee(employeeId);
  if (!employee) return { success: false, session, message: "Funcionário não encontrado." };

  session.employeeId = employee.id;
  session.stage = "consulting";
  session.contextScore = 0;

  return {
    success: true,
    session,
    message: `Agora você está conversando com ${employee.fullName}, ${employee.role}.`,
    greeting: employee.greeting
  };
}

export function getConversationHistory(session) {
  return session?.history || [];
}

export function resetConversation(employeeId = "manager") {
  return createConversation(employeeId);
}