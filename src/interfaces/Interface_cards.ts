export enum TaskStatus {
  TO_DO = 'To Do',
  IN_PROGRESS = 'In Progress',
  REVIEW = 'Review',
  DONE = 'Done',
}

export enum TaskPriority {
  High = 'High',
  Low = 'Low',
  Medium = 'Medium',
}

export interface TaskCard {
  taskId: string;
  name: string;
  description: string;
  taskStatus: TaskStatus;
  priority: TaskPriority;
}
