import { ConsumeMessage, Options } from 'amqplib';

export interface RabbitMQServiceInterface {
	connet: () => Promise<void>;
	exchangeDeclare: (name: string, type: string, options: Options.AssertExchange) => Promise<void>;
	queueDeclare: (name: string, options: Options.AssertQueue) => Promise<void>;
	queueBind: (queueName: string, exchangeName: string, routingKey: string) => Promise<void>;
	publish: (body: unknown, exchangeName: string, routingKey: string) => Promise<void>;
	consume: (queueName: string, cb: (msg: ConsumeMessage | null) => void) => Promise<void>;
	ack: (msg: ConsumeMessage) => Promise<void>;
	reject: (msg: ConsumeMessage, requeue: boolean) => Promise<void>;
	close: () => Promise<void>;
}
