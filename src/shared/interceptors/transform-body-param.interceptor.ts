import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';

@Injectable()
export class TransformBodyParamInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();

    const newBodyParam = {};

    if (!!req.body) {
      Object.keys(req.body).forEach((key) => {
        const keySplited = key.split('');

        keySplited[0] = keySplited[0].toLowerCase();

        newBodyParam[keySplited.join('')] = req.body[key];
      });

      req.body = newBodyParam;
    }

    return next.handle();
  }
}
