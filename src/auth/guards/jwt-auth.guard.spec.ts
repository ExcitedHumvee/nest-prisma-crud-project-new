import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should call super.canActivate', () => {
    const context = {} as ExecutionContext;
    // Spy on super.canActivate
    const superCanActivate = jest.spyOn(JwtAuthGuard.prototype, 'canActivate');
    guard.canActivate(context);
    expect(superCanActivate).toHaveBeenCalledWith(context);
  });
});
