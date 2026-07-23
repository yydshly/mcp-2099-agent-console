+# Bilingual Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persisted English/Simplified Chinese UI switching for the primary MCP-2099 operator workflow.

**Architecture:** A locale context supplies a typed `t(key)` function to presentation components. `NeuralNetPage` owns persisted locale state and wraps the UI; protocol-derived values remain unmodified.

**Tech Stack:** React 19, TypeScript, Vitest, localStorage.

## Global Constraints

- No new dependencies or Agent Contract v1 changes.
- Keep machine identifiers and adapter payloads unmodified.
- English is the default locale.
- Persist selection under `mcp2099.locale`.
- Do not run Git commands or create commits.

---

### Task 1: Build the locale foundation

**Files:**
- Create: `src/ui/locale.tsx`
- Create: `tests/ui/locale.test.ts`

**Interfaces:**
- Produces: `Locale = 'en' | 'zh-CN'`, `isLocale`, `translate(locale, key)`, `LocaleProvider`, `useLocaleState`, and `useLocaleText`.
- Dictionary includes primary navigation, task controls, confirmation, queue, dispatch, runtime, and bottom status text.

- [ ] **Step 1: Test fallback and Chinese lookup**

```ts
expect(isLocale('zh-CN')).toBe(true)
expect(isLocale('fr')).toBe(false)
expect(translate('zh-CN', 'nav.newTask')).toBe('新建任务')
expect(translate('en', 'nav.newTask')).toBe('NEW TASK')
```

- [ ] **Step 2: Implement typed dictionary and persistence-safe hook**

```ts
export type Locale = 'en' | 'zh-CN'
export const isLocale = (value: unknown): value is Locale => value === 'en' || value === 'zh-CN'
export function useLocaleState() {
  const [locale, setLocale] = useState<Locale>(() => isLocale(window.localStorage.getItem('mcp2099.locale')) ? window.localStorage.getItem('mcp2099.locale') as Locale : 'en')
  useEffect(() => window.localStorage.setItem('mcp2099.locale', locale), [locale])
  return { locale, setLocale }
}
```

### Task 2: Expose the language switcher and provider

**Files:**
- Modify: `src/pages/NeuralNetPage.tsx`
- Modify: `src/components/layout/TopNavigation.tsx`
- Modify: `src/styles/panels.css`

**Interfaces:**
- Consumes: `useLocaleState()` and `LocaleProvider`.
- Produces: an `EN / 中文` navigation control that updates the visible locale immediately.

- [ ] **Step 1: Wrap the page UI in LocaleProvider**

```tsx
const localeState = useLocaleState()

return <LocaleProvider value={localeState}>
  <main className={/* existing classes */}>{/* existing UI */}</main>
</LocaleProvider>
```

- [ ] **Step 2: Render a compact language control**

```tsx
const { locale, setLocale, t } = useLocaleText()
<button className="locale-toggle" type="button" onClick={() => setLocale(locale === 'en' ? 'zh-CN' : 'en')}>
  {locale === 'en' ? '中文' : 'EN'}
</button>
```

- [ ] **Step 3: Translate TopNavigation static labels**

Use `t('nav.interface')`, `t('nav.protocol')`, `t('nav.logs')`, `t('nav.commands')`, `t('nav.taskLog')`, and `t('nav.newTask')`; retain `NEURAL_NET` and `MCP 2099` as protocol/brand identifiers.

### Task 3: Translate the active operator workflow

**Files:**
- Modify: `src/components/layout/TaskDispatchDrawer.tsx`
- Modify: `src/components/layout/AgentTaskPanel.tsx`
- Modify: `src/components/layout/MissionQueueDrawer.tsx`
- Modify: `src/components/layout/OperationConfirmGate.tsx`
- Modify: `src/components/layout/RuntimeStatusBanner.tsx`
- Modify: `src/components/layout/BottomStatusBar.tsx`

**Interfaces:**
- Consumes: `useLocaleText()`.
- Preserves: dynamic profile fields, profile names, protocol data, and IDs.

- [ ] **Step 1: Translate static task dispatch text**

Use translated strings for the drawer heading, local draft note, loading state, approval guidance, reset, and dispatch controls. Keep profile schema labels and descriptions as supplied.

- [ ] **Step 2: Translate task, queue, and confirmation controls**

Use dictionary keys for pause/resume/cancel/retry, queue heading and dispatch hold state, confirmation title/copy/actions/error, and close actions.

- [ ] **Step 3: Translate runtime and status-bar presentation**

Map link-state UI and static status-bar labels through the dictionary. Preserve `LOCAL MOCK`, `REMOTE API`, task IDs, and numeric telemetry values.

- [ ] **Step 4: Run full verification**

Run: `npm.cmd test; npm.cmd run lint; npm.cmd run build`
Expected: all tests pass, lint has no findings, and the production build succeeds. The existing WebGL lazy-chunk warning may remain.

## Self-Review

- The plan translates only front-end-owned text and keeps backend data stable.
- Locale state is persistent and isolated from runtime state.
- The navigation control and workflow overlays share one typed dictionary.
- No protocol behavior changes are introduced.

