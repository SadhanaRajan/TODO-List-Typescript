import { useEffect, useMemo, useState } from 'react'
import TaskCard from './components/TaskCard'
import Modal from './components/Modal'
import TaskForm, { type TaskFormValues } from './components/TaskForm'
import type { TodoItem } from './features/todos/todosSlice'
import {
  addTodo,
  deleteTodo,
  toggleComplete,
  updateTodo,
} from './features/todos/todosSlice'
import { useAppDispatch, useAppSelector } from './hooks'

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Never'
  const date = new Date(value)
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

function App() {
  const dispatch = useAppDispatch()
  const todosState = useAppSelector((state) => state.todos)
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null)
  const [isFormOpen, setFormOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<TodoItem | null>(null)
  const [dontAskAgain, setDontAskAgain] = useState(false)
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('todo_skip_delete_confirm') === 'true'
  })
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = localStorage.getItem('todo_theme')
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark'
  })
  const isDark = theme === 'dark'

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('todo_skip_delete_confirm', skipDeleteConfirm ? 'true' : 'false')
  }, [skipDeleteConfirm])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem('todo_theme', theme)
    document.body.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const normalizeCategories = (value: string) =>
    value
      .split(',')
      .map((cat) => cat.trim())
      .filter(Boolean)
      .join(', ')

  const openForm = (todo: TodoItem | null = null) => {
    setEditingTodo(todo)
    setFormOpen(true)
  }

  const closeForm = () => {
    setEditingTodo(null)
    setFormOpen(false)
  }

  const activeTodos = useMemo(
    () =>
      todosState.items
        .filter((todo) => !todo.completed)
        .sort((a, b) => a.order - b.order),
    [todosState.items],
  )

  const completedTodos = useMemo(
    () =>
      todosState.items
        .filter((todo) => todo.completed)
        .sort((a, b) => {
          if (!a.completedAt || !b.completedAt) return 0
          return (
            new Date(b.completedAt).getTime() -
            new Date(a.completedAt).getTime()
          )
        }),
    [todosState.items],
  )

  const overdueCount = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return activeTodos.filter((todo) => {
      if (!todo.dueDate) return false
      const due = new Date(todo.dueDate)
      due.setHours(0, 0, 0, 0)
      return due.getTime() < today.getTime()
    }).length
  }, [activeTodos])

  const completionRate = useMemo(() => {
    const total = todosState.items.length
    if (!total) return 0
    return Math.min(
      100,
      Math.round((completedTodos.length / total) * 100),
    )
  }, [completedTodos.length, todosState.items.length])

  const handleFormSubmit = (values: TaskFormValues) => {
    const sanitizedTitle = values.title.trim()
    if (!sanitizedTitle) {
      return
    }
    const formattedDueDate = values.dueDate
      ? new Date(values.dueDate).toISOString()
      : undefined
    const normalizedCategories = normalizeCategories(values.category)

    if (editingTodo) {
      dispatch(
        updateTodo({
          id: editingTodo.id,
          changes: {
            title: sanitizedTitle,
            description: values.description.trim(),
            category: normalizedCategories || '',
            priority: values.priority,
            dueDate: formattedDueDate,
          },
        }),
      )
      closeForm()
    } else {
      dispatch(
        addTodo({
          title: sanitizedTitle,
          description: values.description.trim(),
          category: normalizedCategories || '',
          priority: values.priority,
          dueDate: formattedDueDate,
        }),
      )
      closeForm()
    }
  }

  const stats = [
    {
      label: 'Active tasks',
      value: activeTodos.length,
      accent: 'text-amber-200',
      bg: 'bg-amber-400/10',
    },
    {
      label: 'Completed',
      value: completedTodos.length,
      accent: 'text-emerald-200',
      bg: 'bg-emerald-400/10',
    },
    {
      label: 'Overdue',
      value: overdueCount,
      accent: 'text-rose-200',
      bg: 'bg-rose-400/10',
    },
  ]

  const requestDelete = (id: string) => {
    const todo = todosState.items.find((item) => item.id === id)
    if (!todo) return
    if (skipDeleteConfirm) {
      dispatch(deleteTodo(id))
      return
    }
    setPendingDelete(todo)
    setDontAskAgain(false)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    if (dontAskAgain) {
      setSkipDeleteConfirm(true)
    }
    dispatch(deleteTodo(pendingDelete.id))
    setPendingDelete(null)
  }

  const cancelDelete = () => setPendingDelete(null)

  return (
    <div
      className={`relative min-h-screen overflow-hidden transition-colors ${isDark ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-emerald-50'}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className={`absolute -left-10 top-10 h-64 w-64 rounded-full blur-3xl ${isDark ? 'bg-emerald-400/20' : 'bg-emerald-300/25'}`}
        />
        <div
          className={`absolute right-[-6rem] top-[-4rem] h-80 w-80 rounded-full blur-3xl ${isDark ? 'bg-amber-300/15' : 'bg-amber-300/20'}`}
        />
        <div
          className={`absolute bottom-[-6rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl ${isDark ? 'bg-cyan-300/10' : 'bg-cyan-300/20'}`}
        />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 lg:px-6">
        <header
          className={`rounded-3xl border p-8 shadow-2xl backdrop-blur ${isDark ? 'border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/60 text-white' : 'border-slate-200 bg-gradient-to-br from-white via-white to-emerald-50/70 text-slate-900 shadow-slate-200/50'}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-white/10 text-emerald-100' : 'bg-emerald-100 text-emerald-700'}`}
                >
                  Local-first
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-white/5 text-slate-200' : 'bg-slate-100 text-slate-700'}`}
                >
                  Fast input
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-white/5 text-amber-100/90' : 'bg-amber-100 text-amber-700'}`}
                >
                  Minimal friction
                </span>
              </div>
              <p
                className={`text-xs uppercase tracking-[0.35em] ${isDark ? 'text-emerald-200/80' : 'text-emerald-600'}`}
              >
                Lightning focus
              </p>
              <h1 className="font-display text-4xl leading-tight sm:text-5xl">
                Minimalist Todo Control Center
              </h1>
              <p
                className={`max-w-2xl text-sm ${isDark ? 'text-slate-200' : 'text-slate-600'}`}
              >
                Capture tasks, prioritize quickly, and drag to reorder your
                active commitments. Everything stays synced locally on this
                device—no sign in required.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3 text-right">
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  onClick={() => setTheme(isDark ? 'light' : 'dark')}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isDark
                      ? 'border-white/20 bg-white/10 text-white hover:border-white/40'
                      : 'border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300'
                  }`}
                >
                  {isDark ? 'Light mode' : 'Dark mode'}
                </button>
                <button
                  onClick={() => openForm()}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-300 to-amber-300 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-emerald-400/30 transition hover:-translate-y-0.5 hover:shadow-amber-300/40"
                >
                  <span className="text-lg">✦</span>
                  New task
                </button>
              </div>
              <p className={`text-xs ${isDark ? 'text-emerald-100/80' : 'text-slate-500'}`}>
                Last updated • {formatDateTime(todosState.lastUpdated)}
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-2xl border p-4 ${stat.bg} ${isDark ? 'border-white/10' : 'border-slate-200'}`}
              >
                <p
                  className={`text-xs uppercase tracking-wide ${isDark ? 'text-slate-200/80' : 'text-slate-600'}`}
                >
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${stat.accent}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <div className={`h-2 flex-1 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-teal-300 to-amber-300 transition-[width]"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
              {completionRate}% done
            </p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <section
            className={`flex flex-col gap-4 rounded-3xl border bg-white/95 p-6 text-slate-900 shadow-2xl backdrop-blur ${
              isDark ? 'border-white/10' : 'border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500">
                  Active queue
                </p>
                <h2 className="font-display text-2xl font-semibold text-slate-900">
                  Focus lane
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Tap checkbox to complete
                </span>
                <button
                  onClick={() => openForm()}
                  className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white shadow-sm shadow-slate-900/20 transition hover:-translate-y-0.5"
                >
                  Add task
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {activeTodos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No active tasks. Add something new to get started.
                </div>
              ) : (
                activeTodos.map((todo) => (
                  <TaskCard
                    key={todo.id}
                    todo={todo}
                    onEdit={(item) => openForm(item)}
                    onToggleComplete={(id) => dispatch(toggleComplete(id))}
                    onDelete={(id) => requestDelete(id)}
                  />
                ))
              )}
            </div>
          </section>

          <section
            className={`flex flex-col gap-4 rounded-3xl border bg-white/90 p-6 text-slate-900 shadow-2xl backdrop-blur ${
              isDark ? 'border-white/10' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Completed tasks
                </p>
                <h2 className="font-display text-2xl font-semibold text-slate-900">
                  Wrapped up
                </h2>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {completedTodos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
                  Nothing completed yet. Check tasks off to build momentum.
                </div>
              ) : (
                completedTodos.map((todo) => (
                  <TaskCard
                    key={todo.id}
                    todo={todo}
                    onEdit={(item) => openForm(item)}
                    onToggleComplete={(id) => dispatch(toggleComplete(id))}
                    onDelete={(id) => requestDelete(id)}
                    showCompletedState
                  />
                ))
              )}
            </div>
          </section>
        </div>

        <Modal
          open={Boolean(pendingDelete)}
          onClose={cancelDelete}
          title="Delete this task?"
        >
          <div className="space-y-4 text-slate-700">
            <p className="text-sm">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">
                {pendingDelete?.title}
              </span>
              ? This cannot be undone.
            </p>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={dontAskAgain}
                onChange={(event) => setDontAskAgain(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-200"
              />
              Don&apos;t ask again
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:-translate-y-0.5"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>

        <Modal
          open={isFormOpen}
          onClose={closeForm}
          title={editingTodo ? 'Edit task' : 'Add a new task'}
        >
          <TaskForm
            onSubmit={handleFormSubmit}
            editingTodo={editingTodo}
            onCancel={closeForm}
          />
        </Modal>
      </div>
    </div>
  )
}

export default App
