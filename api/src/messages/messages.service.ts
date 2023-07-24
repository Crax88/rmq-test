import { inject, injectable } from 'inversify';
import { hrtime } from 'process';
import { RabbitMQServiceInterface } from 'src/shared/services/types/rabbitmq.service.interface';
import { v4 } from 'uuid';

import { HttpException } from '../exceptions/httpException';
import { TYPES } from '../types';

import { MessagesServiceInterface } from './types/messages.service.interface';
import { LoggerInterface } from 'src/common/types/logger.interface';
import { ConsumeMessage } from 'amqplib';

@injectable()
export class MessagesService implements MessagesServiceInterface {
	constructor(
		@inject(TYPES.RabbitMQService) private rabbitMQService: RabbitMQServiceInterface,
		@inject(TYPES.LoggerService) private loggerService: LoggerInterface,
	) {}

	async processMessage(dto: { text: string }): Promise<string> {
		try {
			await this.rabbitMQService.exchangeDeclare('messages', 'topic', { durable: true });
			await this.rabbitMQService.queueDeclare('messagesProcess', { durable: true });
			await this.rabbitMQService.queueDeclare('messagesProcessed', { durable: true });
			await this.rabbitMQService.queueBind('messagesProcess', 'messages', 'income_message');
			await this.rabbitMQService.queueBind('messagesProcessed', 'messages', 'outcome_message.*');
			const messageId = v4();
			const message = { id: messageId, message: dto.text };
			await this.rabbitMQService.publish(message, 'messages', 'income_message');
			const start = Date.now();
			const waitUntil = start + 60 * 1000;
			let response = await this.waitForReoly(messageId);

			// while (!response || Date.now() <= waitUntil) {
			// 	console.log('AWAIT');
			// 	await this.rabbitMQService.consume('messagesProcessed', async (msg) => {
			// 		if (msg) {
			// 			const routingKey = msg?.fields.routingKey;
			// 			const id = routingKey?.split('.')[1];
			// 			if (id === messageId) {
			// 				response = JSON.parse(msg.content.toString());
			// 				await this.rabbitMQService.ack(msg);
			// 			} else {
			// 				await this.rabbitMQService.reject(msg, true);
			// 			}
			// 		}
			// 	});
			// }
			if (!response) {
				throw new HttpException(500, 'Unable to process');
			}

			const result = JSON.parse(response.content.toString())['message'];
			return result;
		} catch (error) {
			this.loggerService.error(error);
			throw new HttpException(500, 'SomethingWentWrong', 'MessagesService-processMessage');
		}
	}

	private async waitForReoly(waitId: string): Promise<ConsumeMessage | null> {
		const start = Date.now();
		const waitUntil = start + 60 * 1000;
		let response: ConsumeMessage | null = null;

		while (!response || Date.now() <= waitUntil) {
			if (response) {
				break;
			}
			await this.rabbitMQService.consume('messagesProcessed', async (msg) => {
				if (msg) {
					const routingKey = msg?.fields.routingKey;
					const id = routingKey?.split('.')[1];
					if (id === waitId) {
						response = msg;
						await this.rabbitMQService.ack(msg);
					} else {
						await this.rabbitMQService.reject(msg, true);
					}
				}
			});
		}

		return response;
	}
}
