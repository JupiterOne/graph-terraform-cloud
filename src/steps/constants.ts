import {
  RelationshipClass,
  StepEntityMetadata,
  StepRelationshipMetadata,
} from '@jupiterone/integration-sdk-core';

export const ACCOUNT_ENTITY_KEY = 'ACCOUNT_ENTITY';
export const ACCOUNT_DATA_KEY = 'ACCOUNT_DATA';
export const MAC_OS_CONFIGURATION_DETAILS_BY_ID_KEY =
  'MAC_OS_CONFIGURATION_DETAILS_BY_ID';

export enum IntegrationSteps {
  ORGANIZATIONS = 'fetch-organizations',
  ORGANIZATION_MEMBERS = 'fetch-organization-members',
  ORGANIZATION_OAUTH_TOKENS = 'fetch-organization-oauth-tokens',
}

export const Entities: Record<'ORGANIZATION' | 'USER', StepEntityMetadata> = {
  ORGANIZATION: {
    _type: 'tfe_organization',
    _class: ['Account', 'Organization'],
    resourceName: 'Organization',
  },
  USER: {
    _type: 'tfe_user',
    _class: ['User'],
    resourceName: 'User',
  },
};

export const Relationships: Record<
  'ORGANIZATION_HAS_USER',
  StepRelationshipMetadata
> = {
  ORGANIZATION_HAS_USER: {
    _type: 'tfe_organization_has_user',
    _class: RelationshipClass.HAS,
    sourceType: Entities.ORGANIZATION._type,
    targetType: Entities.USER._type,
  },
};
