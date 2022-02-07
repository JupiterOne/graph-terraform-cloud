import { getMockWorkspaceResource } from '../../../test/mocks';
import { createWorkspaceResourceEntity } from './converters';

describe('#createWorkspaceResourceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createWorkspaceResourceEntity('resource-id', getMockWorkspaceResource()),
    ).toMatchSnapshot();
  });
});
