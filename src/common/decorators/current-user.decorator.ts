import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../../generated/prisma';

/**
 * Custom decorator to extract the current user from the request
 * This decorator is used in protected routes to access the authenticated user
 */
export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
