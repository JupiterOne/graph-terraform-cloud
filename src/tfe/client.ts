import { Organizations } from './organizations';
import { CreateTerraformCloudClientParams } from './types';
import { Users } from './users';
import { Workspaces } from './workspaces';

export class TerraformCloudClient {
  public readonly organizations: Organizations;
  public readonly users: Users;
  public readonly workspaces: Workspaces;

  constructor(params: CreateTerraformCloudClientParams) {
    this.organizations = new Organizations(params);
    this.users = new Users(params);
    this.workspaces = new Workspaces(params);
  }
}
