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
  planIdentifier: string;
  costEstimationEnabled: boolean;
  sendPassingStatusesForUntriggeredSpeculativePlans: boolean;
  name: string;
  permissions: Permissions;
  fairRunQueuingEnabled: boolean;
  samlEnabled: boolean;
  ownersTeamSamlRoleId?: null;
  twoFactorConformant: boolean;
}

export interface OrganizationWorkspace {
  actions?: {
    isDestroyable: boolean;
  };
  allowDestroyPlan: boolean;
  applyDurationAverage: number;
  autoApply: boolean;
  autoDestroyAt?: string;
  createdAt: string;
  executionMode: string;
  description?: string;
  environment: string;
  fileTriggersEnabled: boolean;
  globalRemoteState: boolean;
  latestChangeAt: string;
  locked: boolean;
  name: string;
  operations: boolean;
  permissions: Permissions;
  planDurationAverage: number;
  policyCheckFailures?: number;
  queueAllRuns: boolean;
  resourceCount: number;
  runFailures: number;
  source: string;
  sourceName?: string;
  sourceUrl?: string;
  speculativeEnabled: boolean;
  structuredRunOutputEnabled?: boolean;
  terraformVersion: string;
  triggerPrefixes: string[];
  updatedAt: string;
  vcsRepo?: {
    branch: string;
    displayIdentifier: string;
    identifier: string;
    ingressSubmodules: boolean;
    oauthTokenId: string;
    repositoryHttpUrl: string;
    serviceProvider: string;
    webhookUrl: string;
  };
  vcsRepoIdentifier?: string;
  workingDirectory: string;
  workspaceKpisRunsCount: number;
}

export interface Permissions {
  canUpdate?: boolean;
  canDestroy?: boolean;
  canAccessViaTeams?: boolean;
  canCreateModule?: boolean;
  canCreateTeam?: boolean;
  canCreateWorkspace?: boolean;
  canManageUsers?: boolean;
  canManageSubscription?: boolean;
  canManageSso?: boolean;
  canUpdateOauth?: boolean;
  canUpdateSentinel?: boolean;
  canUpdateSshKeys?: boolean;
  canUpdateApiToken?: boolean;
  canTraverse?: boolean;
  canStartTrial?: boolean;
  canUpdateAgentPools?: boolean;
  canManageTags?: boolean;
  canManagePublicModules?: boolean;
  canManagePublicProviders?: boolean;
  canCreateProvider?: boolean;
  canCreateOrganizations?: boolean;
  canChangeEmail?: boolean;
  canChangeUsername?: boolean;
  canManageUserTokens?: boolean;
  canManageVarsets?: boolean;
  canReadVarsets?: boolean;
  canManageCustomProviders?: boolean;
  canQueueDestroy?: boolean;
  canQueueRun?: boolean;
  canQueueApply?: boolean;
  canReadStateVersions?: boolean;
  canCreateStateVersions?: boolean;
  canReadVariable?: boolean;
  canUpdateVariable?: boolean;
  canLock?: boolean;
  canUnlock?: boolean;
  canForceUnlock?: boolean;
  canReadSettings?: boolean;
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
  id: string;
  username: string;
  isServiceAccount: boolean;
  avatarUrl: string;
  password?: boolean;
  enterpriseSupport: boolean;
  isSiteAdmin: boolean;
  isSsoLogin: boolean;
  unconfirmedEmail?: boolean;
  hasGitHubAppToken: boolean;
  isConfirmed: boolean;
  isSudo: boolean;
  twoFactor: {
    enabled: boolean;
    verified: boolean;
  };
  email?: string;
  permissions: Permissions;
}

export interface WorkspaceResource {
  address: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  module: string;
  provider: string;
  providerType: string;
  modifiedByStateVersionId: string;
}
export interface EntitlementSet {
  id?: string;
  costEstimation: boolean;
  configurationDesigner: boolean;
  operations: boolean;
  privateModuleRegistry: boolean;
  sentinel: boolean;
  stateStorage: boolean;
  teams: boolean;
  vcsIntegrations: boolean;
  usageReporting: boolean;
  userLimit: number | null;
  selfServeBilling: boolean;
  auditLogging: boolean;
  agents: boolean;
  sso: boolean;
}
export interface OrganizationTeam {
  name: string;
  usersCount: number;
  visibility: string;
  permissions: {
    canUpdateMembership: boolean;
    canDestroy: boolean;
    canUpdateOrganizationAccess: boolean;
    canUpdateApiToken: boolean;
    canUpdateVisibility: boolean;
  };
  organizationAccess?: {
    managePolicies: boolean;
    managePolicyOverrides: boolean;
    manageWorkspaces: boolean;
    manageVcsSettings: boolean;
  };
}
