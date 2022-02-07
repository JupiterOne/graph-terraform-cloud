import {
  IterateListApiDataResponse,
  TerraformCloudClientRequestor,
} from './request';
import {
  CreateOrganizationRequestBodyAttributes,
  EntitlementSet,
  Organization,
  OrganizationMembership,
  OrganizationTeam,
  OrganizationWorkspace,
} from './types';

export class Organizations extends TerraformCloudClientRequestor {
  async create(body: CreateOrganizationRequestBodyAttributes) {
    return this.request<Organization>({
      method: 'POST',
      path: `/api/v2/organizations`,
      body: {
        data: {
          type: 'organizations',
          attributes: {
            name: body.name,
            email: body.email,
            'session-timeout': body.sessionTimeout,
            'session-remember': body.sessionRemember,
            'collaborator-auth-policy': body.collaboratorAuthPolicy,
            'cost-estimation-enabled': body.costEstimationEnabled,
            'owners-team-saml-role-id': body.ownersTeamSamlRoleId,
          },
        },
      },
    });
  }

  async delete(organization: string) {
    return this.deleteRequest<void>({
      path: `/api/v2/organizations/${organization}`,
    });
  }

  async read(organization: string) {
    return this.request<Organization>({
      method: 'GET',
      path: `/api/v2/organizations/${organization}`,
    });
  }

  async list() {
    return this.listRequest<Organization>({
      method: 'GET',
      path: `/api/v2/organizations`,
    });
  }

  async requestOrganizationEntitlementSet(organizationName: string) {
    return this.request<EntitlementSet>({
      method: 'GET',
      path: `/api/v2/organizations/${organizationName}/entitlement-set`,
    });
  }

  async iterateOrganizations(
    callback: (
      organization: IterateListApiDataResponse<Organization>,
    ) => Promise<void>,
  ) {
    await this.iterateListApiData<Organization>(
      {
        method: 'GET',
        path: `/api/v2/organizations`,
      },
      callback,
    );
  }

  async iterateOrganizationOAuthTokens(
    organizationId: string,
    callback: (
      organization: IterateListApiDataResponse<Organization>,
    ) => Promise<void>,
  ) {
    await this.iterateListApiData<Organization>(
      {
        method: 'GET',
        path: `/api/v2/organizations/${organizationId}/oauth-tokens`,
      },
      callback,
    );
  }

  async iterateOrganizationMemberships(
    {
      organizationName,
      includeUsers,
      includeTeams,
    }: {
      organizationName: string;
      includeUsers?: boolean;
      includeTeams?: boolean;
    },
    callback: (
      organization: IterateListApiDataResponse<OrganizationMembership>,
    ) => Promise<void>,
  ) {
    const included: string[] = [];

    if (includeUsers) included.push('user');
    if (includeTeams) included.push('teams');

    await this.iterateListApiData<OrganizationMembership>(
      {
        method: 'GET',
        path: `/api/v2/organizations/${organizationName}/organization-memberships`,
        queryStringParams: {
          include: (included.length && included.join(',')) || undefined,
        },
      },
      callback,
    );
  }

  async iterateOrganizationWorkspaces(
    organizationName: string,
    callback: (
      organization: IterateListApiDataResponse<OrganizationWorkspace>,
    ) => Promise<void>,
  ) {
    await this.iterateListApiData<OrganizationWorkspace>(
      {
        method: 'GET',
        path: `/api/v2/organizations/${organizationName}/workspaces`,
      },
      callback,
    );
  }

  async iterateOrganizationTeams(
    organizationName: string,
    callback: (
      organization: IterateListApiDataResponse<OrganizationTeam>,
    ) => Promise<void>,
  ) {
    await this.iterateListApiData<OrganizationTeam>(
      {
        method: 'GET',
        path: `/api/v2/organizations/${organizationName}/teams`,
      },
      callback,
    );
  }
}
