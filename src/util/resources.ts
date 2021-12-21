import { ParsedTerraformApplyLogHook } from './applies';

type TerraformResourceGraphObjectData = Record<
  string,
  {
    _type: string;
    buildKey?: (hook: ParsedTerraformApplyLogHook) => string;
  }
>;

type GraphObjectFromApplyLogHook = {
  _type: string;
  _key: string;
};

const SUPPORTED_PROVIDERS_SET = new Set<string>(['google']);

export const terraformResourceToGraphObjectDataMap: TerraformResourceGraphObjectData =
  {
    google_project: {
      _type: 'google_cloud_project',
    },
    google_project_service: {
      _type: 'google_cloud_api_service',
    },
    google_cloudfunctions_function: {
      _type: 'google_cloud_function',
    },
    google_folder: {
      _type: 'google_cloud_folder',
    },
    google_organization: {
      _type: 'google_cloud_organization',
    },
    google_project_iam_custom_role: {
      _type: 'google_iam_role',
    },
    google_storage_bucket: {
      _type: 'google_storage_bucket',
      buildKey(hook) {
        return `bucket:${hook.id_value}`;
      },
    },
  };

export function getGraphObjectDataFromApplyLogHook(
  hook: ParsedTerraformApplyLogHook,
): GraphObjectFromApplyLogHook | null {
  if (!SUPPORTED_PROVIDERS_SET.has(hook.resource.implied_provider)) {
    return null;
  }

  const { resource_type: resourceType } = hook.resource;

  const knownGraphObjectData =
    terraformResourceToGraphObjectDataMap[resourceType];

  if (knownGraphObjectData) {
    return {
      _type: knownGraphObjectData._type,
      _key: knownGraphObjectData.buildKey
        ? knownGraphObjectData.buildKey(hook)
        : hook.id_value,
    };
  } else {
    return {
      _type: resourceType,
      _key: hook.id_value,
    };
  }
}
