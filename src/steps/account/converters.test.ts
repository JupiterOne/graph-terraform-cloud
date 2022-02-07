import { getMockUser } from '../../../test/mocks';
import { createAccountEntity } from './converters';

describe('#createAccountEntity', () => {
  test('should convert to entity', () => {
    expect(createAccountEntity(getMockUser())).toMatchSnapshot();
  });
});
