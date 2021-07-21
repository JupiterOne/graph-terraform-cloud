import { JobState } from '@jupiterone/integration-sdk-core';

const ORGANIZATION_IDS_CACHE_KEY = 'tfe_organization_ids';

export interface CachedOrganizationData {
  organizationName: string;
  organizationExternalId: string;
}

export async function cacheOrganizationData(
  jobState: JobState,
  organizationData: CachedOrganizationData[],
) {
  await jobState.setData(ORGANIZATION_IDS_CACHE_KEY, organizationData);
}

export async function getOrganizationsFromCache(
  jobState: JobState,
): Promise<CachedOrganizationData[]> {
  const data = await jobState.getData<CachedOrganizationData[]>(
    ORGANIZATION_IDS_CACHE_KEY,
  );

  return data || [];
}

export async function forEachOrganization(
  jobState: JobState,
  callback: (organization: CachedOrganizationData) => Promise<void>,
) {
  for (const result of await getOrganizationsFromCache(jobState)) {
    await callback(result);
  }
}
