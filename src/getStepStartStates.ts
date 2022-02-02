import {
  IntegrationExecutionContext,
  StepStartStates,
} from '@jupiterone/integration-sdk-core';
import { IntegrationConfig } from './config';
import { IntegrationSteps } from './steps/constants';
import { TerraformCloudClient } from './tfe/client';
import { EntitlementSet } from './tfe/types';

const FREE_TIER_ENTITLEMENT: EntitlementSet = {
  costEstimation: false,
  configurationDesigner: true,
  operations: true,
  privateModuleRegistry: true,
  sentinel: false,
  stateStorage: true,
  teams: false,
  vcsIntegrations: true,
  usageReporting: false,
  userLimit: 5,
  selfServeBilling: true,
  auditLogging: false,
  agents: false,
  sso: false,
};

export default async function getStepStartStates(
  context: IntegrationExecutionContext<IntegrationConfig>,
): Promise<StepStartStates> {
  const { logger, instance } = context;
  const client = new TerraformCloudClient({ apiKey: instance.config.apiKey });

  const reducedEntitlementSet = FREE_TIER_ENTITLEMENT;

  const entitlementSet =
    await client.organizations.requestOrganizationEntitlementSet(
      instance.config.organizationName,
    );

  Object.keys(reducedEntitlementSet).forEach((key) => {
    reducedEntitlementSet[key] ||= entitlementSet[key];
  });

  const stepStartStates: StepStartStates = {
    [IntegrationSteps.ACCOUNT]: {
      disabled: false,
    },
    [IntegrationSteps.ORGANIZATIONS]: {
      disabled: false,
    },
    [IntegrationSteps.ORGANIZATION_ENTITLEMENT_SET]: {
      disabled: false,
    },
    [IntegrationSteps.ORGANIZATION_MEMBERS]: {
      disabled: false,
    },
    [IntegrationSteps.ORGANIZATION_WORKSPACES]: {
      disabled: false,
    },
    [IntegrationSteps.WORKSPACE_RESOURCES]: {
      disabled: false,
    },
    [IntegrationSteps.ORGANIZATION_TEAMS]: {
      disabled: !reducedEntitlementSet.teams,
    },
  };

  logger.info(
    { stepStartStates: JSON.stringify(stepStartStates) },
    'Step start states',
  );
  return stepStartStates;
}
