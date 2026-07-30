import { Injectable } from '@nestjs/common';
import { StateService } from '../state/state.service';
import { RegistrationStep } from '../state/user-state.interface';


@Injectable()
export class RegistrationService {
  constructor(
    private readonly stateService: StateService,
  ) {}
        start(userId: number) {
            this.stateService.set(userId, {
            step: RegistrationStep.WAITING_NAME,
            });
        }

        getState(userId: number) {
            return this.stateService.get(userId);
        }

        clear(userId: number) {
            this.stateService.clear(userId);
        }

        saveName(userId: number, name: string) {
            this.stateService.set(userId, {
            step: RegistrationStep.WAITING_AGE,
            name,
            });
        }
        handleName(userId: number, name: string) {
            this.stateService.set(userId, {
                step: RegistrationStep.WAITING_AGE,
                name,
            });
            }
        handleAge(userId: number, age: number) {
            const state = this.stateService.get(userId);

            this.stateService.clear(userId);

            return {
                name: state.name,
                age,
            };
            }
        cancel(userId: number) {
        this.stateService.clear(userId);
        }

        status(userId: number) {
        return this.stateService.get(userId);
        }
}