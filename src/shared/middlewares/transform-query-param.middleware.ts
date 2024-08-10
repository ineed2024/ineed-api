import { Request, Response, NextFunction } from 'express';

export function transformQueryParamMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const newQueryParam = {};

  if (!!req.query) {
    Object.keys(req.query).forEach((key) => {
      const keySplited = key.split('');

      keySplited[0] = keySplited[0].toLowerCase();

      newQueryParam[keySplited.join('')] = req.query[key];
    });

    req.query = newQueryParam;
  }

  next();
}
