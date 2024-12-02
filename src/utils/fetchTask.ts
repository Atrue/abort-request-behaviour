import { call, Operation, useAbortSignal as abortSignalTask } from "effection";

export default function* fetchTask<T>(
  ...[url, params]: Parameters<typeof fetch>
): Operation<T> {
  const signal = yield* abortSignalTask();
  signal.addEventListener('abort', data => console.log('aborted', data, url, params));
  const response = yield* call(
    fetch(url, {
      signal,
      ...params,
    })
  );
  if (response.ok) {
    return yield* call(response.json());
  } else {
    console.log(response.statusText);
    throw new Error(response.statusText);
  }
}
