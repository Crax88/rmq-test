import { Channel, connect, Connection, ConsumeMessage, Options } from 'amqplib';
import { inject, injectable } from 'inversify';

import { ConfigInterface } from '../../common/types/config.interface';
import { LoggerInterface } from '../../common/types/logger.interface';
import { TYPES } from '../../types';

import { RabbitMQServiceInterface } from './types/rabbitmq.service.interface';

@injectable()
export class RabbitMQService implements RabbitMQServiceInterface {
	private connection: Connection;
	private channel: Channel;
	constructor(
		@inject(TYPES.LoggerService) private loggerService: LoggerInterface,
		@inject(TYPES.ConfigService) private configService: ConfigInterface,
	) {}

	async connet(): Promise<void> {
		try {
			this.connection = await connect({
				hostname: this.configService.get('RABBIT_HOST'),
				port: Number(this.configService.get('RABBIT_PORT')),
				username: this.configService.get('RABBIT_USER'),
				password: this.configService.get('RABBIT_PASSWORD'),
				protocol: 'amqp',
				heartbeat: 60,
			});
			this.loggerService.info(`[RabbitMQService] RabbitMQ connection successfull`);
		} catch (error) {
			error instanceof Error &&
				this.loggerService.error(`[RabbitMQService] ${error.message}`, error);
		}
	}

	async exchangeDeclare(
		name: string,
		type = 'topic',
		options?: Options.AssertExchange,
	): Promise<void> {
		try {
			const channel = await this.getChannel();
			await channel.assertExchange(name, type, options);
		} catch (error) {
			error instanceof Error &&
				this.loggerService.error(`[RabbitMQService] ${error.message}`, error);
		}
	}

	async queueDeclare(name: string, options: Options.AssertQueue): Promise<void> {
		try {
			const channel = await this.getChannel();
			await channel.assertQueue(name, options);
		} catch (error) {
			error instanceof Error &&
				this.loggerService.error(`[RabbitMQService] ${error.message}`, error);
		}
	}

	async queueBind(queueName: string, exchangeName: string, routingKey: string): Promise<void> {
		try {
			const channel = await this.getChannel();
			await channel.bindQueue(queueName, exchangeName, routingKey);
		} catch (error) {
			error instanceof Error &&
				this.loggerService.error(`[RabbitMQService] ${error.message}`, error);
		}
	}

	async publish(body: unknown, exchangeName: string, routingKey: string): Promise<void> {
		try {
			const channel = await this.getChannel();

			await channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(body)));
		} catch (error) {
			console.log(error);
			error instanceof Error &&
				this.loggerService.error(`[RabbitMQService] ${error.message}`, error);
		}
	}

	async consume(queueName: string, cb: (msg: ConsumeMessage | null) => void): Promise<void> {
		try {
			const channel = await this.getChannel();
			await channel.prefetch(1);
			channel.consume(queueName, (msg) => {
				cb(msg);
			});
		} catch (error) {
			error instanceof Error &&
				this.loggerService.error(`[RabbitMQService] ${error.message}`, error);
			cb(null);
		}
	}

	async ack(msg: ConsumeMessage): Promise<void> {
		try {
			const channel = await this.getChannel();
			channel.ack(msg);
		} catch (error) {
			error instanceof Error &&
				this.loggerService.error(`[RabbitMQService] ${error.message}`, error);
		}
	}

	async reject(msg: ConsumeMessage, requeue = false): Promise<void> {
		try {
			const channel = await this.getChannel();
			channel.reject(msg, requeue);
		} catch (error) {
			error instanceof Error &&
				this.loggerService.error(`[RabbitMQService] ${error.message}`, error);
		}
	}

	async close(): Promise<void> {
		await this.channel.close();
		await this.connection.close();
	}

	private async getChannel(): Promise<Channel> {
		if (!this.channel) {
			this.channel = await this.connection.createChannel();
		}

		return this.channel;
	}
}
