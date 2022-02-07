import { createIntegrationEntity } from '@jupiterone/integration-sdk-core';
import { User } from '../../tfe/types';
import { Entities } from '../constants';

export function createAccountEntity(data: User) {
  return createIntegrationEntity({
    entityData: {
      source: data,
      assign: {
        _key: `account-${data.id}`,
        _class: Entities.ACCOUNT._class,
        _type: Entities.ACCOUNT._type,
        username: data.username,
        name: data.username,
        email: data.email,
      },
    },
  });
}
