import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Limit = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const limit = request.query.limit;
  if (limit && !isNaN(limit)) {
    return parseInt(limit);
  }
  return undefined;
});