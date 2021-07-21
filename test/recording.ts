import { IntegrationStepExecutionContext } from '@jupiterone/integration-sdk-core';
import {
  setupRecording,
  SetupRecordingInput,
  createMockStepExecutionContext,
  ToMatchGraphObjectSchemaParams,
  ToMatchRelationshipSchemaParams,
  MockIntegrationStepExecutionContext,
} from '@jupiterone/integration-sdk-testing';

export { Recording } from '@jupiterone/integration-sdk-testing';

export async function withRecording(
  recordingName: string,
  directoryName: string,
  cb: () => Promise<void>,
  options?: SetupRecordingInput['options'],
) {
  const recording = setupRecording({
    directory: directoryName,
    name: recordingName,
    options: {
      recordFailedRequests: false,
      ...(options || {}),
    },
  });

  try {
    await cb();
  } finally {
    await recording.stop();
  }
}

export interface EntitySchemaMatcher {
  _type: string;
  matcher: ToMatchGraphObjectSchemaParams;
}

export interface RelationshipSchemaMatcher {
  _type: string;
  matcher: ToMatchRelationshipSchemaParams;
}

export interface CreateDataCollectionTestParams<IIntegrationConfig> {
  recordingName: string;
  recordingDirectory: string;
  integrationConfig: IIntegrationConfig;
  stepFunctions: ((
    context: IntegrationStepExecutionContext<IIntegrationConfig>,
  ) => Promise<void>)[];
  entitySchemaMatchers?: EntitySchemaMatcher[];
  relationshipSchemaMatchers?: RelationshipSchemaMatcher[];
  context?: MockIntegrationStepExecutionContext<IIntegrationConfig>;
}

export async function createDataCollectionTest<IIntegrationConfig>({
  context,
  recordingName,
  recordingDirectory,
  integrationConfig,
  stepFunctions,
  entitySchemaMatchers,
  relationshipSchemaMatchers,
}: CreateDataCollectionTestParams<IIntegrationConfig>) {
  const stepExecutionContext = (context =
    context ||
    createMockStepExecutionContext<IIntegrationConfig>({
      instanceConfig: integrationConfig,
    }));

  await withRecording(recordingName, recordingDirectory, async () => {
    for (const stepFunction of stepFunctions) {
      await stepFunction(stepExecutionContext);
    }

    expect({
      numCollectedEntities:
        stepExecutionContext.jobState.collectedEntities.length,
      numCollectedRelationships:
        stepExecutionContext.jobState.collectedRelationships.length,
      collectedEntities: stepExecutionContext.jobState.collectedEntities,
      collectedRelationships:
        stepExecutionContext.jobState.collectedRelationships,
      encounteredTypes: stepExecutionContext.jobState.encounteredTypes,
    }).toMatchSnapshot('jobState');

    if (entitySchemaMatchers) {
      for (const entitySchemaMatcher of entitySchemaMatchers) {
        expect(
          stepExecutionContext.jobState.collectedEntities.filter(
            (e) => e._type === entitySchemaMatcher._type,
          ),
        ).toMatchGraphObjectSchema(entitySchemaMatcher.matcher);
      }
    }

    if (relationshipSchemaMatchers) {
      for (const relationshipSchemaMatcher of relationshipSchemaMatchers) {
        expect(
          stepExecutionContext.jobState.collectedRelationships.filter(
            (r) => r._type === relationshipSchemaMatcher._type,
          ),
        ).toMatchDirectRelationshipSchema(relationshipSchemaMatcher.matcher);
      }
    }
  });

  return { context };
}
