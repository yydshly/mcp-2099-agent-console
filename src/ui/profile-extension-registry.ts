import type { ReactNode } from 'react'
import type { AgentProfile, TaskSnapshot } from '../domain/agent-contract'

export interface ProfileFormExtensionContext {
  profile: AgentProfile
  values: Readonly<Record<string, string>>
  setValue: (key: string, value: string) => void
}

export interface ProfileResultExtensionContext {
  profile: AgentProfile | undefined
  snapshot: TaskSnapshot
}

export interface ProfileUiExtension {
  renderForm?: (context: ProfileFormExtensionContext) => ReactNode
  renderResult?: (context: ProfileResultExtensionContext) => ReactNode
}

export class ProfileExtensionRegistry {
  private readonly extensions = new Map<string, ProfileUiExtension>()

  register(profileId: string, extension: ProfileUiExtension): () => void {
    this.extensions.set(profileId, extension)
    return () => this.extensions.delete(profileId)
  }

  get(profileId: string): ProfileUiExtension | undefined {
    return this.extensions.get(profileId)
  }
}

export const profileExtensionRegistry = new ProfileExtensionRegistry()
