export enum RegistrationStep {
  NONE = 'NONE',
  WAITING_NAME = 'WAITING_NAME',
  WAITING_AGE = 'WAITING_AGE',
}

export interface UserState {
  step: RegistrationStep;

  name?: string;
}