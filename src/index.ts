import { IntegrationInvocationConfig } from '@jupiterone/integration-sdk-core';
import {
  instanceConfigFields,
  IntegrationConfig,
  validateInvocation,
} from './config';
import { organizationSteps } from './steps/organization';

export const invocationConfig: IntegrationInvocationConfig<IntegrationConfig> =
  {
    instanceConfigFields,
    validateInvocation,
    integrationSteps: [...organizationSteps],
  };
