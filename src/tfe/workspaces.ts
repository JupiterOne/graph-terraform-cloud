import {
  IterateListApiDataResponse,
  TerraformCloudClientRequestor,
} from './request';
import { Run } from './types';

export class Workspaces extends TerraformCloudClientRequestor {
  async iterateWorkspaceRuns(
    {
      workspaceId,
      includeApply,
      includeConfigurationVersion,
      includeIngressAttributes,
    }: {
      workspaceId: string;
      includeApply?: boolean;
      includeConfigurationVersion?: boolean;
      includeIngressAttributes?: boolean;
    },
    callback: (workspace: IterateListApiDataResponse<Run>) => Promise<void>,
  ) {
    const included: string[] = [];

    if (includeApply) included.push('apply');
    if (includeConfigurationVersion) included.push('configuration_version');
    if (includeIngressAttributes)
      included.push('configuration_version.ingress_attributes');

    await this.iterateListApiData<Run>(
      {
        method: 'GET',
        path: `/api/v2/workspaces/${workspaceId}/runs`,
        queryStringParams: {
          include: (included.length && included.join(',')) || undefined,
        },
      },
      callback,
    );
  }
}
