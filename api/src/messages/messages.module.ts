import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from '../types';

import { MessagesControllerInterface } from './types/messages.controller.interface';
import { MessagesServiceInterface } from './types/messages.service.interface';
import { MessagesContoller } from './messages.controller';
import { MessagesService } from './messages.service';

export const MessagesModule = new ContainerModule((bind: interfaces.Bind) => {
	bind<MessagesControllerInterface>(TYPES.MessagesController)
		.to(MessagesContoller)
		.inSingletonScope();
	bind<MessagesServiceInterface>(TYPES.MessagesService).to(MessagesService).inSingletonScope();
});
