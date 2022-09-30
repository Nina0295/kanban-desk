import cryptoRandomString from 'crypto-random-string';
import deepEqual from 'deep-equal';
import { getColorPriority } from '../helpers/getColorPriority';
import { LocalStorageService } from '../services/LocalStorageService';
import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormHelperText,
  Select,
  TextField
} from '@material-ui/core';
import { TaskCard, TaskPriority, TaskStatus } from '../interfaces/Interface_cards';
import './modalStyle.scss';

interface TaskModalProps {
  isModalOpen: boolean;
  task: TaskCard;
  taskStatus: TaskStatus;
  toggleModal(): void;
  getTasks(): void;
}

interface TaskModalState {
  taskId: string;
  name: string;
  description: string;
  priority: TaskPriority;
  taskStatus: TaskStatus;
}

const localStorageService = LocalStorageService.getInstance();

export default class TaskModal extends React.Component<TaskModalProps, TaskModalState> {
  constructor(props: TaskModalProps) {
    super(props);
    this.state = {
      taskId: '',
      name: '',
      description: '',
      priority: TaskPriority.Low,
      taskStatus: TaskStatus.TO_DO,
    }
  }

  componentDidMount(): void {
    const { task, taskStatus } = this.props;

    this.setTask(task, taskStatus);
  }

  componentDidUpdate(prevProps: TaskModalProps): void {
    if (!deepEqual(prevProps, this.props)) {
      const { task, taskStatus } = this.props;

      this.setTask(task, taskStatus);
    }
  }

  setTask(task: TaskCard, taskStatus: TaskStatus): void {
    const {
      taskId = '',
      name = '',
      description = '',
      priority = TaskPriority.Low,
    } = task || {};

    this.setState({
      taskId,
      name,
      description,
      priority,
      taskStatus
    });
  }

  onChangeTitle = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;

    this.setState({ name: value });
  }

  onChangeDescription = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { value } = event.target;

    this.setState({ description: value });
  }

  onChangePriority = (event: React.ChangeEvent<{ value: unknown; }>): void => {
    const priority = event.target.value;

    this.setState({ priority: priority as TaskPriority });
  }

  onChangeStatus = (event: React.ChangeEvent<{ value: unknown; }>): void => {
    const taskStatus = event.target.value;

    this.setState({ taskStatus: taskStatus as TaskStatus })
  }

  createTask = (): void => {
    const newTask = {
      ...this.state,
      taskId: cryptoRandomString({ length: 10, type: 'base64' }),
    };

    localStorageService.addTasks(newTask)

    this.props.getTasks();
    this.props.toggleModal();
  }

  updateTask = (): void => {
    localStorageService.updatedTask({ ...this.state });

    this.props.getTasks();
    this.props.toggleModal();
  }

  render(): React.ReactNode {
    const { toggleModal, isModalOpen } = this.props;
    const { name, description, priority, taskStatus, taskId } = this.state;

    return (
      <Dialog className="task-modal" open={isModalOpen} onClose={toggleModal} aria-labelledby="form-dialog-title">
        <DialogContent className="modal-description">
          <Select
            native
            value={taskStatus}
            onChange={this.onChangeStatus}
            label={taskStatus}
          >
            <option value={TaskStatus.TO_DO}>{TaskStatus.TO_DO}</option>
            <option value={TaskStatus.IN_PROGRESS}>{TaskStatus.IN_PROGRESS}</option>
            <option value={TaskStatus.REVIEW}>{TaskStatus.REVIEW}</option>
            <option value={TaskStatus.DONE}>{TaskStatus.DONE}</option>
          </Select>
        </DialogContent>
        <DialogTitle>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Title"
            type="title"
            value={name}
            onChange={this.onChangeTitle}
            fullWidth
          />
        </DialogTitle>
        <DialogContent className="modal-description">
          <DialogContentText >
            <TextField
              id="standard-textarea"
              label="Description"
              placeholder="Description"
              multiline
              fullWidth
              defaultValue={description}
              onChange={this.onChangeDescription}
            />
          </DialogContentText>
          <FormHelperText>Priority</FormHelperText>
          <Select
            native
            value={priority}
            onChange={this.onChangePriority}
            className={getColorPriority(priority)}
            label={priority}
          >
            <option value={TaskPriority.Low}>{TaskPriority.Low}</option>
            <option value={TaskPriority.Medium}>{TaskPriority.Medium}</option>
            <option value={TaskPriority.High}>{TaskPriority.High}</option>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleModal} color="primary">
            Cancel
          </Button>
          {taskId
            ? <Button onClick={this.updateTask} color="primary">Save</Button>
            : <Button onClick={this.createTask} color="primary">Create</Button>
          }
        </DialogActions>
      </Dialog>
    );
  }
}
