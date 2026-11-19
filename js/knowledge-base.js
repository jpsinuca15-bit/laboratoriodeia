// TechFlow AI LAB - Base de conhecimento (serviços, FAQ, intenções)
// Preços alinhados com o site principal. Confirme antes de publicar.

export const companyInfo = {
  name: "TechFlow",
  description:
    "Agência de tecnologia: sites, sistemas, automação com IA, agentes de IA e marketing digital.",
  slogan: "Você cuida do negócio. A TechFlow cuida do resto.",
  serviceArea: "Atendemos todo o Brasil e os EUA.",
  responseTime: "Resposta em até 2 horas no horário comercial.",
  contact: {
    whatsapp: "5531999232730",
    website: "", // TODO: colocar o endereço final do site publicado
  },
};

export const services = [
  {
    id: "websites",
    name: "Site profissional",
    description: "Site institucional completo, responsivo e otimizado para buscas.",
    price: "Website: R$ 1.997 (investimento único).",
    keywords: ["site", "sites", "website", "pagina", "institucional"],
  },
  {
    id: "landing",
    name: "Página de vendas",
    description: "Landing page focada em conversão, pronta para campanha de anúncios.",
    price: "Página de Vendas: R$ 597 (investimento único).",
    keywords: ["landing", "landing page", "pagina de vendas"],
  },
  {
    id: "automation",
    name: "Atendente automático no WhatsApp",
    description: "Atende, qualifica e agenda clientes 24 horas por dia.",
    price: "Atendente TechFlow: R$ 1.497 de implantação + R$ 189 por mês.",
    keywords: ["automacao", "automatizar", "automatizacao", "atendente", "whatsapp", "chatbot", "robo"],
  },
  {
    id: "agents",
    name: "Funcionários de IA",
    description: "Agentes de IA para administrativo, contábil, tesouraria, RH e atendimento.",
    price: "Gerente Administrativo IA: R$ 1.797 de implantação + R$ 199 por mês.",
    keywords: ["agente", "agentes", "ia", "inteligencia artificial", "assistente virtual", "gerente administrativo"],
  },
  {
    id: "marketing",
    name: "Marketing digital",
    description: "Gestão de tráfego pago no Google e Meta, com relatórios semanais.",
    price: "Marketing Digital: R$ 697 por mês.",
    keywords: ["trafego", "anuncio", "anuncios", "marketing", "instagram", "google ads", "meta ads"],
  },
  {
    id: "videos",
    name: "Vídeos com IA",
    description: "Vídeos publicitários gerados com IA, sob demanda ou em pacote mensal.",
    price: "Vídeo único: R$ 89,90. Pacote mensal: R$ 797 por mês.",
    keywords: ["video", "videos", "reels", "criativo"],
  },
  {
    id: "systems",
    name: "Sistemas sob medida",
    description: "Sistemas web para gestão de fábricas, escritórios, construtoras e outros setores.",
    price: "GestorPRO a partir de R$ 2.397 + R$ 99/mês. JurisPRO a partir de R$ 1.297 + R$ 69/mês. Administrador Civil: sob consulta.",
    keywords: ["sistema", "sistemas", "software", "painel", "gestor", "gestorpro", "juridico", "jurispro", "fabrica", "blocos", "construtora", "civil"],
  },
];

export const faq = [
  {
    id: "what-is",
    answer: "A TechFlow é uma agência de tecnologia: criamos sites, sistemas, automações com IA, agentes de IA e campanhas de tráfego pago.",
    keywords: ["o que e a techflow", "quem sao voces", "o que e a techflow"],
  },
  {
    id: "how-it-works",
    answer: "Primeiro entendemos o seu negócio, depois montamos uma proposta com escopo, prazo e valor claros. Você aprova e a gente começa.",
    keywords: ["como funciona", "como funciona o atendimento", "processo", "etapas"],
  },
  {
    id: "remote",
    answer: "Atendemos todo o Brasil e os EUA. O atendimento é remoto, pelo WhatsApp e por videochamada.",
    keywords: ["outras cidades", "de outra cidade", "estados unidos", "eua", "remoto"],
  },
  {
    id: "custom",
    answer: "Sim. Desenvolvemos soluções sob medida conforme a operação e os objetivos da sua empresa.",
    keywords: ["personalizado", "sob medida", "projeto exclusivo"],
  },
  {
    id: "support",
    answer: "Sim. Ajustes pós-entrega estão inclusos por 30 dias, e depois temos planos de manutenção mensal.",
    keywords: ["suporte", "manutencao", "depois da entrega", "pos entrega"],
  },
];

export const intents = [
  {
    id: "quote",
    keywords: ["orcamento", "proposta", "contratar", "fechar negocio", "quero contratar"],
    response: "Ótimo! Para montar a proposta, qual é o seu nome?",
  },
  {
    id: "human",
    keywords: ["falar com alguem", "falar com uma pessoa", "atendente humano", "falar com o comercial", "falar com humano"],
    response: "Claro! Vou registrar o seu contato para a equipe comercial. Qual é o seu nome?",
  },
  {
    id: "prices",
    keywords: ["quanto custa", "preco", "precos", "valor", "valores", "quanto e"],
    response: null, // resposta montada a partir de services
  },
  {
    id: "greeting",
    keywords: ["oi", "ola", "bom dia", "boa tarde", "boa noite", "e ai"],
    response: "Olá! Seja bem-vindo à TechFlow. Você pode me contar o que precisa, ou escolher uma opção abaixo.",
  },
  {
    id: "thanks",
    keywords: ["obrigado", "obrigada", "valeu", "agradeco"],
    response: "Por nada! Estou à disposição sempre que precisar.",
  },
  {
    id: "goodbye",
    keywords: ["tchau", "ate logo", "ate mais"],
    response: "Foi um prazer! Quando quiser retomar, é só chamar por aqui.",
  },
];

export const quickReplies = [
  "Quais serviços vocês oferecem?",
  "Quanto custa?",
  "Quero automatizar meu atendimento",
  "Preciso de um site profissional",
  "Quero um orçamento",
];

export function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Casa palavras inteiras: "oi" não casa com "pois", "ia" não casa com "dia".
export function hasKeyword(normalized, keyword) {
  return ` ${normalized} `.includes(` ${normalizeText(keyword)} `);
}

export function findIntent(message) {
  const n = normalizeText(message);
  return intents.find((i) => i.keywords.some((k) => hasKeyword(n, k))) || null;
}

export function searchServices(message) {
  const n = normalizeText(message);
  return services.filter((s) => s.keywords.some((k) => hasKeyword(n, k)));
}

export function searchFAQ(message) {
  const n = normalizeText(message);
  return faq.filter((f) => f.keywords.some((k) => hasKeyword(n, k)));
}

export function getPriceList() {
  return services.map((s) => `• ${s.price}`).join("\n");
}

export function getQuickReplies() {
  return quickReplies;
}
