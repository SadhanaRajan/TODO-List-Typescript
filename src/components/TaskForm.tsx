import {
  type ChangeEvent,
  type FC,
  type FormEvent,
  useEffect,
  useState,
} from 'react'
import type { Priority, TodoItem } from '../features/todos/todosSlice'

export type TaskFormValues = {
  title: string
  description: string
  category: string
  priority: Priority
  dueDate: string
}

type TaskFormProps = {
  onSubmit: (values: TaskFormValues) => void
  editingTodo?: TodoItem | null
  onCancel?: () => void
}

const emptyState: TaskFormValues = {
  title: '',
  description: '',
  category: '',
  priority: 'medium',
  dueDate: '',
}

const TaskForm: FC<TaskFormProps> = ({
  onSubmit,
  editingTodo = null,
  onCancel,
}) => {
  const [values, setValues] = useState<TaskFormValues>(emptyState)
  const parsedCategories = values.category
    .split(',')
    .map((cat) => cat.trim())
    .filter(Boolean)

  useEffect(() => {
    if (editingTodo) {
      setValues({
        title: editingTodo.title,
        description: editingTodo.description ?? '',
        category: editingTodo.category ?? '',
        priority: editingTodo.priority,
        dueDate: editingTodo.dueDate?.slice(0, 10) ?? '',
      })
    } else {
      setValues(emptyState)
    }
  }, [editingTodo])

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!values.title.trim()) {
      return
    }
    onSubmit(values)
    if (!editingTodo) {
      setValues(emptyState)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 md:col-span-2">
          Task title
          <input
            required
            name="title"
            type="text"
            placeholder="What needs attention?"
            value={values.title}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-inner shadow-slate-200/30 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600 md:col-span-2">
          Description
          <textarea
            name="description"
            rows={3}
            placeholder="Add more context, links, or notes"
            value={values.description}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-inner shadow-slate-200/30 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Category
          <input
            name="category"
            type="text"
            placeholder="e.g. Design, Personal, Finance"
            value={values.category}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-inner shadow-slate-200/30 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <span className="text-xs font-normal text-slate-400">
            Separate multiple categories with commas
          </span>
          {parsedCategories.length ? (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              {parsedCategories.map((cat) => (
                <span
                  key={cat}
                  className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600"
                >
                  {cat}
                </span>
              ))}
            </div>
          ) : null}
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Priority
          <select
            name="priority"
            value={values.priority}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-inner shadow-slate-200/30 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
          Due date
          <input
            name="dueDate"
            type="date"
            value={values.dueDate}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-inner shadow-slate-200/30 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          <span className="text-xs font-normal text-slate-400">
            Optional — leave blank if it&apos;s flexible
          </span>
        </label>
      </div>
      <div className="flex justify-end gap-3">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-2xl bg-gradient-to-r from-emerald-400 to-amber-300 px-6 py-3 font-semibold text-slate-900 shadow-lg shadow-emerald-400/40 transition hover:-translate-y-0.5 hover:shadow-amber-300/40"
        >
          {editingTodo ? 'Save changes' : 'Save task'}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
