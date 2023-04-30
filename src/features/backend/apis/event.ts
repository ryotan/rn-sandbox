/**
 * Generated by orval v6.14.4 🍺
 * Do not edit manually.
 * SantokuApp REST API
 * SantokuAppのREST API。
 * OpenAPI spec version: 1.0.0
 */
import {useQuery, useMutation} from '@tanstack/react-query';
import type {
  UseQueryOptions,
  UseMutationOptions,
  QueryFunction,
  MutationFunction,
  UseQueryResult,
  QueryKey,
} from '@tanstack/react-query';
import type {Event, BadRequestResponse, GetEventsParams, EventContent, EventRegistration} from './model';
import {httpCall} from '../utils/httpCall';
import type {ErrorType} from '../utils/httpCall';

/**
 * 掲載期間中のイベントまたは全イベントの一覧を取得します。
 * @summary イベント一覧取得
 */
export const getEvents = (params: GetEventsParams, signal?: AbortSignal) => {
  return httpCall<Event[]>({url: `/events`, method: 'get', params, signal});
};

export const getGetEventsQueryKey = (params: GetEventsParams) => [`/events`, ...(params ? [params] : [])] as const;

export const getGetEventsQueryOptions = <
  TData = Awaited<ReturnType<typeof getEvents>>,
  TError = ErrorType<BadRequestResponse>,
>(
  params: GetEventsParams,
  options?: {query?: UseQueryOptions<Awaited<ReturnType<typeof getEvents>>, TError, TData>},
): UseQueryOptions<Awaited<ReturnType<typeof getEvents>>, TError, TData> & {queryKey: QueryKey} => {
  const {query: queryOptions} = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetEventsQueryKey(params);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getEvents>>> = ({signal}) => getEvents(params, signal);

  return {queryKey, queryFn, ...queryOptions};
};

export type GetEventsQueryResult = NonNullable<Awaited<ReturnType<typeof getEvents>>>;
export type GetEventsQueryError = ErrorType<BadRequestResponse>;

export const useGetEvents = <TData = Awaited<ReturnType<typeof getEvents>>, TError = ErrorType<BadRequestResponse>>(
  params: GetEventsParams,
  options?: {query?: UseQueryOptions<Awaited<ReturnType<typeof getEvents>>, TError, TData>},
): UseQueryResult<TData, TError> & {queryKey: QueryKey} => {
  const queryOptions = getGetEventsQueryOptions(params, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {queryKey: QueryKey};

  query.queryKey = queryOptions.queryKey;

  return query;
};

/**
 * イベントを登録します。
 * @summary イベント登録
 */
export const postEvents = (eventRegistration: EventRegistration) => {
  return httpCall<EventContent>({
    url: `/events`,
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    data: eventRegistration,
  });
};

export const getPostEventsMutationOptions = <TError = ErrorType<BadRequestResponse>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof postEvents>>, TError, {data: EventRegistration}, TContext>;
}): UseMutationOptions<Awaited<ReturnType<typeof postEvents>>, TError, {data: EventRegistration}, TContext> => {
  const {mutation: mutationOptions} = options ?? {};

  const mutationFn: MutationFunction<Awaited<ReturnType<typeof postEvents>>, {data: EventRegistration}> = props => {
    const {data} = props ?? {};

    return postEvents(data);
  };

  return {mutationFn, ...mutationOptions};
};

export type PostEventsMutationResult = NonNullable<Awaited<ReturnType<typeof postEvents>>>;
export type PostEventsMutationBody = EventRegistration;
export type PostEventsMutationError = ErrorType<BadRequestResponse>;

export const usePostEvents = <TError = ErrorType<BadRequestResponse>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<Awaited<ReturnType<typeof postEvents>>, TError, {data: EventRegistration}, TContext>;
}) => {
  const mutationOptions = getPostEventsMutationOptions(options);

  return useMutation(mutationOptions);
};
/**
 * 特定のイベントを取得します。
 * @summary イベント取得
 */
export const getEventsEventId = (eventId: string, signal?: AbortSignal) => {
  return httpCall<Event>({url: `/events/${eventId}`, method: 'get', signal});
};

export const getGetEventsEventIdQueryKey = (eventId: string) => [`/events/${eventId}`] as const;

export const getGetEventsEventIdQueryOptions = <
  TData = Awaited<ReturnType<typeof getEventsEventId>>,
  TError = ErrorType<unknown>,
>(
  eventId: string,
  options?: {query?: UseQueryOptions<Awaited<ReturnType<typeof getEventsEventId>>, TError, TData>},
): UseQueryOptions<Awaited<ReturnType<typeof getEventsEventId>>, TError, TData> & {queryKey: QueryKey} => {
  const {query: queryOptions} = options ?? {};

  const queryKey = queryOptions?.queryKey ?? getGetEventsEventIdQueryKey(eventId);

  const queryFn: QueryFunction<Awaited<ReturnType<typeof getEventsEventId>>> = ({signal}) =>
    getEventsEventId(eventId, signal);

  return {queryKey, queryFn, enabled: !!eventId, ...queryOptions};
};

export type GetEventsEventIdQueryResult = NonNullable<Awaited<ReturnType<typeof getEventsEventId>>>;
export type GetEventsEventIdQueryError = ErrorType<unknown>;

export const useGetEventsEventId = <TData = Awaited<ReturnType<typeof getEventsEventId>>, TError = ErrorType<unknown>>(
  eventId: string,
  options?: {query?: UseQueryOptions<Awaited<ReturnType<typeof getEventsEventId>>, TError, TData>},
): UseQueryResult<TData, TError> & {queryKey: QueryKey} => {
  const queryOptions = getGetEventsEventIdQueryOptions(eventId, options);

  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {queryKey: QueryKey};

  query.queryKey = queryOptions.queryKey;

  return query;
};