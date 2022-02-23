import {
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { WorkspaceResource } from '../../tfe/types';
import { Entities } from '../constants';

export function createWorkspaceResourceEntity(
  resourceId: string,
  data: WorkspaceResource,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: resourceId || '',
        _class: Entities.WORKSPACE_RESOURCE._class,
        _type: Entities.WORKSPACE_RESOURCE._type,
        address: data.address,
        name: data.name,
        createdAt: parseTimePropertyValue(data.createdAt),
        updatedAt: parseTimePropertyValue(data.updatedAt),
        module: data.module,
        provider: data.provider,
        providerType: data.providerType,
        modifiedByStateVersionId: data.modifiedByStateVersionId,
      },
    },
  });
}
