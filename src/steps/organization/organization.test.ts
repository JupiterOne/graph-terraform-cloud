import {
  fetchOrganizationEntitlementSet,
  fetchOrganizationMembers,
  fetchOrganizations,
  fetchOrganizationTeams,
  fetchOrganizationWorkspaces,
} from '.';
import { createDataCollectionTest } from '../../../test/recording';
import { integrationConfig } from '../../../test/config';
import { Entities, Relationships } from '../constants';
import { RelationshipClass } from '@jupiterone/data-model';
import { cacheOrganizationData } from '../../util/jobState';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../config';
import { fetchAccount } from '../account';

describe('#fetchOrganizations', () => {
  test('should collect data', async () => {
    await createDataCollectionTest({
      recordingName: 'fetchOrganizations',
      recordingDirectory: __dirname,
      integrationConfig,
      stepFunctions: [fetchAccount, fetchOrganizations],
      entitySchemaMatchers: [
        {
          _type: Entities.ORGANIZATION._type,
          matcher: {
            _class: ['Organization'],
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
                mfaEnabled: { type: 'boolean' },
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
      relationshipSchemaMatchers: [
        {
          _type: Relationships.ACCOUNT_HAS_ORGANIZATION._type,
          matcher: {
            schema: {
              properties: {
                _class: { const: RelationshipClass.HAS },
                _type: { const: 'tfe_account_has_organization' },
              },
            },
          },
        },
      ],
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

describe('#fetchOrganizationWorkspaces', () => {
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await cacheOrganizationData(context.jobState, [
      {
        organizationName: 'jupiterone',
        organizationExternalId: 'org-yMai1ZUhS39WMAU9',
      },
    ]);

    await createDataCollectionTest({
      context,
      recordingName: 'fetchOrganizationWorkspaces',
      recordingDirectory: __dirname,
      integrationConfig,
      stepFunctions: [fetchOrganizationWorkspaces],
      entitySchemaMatchers: [
        {
          _type: Entities.WORKSPACE._type,
          matcher: {
            _class: ['Project'],
            schema: {
              additionalProperties: false,
              properties: {
                _type: { const: 'tfe_workspace' },
                _rawData: {
                  type: 'array',
                  items: { type: 'object' },
                },
                actionsIsDestroyable: { type: ['boolean', 'null'] },
                allowDestroyPlan: { type: ['boolean', 'null'] },
                applyDurationAverage: { type: ['number', 'null'] },
                autoApply: { type: ['boolean', 'null'] },
                autoDestroyAt: { type: ['string', 'null'] },
                createdAt: { type: ['string', 'null'] },
                executionMode: { type: ['string', 'null'] },
                description: { type: 'string' },
                environment: { type: ['string', 'null'] },
                fileTriggersEnabled: { type: ['boolean', 'null'] },
                globalRemoteState: { type: ['boolean', 'null'] },
                latestChangeAt: { type: ['string', 'null'] },
                locked: { type: ['boolean', 'null'] },
                name: { type: 'string' },
                operations: { type: ['boolean', 'null'] },
                planDurationAverage: { type: ['number', 'null'] },
                policyCheckFailures: { type: ['number', 'null'] },
                queueAllRuns: { type: ['boolean', 'null'] },
                resourceCount: { type: ['number', 'null'] },
                runFailures: { type: ['number', 'null'] },
                source: { type: ['string', 'null'] },
                sourceName: { type: ['string', 'null'] },
                sourceUrl: { type: ['string', 'null'] },
                speculativeEnabled: { type: ['boolean', 'null'] },
                structuredRunOutputEnabled: {
                  type: ['boolean', 'null'],
                },
                terraformVersion: { type: ['string', 'null'] },
                triggerPrefixes: {
                  type: 'array',
                  items: { type: ['string', 'null'] },
                },
                updatedAt: { type: ['string', 'null'] },
                vcsRepoBranch: { type: ['string', 'null'] },
                vcsRepoDisplayIndentifier: { type: ['string', 'null'] },
                vcsRepoIngressSubmodules: { type: ['string', 'null'] },
                vcsRepoOauthTokenId: { type: ['string', 'null'] },
                vcsRepoRepositoryHttpUrl: { type: ['string', 'null'] },
                vcsRepoServiceProvider: { type: ['string', 'null'] },
                vcsRepoWebhookUrl: { type: ['string', 'null'] },
                vcsRepoIdentifier: { type: ['string', 'null'] },
                workingDirectory: { type: ['string', 'null'] },
                workspaceKpisRunsCount: { type: ['number', 'null'] },
                'permissions.canUpdate': { type: ['boolean', 'null'] },
                'permissions.canDestroy': { type: ['boolean', 'null'] },
                'permissions.canQueueDestroy': { type: ['boolean', 'null'] },
                'permissions.canQueueRun': { type: ['boolean', 'null'] },
                'permissions.canQueueApply': { type: ['boolean', 'null'] },
                'permissions.canReadStateVersions': {
                  type: ['boolean', 'null'],
                },
                'permissions.canCreateStateVersions': {
                  type: ['boolean', 'null'],
                },
                'permissions.canReadVariable': { type: ['boolean', 'null'] },
                'permissions.canUpdateVariable': { type: ['boolean', 'null'] },
                'permissions.canLock': { type: ['boolean', 'null'] },
                'permissions.canUnlock': { type: ['boolean', 'null'] },
                'permissions.canForceUnlock': { type: ['boolean', 'null'] },
                'permissions.canReadSettings': { type: ['boolean', 'null'] },
                'permissions.canManageTags': { type: ['boolean', 'null'] },
              },
            },
          },
        },
      ],
      relationshipSchemaMatchers: [
        {
          _type: Relationships.ORGANIZATION_HAS_WORKSPACE._type,
          matcher: {
            schema: {
              properties: {
                _class: { const: RelationshipClass.HAS },
                _type: { const: 'tfe_organization_has_workspace' },
              },
            },
          },
        },
      ],
    });
  });
});

describe('#fetchOrganizationEntitlementSet', () => {
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await cacheOrganizationData(context.jobState, [
      {
        organizationName: 'jupiterone',
        organizationExternalId: 'org-yMai1ZUhS39WMAU9',
      },
      {
        organizationName: 'j1-test-org',
        organizationExternalId: 'org-qcDVXfQDYmRkaSDr',
      },
    ]);

    await createDataCollectionTest({
      context,
      recordingName: 'fetchOrganizationEntitlementSet',
      recordingDirectory: __dirname,
      integrationConfig,
      stepFunctions: [fetchOrganizationEntitlementSet],
      entitySchemaMatchers: [
        {
          _type: Entities.ENTITLEMENT_SET._type,
          matcher: {
            _class: ['Entity'],
            schema: {
              additionalProperties: false,
              properties: {
                _type: { const: 'tfe_entitlement_set' },
                _rawData: {
                  type: 'array',
                  items: { type: 'object' },
                },
                name: { type: 'string' },
                costEstimation: { type: 'boolean' },
                configurationDesigner: { type: 'boolean' },
                operations: { type: 'boolean' },
                privateModuleRegistry: { type: 'boolean' },
                sentinel: { type: 'boolean' },
                stateStorage: { type: 'boolean' },
                teams: { type: 'boolean' },
                vcsIntegrations: { type: 'boolean' },
                usageReporting: { type: 'boolean' },
                userLimit: { type: ['number', 'null'] },
                selfServeBilling: { type: 'boolean' },
                auditLogging: { type: 'boolean' },
                agents: { type: 'boolean' },
                sso: { type: 'boolean' },
              },
            },
          },
        },
      ],
      relationshipSchemaMatchers: [
        {
          _type: Relationships.ORGANIZATION_HAS_ENTITLEMENT_SET._type,
          matcher: {
            schema: {
              properties: {
                _class: { const: RelationshipClass.HAS },
                _type: { const: 'tfe_organization_has_entitlement_set' },
              },
            },
          },
        },
      ],
    });
  });
});

describe('#fetchOrganizationTeams', () => {
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await cacheOrganizationData(context.jobState, [
      {
        organizationName: 'jupiterone',
        organizationExternalId: 'org-yMai1ZUhS39WMAU9',
      },
      {
        organizationName: 'j1-test-org',
        organizationExternalId: 'org-qcDVXfQDYmRkaSDr',
      },
    ]);

    await createDataCollectionTest({
      context,
      recordingName: 'fetchOrganizationTeams',
      recordingDirectory: __dirname,
      integrationConfig,
      stepFunctions: [fetchOrganizationTeams],
      entitySchemaMatchers: [
        {
          _type: Entities.TEAM._type,
          matcher: {
            _class: ['Team'],
            schema: {
              additionalProperties: false,
              properties: {
                _type: { const: 'tfe_team' },
                _rawData: {
                  type: 'array',
                  items: { type: 'object' },
                },
                name: { type: 'string' },
                usersCount: { type: 'number' },
                visibility: { type: 'string' },
                organizationAccessManagePolicies: { type: ['boolean', 'null'] },
                organizationAccessManagePolicyOverrides: {
                  type: ['boolean', 'null'],
                },
                organizationAccessManageWorkspaces: {
                  type: ['boolean', 'null'],
                },
                organizationAccessManageVcsSettigs: {
                  type: ['boolean', 'null'],
                },
                'permissions.canUpdateMembership': {
                  type: ['boolean', 'null'],
                },
                'permissions.canDestroy': { type: ['boolean', 'null'] },
                'permissions.canUpdateOrganizationAccess': {
                  type: ['boolean', 'null'],
                },
                'permissions.canUpdateApiToken': { type: ['boolean', 'null'] },
                'permissions.canUpdateVisibility': {
                  type: ['boolean', 'null'],
                },
              },
            },
          },
        },
      ],
      relationshipSchemaMatchers: [
        {
          _type: Relationships.ORGANIZATION_HAS_TEAM._type,
          matcher: {
            schema: {
              properties: {
                _class: { const: RelationshipClass.HAS },
                _type: { const: 'tfe_organization_has_team' },
              },
            },
          },
        },
      ],
    });
  });
});
