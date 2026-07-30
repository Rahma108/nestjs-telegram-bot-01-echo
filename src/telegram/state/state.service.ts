import { Injectable } from '@nestjs/common';
import { RegistrationStep, UserState } from './user-state.interface';

@Injectable()
export class StateService {
    private readonly users = new Map<number, UserState>();

    get(userId: number): UserState {
        return (
        this.users.get(userId) ?? {
            step: RegistrationStep.NONE,
        }
        );
    }

    set(userId: number, state: UserState) {
        this.users.set(userId, state);
    }

    clear(userId: number) {
        this.users.delete(userId);
    }
    }