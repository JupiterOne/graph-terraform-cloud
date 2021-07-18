import { prefixObjProperties } from './properties';

describe('#prefixObjProperties', () => {
  test('should prefix object properties', () => {
    expect(
      prefixObjProperties('permissions', {
        canUpdate: true,
        canDestroy: false,
      }),
    ).toEqual({
      'permissions.canUpdate': true,
      'permissions.canDestroy': false,
    });
  });
});
