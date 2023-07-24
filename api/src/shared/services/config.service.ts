import { inject, injectable } from 'inversify';

import { AppConfigInterface, AppConfigKey } from '../../common/types/appConfig.interface';
import { ConfigInterface } from '../../common/types/config.interface';
import { LoggerInterface } from '../../common/types/logger.interface';
import { TYPES } from '../../types';

@injectable()
export class ConfigService implements ConfigInterface {
	private config: AppConfigInterface = {
		NODE_ENV: '',
		PORT: '',
		RABBIT_HOST: '',
		RABBIT_PASSWORD: '',
		RABBIT_PORT: '',
		RABBIT_USER: '',
	};

	constructor(@inject(TYPES.LoggerService) private loggerService: LoggerInterface) {
		try {
			for (const param in this.config) {
				const envParam = process.env[param];
				if (!envParam) {
					throw new Error(`Parameter ${param} is not defined in the env`);
				}
				this.config[param as keyof AppConfigInterface] = envParam;
			}
			this.loggerService.info(`[ConfigService] Successfully load env configuration`);
		} catch (error) {
			error instanceof Error && this.loggerService.error(`[ConfigService] ${error.message}`, error);
		}
	}

	get(key: AppConfigKey): string {
		return this.config[key];
	}
}
