import { fetchAccount } from '.';
import { createDataCollectionTest } from '../../../test/recording';
import { integrationConfig } from '../../../test/config';
import { Entities } from '../constants';
import { createMockStepExecutionContext } from '@jupiterone/integration-sdk-testing';
import { IntegrationConfig } from '../../config';

describe('#fetchAccount', () => {
  test('should collect data', async () => {
    const context = createMockStepExecutionContext<IntegrationConfig>({
      instanceConfig: integrationConfig,
    });

    await createDataCollectionTest({
      context,
      recordingName: 'fetchAccount',
      recordingDirectory: __dirname,
      integrationConfig,
      stepFunctions: [fetchAccount],
      entitySchemaMatchers: [
        {
          _type: Entities.ACCOUNT._type,
          matcher: {
            _class: ['Account'],
            schema: {
              additionalProperties: false,
              properties: {
                _type: { const: 'tfe_account' },
                _rawData: {
                  type: 'array',
                  items: { type: 'object' },
                },
                name: { type: 'string' },
                email: { type: 'string' },
                username: { type: 'string' },
              },
            },
          },
        },
      ],
    });
  });
});
