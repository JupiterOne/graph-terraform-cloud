import fetch, { FetchError, RequestInit, Response } from 'node-fetch';
import {
  CreateTerraformCloudClientParams,
  OnRequestRetryFunction,
} from './types';
import { retry } from '@lifeomic/attempt';
import camelcaseKeys from 'camelcase-keys';
import * as qs from 'querystring';

const DEFAULT_REQUEST_TIMEOUT_MS = 30000;
const DEFAULT_LIST_API_PAGE_SIZE = 100;

export interface BaseTerraformCloudClientRequestParams {
  path: string;
  requestTimeout?: number;
  body?: any;
  queryStringParams?: Record<string, any>;
}

export interface TerraformCloudClientRequestParams
  extends BaseTerraformCloudClientRequestParams {
  method: string;
}

export interface TerraformCloudClientPaginatedRequestParams
  extends TerraformCloudClientRequestParams {
  pageNumber?: number;
  pageSize?: number;
}

interface JsonApiResponseLinks {
  self: string;
  first: string;
  prev?: string;
  next?: string;
  last: string;
}

interface JsonApiResponseMeta {
  pagination?: {
    'current-page': number;
    'prev-page'?: number;
    'next-page'?: number;
    'total-pages': number;
    'total-count': number;
  };
}

interface JsonApiResponseRelatedLinks {
  related: string;
}

interface JsonApiResponseRelationship {
  data?: Record<string, any>;
  links: JsonApiResponseRelatedLinks;
}

export interface JsonApiResponseData<T> {
  id: string;
  type: string;
  attributes: T;
  relationships?: Record<string, JsonApiResponseRelationship>;
}

interface JsonApiResponse<T> {
  data: JsonApiResponseData<T>;
  relationships: Record<string, JsonApiResponseRelationship>;
}

export interface JsonApiResponseList<T> {
  data: JsonApiResponseData<T>[];
  links: JsonApiResponseLinks;
  meta?: JsonApiResponseMeta;
  included: JsonApiResponseData<any>[];
}

export interface IterateListApiDataResponse<T> {
  item: JsonApiResponseData<T>;
  included?: JsonApiResponseData<any>[];
}

const noRetryStatusCodes: number[] = [400, 401, 403, 404, 413];

function isSuccessfulStatusCode(status: number) {
  return status >= 200 && status < 400;
}

export interface TerraformCloudApiErrorData {
  /**
   * Status code as a string (e.g. "404")
   */
  status: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
  };
}

export class TerraformCloudApiError extends Error {
  readonly errors?: TerraformCloudApiErrorData[];

  constructor(message: string, errors?: TerraformCloudApiErrorData[]) {
    super(message);
    this.errors = errors;
  }
}

export class TerraformCloudApiPermanentError extends TerraformCloudApiError {
  readonly retryable = false;
}

interface PerformTerraformCloudApiRequestParams {
  method: string;
  path: string;
  queryStringParams?: Record<string, any>;
  body?: any;
  timeout: number;
  apiKey: string;
  onRequestRetry?: OnRequestRetryFunction;
}

function cleanQueryStringParams(queryStringParams: Record<string, any>) {
  const newParams: Record<string, any> = {};

  for (const key in queryStringParams) {
    const val = queryStringParams[key];

    if (typeof val !== 'undefined') {
      newParams[key] = val;
    }
  }

  return newParams;
}

function toApiUrl(
  path: string,
  queryStringParams?: Record<string, any>,
): string {
  let apiUrl = `https://app.terraform.io${path}`;

  if (queryStringParams) {
    const serializedQsParams = qs.stringify(
      cleanQueryStringParams(queryStringParams),
    );
    apiUrl += `?${serializedQsParams}`;
  }

  return apiUrl;
}

async function performRequest({
  method,
  path,
  body,
  timeout,
  apiKey,
  onRequestRetry,
  queryStringParams,
}: PerformTerraformCloudApiRequestParams): Promise<Response> {
  const requestOptions: RequestInit = {
    method,
    timeout,
    body: body && JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json',
    },
  };

  const url = toApiUrl(path, queryStringParams);

  const response = await retry(
    async () => {
      const response = await fetch(url, requestOptions);

      if (isSuccessfulStatusCode(response.status)) {
        return response;
      }

      let jsonResponse: any;

      try {
        jsonResponse = await response.json();
      } catch (err) {
        // Some successful responses do not return JSON, but error responses will
        // still return JSON.
      }

      if (noRetryStatusCodes.includes(response.status)) {
        throw new TerraformCloudApiPermanentError(
          `Received response with non-retryable status code (statusCode=${response.status})`,
          jsonResponse?.errors,
        );
      }

      throw new TerraformCloudApiError(
        `Received response with retryable status code (statusCode=${response.status})`,
        jsonResponse?.errors,
      );
    },
    {
      handleError: (
        err: TerraformCloudApiPermanentError & FetchError,
        attemptContext,
      ) => {
        if (err.retryable === false) {
          attemptContext.abort();
          return;
        }

        if (attemptContext.attemptsRemaining && onRequestRetry) {
          // If there are no attempts remaining, we will just bubble up the
          // entire error by default.
          onRequestRetry({
            url,
            code: err.code,
            err,
            attemptNum: attemptContext.attemptNum,
            attemptsRemaining: attemptContext.attemptsRemaining,
          });
        }
      },
    },
  );

  return response;
}

export class TerraformCloudClientRequestor {
  private readonly apiKey: string;
  private readonly requestTimeout: number;
  private readonly onRequestRetry?: OnRequestRetryFunction;

  constructor({
    apiKey,
    requestTimeout = DEFAULT_REQUEST_TIMEOUT_MS,
    onRequestRetry,
  }: CreateTerraformCloudClientParams) {
    this.apiKey = apiKey;
    this.requestTimeout = requestTimeout;
    this.onRequestRetry = onRequestRetry;
  }

  async request<T>({
    path,
    method,
    body,
  }: TerraformCloudClientRequestParams): Promise<T> {
    const response = await performRequest({
      method,
      path,
      body,
      apiKey: this.apiKey,
      onRequestRetry: this.onRequestRetry,
      timeout: this.requestTimeout,
    });

    const result = (await response.json()) as JsonApiResponse<T>;
    return camelcaseKeys(result.data.attributes, { deep: true });
  }

  async deleteRequest<T>({
    path,
    body,
  }: BaseTerraformCloudClientRequestParams): Promise<void> {
    await performRequest({
      method: 'DELETE',
      path,
      body,
      apiKey: this.apiKey,
      onRequestRetry: this.onRequestRetry,
      timeout: this.requestTimeout,
    });
  }

  async listRequest<T>(
    requestParams: TerraformCloudClientPaginatedRequestParams,
  ): Promise<JsonApiResponseList<T>> {
    const response = await performRequest({
      apiKey: this.apiKey,
      onRequestRetry: this.onRequestRetry,
      timeout: this.requestTimeout,
      ...requestParams,
    });

    const result = (await response.json()) as JsonApiResponseList<T>;
    const { path, method } = requestParams;

    if (typeof result.data.length === 'undefined') {
      throw new Error(
        `API returned data that did not have an array of data from "list" method (path=${path}, method=${method})`,
      );
    }

    return {
      ...result,
      data: result.data.map((d) => camelcaseKeys(d, { deep: true })),
      included: result.included?.map((d) => camelcaseKeys(d, { deep: true })),
    };
  }

  async paginateListApi<T>(
    requestParams: TerraformCloudClientPaginatedRequestParams,
    callback: (response: JsonApiResponseList<T>) => Promise<void>,
  ): Promise<void> {
    let nextPageNumber: number | undefined;

    do {
      const queryStringParams: Record<string, any> = {
        'page[size]': DEFAULT_LIST_API_PAGE_SIZE,
        ...requestParams.queryStringParams,
      };

      if (nextPageNumber) {
        queryStringParams['page[number]'] = nextPageNumber;
      }

      const result = await this.listRequest<T>({
        ...requestParams,
        queryStringParams,
      });

      nextPageNumber = result.meta?.pagination?.['next-page'];
      await callback(result);
    } while (nextPageNumber);
  }

  iterateListApiData<T>(
    requestParams: TerraformCloudClientPaginatedRequestParams,
    callback: (item: IterateListApiDataResponse<T>) => Promise<void>,
  ) {
    return this.paginateListApi(
      requestParams,
      async (response: JsonApiResponseList<T>) => {
        for (const item of response.data) {
          await callback({
            item,
            included: response.included,
          });
        }
      },
    );
  }
}
