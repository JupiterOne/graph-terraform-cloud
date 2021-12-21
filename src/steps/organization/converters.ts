import {
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import { Organization, Workspace } from '../../tfe/types';
import { User } from '../../tfe/types';
import { prefixObjProperties } from '../../util/properties';
import { Entities } from '../constants';

export function createOrganizationEntity(data: Organization) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: data.externalId,
        _class: Entities.ORGANIZATION._class,
        _type: Entities.ORGANIZATION._type,
        createdOn: parseTimePropertyValue(data.createdAt),
        id: data.externalId,
        name: data.name,
        email: data.email,
        sessionTimeout: data.sessionTimeout,
        sessionRemember: data.sessionRemember,
        collaboratorAuthPolicy: data.collaboratorAuthPolicy,
        planExpired: data.planExpired,
        planExpiresAt: parseTimePropertyValue(data.planExpiresAt),
        planIsTrial: data.planIsTrial,
        planIsEnterprise: data.planIsEnterprise,
        costEstimationEnabled: data.costEstimationEnabled,
        fairRunQueuingEnabled: data.fairRunQueuingEnabled,
        samlEnabled: data.samlEnabled,
        ownersTeamSamlRoleId: data.ownersTeamSamlRoleId,
        mfaEnabled: data.twoFactorConformant,
        webLink: `https://app.terraform.io/app/${data.name}/workspaces`,
        ...(data.permissions &&
          prefixObjProperties('permissions', data.permissions)),
      },
    },
  });
}

export function createOrganizationMemberEntity({
  userId,
  userData,
}: {
  userId: string;
  userData: User;
}) {
  return createIntegrationEntity({
    entityData: {
      source: userData,
      assign: {
        _key: userId,
        _class: Entities.USER._class,
        _type: Entities.USER._type,
        id: userId,
        name: userData.username,
        username: userData.username,
        isServiceAccount: userData.isServiceAccount,
        avatarUrl: userData.avatarUrl,
        mfaEnabled: userData.twoFactor.enabled,
        mfaVerified: userData.twoFactor.verified,
        email: userData.email,
        ...(userData.permissions &&
          prefixObjProperties('permissions', userData.permissions)),
      },
    },
  });
}

export function createOrganizationWorkspaceEntity(
  workspaceId: string,
  data: Workspace,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: workspaceId,
        _class: Entities.WORKSPACE._class,
        _type: Entities.WORKSPACE._type,
        createdOn: parseTimePropertyValue(data.createdAt),
        updatedOn: parseTimePropertyValue(data.updatedAt),
        latestChangeAt: parseTimePropertyValue(data.latestChangeAt),
        id: workspaceId,
        name: data.name,
        description: data.description || undefined,
        allowDestroyPlan: data.allowDestroyPlan,
        autoApply: data.autoApply,
        createdAt: data.createdAt,
        environment: data.environment,
        locked: data.locked,
        queueAllRuns: data.queueAllRuns,
        speculativeEnabled: data.speculativeEnabled,
        structuredRunOutputEnabled: data.structuredRunOutputEnabled,
        terraformVersion: data.terraformVersion,
        workingDirectory: data.workingDirectory,
        globalRemoteState: data.globalRemoteState,
        resourceCount: data.resourceCount,
        applyDurationAverage: data.applyDurationAverage,
        planDurationAverage: data.planDurationAverage,
        runFailures: data.runFailures,
        workspaceKpisRunsCount: data.workspaceKpisRunsCount,
        operations: data.operations,
        executionMode: data.executionMode,
        vcsRepoIdentifier: data.vcsRepoIdentifier,
        fileTriggersEnabled: data.fileTriggersEnabled,
        source: data.source,
        webLink: `https://app.terraform.io/app/${data.name}/workspaces/${data.name}`,
        ...(data.permissions &&
          prefixObjProperties('permissions', data.permissions)),
        ...(data.vcsRepo && prefixObjProperties('vcsRepo', data.vcsRepo)),
        ...(data.actions && prefixObjProperties('vcsRepo', data.actions)),
      },
    },
  });
}
