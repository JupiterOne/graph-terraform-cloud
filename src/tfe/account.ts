import { TerraformCloudClientRequestor } from './request';
import { User } from './types';

export class Account extends TerraformCloudClientRequestor {
  async requestAccount() {
    return this.request<User>({
      method: 'GET',
      path: `/api/v2/account/details`,
    });
  }
}
