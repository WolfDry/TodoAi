export type Priority = 'low' | 'medium' | 'high'

export type Subtask = {
  id: number
  text: string
  done: boolean
  task_id: number
  priority: Priority
}

export type Task = {
  id: number
  text: string
  done: boolean
  category_id: number
  subtasks: Subtask[]
  priority: Priority
}

export type Category = {
  id: number
  name: string
  color: string
  tasks: Task[]
}
