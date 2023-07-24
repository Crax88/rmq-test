import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { BaseController } from '../common/base.controller';
import { LoggerInterface } from '../common/types/logger.interface';
import { TYPES } from '../types';

import { MessagesControllerInterface } from './types/messages.controller.interface';
import { MessagesServiceInterface } from './types/messages.service.interface';

@injectable()
export class MessagesContoller extends BaseController implements MessagesControllerInterface {
	constructor(
		@inject(TYPES.LoggerService) loggerService: LoggerInterface,
		@inject(TYPES.MessagesService) private messagesService: MessagesServiceInterface,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/messages',
				method: 'post',
				handler: this.processMessage,
			},
		]);
	}

	async processMessage(
		req: Request<{}, {}, { text: string }, {}>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		try {
			const result = await this.messagesService.processMessage(req.body);
			this.ok(res, result);
		} catch (error) {
			next(error);
		}
	}
}
