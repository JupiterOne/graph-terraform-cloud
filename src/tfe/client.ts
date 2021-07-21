import { Organizations } from './organizations';
import { CreateTerraformCloudClientParams } from './types';
import { Users } from './users';

export class TerraformCloudClient {
  public readonly organizations: Organizations;
  public readonly users: Users;

  constructor(params: CreateTerraformCloudClientParams) {
    this.organizations = new Organizations(params);
    this.users = new Users(params);
  }
}
