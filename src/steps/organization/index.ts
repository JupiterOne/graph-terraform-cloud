import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { TerraformCloudClient } from '../../tfe/client';
import { IntegrationConfig } from '../../config';
import { Entities, IntegrationSteps, Relationships } from '../constants';
import {
  createOrganizationEntity,
  createOrganizationMemberEntity,
} from './converters';
import {
  CachedOrganizationData,
  cacheOrganizationData,
  forEachOrganization,
} from '../../util/jobState';
import { User } from '../../tfe/types';

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

              await jobState.addRelationship(
                createDirectRelationship({
                  _class: RelationshipClass.HAS,
                  fromKey: organizationExternalId,
                  toKey: userEntity._key,
                  fromType: Entities.ORGANIZATION._type,
                  toType: Entities.USER._type,
                  properties: {
                    status: item.attributes.status,
                  },
                }),
              );
            }
          }
        },
      );
    },
  );
}

// export async function fetchOrganizationOAuthTokens({
//   instance: { config },
//   jobState,
// }: IntegrationStepExecutionContext<IntegrationConfig>) {
//   const { apiKey } = config;
//   const client = new TerraformCloudClient({ apiKey });

//   await forEachOrganization(jobState, async ({ organizationName }) => {
//     await client.organizations.iterateOrganizationOAuthTokens(
//       organizationName,
//       async (data) => {
//         // TODO: Implement converter for this
//         return Promise.resolve();
//       }
//     );
//   });
// }

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
  // {
  //   id: IntegrationSteps.ORGANIZATION_OAUTH_TOKENS,
  //   name: 'Fetch Organization OAuth Tokens',
  //   entities: [],
  //   relationships: [],
  //   dependsOn: [IntegrationSteps.ORGANIZATIONS],
  //   executionHandler: fetchOrganizationOAuthTokens,
  // },
];
