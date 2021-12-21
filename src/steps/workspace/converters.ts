import {
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { Run } from '../../tfe/types';
import { prefixObjProperties } from '../../util/properties';
import { Entities } from '../constants';

type CreateWorkspaceRunEntityParams = {
  runId: string;
  run: Run;
};

export function createWorkspaceRunEntity({
  runId,
  run,
}: CreateWorkspaceRunEntityParams) {
  return createIntegrationEntity({
    entityData: {
      source: run,
      assign: {
        _key: runId,
        _class: Entities.RUN._class,
        _type: Entities.RUN._type,
        createdOn: parseTimePropertyValue(run.createdAt),
        id: runId,
        name: runId,
        hasChanges: run.hasChanges,
        isDestroy: run.isDestroy,
        message: run.message,
        planOnly: run.planOnly,
        refresh: run.refresh,
        refreshOnly: run.refreshOnly,
        source: run.source,
        status: run.status,
        triggerReason: run.triggerReason,

        appliedAt: parseTimePropertyValue(run.statusTimestamps.appliedAt),
        plannedAt: parseTimePropertyValue(run.statusTimestamps.plannedAt),
        applyingAt: parseTimePropertyValue(run.statusTimestamps.applyingAt),
        planningAt: parseTimePropertyValue(run.statusTimestamps.planningAt),
        confirmedAt: parseTimePropertyValue(run.statusTimestamps.confirmedAt),
        planQueuedAt: parseTimePropertyValue(run.statusTimestamps.planQueuedAt),
        applyQueuedAt: parseTimePropertyValue(
          run.statusTimestamps.applyQueuedAt,
        ),
        planQueueableAt: parseTimePropertyValue(
          run.statusTimestamps.planQueueableAt,
        ),

        // TODO:
        // webLink: `https://app.terraform.io/app/${organizationId}/workspaces/${workspaceId}/runs/${runId}`,
        ...(run.permissions &&
          prefixObjProperties('permissions', run.permissions)),
        ...(run.actions && prefixObjProperties('vcsRepo', run.actions)),
      },
    },
  });
}
