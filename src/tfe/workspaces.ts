import {
  IterateListApiDataResponse,
  TerraformCloudClientRequestor,
} from './request';
import { WorkspaceResource } from './types';

export class Workspaces extends TerraformCloudClientRequestor {
  async iterateWorkspaceResources(
    workspaceName: string,
    callback: (
      organization: IterateListApiDataResponse<WorkspaceResource>,
    ) => Promise<void>,
  ) {
    await this.iterateListApiData<WorkspaceResource>(
      {
        method: 'GET',
        path: `/api/v2/workspaces/${workspaceName}/resources`,
      },
      callback,
    );
  }
}
