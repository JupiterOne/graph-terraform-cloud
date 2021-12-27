import { fetchWorkspaceResources } from '.';
import { createDataCollectionTest } from '../../../test/recording';
import { integrationConfig } from '../../../test/config';
import { Entities, Relationships } from '../constants';
import { RelationshipClass } from '@jupiterone/data-model';
import { cacheOrganizationData } from '../../util/jobState';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../config';
import { fetchOrganizationWorkspaces } from '../organization';

describe('#fetchWorkspaceResources', () => {
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await cacheOrganizationData(context.jobState, [
      // {
      //   organizationName: 'austin-test-org',
      //   organizationExternalId: 'org-Ljx2Ap3vszNhHWWv',
      // },
      // {
      //   organizationName: 'austin-test-org-v2',
      //   organizationExternalId: 'org-X2NET8eXZP36vxN7',
      // },
      {
        organizationName: 'jupiterone',
        organizationExternalId: 'org-yMai1ZUhS39WMAU9',
      },
    ]);

    await createDataCollectionTest({
      context,
      recordingName: 'fetchWorkspaceResources',
      recordingDirectory: __dirname,
      integrationConfig,
      stepFunctions: [fetchOrganizationWorkspaces, fetchWorkspaceResources],
      entitySchemaMatchers: [
        {
          _type: Entities.WORKSPACE_RESOURCE._type,
          matcher: {
            _class: ['Resource'],
            schema: {
              additionalProperties: false,
              properties: {
                _type: { const: 'tfe_workspace_resource' },
                _rawData: {
                  type: 'array',
                  items: { type: 'object' },
                },
                address: { type: 'string' },
                name: { type: 'string' },
                createdAt: { type: 'number' },
                updatedAt: { type: 'number' },
                module: { type: 'string' },
                provider: { type: 'string' },
                providerType: { type: 'string' },
                modifiedByStateVersionId: { type: 'string' },
              },
            },
          },
        },
      ],
      relationshipSchemaMatchers: [
        {
          _type: Relationships.WORKSPACE_HAS_RESOURCE._type,
          matcher: {
            schema: {
              properties: {
                _class: { const: RelationshipClass.HAS },
                _type: { const: 'tfe_workspace_has_resource' },
              },
            },
          },
        },
      ],
    });
  });
});
