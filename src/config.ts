import {
  IntegrationExecutionContext,
  IntegrationInstanceConfig,
  IntegrationInstanceConfigFieldMap,
  IntegrationProviderAuthenticationError,
  IntegrationValidationError,
} from '@jupiterone/integration-sdk-core';
import { TerraformCloudClient } from './tfe/client';

export const instanceConfigFields: IntegrationInstanceConfigFieldMap = {
  apiKey: {
    type: 'string',
    mask: true,
  },
  organizationName: {
    type: 'string',
  },
};

export interface IntegrationConfig extends IntegrationInstanceConfig {
  apiKey: string;
  organizationName: string;
}

export async function validateInvocation(
  context: IntegrationExecutionContext<IntegrationConfig>,
) {
  const { instance } = context;
  const { config } = instance;

  if (!config.apiKey || !config.organizationName) {
    throw new IntegrationValidationError(
      'Config requires all of {apiKey, organizationName}',
    );
  }

  const client = new TerraformCloudClient({ apiKey: config.apiKey });

  try {
    await client.organizations.list();
  } catch (err) {
    throw new IntegrationProviderAuthenticationError(err.message);
  }
}
