import { Organizations } from './organizations';
import { Workspaces } from './workspaces';
import { CreateTerraformCloudClientParams } from './types';
import { Users } from './users';
import { Account } from './account';

export class TerraformCloudClient {
  public readonly organizations: Organizations;
  public readonly workspaces: Workspaces;
  public readonly users: Users;
  public readonly account: Account;

  constructor(params: CreateTerraformCloudClientParams) {
    this.organizations = new Organizations(params);
    this.workspaces = new Workspaces(params);
    this.users = new Users(params);
    this.account = new Account(params);
  }
}
