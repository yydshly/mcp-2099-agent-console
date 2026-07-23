import type { AgentProfile } from './agent-contract'

export interface ProfileInputField {
  key: string
  label: string
  description: string
  placeholder: string
  widget: 'input' | 'textarea' | 'select'
  required: boolean
  defaultValue: string
  options: string[]
}

type SchemaProperty = { title?: unknown; description?: unknown; default?: unknown; enum?: unknown; format?: unknown; placeholder?: unknown }

const title = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ').toUpperCase()

export function getProfileInputFields(profile: AgentProfile): ProfileInputField[] {
  const schema = profile.inputSchema as { properties?: Record<string, SchemaProperty>; required?: unknown }
  const required = new Set(Array.isArray(schema.required) ? schema.required.filter((value): value is string => typeof value === 'string') : [])
  return Object.entries(schema.properties ?? {}).map(([key, property]) => ({
    key,
    label: typeof property.title === 'string' ? property.title.toUpperCase() : title(key),
    description: typeof property.description === 'string' ? property.description : '',
    placeholder: typeof property.placeholder === 'string' ? property.placeholder : '',
    widget: Array.isArray(property.enum) ? 'select' : property.format === 'textarea' ? 'textarea' : 'input',
    required: required.has(key),
    defaultValue: typeof property.default === 'string' ? property.default : '',
    options: Array.isArray(property.enum) ? property.enum.filter((value): value is string => typeof value === 'string') : [],
  }))
}
