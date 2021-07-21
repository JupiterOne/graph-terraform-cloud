import { fetchOrganizationMembers, fetchOrganizations } from '.';
import { createDataCollectionTest } from '../../../test/recording';
import { integrationConfig } from '../../../test/config';
import { Entities, Relationships } from '../constants';
import { RelationshipClass } from '@jupiterone/data-model';
import { cacheOrganizationData } from '../../util/jobState';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../config';

describe('#fetchOrganizations', () => {
  test('should collect data', async () => {
    await createDataCollectionTest({
      recordingName: 'fetchOrganizations',
      recordingDirectory: __dirname,
      integrationConfig,
      stepFunctions: [fetchOrganizations],
      entitySchemaMatchers: [
        {
          _type: Entities.ORGANIZATION._type,
          matcher: {
            _class: ['Account', 'Organization'],
            schema: {
              additionalProperties: false,
              properties: {
                _type: { const: 'tfe_organization' },
                _rawData: {
                  type: 'array',
                  items: { type: 'object' },
                },
                name: { type: 'string' },
                displayName: { type: 'string' },
                email: { type: 'string' },
                collaboratorAuthPolicy: { type: 'string' },
                ownersTeamSamlRoleId: { type: ['string', 'null'] },
                'permissions.canAccessViaTeams': { type: 'boolean' },
                'permissions.canCreateModule': { type: 'boolean' },
                'permissions.canCreateProvider': { type: 'boolean' },
                'permissions.canCreateTeam': { type: 'boolean' },
                'permissions.canCreateWorkspace': { type: 'boolean' },
                'permissions.canDestroy': { type: 'boolean' },
                'permissions.canManagePublicModules': { type: 'boolean' },
                'permissions.canManagePublicProviders': { type: 'boolean' },
                'permissions.canManageSso': { type: 'boolean' },
                'permissions.canManageSubscription': { type: 'boolean' },
                'permissions.canManageTags': { type: 'boolean' },
                'permissions.canManageUsers': { type: 'boolean' },
                'permissions.canStartTrial': { type: 'boolean' },
                'permissions.canTraverse': { type: 'boolean' },
                'permissions.canUpdate': { type: 'boolean' },
                'permissions.canUpdateAgentPools': { type: 'boolean' },
                'permissions.canUpdateApiToken': { type: 'boolean' },
                'permissions.canUpdateOauth': { type: 'boolean' },
                'permissions.canUpdateSentinel': { type: 'boolean' },
                'permissions.canUpdateSshKeys': { type: 'boolean' },
                planExpired: { type: 'boolean' },
                planExpiresAt: { type: 'string' },
                planIsEnterprise: { type: 'boolean' },
                planIsTrial: { type: 'boolean' },
                samlEnabled: { type: 'boolean' },
                sessionRemember: { type: ['number', 'null'] },
                sessionTimeout: { type: ['number', 'null'] },
                costEstimationEnabled: { type: 'boolean' },
                fairRunQueuingEnabled: { type: 'boolean' },
                twoFactorConformant: { type: 'boolean' },
              },
            },
          },
        },
      ],
      relationshipSchemaMatchers: [],
    });
  });
});

describe('#fetchOrganizationMembers', () => {
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await cacheOrganizationData(context.jobState, [
      {
        organizationName: 'austin-test-org',
        organizationExternalId: 'org-Ljx2Ap3vszNhHWWv',
      },
      {
        organizationName: 'austin-test-org-v2',
        organizationExternalId: 'org-X2NET8eXZP36vxN7',
      },
      {
        organizationName: 'jupiterone',
        organizationExternalId: 'org-yMai1ZUhS39WMAU9',
      },
    ]);

    await createDataCollectionTest({
      context,
      recordingName: 'fetchOrganizationMembers',
      recordingDirectory: __dirname,
      integrationConfig,
      stepFunctions: [fetchOrganizationMembers],
      entitySchemaMatchers: [
        {
          _type: Entities.USER._type,
          matcher: {
            _class: ['User'],
            schema: {
              additionalProperties: false,
              properties: {
                _type: { const: 'tfe_user' },
                _rawData: {
                  type: 'array',
                  items: { type: 'object' },
                },
                name: { type: 'string' },
                displayName: { type: 'string' },
                email: { type: 'string' },
                isServiceAccount: { type: 'boolean' },
                avatarUrl: { type: 'string' },
                mfaEnabled: { type: 'boolean' },
                mfaVerified: { type: 'boolean' },
                'permissions.canChangeEmail': { type: 'boolean' },
                'permissions.canCreateOrganizations': { type: 'boolean' },
                'permissions.canManageUserTokens': { type: 'boolean' },
                'permissions.canChangeUsername': { type: 'boolean' },
              },
            },
          },
        },
      ],
      relationshipSchemaMatchers: [
        {
          _type: Relationships.ORGANIZATION_HAS_USER._type,
          matcher: {
            schema: {
              properties: {
                _class: { const: RelationshipClass.HAS },
                _type: { const: 'tfe_organization_has_user' },
                status: { type: 'string' },
              },
            },
          },
        },
      ],
    });
  });
});
