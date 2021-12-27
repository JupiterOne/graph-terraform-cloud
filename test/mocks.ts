import {
  EntitlementSet,
  Organization,
  OrganizationWorkspace,
  User,
  WorkspaceResource,
} from '../src/tfe/types';

export function getMockUser(partial?: Partial<User>): User {
  return {
    id: 'user-TSVGDCJGAZZZZZZ',
    username: 'api-org-test',
    isServiceAccount: true,
    avatarUrl:
      'https://www.gravatar.com/avatar/c726702df6456d9affb1eb8d9d37a9de?s=100&d=mm',
    enterpriseSupport: false,
    isSiteAdmin: false,
    isSsoLogin: false,
    twoFactor: { enabled: false, verified: false },
    email: 'api-org-test@hashicorp.com',
    hasGitHubAppToken: false,
    isConfirmed: true,
    isSudo: false,
    permissions: {
      canCreateOrganizations: false,
      canChangeEmail: true,
      canChangeUsername: true,
      canManageUserTokens: false,
    },
    ...partial,
  };
}

export function getMockOrganization(
  partial?: Partial<Organization>,
): Organization {
  return {
    externalId: 'org-yMai1ZUhS39WMAU9',
    createdAt: '2021-02-17T21:24:28.929Z',
    email: 'austin.kelleher@jupiterone.com',
    collaboratorAuthPolicy: 'password',
    planExpired: false,
    planIsTrial: false,
    planIsEnterprise: false,
    planIdentifier: 'free',
    costEstimationEnabled: false,
    sendPassingStatusesForUntriggeredSpeculativePlans: true,
    name: 'jupiterone',
    permissions: {
      canUpdate: false,
      canDestroy: false,
      canAccessViaTeams: true,
      canCreateModule: false,
      canCreateTeam: false,
      canCreateWorkspace: true,
      canManageUsers: true,
      canManageSubscription: false,
      canManageSso: false,
      canUpdateOauth: true,
      canUpdateSentinel: false,
      canUpdateSshKeys: false,
      canUpdateApiToken: true,
      canTraverse: true,
      canStartTrial: true,
      canUpdateAgentPools: false,
      canManageTags: true,
      canManageVarsets: true,
      canReadVarsets: true,
      canManagePublicProviders: false,
      canCreateProvider: false,
      canManagePublicModules: false,
      canManageCustomProviders: false,
    },
    fairRunQueuingEnabled: true,
    samlEnabled: false,
    ownersTeamSamlRoleId: null,
    twoFactorConformant: false,
    ...partial,
  };
}

export function getMockOrganizationWorkspace(
  partial?: Partial<OrganizationWorkspace>,
): OrganizationWorkspace {
  return {
    allowDestroyPlan: true,
    autoApply: false,
    createdAt: '2021-02-17T21:26:58.799Z',
    environment: 'default',
    locked: false,
    name: 'integration-development-google-cloud',
    queueAllRuns: false,
    speculativeEnabled: true,
    terraformVersion: '0.14.7',
    workingDirectory: '',
    globalRemoteState: true,
    updatedAt: '2021-07-16T14:03:57.005Z',
    resourceCount: 75,
    applyDurationAverage: 34000,
    planDurationAverage: 28000,
    runFailures: 21,
    workspaceKpisRunsCount: 30,
    latestChangeAt: '2021-05-28T17:39:48.509Z',
    operations: true,
    executionMode: 'remote',
    permissions: {
      canUpdate: true,
      canDestroy: true,
      canQueueDestroy: false,
      canQueueRun: false,
      canQueueApply: false,
      canReadStateVersions: true,
      canCreateStateVersions: false,
      canReadVariable: true,
      canUpdateVariable: true,
      canLock: false,
      canUnlock: false,
      canForceUnlock: false,
      canReadSettings: true,
      canManageTags: true,
    },
    actions: { isDestroyable: true },
    fileTriggersEnabled: false,
    triggerPrefixes: [],
    source: 'tfe-ui',
    ...partial,
  };
}

export function getMockEntitlementSet(
  partial?: Partial<EntitlementSet>,
): EntitlementSet {
  return {
    id: 'org-yMai1ZUhS39WMAU9',
    costEstimation: false,
    configurationDesigner: true,
    operations: true,
    privateModuleRegistry: true,
    sentinel: false,
    stateStorage: true,
    teams: false,
    vcsIntegrations: true,
    usageReporting: false,
    userLimit: 5,
    selfServeBilling: true,
    auditLogging: false,
    agents: false,
    sso: false,
    ...partial,
  };
}

export function getMockWorkspaceResource(
  partial?: Partial<WorkspaceResource>,
): WorkspaceResource {
  return {
    address: 'google_bigquery_dataset.dataset',
    name: 'dataset',
    createdAt: '2021-06-24',
    updatedAt: '2021-06-24',
    module: 'root',
    provider: 'hashicorp/google',
    providerType: 'google_bigquery_dataset',
    modifiedByStateVersionId: 'sv-sc34Fi2C2jQLjtEX',
    ...partial,
  };
}
