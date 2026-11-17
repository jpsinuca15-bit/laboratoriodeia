export const companyInfo = {
  name: "TechFlow AI",
  description:
    "Empresa especializada em tecnologia, desenvolvimento de sistemas, inteligência artificial e automação empresarial.",
  slogan: "Tecnologia inteligente para empresas que querem crescer.",
  serviceArea: "Atendimento digital para empresas de diferentes regiões.",
  businessHours: "Atendimento digital disponível 24 horas.",
  contact: {
    whatsapp: "",
    email: "",
    website: "https://agencia-techflow.vercel.app/",
  },
};

export const services = [
  {
    id: "websites",
    name: "Criação de Sites",
    category: "Desenvolvimento",
    description:
      "Desenvolvimento de sites profissionais, responsivos e preparados para apresentar empresas e captar clientes.",
    benefits: [
      "Design profissional",
      "Adaptação para celulares",
      "Apresentação de serviços",
      "Botão de WhatsApp",
      "Estrutura otimizada para SEO",
    ],
    price: "A partir de R$ 597",
    keywords: [
      "site",
      "sites",
      "website",
      "página",
      "landing page",
      "loja virtual",
    ],
  },
  {
    id: "automation",
    name: "Automação Empresarial",
    category: "Automação",
    description:
      "Automatização de tarefas, atendimento, processos comerciais e rotinas empresariais.",
    benefits: [
      "Redução de tarefas repetitivas",
      "Organização de processos",
      "Agilidade no atendimento",
      "Melhoria da produtividade",
    ],
    price: "A partir de R$ 1.497",
    keywords: ["automação", "automatizar", "processos", "tarefas", "whatsapp"],
  },
  {
    id: "ai-agents",
    name: "Agentes Virtuais",
    category: "Inteligência Artificial",
    description:
      "Desenvolvimento de agentes virtuais para atendimento, suporte, organização e processos comerciais.",
    benefits: [
      "Atendimento automatizado",
      "Respostas a perguntas frequentes",
      "Organização de solicitações",
      "Encaminhamento de contatos",
    ],
    price: "A partir de R$ 1.797",
    keywords: [
      "agente",
      "agentes",
      "ia",
      "inteligência artificial",
      "assistente virtual",
      "robô",
    ],
  },
  {
    id: "marketing",
    name: "Marketing Digital",
    category: "Marketing",
    description:
      "Criação de vídeos com inteligência artificial, criativos para anúncios, textos comerciais e planejamento de conteúdo.",
    benefits: [
      "Vídeos promocionais",
      "Criativos para anúncios",
      "Textos persuasivos",
      "Planejamento de conteúdo",
    ],
    price: "A partir de R$ 697 por mês",
    keywords: [
      "marketing",
      "anúncios",
      "tráfego",
      "vídeos",
      "propaganda",
      "instagram",
    ],
  },
  {
    id: "systems",
    name: "Sistemas Personalizados",
    category: "Desenvolvimento",
    description:
      "Desenvolvimento de sistemas web personalizados para organizar operações e facilitar a gestão de empresas.",
    benefits: [
      "Painéis administrativos",
      "Cadastro de clientes",
      "Gestão de informações",
      "Relatórios",
      "Funcionalidades personalizadas",
    ],
    price: "Sob consulta",
    keywords: ["sistema", "software", "plataforma", "painel", "crm", "gestão"],
  },
];

export const faq = [
  {
    id: "what-is-techflow",
    question: "O que é a TechFlow AI?",
    answer:
      "A TechFlow AI é especializada em soluções digitais, desenvolvimento de sistemas, automação empresarial e tecnologia aplicada aos negócios.",
    keywords: ["o que é", "techflow", "empresa", "quem são vocês"],
  },
  {
    id: "how-it-works",
    question: "Como funciona o atendimento?",
    answer:
      "Nosso atendimento começa entendendo as necessidades da sua empresa. Depois, identificamos a solução mais adequada e encaminhamos sua solicitação para o setor responsável.",
    keywords: ["atendimento", "funciona", "como funciona", "processo"],
  },
  {
    id: "prices",
    question: "Quanto custam os serviços?",
    answer:
      "Os valores variam conforme o serviço e a complexidade do projeto. Temos soluções com valores iniciais definidos e também projetos personalizados.",
    keywords: [
      "preço",
      "preços",
      "valor",
      "valores",
      "quanto custa",
      "orçamento",
    ],
  },
  {
    id: "custom-projects",
    question: "Vocês desenvolvem projetos personalizados?",
    answer:
      "Sim! Podemos desenvolver soluções personalizadas de acordo com a operação, os objetivos e as necessidades da sua empresa.",
    keywords: ["personalizado", "projeto", "sob medida", "exclusivo"],
  },
  {
    id: "remote-service",
    question: "Vocês atendem empresas de outras cidades?",
    answer:
      "Sim! O atendimento pode ser realizado digitalmente, permitindo atender empresas de diferentes cidades e regiões.",
    keywords: [
      "outras cidades",
      "distância",
      "remoto",
      "região",
      "localização",
    ],
  },
  {
    id: "human-contact",
    question: "Como falar com um atendente?",
    answer:
      "Posso registrar seu interesse e encaminhar sua solicitação para nossa equipe comercial.",
    keywords: ["humano", "atendente", "pessoa", "falar com alguém", "contato"],
  },
];

export const intents = [
  {
    id: "greeting",
    keywords: [
      "oi",
      "olá",
      "ola",
      "bom dia",
      "boa tarde",
      "boa noite",
      "e aí",
      "eai",
    ],
    response:
      "Olá! Seja muito bem-vindo à TechFlow AI. Como posso ajudar sua empresa hoje?",
  },
  {
    id: "services",
    keywords: [
      "serviços",
      "servico",
      "serviços oferecidos",
      "o que vocês fazem",
      "soluções",
    ],
    response:
      "Trabalhamos com criação de sites, sistemas personalizados, automação empresarial, agentes virtuais e marketing digital.",
  },
  {
    id: "quote",
    keywords: [
      "orçamento",
      "orcamento",
      "proposta",
      "contratar",
      "fechar negócio",
      "fechar negocio",
    ],
    response:
      "Perfeito! Para direcionar seu orçamento, gostaria de entender melhor o que sua empresa precisa.",
  },
  {
    id: "thanks",
    keywords: ["obrigado", "obrigada", "valeu", "agradeço", "agradecido"],
    response:
      "Eu que agradeço pelo contato! A TechFlow AI está à disposição para ajudar sua empresa.",
  },
  {
    id: "goodbye",
    keywords: ["tchau", "até logo", "ate logo", "até mais", "encerrar"],
    response: "Foi um prazer atender você! Conte com a TechFlow AI. Até breve!",
  },
];

export const quickReplies = [
  "Quais serviços vocês oferecem?",
  "Quero automatizar minha empresa",
  "Preciso de um site profissional",
  "Quero conhecer os agentes virtuais",
  "Gostaria de solicitar um orçamento",
  "Quero falar com o comercial",
];

export function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findIntent(message) {
  const normalized = normalizeText(message);

  return (
    intents.find((intent) =>
      intent.keywords.some((keyword) =>
        normalized.includes(normalizeText(keyword)),
      ),
    ) || null
  );
}

export function searchServices(message) {
  const normalized = normalizeText(message);

  return services.filter((service) =>
    service.keywords.some((keyword) =>
      normalized.includes(normalizeText(keyword)),
    ),
  );
}

export function searchFAQ(message) {
  const normalized = normalizeText(message);

  return faq.filter((item) =>
    item.keywords.some((keyword) =>
      normalized.includes(normalizeText(keyword)),
    ),
  );
}

export function getServiceById(serviceId) {
  return services.find((service) => service.id === serviceId) || null;
}

export function getAllServices() {
  return services;
}

export function getQuickReplies() {
  return quickReplies;
}
