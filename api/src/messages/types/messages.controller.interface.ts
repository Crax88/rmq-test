import { NextFunction, Request, Response } from 'express';
import { BaseController } from 'src/common/base.controller';

export interface MessagesControllerInterface extends BaseController {
	processMessage: (
		req: Request<{ text: string }>,
		res: Response,
		next: NextFunction,
	) => Promise<void>;
}
