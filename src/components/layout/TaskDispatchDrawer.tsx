import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { AgentProfile, CreateTaskCommand } from '../../domain/agent-contract'
import { getProfileInputFields } from '../../domain/profile-schema'
import { type TaskPriority } from '../../hooks/useAgentSimulation'
import { usePersistentState } from '../../hooks/usePersistentState'
import { profileExtensionRegistry, type ProfileExtensionRegistry } from '../../ui/profile-extension-registry'
import { useLocaleText } from '../../ui/locale'

interface SelectOption<T extends string> { value: T; label: string; detail: string }
interface ConsoleSelectProps<T extends string> { value: T; options: ReadonlyArray<SelectOption<T>>; onChange: (value: T) => void }
function ConsoleSelect<T extends string>({ value, options, onChange }: ConsoleSelectProps<T>) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = options.find((option) => option.value === value) ?? options[0]
  useEffect(() => { const close = (event: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false) }; document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close) }, [])
  return <div className={open ? 'console-select open' : 'console-select'} ref={containerRef}><button className="console-select-trigger" type="button" onClick={() => setOpen((current) => !current)} aria-haspopup="listbox" aria-expanded={open}><span><strong>{selected.label}</strong><small>{selected.detail}</small></span><ChevronDown size={15} /></button>{open && <div className="console-select-menu" role="listbox">{options.map((option) => <button className={option.value === value ? 'selected' : ''} key={option.value} type="button" role="option" aria-selected={option.value === value} onClick={() => { onChange(option.value); setOpen(false) }}><span><strong>{option.label}</strong><small>{option.detail}</small></span>{option.value === value && <i />}</button>)}</div>}</div>
}

interface TaskDispatchDrawerProps {
  open: boolean
  profiles: AgentProfile[]
  profilesLoading?: boolean
  extensionRegistry?: ProfileExtensionRegistry
  onClose: () => void
  onDispatch: (command: CreateTaskCommand) => void
}

export function TaskDispatchDrawer({ open, profiles, profilesLoading = false, extensionRegistry = profileExtensionRegistry, onClose, onDispatch }: TaskDispatchDrawerProps) {
  const { t } = useLocaleText()
  const priorityOptions = useMemo<ReadonlyArray<SelectOption<TaskPriority>>>(() => [
    { value: 'standard', label: t('dispatch.standard'), detail: t('dispatch.standardDetail') },
    { value: 'priority', label: t('dispatch.priorityOption'), detail: t('dispatch.priorityDetail') },
    { value: 'critical', label: t('dispatch.critical'), detail: t('dispatch.criticalDetail') },
  ], [t])
  const profileOptions = useMemo(() => profiles.map((profile) => ({ value: profile.id, label: profile.name.toUpperCase(), detail: profile.description })), [profiles])
  const [profileId, setProfileId] = usePersistentState('mcp-2099.task-draft.profile', '')
  const [values, setValues] = usePersistentState<Record<string, string>>('mcp-2099.task-draft.input', {})
  const [priority, setPriority] = usePersistentState<TaskPriority>('mcp-2099.task-draft.priority', 'standard')
  const [requiresApproval, setRequiresApproval] = usePersistentState('mcp-2099.task-draft.approval', true)
  const [validationAttempted, setValidationAttempted] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [isDispatching, setIsDispatching] = useState(false)
  const selectedProfile = profiles.find((profile) => profile.id === profileId) ?? profiles[0]
  const fields = useMemo(() => selectedProfile ? getProfileInputFields(selectedProfile) : [], [selectedProfile])
  const objectiveField = fields.find((field) => field.key === 'objective')
  const contextFields = fields.filter((field) => field.key !== 'objective')
  const valueFor = (key: string, defaultValue = '') => values[key] ?? defaultValue
  const missingRequired = fields.some((field) => field.required && !valueFor(field.key, field.defaultValue).trim())

  useEffect(() => { if (!confirmingReset) return; const timeout = window.setTimeout(() => setConfirmingReset(false), 3600); return () => window.clearTimeout(timeout) }, [confirmingReset])
  useEffect(() => { setConfirmingReset(false); if (open) setIsDispatching(false) }, [open])
  useEffect(() => {
    if (profiles.length > 0 && !profiles.some((profile) => profile.id === profileId)) setProfileId(profiles[0].id)
  }, [profileId, profiles, setProfileId])

  const resetDraft = () => {
    const defaultProfile = profiles[0]
    if (!defaultProfile) return
    const defaults = Object.fromEntries(getProfileInputFields(defaultProfile).filter((field) => field.defaultValue).map((field) => [field.key, field.defaultValue]))
    setProfileId(defaultProfile.id); setValues(defaults); setPriority('standard'); setRequiresApproval(true); setValidationAttempted(false)
  }
  const changeProfile = (nextProfileId: string) => {
    const nextProfile = profiles.find((profile) => profile.id === nextProfileId) ?? profiles[0]
    if (!nextProfile) return
    setProfileId(nextProfile.id)
    setValues(Object.fromEntries(getProfileInputFields(nextProfile).filter((field) => field.defaultValue).map((field) => [field.key, field.defaultValue])))
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isDispatching) return
    if (!selectedProfile) return
    if (missingRequired) { setValidationAttempted(true); return }
    setValidationAttempted(false); setIsDispatching(true)
    onDispatch({
      requestId: crypto.randomUUID(),
      profileId: selectedProfile.id,
      workflowId: selectedProfile.workflow.id,
      input: Object.fromEntries(fields.map((field) => [field.key, valueFor(field.key, field.defaultValue).trim()])),
      options: { priority: priority === 'critical' ? 'urgent' : priority === 'priority' ? 'high' : 'standard', approvalPolicy: requiresApproval ? 'required' : 'auto' },
    })
  }

  if (!open) return null
  const extension = selectedProfile ? extensionRegistry.get(selectedProfile.id) : undefined
  return <aside className="task-dispatch-drawer open"><div className="dispatch-heading"><span>{t('dispatch.title')}<small>{t('dispatch.draft')}</small></span><button type="button" onClick={onClose}>{t('dispatch.close')}</button></div><form onSubmit={submit}>
    {profilesLoading && <div className="dispatch-profile-status" role="status">{t('dispatch.loading')}</div>}
    {!profilesLoading && !selectedProfile && <div className="dispatch-profile-status is-error" role="alert">{t('dispatch.empty')}</div>}
    {selectedProfile && <label>{t('dispatch.profile')}<ConsoleSelect value={selectedProfile.id} options={profileOptions} onChange={changeProfile} /></label>}
    {objectiveField && <><label>{objectiveField.label}<textarea className={validationAttempted && !valueFor('objective', objectiveField.defaultValue).trim() ? 'is-invalid' : undefined} value={valueFor('objective', objectiveField.defaultValue)} onChange={(event) => setValues((current) => ({ ...current, objective: event.target.value }))} rows={4} aria-invalid={validationAttempted && !valueFor('objective', objectiveField.defaultValue).trim()} aria-describedby="objective-guidance" /></label><small className={validationAttempted && !valueFor('objective', objectiveField.defaultValue).trim() ? 'objective-guidance is-error' : 'objective-guidance'} id="objective-guidance">{validationAttempted && !valueFor('objective', objectiveField.defaultValue).trim() ? t('dispatch.required') : objectiveField.description || t('dispatch.objectiveHint')}</small></>}
    {contextFields.length > 0 && <div className="dispatch-context"><span>{t('dispatch.input')}</span><div>{contextFields.map((field) => <label key={field.key}>{field.label}{field.widget === 'select' ? <select value={valueFor(field.key, field.defaultValue)} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input className={validationAttempted && field.required && !valueFor(field.key, field.defaultValue).trim() ? 'is-invalid' : undefined} value={valueFor(field.key, field.defaultValue)} onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))} placeholder={field.placeholder} aria-invalid={validationAttempted && field.required && !valueFor(field.key, field.defaultValue).trim()} />}</label>)}</div></div>}
    {selectedProfile && extension?.renderForm?.({ profile: selectedProfile, values, setValue: (key, value) => setValues((current) => ({ ...current, [key]: value })) })}
    <label>{t('dispatch.priority')}<ConsoleSelect value={priority} options={priorityOptions} onChange={setPriority} /></label><label className="approval-toggle"><input type="checkbox" checked={requiresApproval} onChange={(event) => setRequiresApproval(event.target.checked)} /><span>{t('dispatch.approval')}</span></label><small className="approval-guidance">{requiresApproval ? t('dispatch.approvalOn') : t('dispatch.approvalOff')}</small>
    <div className="dispatch-actions"><button className={`dispatch-reset ${confirmingReset ? 'is-confirming' : ''}`} type="button" onClick={() => { if (confirmingReset) { setConfirmingReset(false); resetDraft() } else setConfirmingReset(true) }} disabled={isDispatching || !selectedProfile}>{confirmingReset ? t('dispatch.confirmReset') : t('dispatch.reset')}</button><button className="dispatch-submit" type="submit" disabled={isDispatching || !selectedProfile}>{isDispatching ? t('dispatch.submitting') : t('dispatch.submit')}</button></div>
  </form></aside>
}
