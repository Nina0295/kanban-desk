import { TaskCard, TaskStatus } from '../interfaces/Interface_cards';

export class LocalStorageService {

  private static instance: LocalStorageService;

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  getTasks ():TaskCard[] {
    const tasks = localStorage.getItem('tasks');

    if (tasks !== null) {
      return JSON.parse(tasks)
    } else {
      return []
    }
  }

  addTasks (newTask: TaskCard): void {
    const tasks = localStorage.getItem('tasks');

    if (tasks !== null) {
      const updatedTasks = [...JSON.parse(tasks), newTask];

      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } else {
      localStorage.setItem('tasks', JSON.stringify([newTask]));
    }
  }

  deleteTask (taskId: string): void {
    const updatedTasks = this.getTasks().filter((task) => task.taskId !== taskId);

    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  }

  updatedTask (changedTask: TaskCard): void {
    const tasks = this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.taskId === changedTask.taskId)
    tasks.splice(taskIndex, 1, changedTask);

    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  onDragEnd = (targetColumn: TaskCard[], targetTaskStatus:TaskStatus, taskId: string): void => {
    const untargetColumns = this.getTasks().filter((task) => task.taskStatus !== targetTaskStatus && task.taskId !== taskId);

    localStorage.setItem('tasks', JSON.stringify(untargetColumns.concat(targetColumn)));
  }
}
