export const operationConfirmLabels = {
  cancel: 'CONFIRM CANCEL',
  removeQueued: 'REMOVE FROM QUEUE',
} as const

export interface ConfirmOperation {
  title: string
  message: string
  confirmLabel: string
  execute: () => Promise<void>
}
