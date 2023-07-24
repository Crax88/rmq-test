import { Container } from 'inversify';

import { ExceptionFilterInterface } from './common/types/exceptionFilter.interface';
import { ExceptionFilter } from './exceptions/exception.filter';
import { MessagesModule } from './messages/messages.module';
import { SharedModule } from './shared/shared.module';
import { App } from './App';
import { TYPES } from './types';

export interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}
async function bootstrap(): Promise<IBootstrapReturn> {
	const appContainer = new Container();
	appContainer.bind<App>(TYPES.Application).to(App).inSingletonScope();
	appContainer
		.bind<ExceptionFilterInterface>(TYPES.ExceptionFilter)
		.to(ExceptionFilter)
		.inSingletonScope();
	appContainer.load(SharedModule, MessagesModule);

	const app = appContainer.get<App>(TYPES.Application);

	await app.init();

	return { app, appContainer };
}

export const boot = bootstrap();

// import { connect } from 'amqplib';

// const start = async () => {
// 	console.log('HOST: ' + process.env.RABBIT_USER, 'PORT: ' + process.env.RABBIT_PASSWORD);

// 	try {
// 		const rabbit = await connect({
// 			hostname: process.env.RABBIT_HOST,
// 			port: 5672, //Number(process.env.RABBIT_PORT),
// 			username: process.env.RABBIT_USER,
// 			password: process.env.RABBIT_PASSWORD,
// 			heartbeat: 60,
// 			protocol: 'amqp',
// 		});
// 		const channel = await rabbit.createChannel();
// 		await channel.assertExchange('daemon', 'topic', { durable: true });
// 		await channel.assertQueue('process', { durable: true });
// 		await channel.bindQueue('process', 'daemon', 'process');
// 		const msg = {
// 			id: Math.floor(Math.random() * 1000),
// 			email: 'user@domail.com',
// 			name: 'firstname lastname',
// 		};
// 		channel.publish('daemon', 'process', Buffer.from(JSON.stringify(msg)));
// 	} catch (err) {
// 		console.log(err);
// 	}
// };

// start();
