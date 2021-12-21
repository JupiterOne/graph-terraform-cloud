import {
  createDirectRelationship,
  createMappedRelationship,
  Entity,
  IntegrationStep,
  IntegrationStepExecutionContext,
  JobState,
  RelationshipClass,
  RelationshipDirection,
} from '@jupiterone/integration-sdk-core';
import { TerraformCloudClient } from '../../tfe/client';
import { IntegrationConfig } from '../../config';
import { Entities, IntegrationSteps } from '../constants';
import { createWorkspaceRunEntity } from './converters';
import { collectApplyCompleteOperations } from '../../util/applies';
import { getGraphObjectDataFromApplyLogHook } from '../../util/resources';
import { JsonApiResponseData } from '../../tfe/request';
import { Run } from '../../tfe/types';

async function forEachWorkspaceEntity(
  jobState: JobState,
  callback: (e: Entity) => Promise<void>,
) {
  await jobState.iterateEntities(
    {
      _type: Entities.WORKSPACE._type,
    },
    callback,
  );
}

async function processRunDeployedResourceRelationships({
  jobState,
  runEntity,
  run,
  included,
}: {
  jobState: JobState;
  runEntity: Entity;
  run: JsonApiResponseData<Run>;
  included: JsonApiResponseData<any>[];
}) {
  const relatedApplyId = run.relationships?.apply?.data?.id;

  if (!relatedApplyId) {
    return;
  }

  for (const includedItem of included) {
    if (includedItem.id === relatedApplyId) {
      const applyCompleteOperations = await collectApplyCompleteOperations(
        includedItem.attributes.logReadUrl,
      );

      for (const operation of applyCompleteOperations) {
        const targetEntityData = getGraphObjectDataFromApplyLogHook(
          operation.hook,
        );

        if (!targetEntityData) {
          continue;
        }

        await jobState.addRelationship(
          createMappedRelationship({
            _class: RelationshipClass.DEPLOYED,
            _type: 'tfe_run_deployed_resource',
            _mapping: {
              relationshipDirection: RelationshipDirection.FORWARD,
              sourceEntityKey: runEntity._key,
              targetFilterKeys: [['_type', '_key']],
              skipTargetCreation: true,
              targetEntity: {
                _key: targetEntityData._key,
                _type: targetEntityData._type,
              },
            },
          }),
        );
      }
    }
  }
}

function findIncludedRelationship<T>({
  type,
  data,
  included,
}: {
  type: string;
  data: JsonApiResponseData<T>;
  included: JsonApiResponseData<any>[];
}) {
  const relatedId = data.relationships?.[type]?.data?.id;

  if (!relatedId) {
    return;
  }

  for (const includedItem of included) {
    if (includedItem.id === relatedId) {
      return includedItem;
    }
  }
}

function runIngressAttrIdentifierToRepoName(identifier: string) {
  return identifier.split('/')[1];
}

async function processPullRequestTriggersRunRelationship({
  jobState,
  runEntity,
  run,
  included,
}: {
  jobState: JobState;
  runEntity: Entity;
  run: JsonApiResponseData<Run>;
  included: JsonApiResponseData<any>[];
}) {
  const relatedConfigurationVersion = findIncludedRelationship({
    type: 'configurationVersion',
    data: run,
    included,
  });

  if (!relatedConfigurationVersion) {
    return;
  }

  const relatedIngressAttributes = findIncludedRelationship({
    type: 'ingressAttributes',
    data: relatedConfigurationVersion,
    included,
  });

  if (
    !relatedIngressAttributes ||
    !relatedIngressAttributes.attributes ||
    !relatedIngressAttributes.attributes.commitSha ||
    !relatedIngressAttributes.attributes.identifier
  ) {
    return;
  }

  await jobState.addRelationship(
    createMappedRelationship({
      _class: RelationshipClass.TRIGGERS,
      _type: 'pr_triggers_codedeploy',
      _mapping: {
        relationshipDirection: RelationshipDirection.REVERSE,
        sourceEntityKey: runEntity._key,
        targetFilterKeys: [
          ['_class', 'mergeCommitHash', 'repository'],
          // TODO: consider `commits` property
        ],
        skipTargetCreation: true,
        targetEntity: {
          _class: 'PR',
          repository: runIngressAttrIdentifierToRepoName(
            relatedIngressAttributes.attributes.identifier,
          ),
          mergeCommitHash: relatedIngressAttributes.attributes.commitSha,
        },
      },
    }),
  );
}

export async function fetchWorkspaceRuns({
  instance: { config },
  jobState,
}: IntegrationStepExecutionContext<IntegrationConfig>) {
  const { apiKey } = config;
  const client = new TerraformCloudClient({ apiKey });

  await forEachWorkspaceEntity(jobState, async (workspaceEntity) => {
    await client.workspaces.iterateWorkspaceRuns(
      {
        workspaceId: workspaceEntity._key,
        includeApply: true,
        includeIngressAttributes: true,
      },
      async ({ item: run, included = [] }) => {
        const runEntity = await jobState.addEntity(
          createWorkspaceRunEntity({
            runId: run.id,
            run: run.attributes,
          }),
        );

        await jobState.addRelationship(
          createDirectRelationship({
            _class: RelationshipClass.HAS,
            from: workspaceEntity,
            to: runEntity,
          }),
        );

        await processRunDeployedResourceRelationships({
          jobState,
          runEntity,
          run,
          included,
        });

        await processPullRequestTriggersRunRelationship({
          jobState,
          runEntity,
          run,
          included,
        });
      },
    );
  });
}

export const workspaceSteps: IntegrationStep<IntegrationConfig>[] = [
  {
    id: IntegrationSteps.RUNS,
    name: 'Fetch Workspace Runs',
    entities: [Entities.WORKSPACE],
    relationships: [],
    dependsOn: [IntegrationSteps.WORKSPACES],
    executionHandler: fetchWorkspaceRuns,
  },
];
