import {
  createIntegrationEntity,
  parseTimePropertyValue,
} from '@jupiterone/integration-sdk-core';
import {
  EntitlementSet,
  Organization,
  OrganizationTeam,
  OrganizationWorkspace,
} from '../../tfe/types';
import { User } from '../../tfe/types';
import { prefixObjProperties } from '../../util/properties';
import { Entities } from '../constants';

export function generateEntitlementSetKey(organizationName: string): string {
  return `entitlement-set-${organizationName}`;
}

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
  data: OrganizationWorkspace,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: workspaceId,
        _class: Entities.WORKSPACE._class,
        _type: Entities.WORKSPACE._type,
        actionsIsDestroyable: data.actions?.isDestroyable,
        allowDestroyPlan: data.allowDestroyPlan,
        applyDurationAverage: data.applyDurationAverage,
        autoApply: data.autoApply,
        autoDestroyAt: data.autoDestroyAt,
        createdAt: data.createdAt,
        executionMode: data.executionMode,
        description: data.description || '',
        environment: data.environment,
        fileTriggersEnabled: data.fileTriggersEnabled,
        globalRemoteState: data.globalRemoteState,
        latestChangeAt: data.latestChangeAt,
        locked: data.locked,
        name: data.name,
        operations: data.operations,
        planDurationAverage: data.planDurationAverage,
        policyCheckFailures: data.policyCheckFailures,
        queueAllRuns: data.queueAllRuns,
        resourceCount: data.resourceCount,
        runFailures: data.runFailures,
        source: data.source,
        sourceName: data.sourceName,
        sourceUrl: data.sourceUrl,
        speculativeEnabled: data.speculativeEnabled,
        structuredRunOutputEnabled: data.structuredRunOutputEnabled,
        terraformVersion: data.terraformVersion,
        triggerPrefixes: data.triggerPrefixes,
        updatedAt: data.updatedAt,
        vcsRepoBranch: data.vcsRepo?.branch,
        vcsRepoDisplayIndentifier: data.vcsRepo?.displayIdentifier,
        vcsRepoIngressSubmodules: data.vcsRepo?.ingressSubmodules,
        vcsRepoOauthTokenId: data.vcsRepo?.oauthTokenId,
        vcsRepoRepositoryHttpUrl: data.vcsRepo?.repositoryHttpUrl,
        vcsRepoServiceProvider: data.vcsRepo?.serviceProvider,
        vcsRepoWebhookUrl: data.vcsRepo?.webhookUrl,
        vcsRepoIdentifier: data.vcsRepoIdentifier,
        workingDirectory: data.workingDirectory,
        workspaceKpisRunsCount: data.workspaceKpisRunsCount,
        webLink: `https://app.terraform.io/app/${data.name}/workspaces`,
        ...(data.permissions &&
          prefixObjProperties('permissions', data.permissions)),
      },
    },
  });
}

export function createOrganizationTeamEntity(
  teamId: string,
  data: OrganizationTeam,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: teamId,
        _class: Entities.TEAM._class,
        _type: Entities.TEAM._type,
        name: data.name,
        usersCount: data.usersCount,
        visibility: data.visibility,
        organizationAccessManagePolicies:
          data.organizationAccess?.managePolicies,
        organizationAccessManagePolicyOverrides:
          data.organizationAccess?.managePolicyOverrides,
        organizationAccessManageWorkspaces:
          data.organizationAccess?.manageWorkspaces,
        organizationAccessManageVcsSettigs:
          data.organizationAccess?.manageVcsSettings,
        ...(data.permissions &&
          prefixObjProperties('permissions', data.permissions)),
      },
    },
  });
}

export function createOrganizationEntitlementSetEntity(
  organizationId: string,
  data: EntitlementSet,
) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: generateEntitlementSetKey(organizationId),
        _class: Entities.ENTITLEMENT_SET._class,
        _type: Entities.ENTITLEMENT_SET._type,
        name: generateEntitlementSetKey(organizationId),
        costEstimation: data.costEstimation,
        configurationDesigner: data.configurationDesigner,
        operations: data.operations,
        privateModuleRegistry: data.privateModuleRegistry,
        sentinel: data.sentinel,
        stateStorage: data.stateStorage,
        teams: data.teams,
        vcsIntegrations: data.vcsIntegrations,
        usageReporting: data.usageReporting,
        userLimit: data.userLimit,
        selfServeBilling: data.selfServeBilling,
        auditLogging: data.auditLogging,
        agents: data.agents,
        sso: data.sso,
      },
    },
  });
}
