import createDebug from 'debug';
import { Response, Request, RequestHandler } from "express";
import { run, call, Operation, useAbortSignal as abortSignalTask } from "effection";

export const debug = createDebug('app');

export function* fetchTask<T>(
  ...[url, params]: Parameters<typeof fetch>
): Operation<T> {
  const signal = yield* abortSignalTask();
  const response = yield* call(
    fetch(url, {
      signal,
      ...params,
    })
  );
  if (response.ok) {
    return yield* call(response.json());
  } else {
    throw new Error(response.statusText);
  }
}

export function routerHandler(task: (req: Request, res: Response) => Operation<unknown>): RequestHandler {
    return async (req, res) => {
        const runningTask = run(function*(): Operation<void> {
            try {
                debug(`${req.method} ${req.url} started`);
                const result = yield* task(req, res);
                res.send(result);
                debug(`${req.method} ${req.url} finished`);
            } catch (err) {
                debug(`${req.method} ${req.url} error:`, err);
                if (err instanceof ApiError) {
                  res.writeHead(err.status).send()
                } else {
                  res.writeHead(500).send()
                }
            }
        });

        res.on("close", function () {
            const aborted = !res.writableFinished;
            if (aborted) {
                debug(`${req.method} ${req.url} aborted`);
                run(runningTask.halt);
            }
        });
    }
}

export class ApiError extends Error {
    status: number;

    constructor(status: number) {
        super();
        this.status = status;
    }
}