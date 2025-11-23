import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type Priority = 'high' | 'medium' | 'low'

export interface TodoItem {
  id: string
  title: string
  description?: string
  category?: string
  priority: Priority
  dueDate?: string
  completed: boolean
  completedAt?: string | null
  createdAt: string
  order: number
}

export interface TodosState {
  items: TodoItem[]
  lastUpdated: string | null
}

type CreateTodoPayload = {
  title: string
  description?: string
  category?: string
  priority: Priority
  dueDate?: string | null
}

type UpdateTodoPayload = {
  id: string
  changes: Omit<CreateTodoPayload, 'priority'> & {
    priority: Priority
    completed?: boolean
  }
}

const starterTodos: TodoItem[] = [
  {
    id: nanoid(),
    title: 'Plan sprint backlog',
    description: 'Review tasks for the week and assign ownership.',
    category: 'Work',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    order: 1,
  },
  {
    id: nanoid(),
    title: 'Grocery run',
    description: 'Ingredients for the weekend dinner party.',
    category: 'Personal',
    priority: 'medium',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    order: 2,
  },
  {
    id: nanoid(),
    title: 'Call mom',
    description: '',
    category: 'Family',
    priority: 'low',
    dueDate: undefined,
    completed: true,
    completedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    order: 3,
  },
]

const initialState: TodosState = {
  items: starterTodos,
  lastUpdated: new Date().toISOString(),
}

const touchState = (state: TodosState) => {
  state.lastUpdated = new Date().toISOString()
}

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<CreateTodoPayload>) => {
      const nextOrder =
        state.items.reduce((max, todo) => Math.max(max, todo.order), 0) + 1

      state.items.push({
        id: nanoid(),
        title: action.payload.title,
        description: action.payload.description?.trim()
          ? action.payload.description
          : undefined,
        category: action.payload.category?.trim()
          ? action.payload.category
          : undefined,
        priority: action.payload.priority,
        dueDate: action.payload.dueDate || undefined,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
        order: nextOrder,
      })
      touchState(state)
    },
    updateTodo: (state, action: PayloadAction<UpdateTodoPayload>) => {
      const todo = state.items.find((item) => item.id === action.payload.id)
      if (!todo) {
        return
      }

      const { changes } = action.payload
      todo.title = changes.title
      todo.description = changes.description?.trim()
        ? changes.description
        : undefined
      todo.category = changes.category?.trim() ? changes.category : undefined
      todo.priority = changes.priority
      todo.dueDate = changes.dueDate || undefined
      if (typeof changes.completed === 'boolean') {
        todo.completed = changes.completed
        todo.completedAt = changes.completed ? new Date().toISOString() : null
        if (!changes.completed) {
          const nextOrder =
            state.items.reduce((max, item) => Math.max(max, item.order), 0) + 1
          todo.order = nextOrder
        }
      }
      touchState(state)
    },
    toggleComplete: (state, action: PayloadAction<string>) => {
      const todo = state.items.find((item) => item.id === action.payload)
      if (!todo) {
        return
      }
      todo.completed = !todo.completed
      todo.completedAt = todo.completed ? new Date().toISOString() : null
      if (!todo.completed) {
        const nextOrder =
          state.items.reduce((max, item) => Math.max(max, item.order), 0) + 1
        todo.order = nextOrder
      }
      touchState(state)
    },
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
      touchState(state)
    },
    reorderActive: (state, action: PayloadAction<string[]>) => {
      const updatedIds = action.payload
      updatedIds.forEach((id, index) => {
        const todo = state.items.find((item) => item.id === id)
        if (todo) {
          todo.order = index + 1
        }
      })
      touchState(state)
    },
  },
})

export const {
  addTodo,
  updateTodo,
  toggleComplete,
  deleteTodo,
  reorderActive,
} = todosSlice.actions
export default todosSlice.reducer
