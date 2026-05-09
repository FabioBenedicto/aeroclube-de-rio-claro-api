import { PermissionsGuard } from './permissions.guard';
import { Reflector } from '@nestjs/core';

const makeContext = (user: any, permission?: string) => {
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(permission) } as any;
  const ctx = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as any;
  return { reflector, ctx };
};

describe('PermissionsGuard', () => {
  it('passes when no permission is required', () => {
    const { reflector, ctx } = makeContext({ role: 'EMPLOYEE', permissions: [] }, undefined);
    const guard = new PermissionsGuard(reflector as Reflector);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('passes for ADMIN regardless of permission', () => {
    const { reflector, ctx } = makeContext({ role: 'ADMIN', permissions: [] }, 'flights:view');
    const guard = new PermissionsGuard(reflector as Reflector);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('passes for EMPLOYEE with the required permission', () => {
    const { reflector, ctx } = makeContext(
      { role: 'EMPLOYEE', permissions: ['flights:view', 'flights:create'] },
      'flights:view',
    );
    const guard = new PermissionsGuard(reflector as Reflector);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('blocks EMPLOYEE missing the required permission', () => {
    const { reflector, ctx } = makeContext(
      { role: 'EMPLOYEE', permissions: ['flights:view'] },
      'flights:create',
    );
    const guard = new PermissionsGuard(reflector as Reflector);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('blocks when user is absent', () => {
    const { reflector, ctx } = makeContext(null, 'flights:view');
    const guard = new PermissionsGuard(reflector as Reflector);
    expect(guard.canActivate(ctx)).toBe(false);
  });
});
