import React from 'react'
import { CategoryItem } from './CategoryItem'
import { Category, Priority } from '../types/todo.types'

interface Props {
  categories: Category[]
  onRemoveCategory: (categoryId: number) => void
  onUpdateColor: (categoryId: number, color: string) => void
  onUpdateName: (categoryId: number, name: string) => void
  onAddTask: (categoryId: number, text: string, priority: Priority) => void
  onToggleTask: (categoryId: number, taskId: number) => void
  onRemoveTask: (categoryId: number, taskId: number) => void
  onAddSubtask: (categoryId: number, taskId: number, text: string, priority?: Priority) => void
  onToggleSubtask: (categoryId: number, taskId: number, subtaskId: number) => void
  onRemoveSubtask: (categoryId: number, taskId: number, subtaskId: number) => void
}

export function CategoryList({ categories, ...handlers }: Props) {
  return (
    <div>
      {categories.map(cat => (
        <CategoryItem key={cat.id} category={cat} {...handlers} />
      ))}
    </div>
  )
}
