import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import { getColorPriority } from '../helpers/getColorPriority';
import { LocalStorageService } from '../services/LocalStorageService';
import React from 'react';
import TaskModal from './/ModalWindow';
import {
  AppBar,
  Button,
  Card,
  CardContent,
  Grid,
  GridList,
  IconButton,
  Paper,
  Typography
} from '@material-ui/core';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult
} from 'react-beautiful-dnd';
import { TaskCard, TaskStatus } from '../interfaces/Interface_cards';

interface TaskboardPageState {
  isModalOpen: boolean;
  taskIndex: number;
  tasks: TaskCard[];
  taskId: string;
  createdTaskStatus: TaskStatus;
}

const localStorageService = LocalStorageService.getInstance();

export default class TaskboardPage extends React.Component<Record<string, unknown>, TaskboardPageState>{
  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = {
      tasks: [],
      isModalOpen: false,
      taskIndex: -1,
      taskId: '',
      createdTaskStatus: TaskStatus.TO_DO,
    }
  }

  componentDidMount(): void {
    this.getTasks()
  }

  sortTasksByStatus = (taskStatus: TaskStatus): TaskCard[] => {
    return this.state.tasks.filter(task => task.taskStatus === taskStatus)
  }

  toggleModal = (taskId = ''): void => {
    const taskIndex = this.state.tasks.findIndex(task => task.taskId === taskId);

    this.setState((prevState) =>
    ({
      isModalOpen: !prevState.isModalOpen,
      taskIndex,
    }));

  };

  addNewTask = (createdTaskStatus: TaskStatus): void => {
    this.setState({ createdTaskStatus });

    this.toggleModal();
  }

  getTasks = (): void => {
    const tasks = localStorageService.getTasks();

    this.setState({ tasks });
  }

  deleteTask = (event: React.MouseEvent, taskId: string): void => {
    event.stopPropagation();

    localStorageService.deleteTask(taskId);

    this.getTasks();
  }

  onDragEnd = (result: DropResult): void => {
    const { destination /* to */, source /* from */, draggableId /* taskId */ } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const currentTask = this.state.tasks.find(task => task.taskId === draggableId);

    if (currentTask && source.droppableId === destination.droppableId) {
      const targetTaskStatus = destination.droppableId as TaskStatus;

      const targetColumn = this.sortTasksByStatus(targetTaskStatus);
      const updatedTask = { ...currentTask, taskStatus: targetTaskStatus }

      targetColumn.splice(source.index, 1)
      targetColumn.splice(destination.index, 0, updatedTask as TaskCard)

      localStorageService.onDragEnd(targetColumn, targetTaskStatus, updatedTask.taskId);

      this.getTasks()

      return;
    }
    const targetTaskStatus = destination.droppableId as TaskStatus;
    const targetColumn = this.sortTasksByStatus(targetTaskStatus);

    if (targetTaskStatus && currentTask) {
      const updatedTask = { ...currentTask, taskStatus: targetTaskStatus };

      targetColumn.splice(destination.index, 0, updatedTask)

      localStorageService.onDragEnd(targetColumn, targetTaskStatus, updatedTask.taskId)
    }

    this.getTasks()
  };

  render(): React.ReactNode {
    const { isModalOpen, taskIndex, tasks, createdTaskStatus } = this.state;

    const toDoTasks = this.sortTasksByStatus(TaskStatus.TO_DO);
    const inProgressTasks = this.sortTasksByStatus(TaskStatus.IN_PROGRESS);
    const reviewTasks = this.sortTasksByStatus(TaskStatus.REVIEW);
    const doneTasks = this.sortTasksByStatus(TaskStatus.DONE);

    const currentTask = tasks[taskIndex];

    return (
      <>
        <TaskModal
          task={tasks[taskIndex]}
          isModalOpen={isModalOpen}
          toggleModal={this.toggleModal}
          getTasks={this.getTasks}
          taskStatus={currentTask ? currentTask.taskStatus : createdTaskStatus}
        />
        <Grid container className="task-board-page">
          <Grid item xs={12}>
            <AppBar className="app-bar-style">
              <Grid container className="app-bar-container" alignItems="center">
                <Grid item xs={10}>
                  <Typography className="header-text" variant="h5">Kanban Desk</Typography>
                </Grid>
                <Grid container item xs={2} justify="flex-end">
                </Grid>
              </Grid>
            </AppBar>
          </Grid>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Grid item xs={3}>
              <Paper className="task-column">
                <Grid container>
                  <Grid className="task-column-header" item xs={12}>
                    <Typography variant="h6">{TaskStatus.TO_DO}</Typography>
                  </Grid>
                  <Droppable droppableId={TaskStatus.TO_DO}>
                    {provided => (
                      <Grid item xs={12}
                        innerRef={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {toDoTasks.map((task, index) => (
                          <Draggable
                            draggableId={task.taskId}
                            index={index}
                            key={task.taskId}
                          >
                            {(provided) => (
                              <Card
                                onClick={() => this.toggleModal(task.taskId)}
                                key={task.taskId}
                                className="card-task"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                innerRef={provided.innerRef}
                              >
                                <CardContent>
                                  <Typography className="title-card" color="textSecondary">
                                    {task.name}
                                  </Typography>
                                  <GridList cellHeight={30} cols={1}>
                                    <Typography variant="body2" component="p">
                                      {task.description}
                                    </Typography>
                                  </GridList>
                                  <Typography className={getColorPriority(task.priority)}>
                                    {task.priority}
                                    <IconButton size="small">
                                      <DeleteOutlinedIcon fontSize="default"
                                        onClick={(event) => this.deleteTask(event, task.taskId)}
                                      />
                                    </IconButton>
                                  </Typography>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Grid>
                    )}
                  </Droppable>
                  <Grid item xs={12}>
                    <Button
                      onClick={() => this.addNewTask(TaskStatus.TO_DO)}
                      className="add-task-button"
                      variant="outlined"
                      color="inherit"
                      href="#outlined-buttons">
                      + Add task
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className="task-column in-progress">
                <Grid container>
                  <Grid className="task-column-header" item xs={12}>
                    <Typography variant="h6">{TaskStatus.IN_PROGRESS}</Typography>
                  </Grid>
                  <Droppable droppableId={TaskStatus.IN_PROGRESS}>
                    {provided => (
                      <Grid item xs={12}
                        innerRef={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {inProgressTasks.map((task, index) => (
                          <Draggable
                            draggableId={task.taskId}
                            index={index}
                            key={task.taskId}
                          >
                            {(provided) => (
                              <Card
                                onClick={() => this.toggleModal(task.taskId)}
                                key={task.taskId}
                                className="card-task"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                innerRef={provided.innerRef}
                              >
                                <CardContent>
                                  <Typography className="title-card" color="textSecondary">
                                    {task.name}
                                  </Typography>
                                  <GridList cellHeight={30} cols={1}>
                                    <Typography variant="body2" component="p">
                                      {task.description}
                                    </Typography>
                                  </GridList>
                                  <Typography className={getColorPriority(task.priority)}>
                                    {task.priority}
                                    <IconButton size="small">
                                      <DeleteOutlinedIcon fontSize="default"
                                        onClick={(event) => this.deleteTask(event, task.taskId)}
                                      />
                                    </IconButton>
                                  </Typography>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Grid>
                    )}
                  </Droppable>
                  <Grid item xs={12}>
                    <Button
                      onClick={() => this.addNewTask(TaskStatus.IN_PROGRESS)}
                      className="add-task-button"
                      variant="outlined"
                      color="inherit"
                      href="#outlined-buttons">
                      + Add task
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className="task-column review">
                <Grid container>
                  <Grid className="task-column-header" item xs={12}>
                    <Typography variant="h6">{TaskStatus.REVIEW}</Typography>
                  </Grid>
                  <Droppable droppableId={TaskStatus.REVIEW}>
                    {provided => (
                      <Grid item xs={12}
                        innerRef={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {reviewTasks.map((task, index) => (
                          <Draggable
                            draggableId={task.taskId}
                            index={index}
                            key={task.taskId}
                          >
                            {(provided) => (
                              <Card
                                onClick={() => this.toggleModal(task.taskId)}
                                key={task.taskId}
                                className="card-task"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                innerRef={provided.innerRef}
                              >
                                <CardContent>
                                  <Typography className="title-card" color="textSecondary">
                                    {task.name}
                                  </Typography>
                                  <GridList cellHeight={30} cols={1}>
                                    <Typography variant="body2" component="p">
                                      {task.description}
                                    </Typography>
                                  </GridList>
                                  <Typography className={getColorPriority(task.priority)}>
                                    {task.priority}
                                    <IconButton size="small">
                                      <DeleteOutlinedIcon fontSize="default"
                                        onClick={(event) => this.deleteTask(event, task.taskId)}
                                      />
                                    </IconButton>
                                  </Typography>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Grid>
                    )}
                  </Droppable>
                  <Grid item xs={12}>
                    <Button
                      onClick={() => this.addNewTask(TaskStatus.REVIEW)}
                      className="add-task-button"
                      variant="outlined"
                      color="inherit"
                      href="#outlined-buttons">
                      + Add task
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper className="task-column done">
                <Grid container>
                  <Grid className="task-column-header" item xs={12}>
                    <Typography variant="h6">{TaskStatus.DONE}</Typography>
                  </Grid>
                  <Droppable droppableId={TaskStatus.DONE}>
                    {provided => (
                      <Grid item xs={12}
                        innerRef={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {doneTasks.map((task, index) => (
                          <Draggable
                            draggableId={task.taskId}
                            index={index}
                            key={task.taskId}
                          >
                            {provided => (
                              <Card
                                onClick={() => this.toggleModal(task.taskId)}
                                key={task.taskId}
                                className="card-task"
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                innerRef={provided.innerRef}
                              >
                                <CardContent>
                                  <Typography className="title-card" color="textSecondary">
                                    {task.name}
                                  </Typography>
                                  <GridList cellHeight={30} cols={1}>
                                    <Typography variant="body2" component="p">
                                      {task.description}
                                    </Typography>
                                  </GridList>
                                  <Typography className={getColorPriority(task.priority)}>
                                    {task.priority}
                                    <IconButton size="small">
                                      <DeleteOutlinedIcon fontSize="default"
                                        onClick={(event) => this.deleteTask(event, task.taskId)}
                                      />
                                    </IconButton>
                                  </Typography>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Grid>
                    )}
                  </Droppable>
                  <Grid item xs={12}>
                    <Button
                      onClick={() => this.addNewTask(TaskStatus.DONE)}
                      className="add-task-button"
                      variant="outlined"
                      color="inherit"
                      href="#outlined-buttons">
                      + Add task
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </DragDropContext>
        </Grid>
      </>
    );
  }
}