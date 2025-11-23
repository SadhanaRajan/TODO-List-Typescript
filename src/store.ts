import { configureStore } from '@reduxjs/toolkit'
import todosReducer, {
  type TodosState,
} from './features/todos/todosSlice'

const STORAGE_KEY = 'dashboard-todos'

type PersistedState = {
  todos: TodosState
}

const isBrowser = typeof window !== 'undefined'

const loadState = (): PersistedState | undefined => {
  if (!isBrowser) {
    return undefined
  }

  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY)
    if (!serialized) {
      return undefined
    }

    const parsed = JSON.parse(serialized) as PersistedState
    return parsed
  } catch {
    return undefined
  }
}

const saveState = (state: PersistedState) => {
  if (!isBrowser) {
    return
  }

  try {
    const serialized = JSON.stringify(state)
    window.localStorage.setItem(STORAGE_KEY, serialized)
  } catch {
    // No-op if unavailable (private mode, etc.)
  }
}

const preloadedState = loadState()

export const store = configureStore({
  reducer: {
    todos: todosReducer,
  },
  preloadedState,
})

if (isBrowser) {
  store.subscribe(() => {
    saveState({ todos: store.getState().todos })
  })
}

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
