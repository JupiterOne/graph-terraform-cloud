import fetch from 'node-fetch';

/**
 * See: https://www.terraform.io/docs/internals/machine-readable-ui.html#operation-messages
 */
export type ParsedTerraformApplyLogActionType =
  | 'apply_start'
  | 'apply_progress'
  | 'apply_complete'
  | 'apply_errored'
  | 'provision_start'
  | 'provision_progress'
  | 'provision_complete'
  | 'provision_errored'
  | 'refresh_start'
  | 'refresh_complete';

export type ParsedTerraformApplyLogHook = {
  resource: {
    addr: string;
    module: string;
    resource: string;
    implied_provider: string;
    resource_type: string;
    resource_name: string;
    resource_key: string | null;
  };
  action: string;
  id_key: string;
  id_value: string;
  elapsed_seconds: number;
};

export type ParsedTerraformApplyLog = {
  '@level': string;
  '@message': string;
  '@module': string;
  '@timestamp': string;
  type: string;
  hook: ParsedTerraformApplyLogHook;
};

export async function downloadAndParseRunApply(url: string) {
  const response = await fetch(url);
  return response.text();
}

/**
 * When the `Structured Run Output` workspace option is enabled, Terraform Cloud
 * stores raw logs of the Terraform apply.
 */
export function parseRunApply(text: string): ParsedTerraformApplyLog[] {
  const splitApply = text.split('\n');
  const collected: ParsedTerraformApplyLog[] = [];

  for (const row of splitApply) {
    try {
      const parsed = JSON.parse(row) as ParsedTerraformApplyLog;

      // Validate that one of the apply log properties are available before
      // considering it valid
      if (parsed['@message']) {
        collected.push(parsed);
      }
    } catch (err) {
      // This apply log is likely using non-structured run output and therefore
      // cannot be parsed
    }
  }
  return collected;
}

export async function collectApplyCompleteOperations(url: string) {
  const text = await downloadAndParseRunApply(url);
  const parsed = parseRunApply(text);
  return parsed.filter((v) => v.type === 'apply_complete');
}
