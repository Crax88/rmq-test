import 'reflect-metadata';
import { join } from 'path';

import { json } from 'body-parser';
import express, { Express } from 'express';
import helmet from 'helmet';
import { inject, injectable } from 'inversify';
import { Server } from 'node:http';
import { MessagesControllerInterface } from 'src/messages/types/messages.controller.interface';

import { ConfigInterface } from './common/types/config.interface';
import { ExceptionFilterInterface } from './common/types/exceptionFilter.interface';
import { LoggerInterface } from './common/types/logger.interface';
import { TYPES } from './types';
import { RabbitMQServiceInterface } from './shared/services/types/rabbitmq.service.interface';

@injectable()
export class App {
	private app: Express;
	private port: number;
	private server: Server;

	constructor(
		@inject(TYPES.ConfigService) private configService: ConfigInterface,
		@inject(TYPES.LoggerService) private loggerService: LoggerInterface,
		@inject(TYPES.MessagesController) private messagesController: MessagesControllerInterface,
		@inject(TYPES.ExceptionFilter) private exceptionFilter: ExceptionFilterInterface,
		@inject(TYPES.RabbitMQService) private rabbitMQService: RabbitMQServiceInterface,
	) {
		this.port = Number(this.configService.get('PORT'));
		this.app = express();
	}

	async init(): Promise<void> {
		this.useMiddlewares();
		this.useRoutes();
		await this.rabbitMQService.connet();
		this.useExceptionFilters();
		this.server = this.app.listen(this.port, () => {
			this.loggerService.info(`[App] Server started on port ${this.port}`);
		});
		process.on('uncaughtException', async (err) => {
			this.loggerService.error(`[App] Uncaught exception ${err.message}`, err);
			await this.rabbitMQService.close();
			process.exit(1);
		});
	}

	close(): void {
		this.server.close();
	}

	private useMiddlewares(): void {
		this.app.use(json());
		this.app.use(helmet());
		this.app.use(express.static('./'));
	}

	private useRoutes(): void {
		this.app.use('/api', this.messagesController.router);
	}

	private useExceptionFilters(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}
}
