import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MonthData, ActiveFilter, DateRange, DashboardSettings, Annotation } from '@/lib/types'
import { DEFAULT_SETTINGS } from '@/lib/types'

interface DashboardStore {
  months: Record<string, MonthData>
  activeMonth: string
  setActiveMonth: (m: string) => void
  addMonth: (data: MonthData) => void
  removeMonth: (name: string) => void

  dateRange: DateRange
  setDateRange: (r: DateRange) => void
  resetDateRange: () => void

  crossFilter: ActiveFilter
  setCrossFilter: (f: ActiveFilter) => void
  clearCrossFilter: () => void

  settings: DashboardSettings
  updateSettings: (s: Partial<DashboardSettings>) => void

  annotations: Record<string, string>
  setAnnotation: (key: string, note: string) => void
  deleteAnnotation: (key: string) => void

  activeTab: string
  setActiveTab: (t: string) => void
  modalType: string | null
  modalPayload: string | null
  openModal: (type: string, payload?: string) => void
  closeModal: () => void

  settingsPanelOpen: boolean
  setSettingsPanelOpen: (open: boolean) => void
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      months: {},
      activeMonth: '',
      setActiveMonth: (m) => set({ activeMonth: m, dateRange: { startDay: 1, endDay: 31 }, crossFilter: { type: null, value: null } }),
      addMonth: (data) => set(s => ({
        months: { ...s.months, [data.month]: data },
        activeMonth: s.activeMonth || data.month,
      })),
      removeMonth: (name) => set(s => {
        const months = { ...s.months }
        delete months[name]
        const activeMonth = s.activeMonth === name ? Object.keys(months)[0] || '' : s.activeMonth
        return { months, activeMonth }
      }),

      dateRange: { startDay: 1, endDay: 31 },
      setDateRange: (r) => set({ dateRange: r }),
      resetDateRange: () => set({ dateRange: { startDay: 1, endDay: 31 } }),

      crossFilter: { type: null, value: null },
      setCrossFilter: (f) => set({ crossFilter: f }),
      clearCrossFilter: () => set({ crossFilter: { type: null, value: null } }),

      settings: DEFAULT_SETTINGS,
      updateSettings: (s) => set(prev => ({ settings: { ...prev.settings, ...s } })),

      annotations: {},
      setAnnotation: (key, note) => set(s => ({ annotations: { ...s.annotations, [key]: note } })),
      deleteAnnotation: (key) => set(s => { const a = { ...s.annotations }; delete a[key]; return { annotations: a } }),

      activeTab: 'overview',
      setActiveTab: (t) => set({ activeTab: t }),
      modalType: null,
      modalPayload: null,
      openModal: (type, payload) => set({ modalType: type, modalPayload: payload || null }),
      closeModal: () => set({ modalType: null, modalPayload: null }),

      settingsPanelOpen: false,
      setSettingsPanelOpen: (open) => set({ settingsPanelOpen: open }),
      theme: 'light',
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: 'hmi-dashboard',
      partialize: (s) => ({ settings: s.settings, annotations: s.annotations, theme: s.theme }),
    }
  )
)
