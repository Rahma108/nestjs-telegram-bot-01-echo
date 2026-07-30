export enum RegistrationStep {
  NONE = 'NONE',
  WAITING_NAME = 'WAITING_NAME',
  WAITING_AGE = 'WAITING_AGE',
    WAITING_TASK = 'WAITING_TASK',
    WAITING_EDIT_TASK = 'WAITING_EDIT_TASK',
  WAITING_DUE_DATE = 'WAITING_DUE_DATE',
   WAITING_PRIORITY = 'WAITING_PRIORITY',
}

export interface UserState {
  step: RegistrationStep;

  name?: string;
  taskId?: string;

  taskTitle?: string;
  dueDate?: Date | null;
  priority?: string;
}
