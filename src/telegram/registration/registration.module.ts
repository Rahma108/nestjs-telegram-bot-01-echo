import { Module } from '@nestjs/common';

import { RegistrationService } from './registration.service';
import { StateModule } from '../state/state.module';

@Module({
    imports: [StateModule],
    providers: [RegistrationService],
    exports: [RegistrationService],
})
export class RegistrationModule {}