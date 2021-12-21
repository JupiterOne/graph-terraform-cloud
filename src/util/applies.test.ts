import { promises as fs } from 'fs';
import * as path from 'path';
import { parseRunApply } from './applies';

async function loadFixture(fixtureName: string): Promise<string> {
  const fullPath = path.join(__dirname, '__fixtures__', `${fixtureName}.txt`);
  const file = await fs.readFile(fullPath, { encoding: 'utf-8' });
  return file;
}

async function parseRunApplyFixture(fixtureName: string) {
  return parseRunApply(await loadFixture(fixtureName));
}

describe('#parseRunApply', () => {
  test('should parse "resource-added" log output', async () => {
    expect(await parseRunApplyFixture('resource-added')).toMatchSnapshot();
  });
});
