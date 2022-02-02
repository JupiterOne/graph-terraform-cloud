import {
  createDirectRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  RelationshipClass,
} from '@jupiterone/integration-sdk-core';
import { TerraformCloudClient } from '../../tfe/client';
import { IntegrationConfig } from '../../config';
import {
  ACCOUNT_ENTITY_KEY,
  Entities,
  IntegrationSteps,
  Relationships,
} from '../constants';
import {
  createOrganizationEntitlementSetEntity,
  createOrganizationEntity,
  createOrganizationMemberEntity,
  createOrganizationTeamEntity,
  createOrganizationWorkspaceEntity,
  generateEntitlementSetKey,
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
    // Let's only handle the customer specified organization (for now)
    if (item.id !== config.organizationName) {
      return;
    }

    const organizationEntity = createOrganizationEntity(item.attributes);
    await jobState.addEntity(organizationEntity);
    organizationData.push({
      organizationName: item.attributes.name,
      organizationExternalId: item.attributes.externalId,
    });

    const accountEntity = await jobState.getData(ACCOUNT_ENTITY_KEY);

    await jobState.addRelationship(
      createDirectRelationship({
        _class: RelationshipClass.HAS,
        to: organizationEntity,
        from: accountEntity as Entity,
      }),
    );
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

export async function fetchOrganizationWorkspaces({
  instance: { config },
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const { apiKey } = config;
  const client = new TerraformCloudClient({ apiKey });

  await forEachOrganization(
    jobState,
    async ({ organizationExternalId, organizationName }) => {
      await client.organizations.iterateOrganizationWorkspaces(
        organizationName,
        async ({ item }) => {
          const workspaceEntity = createOrganizationWorkspaceEntity(
            item.id,
            item.attributes,
          );
          await jobState.addEntity(workspaceEntity);

          await jobState.addRelationship(
            createDirectRelationship({
              _class: RelationshipClass.HAS,
              fromKey: organizationExternalId,
              toKey: workspaceEntity._key,
              fromType: Entities.ORGANIZATION._type,
              toType: Entities.WORKSPACE._type,
            }),
          );
        },
      );
    },
  );
}

export async function fetchOrganizationEntitlementSet({
  instance: { config },
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const { apiKey } = config;
  const client = new TerraformCloudClient({ apiKey });

  await forEachOrganization(
    jobState,
    async ({ organizationExternalId, organizationName }) => {
      const entitlementSetEntity = createOrganizationEntitlementSetEntity(
        organizationName,
        await client.organizations.requestOrganizationEntitlementSet(
          organizationName,
        ),
      );
      await jobState.addEntity(entitlementSetEntity);

      await jobState.addRelationship(
        createDirectRelationship({
          _class: RelationshipClass.HAS,
          fromKey: organizationExternalId,
          toKey: entitlementSetEntity._key,
          fromType: Entities.ORGANIZATION._type,
          toType: Entities.ENTITLEMENT_SET._type,
        }),
      );
    },
  );
}

export async function fetchOrganizationTeams({
  instance: { config },
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const { apiKey } = config;
  const client = new TerraformCloudClient({ apiKey });

  await forEachOrganization(
    jobState,
    async ({ organizationExternalId, organizationName }) => {
      const entitlementSetEntity = await jobState.findEntity(
        generateEntitlementSetKey(organizationName),
      );

      if (entitlementSetEntity?.teams) {
        await client.organizations.iterateOrganizationTeams(
          organizationName,
          async ({ item }) => {
            const teamEntity = createOrganizationTeamEntity(
              item.id,
              item.attributes,
            );
            await jobState.addEntity(teamEntity);

            await jobState.addRelationship(
              createDirectRelationship({
                _class: RelationshipClass.HAS,
                fromKey: organizationExternalId,
                toKey: teamEntity._key,
                fromType: Entities.ORGANIZATION._type,
                toType: Entities.TEAM._type,
              }),
            );
          },
        );
      }
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
    relationships: [Relationships.ACCOUNT_HAS_ORGANIZATION],
    dependsOn: [IntegrationSteps.ACCOUNT],
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
    id: IntegrationSteps.ORGANIZATION_WORKSPACES,
    name: 'Fetch Organization Workspaces',
    entities: [Entities.WORKSPACE],
    relationships: [Relationships.ORGANIZATION_HAS_WORKSPACE],
    dependsOn: [IntegrationSteps.ORGANIZATIONS],
    executionHandler: fetchOrganizationWorkspaces,
  },
  {
    id: IntegrationSteps.ORGANIZATION_ENTITLEMENT_SET,
    name: 'Fetch Organization Entitlement Set',
    entities: [Entities.ENTITLEMENT_SET],
    relationships: [Relationships.ORGANIZATION_HAS_ENTITLEMENT_SET],
    dependsOn: [IntegrationSteps.ORGANIZATIONS],
    executionHandler: fetchOrganizationEntitlementSet,
  },
  {
    id: IntegrationSteps.ORGANIZATION_TEAMS,
    name: 'Fetch Organization Teams',
    entities: [Entities.TEAM],
    relationships: [Relationships.ORGANIZATION_HAS_TEAM],
    dependsOn: [
      IntegrationSteps.ORGANIZATIONS,
      IntegrationSteps.ORGANIZATION_ENTITLEMENT_SET,
    ],
    executionHandler: fetchOrganizationTeams,
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
