import {
  getMockEntitlementSet,
  getMockOrganization,
  getMockOrganizationWorkspace,
  getMockUser,
} from '../../../test/mocks';
import {
  createOrganizationEntitlementSetEntity,
  createOrganizationEntity,
  createOrganizationMemberEntity,
  createOrganizationWorkspaceEntity,
} from './converters';

describe('#createOrganizationEntity', () => {
  test('should convert to entity', () => {
    expect(createOrganizationEntity(getMockOrganization())).toMatchSnapshot();
  });
});

describe('#createOrganizationMemberEntity', () => {
  test('should convert to entity', () => {
    expect(
      createOrganizationMemberEntity({
        userId: 'test-id',
        userData: getMockUser(),
      }),
    ).toMatchSnapshot();
  });
});

describe('#createOrganizationWorkspaceEntity', () => {
  test('should convert to entity', () => {
    expect(
      createOrganizationWorkspaceEntity(
        'workspace-id',
        getMockOrganizationWorkspace(),
      ),
    ).toMatchSnapshot();
  });
});

describe('#createOrganizationEntitlementSetEntity', () => {
  test('should convert to entity', () => {
    expect(
      createOrganizationEntitlementSetEntity(
        'organization-id',
        getMockEntitlementSet(),
      ),
    ).toMatchSnapshot();
  });
});
