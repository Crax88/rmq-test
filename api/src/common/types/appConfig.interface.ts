export interface AppConfigInterface {
	PORT: string;
	NODE_ENV: string;
	RABBIT_HOST: string;
	RABBIT_PORT: string;
	RABBIT_USER: string;
	RABBIT_PASSWORD: string;
}

export type AppConfigKey = keyof AppConfigInterface;
