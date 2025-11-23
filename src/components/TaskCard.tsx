import type { FC } from 'react'
import type { TodoItem } from '../features/todos/todosSlice'

type TaskCardProps = {
  todo: TodoItem
  onEdit: (todo: TodoItem) => void
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  isDragging?: boolean
  showCompletedState?: boolean
}

const priorityStyles: Record<
  TodoItem['priority'],
  { bg: string; text: string }
> = {
  high: {
    bg: 'bg-gradient-to-r from-rose-100 to-orange-50',
    text: 'text-rose-700',
  },
  medium: {
    bg: 'bg-gradient-to-r from-amber-100 to-yellow-50',
    text: 'text-amber-700',
  },
  low: {
    bg: 'bg-gradient-to-r from-emerald-100 to-teal-50',
    text: 'text-emerald-700',
  },
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
})

const TaskCard: FC<TaskCardProps> = ({
  todo,
  onEdit,
  onToggleComplete,
  onDelete,
  isDragging = false,
  showCompletedState = false,
}) => {
  const dueDate = todo.dueDate ? new Date(todo.dueDate) : null
  const isOverdue =
    Boolean(dueDate) &&
    !todo.completed &&
    dueDate!.setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
  const categories = todo.category
    ? todo.category
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

  return (
    <article
      className={[
        'relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50 p-5 shadow-card transition duration-200',
        isDragging
          ? 'ring-2 ring-emerald-300/70 shadow-xl'
          : 'hover:-translate-y-0.5 hover:shadow-xl',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -right-10 -top-16 h-32 w-32 rounded-full bg-emerald-100 blur-3xl" />
        <div className="absolute -left-14 bottom-[-3rem] h-28 w-28 rounded-full bg-amber-100 blur-3xl" />
      </div>
      <div className="relative flex items-start gap-3">
        <button
          onClick={() => onToggleComplete(todo.id)}
          aria-label={todo.completed ? 'Mark as active' : 'Mark as complete'}
          className={[
            'mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md border-2 bg-white text-[0.8rem] font-semibold transition',
            todo.completed
              ? 'border-emerald-500 bg-gradient-to-br from-emerald-400 to-lime-300 text-slate-900 shadow-sm shadow-emerald-300/40'
              : 'border-slate-300 text-transparent hover:border-emerald-300',
          ].join(' ')}
        >
          ✓
        </button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-slate-900">
              {todo.title}
            </h3>
            {categories.map((cat) => (
              <span
                key={cat}
                className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600"
              >
                {cat}
              </span>
            ))}
            <span
              className={[
                'rounded-full px-3 py-0.5 text-xs font-semibold capitalize shadow-sm shadow-slate-200/70',
                priorityStyles[todo.priority].bg,
                priorityStyles[todo.priority].text,
              ].join(' ')}
            >
              {todo.priority} priority
            </span>
          </div>
          {todo.description ? (
            <p className="mt-2 text-sm text-slate-600">{todo.description}</p>
          ) : null}
          {dueDate ? (
            <p
              className={[
                'mt-3 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium',
                isOverdue
                  ? 'border-rose-100/70 bg-gradient-to-r from-rose-50 to-orange-50 text-rose-600'
                  : 'border-emerald-100/80 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700',
              ].join(' ')}
            >
              <span>Due {dateFormatter.format(dueDate)}</span>
              {isOverdue ? <span>• overdue</span> : null}
            </p>
          ) : (
            <p className="mt-3 inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500">
              No due date
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 text-sm">
          <button
            onClick={() => onEdit(todo)}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            className="rounded-full border border-transparent px-3 py-1 font-semibold text-rose-600 transition hover:-translate-y-0.5 hover:border-rose-100 hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      </div>
      {showCompletedState && todo.completedAt ? (
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Completed {dateFormatter.format(new Date(todo.completedAt))}
        </p>
      ) : null}
    </article>
  )
}

export default TaskCard
