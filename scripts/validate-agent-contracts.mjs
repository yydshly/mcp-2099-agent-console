import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contractRoot = resolve(root, 'contracts', 'agent-platform', 'v1')
const schemaNames = [
  'task-request.schema.json',
  'task-action.schema.json',
  'task-snapshot.schema.json',
  'agent-run.schema.json',
  'agent-event.schema.json',
  'task-result.schema.json',
  'agent-profile.schema.json',
  'queue-snapshot.schema.json',
  'queue-action.schema.json',
  'audit-record.schema.json',
]

const loadJson = async (path) => JSON.parse(await readFile(path, 'utf8'))
const assert = (condition, message) => {
  if (!condition) throw new Error(`Contract validation failed: ${message}`)
}
const requires = (schema, fields) => fields.forEach((field) => assert(schema.required?.includes(field), `${schema.title} must require ${field}`))

const schemas = await Promise.all(schemaNames.map(async (name) => loadJson(resolve(contractRoot, 'schemas', name))))
const identifiers = schemas.map((schema) => schema.$id)
assert(identifiers.every(Boolean), 'every schema must define $id')
assert(new Set(identifiers).size === identifiers.length, 'schema $id values must be unique')

const byTitle = Object.fromEntries(schemas.map((schema) => [schema.title, schema]))
requires(byTitle.CreateTaskCommand, ['requestId', 'profileId', 'input'])
requires(byTitle.TaskActionCommand, ['requestId', 'action'])
requires(byTitle.AgentEvent, ['id', 'sequence', 'taskId', 'occurredAt', 'type', 'payload'])
requires(byTitle.TaskSnapshot, ['id', 'profileId', 'status', 'progress', 'input', 'options', 'agents', 'createdAt', 'updatedAt', 'version'])
requires(byTitle.QueueSnapshot, ['paused', 'tasks', 'updatedAt'])
requires(byTitle.QueueActionCommand, ['requestId', 'action'])
requires(byTitle.AuditRecord, ['id', 'occurredAt', 'actor', 'type', 'message', 'tone'])

const openapi = await loadJson(resolve(contractRoot, 'openapi.json'))
assert(openapi.openapi === '3.1.0', 'OpenAPI version must be 3.1.0')
for (const path of ['/v1/profiles', '/v1/tasks', '/v1/tasks/{taskId}', '/v1/tasks/{taskId}/actions', '/v1/tasks/{taskId}/events', '/v1/tasks/{taskId}/logs', '/v1/queue', '/v1/queue/actions', '/v1/audit']) {
  assert(openapi.paths?.[path], `missing ${path}`)
}

const customerRefund = await loadJson(resolve(contractRoot, 'fixtures', 'customer-refund.profile.json'))
assert(customerRefund.inputSchema?.properties?.orderId, 'fixture must own orderId')
assert(!byTitle.TaskSnapshot.properties?.orderId, 'TaskSnapshot must not own orderId')
assert(!byTitle.TaskSnapshot.properties?.customerId, 'TaskSnapshot must not own customerId')

console.log('Agent Platform v1 contracts are valid.')
