// TechFlow AI LAB - Motor de conversa (versão com respostas mais naturais)
import { getEmployee } from "./employees.js";
import {
  findIntent,
  searchServices,
  searchFAQ,
  getQuickReplies,
  getPriceList,
  normalizeText,
  hasKeyword,
} from "./knowledge-base.js";

const STAGES = {
  OPEN: "open",
  NAME: "collect_name",
  COMPANY: "collect_company",
  DONE: "done",
};

const NICHES = [
  {
    keys: ["deposito", "material de construcao", "ferragem", "construtora"],
    name: "material de construção",
    pain: "responder rápido quem pergunta preço e disponibilidade no WhatsApp, enquanto o balcão está cheio",
    example:
      "um cliente pergunta se tem cimento na sexta e o agente já responde com o estoque e reserva o pedido",
  },
  {
    keys: ["farmacia", "drogaria", "remedio"],
    name: "farmácia",
    pain: "organizar pedidos de entrega e responder dúvidas sobre medicamentos e convênios",
    example:
      "o cliente manda a receita e o agente registra o pedido e avisa quando sai para entrega",
  },
  {
    keys: ["posto", "combustivel", "gasolina"],
    name: "posto de combustíveis",
    pain: "fidelizar quem passa pela pista e manter a conveniência vendendo mesmo fora de pico",
    example:
      "o agente envia uma promoção para quem abasteceu na semana e avisa o cliente sobre os produtos da conveniência",
  },
  {
    keys: [
      "mercado",
      "supermercado",
      "mercearia",
      "atacarejo",
      "loja",
      "comercio",
    ],
    name: "comércio",
    pain: "atender pedidos e dúvidas de produto sem deixar o cliente esperando, principalmente à noite e no fim de semana",
    example:
      "o cliente pergunta o horário, o preço de um produto e já faz o pedido pelo WhatsApp",
  },
  {
    keys: ["advocacia", "advogado", "juridico", "escritorio"],
    name: "escritório jurídico",
    pain: "fazer a triagem de quem entra em contato e não perder prazos nem informações do cliente",
    example:
      "o agente coleta o caso, organiza as informações e encaminha para o advogado certo, sem o cliente repetir tudo",
  },
  {
    keys: ["clinica", "dentista", "odontologia", "medico", "consultorio"],
    name: "clínica",
    pain: "reduzir faltas em consultas e manter a agenda cheia sem depender da recepção o tempo todo",
    example:
      "o agente confirma a consulta um dia antes e oferece um novo horário quando o paciente não pode ir",
  },
  {
    keys: ["fabrica", "blocos", "industria", "pre moldado", "producao"],
    name: "indústria",
    pain: "organizar pedidos grandes, prazos de entrega e a comunicação com clientes que compram em volume",
    example:
      "o cliente pede um orçamento de blocos e o agente calcula a quantidade e informa o prazo de entrega",
  },
  {
    keys: [
      "restaurante",
      "lanchonete",
      "pizzaria",
      "hamburgueria",
      "padaria",
      "bar",
      "cafeteria",
      "confeitaria",
      "delivery",
      "comida",
      "alimentacao",
    ],
    name: "alimentação",
    pain: "receber pedidos por WhatsApp no pico, confirmar cardápio e atualizar o que está disponível",
    example:
      "o cliente pede o cardápio, escolhe o pedido e o agente confirma o endereço e o horário de entrega",
  },
  {
    keys: [
      "barbearia",
      "salao",
      "cabeleireiro",
      "barbeiro",
      "estetica",
      "manicure",
      "spa",
      "beleza",
    ],
    name: "beleza e estética",
    pain: "marcar horários sem ficar no telefone e reduzir a falta de clientes sem aviso",
    example:
      "o agente oferece os horários livres da semana, marca e manda um lembrete antes do atendimento",
  },
  {
    keys: [
      "academia",
      "personal",
      "crossfit",
      "pilates",
      "fitness",
      "nutricionista",
    ],
    name: "academia e fitness",
    pain: "captar alunos interessados nos planos e manter a rotina de matrícula e renovação",
    example:
      "quem pergunta sobre planos recebe os valores, agenda uma aula experimental e recebe o lembrete do horário",
  },
  {
    keys: [
      "imobiliaria",
      "imovel",
      "imoveis",
      "corretor",
      "corretora",
      "aluguel",
    ],
    name: "imobiliária",
    pain: "responder rápido quem chega por anúncio e filtrar os interessados antes de marcar visita",
    example:
      "o agente pergunta faixa de preço e bairro, mostra os imóveis compatíveis e agenda a visita",
  },
  {
    keys: ["contabilidade", "contador", "contabil"],
    name: "contabilidade",
    pain: "receber documentos dos clientes e cobrar pendências sem depender de ligações o tempo todo",
    example:
      "o agente lembra o cliente do documento que falta e organiza o que chegou por WhatsApp",
  },
  {
    keys: [
      "oficina",
      "mecanica",
      "funilaria",
      "pneu",
      "lava rapido",
      "lavagem",
      "automotivo",
      "auto center",
    ],
    name: "oficina e automotivo",
    pain: "agendar revisões, informar orçamentos e avisar quando o carro está pronto",
    example:
      "o cliente informa o modelo do carro, recebe a estimativa e agenda a entrada",
  },
  {
    keys: [
      "escola",
      "curso",
      "educacao",
      "colegio",
      "faculdade",
      "idiomas",
      "professor",
      "creche",
    ],
    name: "educação",
    pain: "responder matrículas e dúvidas de mensalidade sem sobrecarregar a secretaria",
    example:
      "quem pergunta sobre um curso recebe a grade, o valor e agenda uma visita",
  },
  {
    keys: [
      "transporte",
      "logistica",
      "entregas",
      "frete",
      "motoboy",
      "mudanca",
      "transportadora",
    ],
    name: "transporte e logística",
    pain: "informar o status das entregas e receber pedidos de frete sem ligação",
    example:
      "o cliente pergunta onde está a encomenda e recebe a atualização na hora",
  },
  {
    keys: [
      "pet shop",
      "petshop",
      "pet",
      "veterinario",
      "veterinaria",
      "banho e tosa",
    ],
    name: "pet shop e veterinária",
    pain: "marcar banho, tosa e consultas e lembrar a vacinação dos clientes",
    example:
      "o agente agenda o banho, confirma no dia anterior e lembra quando a vacina está vencendo",
  },
  {
    keys: [
      "eventos",
      "buffet",
      "festa",
      "casamento",
      "decoracao",
      "fotografo",
      "fotografia",
    ],
    name: "eventos",
    pain: "receber orçamentos com muitas perguntas repetidas e responder rápido nas datas mais disputadas",
    example:
      "o agente coleta data, quantidade de convidados e tipo de evento, e já envia um orçamento inicial",
  },
  {
    keys: ["software", "desenvolvedor", "agencia", "publicidade"],
    name: "tecnologia e marketing",
    pain: "qualificar contatos de forma rápida e não perder oportunidades enquanto a equipe está em projetos",
    example:
      "o agente identifica o tipo de projeto e agenda a conversa com o responsável técnico",
  },
  {
    keys: [
      "agro",
      "agronegocio",
      "fazenda",
      "agricultura",
      "pecuaria",
      "agropecuaria",
      "insumos",
    ],
    name: "agronegócio",
    pain: "receber pedidos de insumos e orçamentos fora do horário, com clientes espalhados pela região",
    example:
      "o produtor pede o insumo, o agente confirma estoque e prazo de entrega na região",
  },
];

// Como cada serviço funciona, sem preço. O preço só aparece quando a pessoa pergunta.
const HOW_IT_WORKS = {
  automation:
    "A automação funciona como um atendente que trabalha 24 horas. Ele recebe a mensagem, entende o que a pessoa quer, responde o que já está definido (horário, endereço, produtos, prazos) e, quando precisa de uma pessoa, passa a conversa com todo o histórico.",
  agents:
    "Um funcionário de IA cuida de uma parte da rotina, como emitir documentos, organizar dados ou acompanhar pagamentos, e avisa você quando algo precisa de decisão.",
  websites:
    "Um site bem feito apresenta o seu negócio, mostra o que você faz e leva a pessoa até o contato sem atrito.",
  landing:
    "É uma página focada em uma única oferta, pensada para quem chega pelo anúncio e precisa decidir rápido.",
  marketing:
    "A gente cuida dos anúncios no Google e na Meta, acompanha os resultados e ajusta toda semana para o dinheiro investido render mais.",
  videos:
    "Criamos vídeos com IA para anúncios e redes sociais, sem precisar de câmera nem de equipe de gravação.",
  systems:
    "Quando o processo está espalhado em planilhas, papel e conversas, um sistema sob medida junta tudo num painel só.",
};

const DISCOVERY = {
  automation:
    "Como os seus clientes costumam chegar até você hoje: pelo WhatsApp, por telefone, pelo site ou presencialmente?",
  agents: "Qual parte da rotina administrativa mais consome o seu tempo hoje?",
  websites: "Você já tem alguma presença online, ou estaria começando do zero?",
  landing: "Você já tem uma oferta definida que quer divulgar?",
  marketing: "Você já anuncia hoje, ou ainda não começou?",
  videos: "Você já posta vídeos com frequência, ou está começando agora?",
  systems:
    "Hoje, como você controla as informações do negócio: planilha, papel ou algum sistema?",
};

const SEGMENT_QUESTION =
  "Pra eu entender melhor o seu caso, qual é o segmento do seu negócio?";

// Duas perguntas por setor. A conversa alterna entre elas para não repetir sempre a mesma.
const NICHE_QUESTIONS = {
  "material de construção": [
    "Vocês atendem mais pelo balcão ou pelo WhatsApp?",
    "Quantos pedidos por dia vocês recebem em média?",
  ],
  farmácia: [
    "As entregas são feitas por vocês ou por motoboy?",
    "Quais são as dúvidas que mais chegam pelo atendimento?",
  ],
  "posto de combustíveis": [
    "Vocês já têm algum programa de fidelidade hoje?",
    "Quantos clientes passam pela conveniência num dia de movimento?",
  ],
  comércio: [
    "Os pedidos chegam mais pelo WhatsApp, Instagram ou no balcão?",
    "Quais perguntas vocês mais respondem todo dia?",
  ],
  "escritório jurídico": [
    "Quantas pessoas entram em contato por dia pedindo atendimento?",
    "Vocês controlam os prazos em planilha ou em algum sistema?",
  ],
  clínica: [
    "Quantas faltas vocês têm por semana, em média?",
    "Quem marca as consultas hoje: a recepção ou os próprios pacientes?",
  ],
  indústria: [
    "Os pedidos chegam por representante, e-mail ou WhatsApp?",
    "O prazo de entrega costuma ser o que mais gera reclamação?",
  ],
  alimentação: [
    "Os pedidos chegam mais pelo app ou pelo WhatsApp?",
    "Nos horários de pico, quanto tempo um cliente espera por resposta?",
  ],
  "beleza e estética": [
    "Como vocês marcam os horários hoje?",
    "Quantos clientes costumam faltar por semana sem avisar?",
  ],
  "academia e fitness": [
    "Quantas pessoas perguntam sobre planos por semana?",
    "A renovação dos alunos é feita de forma automática ou manual?",
  ],
  imobiliária: [
    "Os interessados chegam mais por anúncio ou por indicação?",
    "Quanto tempo leva hoje para o primeiro retorno a um interessado?",
  ],
  contabilidade: [
    "Como os clientes enviam os documentos hoje?",
    "Quanto tempo vocês gastam cobrando pendências por mês?",
  ],
  "oficina e automotivo": [
    "Os clientes costumam agendar ou chegam direto na oficina?",
    "Vocês avisam o cliente por telefone quando o carro fica pronto?",
  ],
  educação: [
    "As matrículas chegam mais por telefone, site ou redes sociais?",
    "Quantas dúvidas sobre mensalidade vocês recebem por semana?",
  ],
  "transporte e logística": [
    "Como os clientes acompanham as entregas hoje?",
    "Quantas ligações por dia são só para saber onde está a encomenda?",
  ],
  "pet shop e veterinária": [
    "Como os tutores marcam banho e consultas hoje?",
    "Vocês lembram os clientes das vacinas, ou eles precisam lembrar sozinhos?",
  ],
  eventos: [
    "Quantos orçamentos vocês recebem por mês, em média?",
    "As perguntas sobre data e número de convidados se repetem muito?",
  ],
  "tecnologia e marketing": [
    "Quantos contatos chegam por mês pedindo projeto?",
    "Quanto tempo leva para responder um contato novo?",
  ],
  agronegócio: [
    "Os pedidos chegam mais por telefone ou WhatsApp?",
    "Quantas regiões vocês atendem hoje?",
  ],
};

// Três formas de abrir a conversa sobre o setor, alternadas.
const OPENINGS = [
  (n) => `Entendi que você trabalha com ${n}.`,
  (n) => `Legal, ${n} tem bastante movimento no dia a dia.`,
  (n) => `Obrigado por explicar. Em ${n}, as coisas costumam correr rápido.`,
];

function nicheQuestion(niche, session) {
  const list = NICHE_QUESTIONS[niche.name] || [
    "Me conta qual parte mais atrapalha a sua rotina hoje?",
  ];
  return list[session.history.length % list.length];
}

const ROUTING = {
  websites: "technology",
  landing: "marketing",
  automation: "technology",
  agents: "manager",
  marketing: "marketing",
  videos: "marketing",
  systems: "technology",
};

const GREETINGS = [
  "Oi! Que bom ter você por aqui. Me conta, o que você está buscando para a sua empresa?",
  "Olá! Seja bem-vindo. Pode me contar com calma o que você precisa resolver.",
  "Oi, tudo bem? Sou o atendimento da TechFlow. Como posso te ajudar hoje?",
];

const nameOf = (id) => {
  const e = getEmployee(id);
  return e ? e.fullName : "nossa equipe";
};

// Escolhe uma variação sem repetir sempre a mesma frase
const pick = (list, session) => list[session.history.length % list.length];

export function createConversation(employeeId = "manager") {
  const e = getEmployee(employeeId);
  return {
    employeeId: e ? e.id : "manager",
    stage: STAGES.OPEN,
    niche: null,
    nicheAnswered: false,
    firstNeed: "",
    lastService: null,
    discovery: 0,
    consultArea: null,
    consultTurns: 0,
    askedSegment: false,
    lead: { name: "", company: "", need: "", niche: "" },
    history: [],
  };
}

function saveHistory(session, sender, message) {
  session.history.push({
    sender,
    message,
    timestamp: new Date().toISOString(),
  });
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

// Captura o segmento com as palavras do próprio cliente ("trabalho com pet shop")
const SEGMENT_PATTERN =
  /(?:trabalho com|trabalho de|tenho (?:um|uma)|sou (?:um|uma)|meu neg[oó]cio [ée] (?:um|uma)?|minha (?:empresa|loja) [ée] (?:um|uma)?)\s+([a-zà-ú0-9 ]{3,40})/i;

function captureSegment(text) {
  const m = text.match(SEGMENT_PATTERN);
  if (!m) return null;
  return m[1].replace(/[.,!?].*$/, "").trim();
}

function detectNiche(text) {
  const n = normalizeText(text);
  return (
    NICHES.find((niche) => niche.keys.some((k) => hasKeyword(n, k))) || null
  );
}

// ===== CONSULTORIA POR ÁREA: conduz a conversa antes de encaminhar =====
// Não cita preços nem empurra a venda. Explica, pergunta, sugere caminhos e só depois encaminha.
const CONSULT_AREAS = {
  finance: {
    keys: [
      "tesouraria",
      "financeiro",
      "financeira",
      "contas a pagar",
      "contas a receber",
      "fluxo de caixa",
      "caixa",
    ],
    name: "financeiro e tesouraria",
    intro:
      "Na área financeira, o que mais consome tempo costuma ser lançar contas, conferir boletos e fechar o fluxo de caixa no fim do mês.",
    ask: "Hoje essa rotina é feita em planilha, em sistema ou ainda na mão?",
    options:
      "Dá para montar uma solução completa, que integra contas a pagar, contas a receber e o fluxo de caixa num painel só. Ou, se preferir começar menor, dá para automatizar só o ponto que mais pesa, como a conferência de boletos e os alertas de vencimento.",
    follow: "Qual dessas etapas hoje gera mais retrabalho para a sua equipe?",
    dept: "manager",
  },
  hr: {
    keys: [
      "rh",
      "recursos humanos",
      "folha",
      "ferias",
      "admissao",
      "funcionarios",
      "departamento pessoal",
    ],
    name: "recursos humanos",
    intro:
      "No RH, o que mais toma tempo costuma ser a admissão, a coleta de documentos, o controle de ponto e as férias.",
    ask: "Quantas pessoas a sua equipe tem hoje, e como esses controles são feitos?",
    options:
      "Dá para integrar admissão, documentos, ponto e férias num fluxo só, com aviso automático para quem precisa aprovar. Ou começar só pelos documentos e pelo ponto, que costumam ser o maior gargalo.",
    follow: "Qual dessas rotinas mais toma tempo de quem cuida do RH?",
    dept: "manager",
  },
  stock: {
    keys: [
      "estoque",
      "almoxarife",
      "almoxarifado",
      "inventario",
      "mercadoria",
      "insumo",
    ],
    name: "estoque e almoxarifado",
    intro:
      "Em estoque, o problema mais comum é a diferença entre o que o sistema mostra e o que existe de fato, e a reposição que chega atrasada.",
    ask: "Hoje o controle é feito em planilha, em sistema ou na contagem manual?",
    options:
      "Dá para ter um sistema que registra entradas e saídas, avisa a reposição no momento certo e cruza tudo com as vendas. Ou começar só pelo alerta de estoque mínimo e pela conferência de entradas, sem mexer no resto da operação.",
    follow:
      "Quando aparece divergência, em qual etapa ela costuma surgir: na entrada, na saída ou na contagem?",
    dept: "technology",
  },
  service: {
    keys: ["atendimento", "suporte", "responder clientes", "atender clientes"],
    name: "atendimento",
    intro:
      "No atendimento, o cliente costuma esperar demais quando o volume aumenta, principalmente com as mesmas perguntas repetidas.",
    ask: "Quais perguntas mais chegam, e quantas delas poderiam ser respondidas sem precisar de uma pessoa?",
    options:
      "Dá para ter um atendimento que responde as perguntas recorrentes, organiza os pedidos e passa a conversa para uma pessoa quando precisa. Ou começar só pelas perguntas mais frequentes.",
    follow: "Em qual horário o atendimento fica mais pesado hoje?",
    dept: "secretary",
  },
  automation: {
    keys: [
      "automacao",
      "automatizar",
      "automatizacao",
      "sistema de automacao",
      "automatico",
    ],
    name: "automação",
    intro:
      "Automação costuma ajudar mais quando a empresa tem tarefas repetidas que consomem o tempo de quem poderia estar fazendo outra coisa.",
    ask: "Em qual área você está pensando primeiro: financeiro, RH, estoque, atendimento ou vendas?",
    options:
      "Dá para começar por uma parte específica da operação ou montar algo mais completo, dependendo do que pesa mais hoje.",
    follow: "Qual dessas áreas é a mais urgente para você?",
    dept: "technology",
  },
};

function detectArea(text) {
  const n = normalizeText(text);
  for (const key of Object.keys(CONSULT_AREAS)) {
    if (CONSULT_AREAS[key].keys.some((k) => hasKeyword(n, k))) return key;
  }
  return null;
}

function consultReply(session, text, areaKey) {
  const area = CONSULT_AREAS[areaKey];
  // Primeira vez no assunto: explica e pergunta o cenário
  if (session.consultArea !== areaKey) {
    session.consultArea = areaKey;
    session.consultTurns = 0;
    return reply(session, `${area.intro}\n\n${area.ask}`);
  }
  session.consultTurns += 1;
  // Segunda troca: mostra os caminhos possíveis
  if (session.consultTurns === 1 && area.options) {
    session.employeeId = area.dept;
    const ack =
      text.split(/\s+/).length >= 4
        ? `Entendi, ${echo(text).toLowerCase()}.`
        : "Entendi.";
    return reply(session, `${ack}\n\n${area.options}\n\n${area.follow}`);
  }
  // Terceira troca: conecta com a situação que a pessoa contou
  if (session.consultTurns === 2 && area.follow) {
    return reply(
      session,
      `Faz sentido. Essa é justamente a etapa em que uma automação costuma entrar.\n\nSe quiser, eu posso seguir com você e entender melhor o seu caso, ou encaminhar para o especialista de ${area.name}. Qual prefere?`,
    );
  }
  // Depois de um contexto suficiente: encaminha
  session.stage = STAGES.NAME;
  return reply(
    session,
    `Perfeito. Vou passar o seu caso para o especialista de ${area.name}, que já vai com o que você me contou. Como você se chama?`,
  );
}

function asksPrice(text) {
  const n = normalizeText(text);
  return (
    hasKeyword(n, "quanto custa") ||
    /\b(preco|precos|valor|valores|quanto e|quanto fica)\b/.test(n)
  );
}

// Repete de forma curta o que a pessoa disse, para a conversa parecer atenta
function echo(text) {
  const clean = text.replace(/[?!.]+$/, "").trim();
  return clean.length > 60 ? clean.slice(0, 57) + "..." : clean;
}

function nicheIntro(niche, session) {
  const opening = OPENINGS[session.history.length % OPENINGS.length](
    niche.name,
  );
  return `${opening} Nesse segmento, o que mais pesa costuma ser ${niche.pain}. Por exemplo: ${niche.example}.`;
}

export function processMessage(message, currentSession = null) {
  const session = currentSession || createConversation();
  const text = String(message || "")
    .trim()
    .slice(0, 500);

  if (!text)
    return reply(
      session,
      "Pode me contar um pouco mais sobre o que você precisa?",
    );
  saveHistory(session, "user", text);

  // Durante a coleta de nome e empresa, perguntas e pedidos de preço são respondidos sem virar nome
  if (
    (session.stage === STAGES.NAME || session.stage === STAGES.COMPANY) &&
    (asksPrice(text) || text.includes("?"))
  ) {
    if (asksPrice(text)) {
      const svc = session.lastService;
      const body = svc
        ? `Para ${svc.name.toLowerCase()}: ${svc.price}`
        : getPriceList();
      return reply(
        session,
        `${body}\n\nO valor exato sai na proposta. Quando quiser, me diz o seu nome que eu registro o contato.`,
      );
    }
    return reply(
      session,
      session.stage === STAGES.NAME
        ? "Claro, pode perguntar à vontade. Quando quiser, me diz o seu nome para eu registrar o contato."
        : "Claro. Me diz o nome da empresa para eu registrar o contato.",
    );
  }

  // Coleta de dados para o lead
  if (session.stage === STAGES.NAME) {
    session.lead.name = text.slice(0, 80);
    session.stage = STAGES.COMPANY;
    return reply(
      session,
      `Prazer, ${session.lead.name}! Qual é o nome da sua empresa?`,
    );
  }
  if (session.stage === STAGES.COMPANY) {
    session.lead.company = text.slice(0, 80);
    session.lead.need = session.firstNeed || "Interesse geral";
    session.lead.niche = session.niche ? session.niche.name : "";
    session.stage = STAGES.DONE;
    session.employeeId = "sales";
    const what = session.lastService
      ? ` para ${session.lastService.name.toLowerCase()}`
      : "";
    return reply(
      session,
      `Perfeito, ${session.lead.name}. Registrei seu interesse${what} para a ${session.lead.company}. Nosso consultor comercial entra em contato em até 2 horas no horário comercial. Enquanto isso, se quiser, pode me perguntar qualquer coisa sobre o serviço.`,
      { transferred: true, shouldCreateLead: true },
    );
  }
  if (session.stage === STAGES.DONE) {
    return reply(
      session,
      "Seu contato já está com a equipe comercial. Tem mais alguma dúvida que eu possa responder agora?",
    );
  }

  // Fluxo aberto
  if (!session.firstNeed && text.length > 3)
    session.firstNeed = text.slice(0, 120);
  const niche = detectNiche(text);
  const newNiche =
    niche && (!session.niche || session.niche.name !== niche.name);
  if (niche) session.niche = niche;

  const namedSegment = captureSegment(text);
  if (namedSegment && !niche) {
    session.namedSegment = namedSegment;
    session.nicheAnswered = true;
    return reply(
      session,
      `Entendi que você trabalha com ${namedSegment}. Me conta como é o dia a dia do atendimento aí: os clientes chegam mais por WhatsApp, telefone ou pessoalmente?`,
    );
  }

  const intent = findIntent(text);
  if (intent && (intent.id === "quote" || intent.id === "human")) {
    session.stage = STAGES.NAME;
    const about = session.lastService
      ? ` sobre ${session.lastService.name.toLowerCase()}`
      : "";
    return reply(
      session,
      `Claro, vou montar isso${about} com você. Para começar, como você se chama?`,
    );
  }

  if (asksPrice(text)) {
    session.discovery += 1;
    if (session.lastService) {
      return reply(
        session,
        `Para ${session.lastService.name.toLowerCase()}: ${session.lastService.price}\n\nO valor exato depende do seu caso, então sai na proposta. Quer que eu registre seu interesse para um consultor montar a sua?`,
      );
    }
    return reply(
      session,
      `Os valores de referência são estes:\n${getPriceList()}\n\nCada projeto tem escopo próprio, então o valor exato sai na proposta. Me conta um pouco do seu negócio que eu já te indico o que faz mais sentido.`,
    );
  }

  const area = detectArea(text);
  if (area) return consultReply(session, text, area);
  if (
    session.consultArea &&
    session.consultTurns < 3 &&
    !searchFAQ(text).length
  ) {
    return consultReply(session, text, session.consultArea);
  }

  const services = searchServices(text);
  if (services.length) {
    const main = services[0];
    session.lastService = main;
    session.discovery += 1;
    session.employeeId = ROUTING[main.id] || session.employeeId;
    session.nicheAnswered = session.nicheAnswered || !!niche;

    const sameTopic =
      session.lastService &&
      session.lastService.id === main.id &&
      session.discovery > 1;
    const intro = newNiche ? nicheIntro(niche, session) + " " : "";
    const how = sameTopic
      ? "Entendi, isso ajuda bastante."
      : HOW_IT_WORKS[main.id] || "";
    const question = session.niche ? DISCOVERY[main.id] : SEGMENT_QUESTION;
    session.askedSegment = session.askedSegment || !session.niche;

    // Depois de algumas trocas, a conversa já tem contexto: convida para a proposta
    if (session.discovery >= 3 && session.niche) {
      session.stage = STAGES.NAME;
      return reply(
        session,
        `${intro}${how}\n\nPelo que você me contou, faz sentido montar uma proposta com o seu caso. Posso registrar seu interesse? Como você se chama?`,
        { matchedServices: services },
      );
    }

    return reply(session, `${intro}${how}\n\n${question}`, {
      matchedServices: services,
    });
  }

  const faqs = searchFAQ(text);
  if (faqs.length) return reply(session, faqs[0].answer);

  if (niche) {
    session.nicheAnswered = true;
    return reply(
      session,
      `${nicheIntro(niche, session)} ${nicheQuestion(niche, session)}`,
    );
  }

  if (intent && intent.response)
    return reply(
      session,
      intent.response.startsWith("Olá")
        ? pick(GREETINGS, session)
        : intent.response,
    );

  // Resposta de quem não se encaixou em nenhuma regra: reconhece e pergunta com contexto
  return reply(
    session,
    `Entendi: "${echo(text)}". Ainda não tenho certeza de como isso se encaixa no seu caso. Você está buscando um site, um sistema, automação com IA ou divulgação? Se preferir, me conta com as suas palavras que eu te ajudo a chegar na melhor solução.`,
  );
}

export function switchEmployee(session, employeeId) {
  const employee = getEmployee(employeeId);
  if (!employee)
    return { success: false, session, message: "Funcionário não encontrado." };
  session.employeeId = employee.id;
  session.stage = STAGES.OPEN;
  return {
    success: true,
    session,
    message: `Agora você está conversando com ${employee.fullName}.`,
    greeting: employee.greeting,
  };
}

export function getConversationHistory(session) {
  return session?.history || [];
}

export function resetConversation(employeeId = "manager") {
  return createConversation(employeeId);
}
