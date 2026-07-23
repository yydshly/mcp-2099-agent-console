export type AccessTokenProvider = () => Promise<string | null>

let accessTokenProvider: AccessTokenProvider = async () => null

export function configureAgentAccessTokenProvider(provider: AccessTokenProvider): void {
  accessTokenProvider = provider
}

export function getAgentAccessToken(): Promise<string | null> {
  return accessTokenProvider()
}
