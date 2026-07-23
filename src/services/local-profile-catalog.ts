import type { AgentProfile } from '../domain/agent-contract'
import { loadContractProfileFixtures } from './profile-fixture-loader'

export const localProfileCatalog: AgentProfile[] = [
  {
    id: 'customer-support', version: '1.0.0', name: 'Customer support', description: 'Knowledge, tickets, escalation',
    inputSchema: { type: 'object', required: ['objective'], properties: { objective: { title: 'Task objective', format: 'textarea', default: 'Resolve the latest customer request with approved knowledge and escalation policy.' }, customer: { title: 'Customer ID', placeholder: 'CUS-2049' }, order: { title: 'Order reference', placeholder: 'ORD-8821' }, channel: { title: 'Channel', placeholder: 'EMAIL / CHAT / VOICE' } } },
    resultSchema: { type: 'object', additionalProperties: true }, workflow: { id: 'support-resolution', version: '1.0.0', allowedRoles: ['context-retrieval', 'policy-validation', 'response-synthesis'] },
  },
  {
    id: 'sales-ops', version: '1.0.0', name: 'Sales operations', description: 'Lead routing and account actions',
    inputSchema: { type: 'object', required: ['objective'], properties: { objective: { title: 'Task objective', format: 'textarea', default: 'Qualify the selected lead and prepare a next-action handoff for the account team.' }, lead: { title: 'Lead ID', placeholder: 'LEAD-819' }, account: { title: 'Account', placeholder: 'ORBITAL SYSTEMS' }, region: { title: 'Region', placeholder: 'APAC / EMEA / AMERICAS' } } },
    resultSchema: { type: 'object', additionalProperties: true }, workflow: { id: 'lead-qualification', version: '1.0.0', allowedRoles: ['crm-validation', 'research', 'handoff'] },
  },
  {
    id: 'operations', version: '1.0.0', name: 'Operations', description: 'Workflow and incident operations',
    inputSchema: { type: 'object', required: ['objective'], properties: { objective: { title: 'Task objective', format: 'textarea', default: 'Assess the operational request and prepare a bounded runbook response.' }, service: { title: 'Service', placeholder: 'FULFILLMENT PIPELINE' }, incident: { title: 'Incident ID', placeholder: 'INC-2099' }, environment: { title: 'Environment', placeholder: 'PRODUCTION' } } },
    resultSchema: { type: 'object', additionalProperties: true }, workflow: { id: 'operations-response', version: '1.0.0', allowedRoles: ['assessment', 'runbook', 'approval-coordination'] },
  },
  {
    id: 'data-analysis', version: '1.0.0', name: 'Data analysis', description: 'Reports and bounded analysis',
    inputSchema: { type: 'object', required: ['objective'], properties: { objective: { title: 'Task objective', format: 'textarea', default: 'Generate a decision-ready analysis brief for the selected dataset and time window.' }, dataset: { title: 'Dataset', placeholder: 'Q3_RETENTION' }, period: { title: 'Time window', placeholder: 'LAST 30 DAYS' }, output: { title: 'Output format', placeholder: 'EXECUTIVE BRIEF' } } },
    resultSchema: { type: 'object', additionalProperties: true }, workflow: { id: 'analysis-brief', version: '1.0.0', allowedRoles: ['data-retrieval', 'analysis', 'synthesis'] },
  },
  ...loadContractProfileFixtures(),
]
