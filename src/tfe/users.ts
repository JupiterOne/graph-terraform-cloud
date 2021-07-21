import { User } from './types';
import { TerraformCloudClientRequestor } from './request';

export class Users extends TerraformCloudClientRequestor {
  async get(userId: string) {
    return this.request<User>({
      method: 'GET',
      path: `/api/v2/users/${userId}`,
    });
  }
}
