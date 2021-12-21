import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  JobState,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { TerraformCloudClient } from '../../tfe/client';
import { IntegrationConfig } from '../../config';
import { Entities, IntegrationSteps, Relationships } from '../constants';
import {
  createOrganizationEntity,
  createOrganizationMemberEntity,
  createOrganizationWorkspaceEntity,
} from './converters';
import {
  CachedOrganizationData,
  cacheOrganizationData,
  forEachOrganization,
} from '../../util/jobState';
import { User } from '../../tfe/types';

async function createOrganizationHasResourceRelationship({
  jobState,
  organizationExternalId,
  targetEntity,
  properties,
}: {
  jobState: JobState;
  organizationExternalId: string;
  targetEntity: Entity;
  properties?: any;
}) {
  await jobState.addRelationship(
    createDirectRelationship({
      _class: RelationshipClass.HAS,
      fromKey: organizationExternalId,
      toKey: targetEntity._key,
      fromType: Entities.ORGANIZATION._type,
      toType: targetEntity._type,
      properties,
    }),
  );
}

export async function fetchOrganizations({
  instance: { config },
  jobState,
  logger,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const { apiKey } = config;
  const client = new TerraformCloudClient({ apiKey });
  const organizationData: CachedOrganizationData[] = [];

  await client.organizations.iterateOrganizations(async ({ item }) => {
    await jobState.addEntity(createOrganizationEntity(item.attributes));
    organizationData.push({
      organizationName: item.attributes.name,
      organizationExternalId: item.attributes.externalId,
    });
  });

  await cacheOrganizationData(jobState, organizationData);

  logger.info(
    {
      numOrganizationIds: organizationData.length,
    },
    'Collected organizations',
  );
}

export async function fetchOrganizationMembers({
  instance: { config },
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const { apiKey } = config;
  const client = new TerraformCloudClient({ apiKey });
  const userEntityToUserEntityKeyMap: Map<string, Entity> = new Map();

  await forEachOrganization(
    jobState,
    async ({ organizationExternalId, organizationName }) => {
      await client.organizations.iterateOrganizationMemberships(
        {
          organizationName,
          includeUsers: true,
        },
        async ({ item, included = [] }) => {
          const userRelationship = item.relationships?.user;

          if (
            !userRelationship ||
            !userRelationship.data ||
            !userRelationship.data.id
          ) {
            return;
          }

          const relatedUserId = userRelationship.data.id as string;

          // Find the user details in the "included" response data. Users can be
          // members of multiple organizations, so we only want to create the user
          // entity a single time.
          for (const includedItem of included) {
            if (includedItem.id === relatedUserId) {
              let userEntity = userEntityToUserEntityKeyMap.get(relatedUserId);

              if (!userEntity) {
                userEntity = await jobState.addEntity(
                  createOrganizationMemberEntity({
                    userId: relatedUserId,
                    userData: includedItem.attributes as User,
                  }),
                );

                userEntityToUserEntityKeyMap.set(userEntity._key, userEntity);
              }

              await createOrganizationHasResourceRelationship({
                jobState,
                organizationExternalId,
                targetEntity: userEntity,
                properties: {
                  status: item.attributes.status,
                },
              });
            }
          }
        },
      );
    },
  );
}

export async function fetchOrganizationWorkspaces({
  instance: { config },
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const { apiKey } = config;
  const client = new TerraformCloudClient({ apiKey });

  await forEachOrganization(
    jobState,
    async ({ organizationExternalId, organizationName }) => {
      await client.organizations.iterateWorkspaces(
        organizationName,
        async (data) => {
          await createOrganizationHasResourceRelationship({
            jobState,
            organizationExternalId,
            targetEntity: await jobState.addEntity(
              createOrganizationWorkspaceEntity(
                data.item.id,
                data.item.attributes,
              ),
            ),
          });
        },
      );
    },
  );
}

export const organizationSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: IntegrationSteps.ORGANIZATIONS,
    name: 'Fetch Organization Details',
    entities: [Entities.ORGANIZATION],
    relationships: [],
    dependsOn: [],
    executionHandler: fetchOrganizations,
  },
  {
    id: IntegrationSteps.ORGANIZATION_MEMBERS,
    name: 'Fetch Organization Members',
    entities: [Entities.USER],
    relationships: [Relationships.ORGANIZATION_HAS_USER],
    dependsOn: [IntegrationSteps.ORGANIZATIONS],
    executionHandler: fetchOrganizationMembers,
  },
  {
    id: IntegrationSteps.WORKSPACES,
    name: 'Fetch Organization Workspaces',
    entities: [Entities.WORKSPACE],
    relationships: [Relationships.ORGANIZATION_HAS_WORKSPACE],
    dependsOn: [IntegrationSteps.ORGANIZATIONS],
    executionHandler: fetchOrganizationWorkspaces,
  },
];
