/**
 * TechFlow AI LAB - Motor de Automação & Controle de Acesso (RBAC)
 * Simula fluxos de trabalho estilo n8n/Make localmente com validação de cargo.
 */

const AutomationEngine = (() => {
    // Regras estritas de permissão por cargo (IDs devem bater com seu employees.js)
    const ROLE_PERMISSIONS = {
        'sdr': ['qualificar_lead', 'agendar_reuniao', 'enviar_whatsapp', 'consultar_crm'],
        'suporte': ['abrir_ticket', 'consultar_base_conhecimento', 'escalar_humano', 'consultar_crm'],
        'closer': ['gerar_proposta', 'aplicar_desconto', 'fechar_contrato', 'consultar_crm'],
        'ops': ['auditar_fluxos', 'gerar_relatorio', 'reiniciar_agente', 'acesso_total']
    };

    // Catálogo de automações disponíveis no laboratório
    const WORKFLOWS = {
        'qualificar_lead': {
            name: 'Qualificação BANT + Score no CRM',
            trigger: 'Mensagem do Visitante',
            steps: ['Analisar intenção', 'Calcular Lead Score', 'Salvar no CRM TechFlow'],
            latencyMs: 650
        },
        'agendar_reuniao': {
            name: 'Agendamento Inteligente (Calendar Sync)',
            trigger: 'Interesse Comercial Confirmado',
            steps: ['Verificar disponibilidade', 'Reservar slot', 'Disparar convite'],
            latencyMs: 800
        },
        'abrir_ticket': {
            name: 'Triagem e Abertura de Chamado N1/N2',
            trigger: 'Dúvida Técnica / Problema',
            steps: ['Classificar severidade', 'Gerar protocolo', 'Notificar fila'],
            latencyMs: 500
        },
        'gerar_proposta': {
            name: 'Gerador Dinâmico de Escopo & Proposta',
            trigger: 'Solicitação de Orçamento',
            steps: ['Calcular escopo técnico', 'Montar precificação', 'Gerar PDF simulado'],
            latencyMs: 1100
        },
        'gerar_relatorio': {
            name: 'Consolidação de KPIs Executivos',
            trigger: 'Comando Administrativo',
            steps: ['Varrer interações', 'Calcular conversão', 'Atualizar Dashboard'],
            latencyMs: 400
        }
    };

    let executionLogs = JSON.parse(localStorage.getItem('tf_automation_logs')) || [];

    function saveLogs() {
        // Mantém os últimos 50 logs para performance
        if (executionLogs.length > 50) executionLogs = executionLogs.slice(-50);
        localStorage.setItem('tf_automation_logs', JSON.stringify(executionLogs));
    }

    /**
     * Verifica se o funcionário tem permissão para executar a ação
     */
    function hasPermission(employeeRole, actionKey) {
        const allowed = ROLE_PERMISSIONS[employeeRole] || [];
        return allowed.includes(actionKey) || allowed.includes('acesso_total');
    }

    /**
     * Executa uma automação simulada e emite evento para a UI
     */
    async function triggerWorkflow(employee, actionKey, payload = {}) {
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        
        // Bloqueio de segurança por cargo (Demonstração de governança para clientes)
        if (!hasPermission(employee.role, actionKey)) {
            const deniedLog = {
                id: `EXEC-${Date.now().toString().slice(-4)}`,
                time: timestamp,
                employeeName: employee.name,
                role: employee.role,
                action: actionKey,
                status: 'BLOQUEADO (RBAC)',
                details: `Cargo '${employee.role}' não possui permissão para '${actionKey}'.`
            };
            executionLogs.push(deniedLog);
            saveLogs();
            dispatchUpdate(deniedLog);
            return { success: false, log: deniedLog };
        }

        const workflow = WORKFLOWS[actionKey] || {
            name: actionKey,
            steps: ['Processar entrada', 'Executar regra', 'Concluir'],
            latencyMs: 500
        };

        // Simula o tempo de processamento real do pipeline
        await new Promise(resolve => setTimeout(resolve, workflow.latencyMs));

        const successLog = {
            id: `EXEC-${Date.now().toString().slice(-4)}`,
            time: timestamp,
            employeeName: employee.name,
            role: employee.role,
            action: workflow.name,
            status: 'CONCLUÍDO',
            steps: workflow.steps,
            payload
        };

        executionLogs.push(successLog);
        saveLogs();
        dispatchUpdate(successLog);

        return { success: true, log: successLog };
    }

    function dispatchUpdate(logEntry) {
        window.dispatchEvent(new CustomEvent('techflow:automation', { detail: logEntry }));
    }

    function getLogs() {
        return [...executionLogs].reverse();
    }

    function clearLogs() {
        executionLogs = [];
        saveLogs();
    }

    return {
        hasPermission,
        triggerWorkflow,
        getLogs,
        clearLogs,
        ROLE_PERMISSIONS
    };
})();

window.AutomationEngine = AutomationEngine;