import { NextFunction, Request, Response, Router } from 'express';

export interface RouteInterface {
	path: string;
	handler: (req: Request<any>, res: Response, next: NextFunction) => void;
	method: keyof Pick<Router, 'get' | 'post' | 'delete' | 'patch' | 'put'>;
}

export type ExpressReturnType = Response<unknown, Record<string, unknown>>;
