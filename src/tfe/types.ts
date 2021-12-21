import { FetchError } from 'node-fetch';

interface OnRequestRetryParams {
  url: string;
  err: FetchError;
  attemptNum: number;
  attemptsRemaining: number;
  code?: string;
}

export type OnRequestRetryFunction = (params: OnRequestRetryParams) => void;

export interface CreateTerraformCloudClientParams {
  apiKey: string;
  requestTimeout?: number;
  onRequestRetry?: OnRequestRetryFunction;
}

export type AuthPolicy = 'password' | 'two_factor_mandatory';

export interface Organization {
  externalId: string;
  createdAt: string;
  email: string;
  sessionTimeout?: number;
  sessionRemember?: number;
  collaboratorAuthPolicy: AuthPolicy;
  planExpired: boolean;
  planExpiresAt?: string;
  planIsTrial: boolean;
  planIsEnterprise: boolean;
  costEstimationEnabled: boolean;
  name: string;
  permissions: Permissions;
  fairRunQueuingEnabled: boolean;
  samlEnabled: boolean;
  ownersTeamSamlRoleId?: null;
  twoFactorConformant: boolean;
}

export interface Permissions {
  canUpdate: boolean;
  canDestroy: boolean;
  canAccessViaTeams: boolean;
  canCreateModule: boolean;
  canCreateTeam: boolean;
  canCreateWorkspace: boolean;
  canManageUsers: boolean;
  canManageSubscription: boolean;
  canManageSso: boolean;
  canUpdateOauth: boolean;
  canUpdateSentinel: boolean;
  canUpdateSshKeys: boolean;
  canUpdateApiToken: boolean;
  canTraverse: boolean;
  canStartTrial: boolean;
  canUpdateAgentPools: boolean;
  canManageTags: boolean;
  canManagePublicModules: boolean;
  canManagePublicProviders: boolean;
  canCreateProvider: boolean;
}

export type OrganizationMembershipStatus = 'active' | 'invited';

export interface OrganizationMembership {
  status: OrganizationMembershipStatus;
  email: string;
  createdAt: string;
}

/**
 * https://www.terraform.io/docs/cloud/api/organizations.html#request-body
 */
export interface CreateOrganizationRequestBodyAttributes {
  name: string;
  email: string;
  sessionTimeout?: number;
  sessionRemember?: number;
  collaboratorAuthPolicy: AuthPolicy;
  costEstimationEnabled?: boolean;
  ownersTeamSamlRoleId?: string;
}

export interface User {
  username: string;
  isServiceAccount: boolean;
  avatarUrl: string;
  twoFactor: {
    enabled: boolean;
    verified: boolean;
  };
  email?: string;
  permissions: Permissions;
}

export interface WorkspaceVCSRepo {
  branch: string;
  ingressSubmodules: boolean;
  identifier: string;
  displayIdentifier: string;
  githubAppInstallationId: string;
  repositoryHttpUrl: string;
  serviceProvider: string;
}

export interface WorkspacePermissions {
  canUpdate: boolean;
  canDestroy: boolean;
  canQueueDestroy: boolean;
  canQueueRun: boolean;
  canQueueApply: boolean;
  canReadStateVersions: boolean;
  canCreateStateVersions: boolean;
  canReadVariable: boolean;
  canUpdateVariable: boolean;
  canLock: boolean;
  canUnlock: boolean;
  canForceUnlock: boolean;
  canReadSettings: boolean;
  canManageTags: boolean;
}

export interface WorkspaceActions {
  isDestroyable: boolean;
}

export interface Workspace {
  allowDestroyPlan: boolean;
  autoApply: boolean;
  autoDestroyAt: string | null;
  createdAt: string;
  environment: string;
  locked: boolean;
  name: string;
  queueAllRuns: boolean;
  speculativeEnabled: boolean;
  structuredRunOutputEnabled: boolean;
  terraformVersion: string;
  workingDirectory: string;
  globalRemoteState: boolean;
  updatedAt: string;
  resourceCount: number;
  applyDurationAverage: number;
  planDurationAverage: number;
  policyCheckFailures: string | null;
  runFailures: number;
  workspaceKpisRunsCount: number;
  latestChangeAt: string;
  operations: boolean;
  executionMode: string;
  vcsRepo: WorkspaceVCSRepo;
  vcsRepoIdentifier: string;
  permissions: WorkspacePermissions;
  actions: WorkspaceActions;
  description: string;
  fileTriggersEnabled: boolean;
  source: string;
  sourceName: string | null;
  sourceUrl: string | null;
  triggerPrefixes: string[];
}

export interface Run {
  actions: {
    isCancelable: boolean;
    isConfirmable: boolean;
    isDiscardable: boolean;
    isForceCancelable: boolean;
  };
  canceledAt: string | null;
  createdAt: string;
  hasChanges: boolean;
  isDestroy: boolean;
  message: string;
  planOnly: boolean;
  refresh: boolean;
  refreshOnly: boolean;
  replaceAddrs: string | null;
  source: string;
  statusTimestamps: {
    appliedAt: string;
    plannedAt: string;
    applyingAt: string;
    planningAt: string;
    confirmedAt: string;
    planQueuedAt: string;
    applyQueuedAt: string;
    planQueueableAt: string;
  };
  status: string;
  targetAddrs: string | null;
  triggerReason: string;
  permissions: {
    canApply: boolean;
    canCancel: boolean;
    canComment: boolean;
    canDiscard: boolean;
    canForceExecute: boolean;
    canForceCancel: boolean;
    canOverridePolicyCheck: boolean;
  };
}
