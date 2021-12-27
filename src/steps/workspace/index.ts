import {
  createDirectRelationship,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { TerraformCloudClient } from '../../tfe/client';
import { IntegrationConfig } from '../../config';
import { Entities, IntegrationSteps, Relationships } from '../constants';
import { createWorkspaceResourceEntity } from './converters';

export async function fetchWorkspaceResources({
  instance: { config },
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const { apiKey } = config;
  const client = new TerraformCloudClient({ apiKey });

  await jobState.iterateEntities(
    { _type: Entities.WORKSPACE._type },
    async (workspaceEntity) => {
      await client.workspaces.iterateWorkspaceResources(
        workspaceEntity._key as string,
        async ({ item }) => {
          const resourceEntity = createWorkspaceResourceEntity(
            item.id,
            item.attributes,
          );
          await jobState.addEntity(resourceEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              fromKey: workspaceEntity._key,
              toKey: resourceEntity._key,
              fromType: Entities.WORKSPACE._type,
              toType: Entities.WORKSPACE_RESOURCE._type,
            }),
          );
        },
      );
    },
  );
}

export const workspaceSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: IntegrationSteps.WORKSPACE_RESOURCES,
    name: 'Fetch Workspace Resources',
    entities: [Entities.WORKSPACE_RESOURCE],
    relationships: [Relationships.WORKSPACE_HAS_RESOURCE],
    dependsOn: [IntegrationSteps.ORGANIZATION_WORKSPACES],
    executionHandler: fetchWorkspaceResources,
  },
];
