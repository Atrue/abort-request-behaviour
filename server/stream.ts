import { Response, Request, RequestHandler, Router } from "express";
import { Readable } from 'node:stream';
import http from 'http';
import { Operation, call, each } from 'effection';
import { fetchTask, routerHandler } from "./utils";
import proxy from 'express-http-proxy';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = Router();

async function _testAsync(body: ReadableStream) {
  for await (const c of body) {
    console.log(c);
  }
}

function* _testEach(body: ReadableStream) {
  for (const c of yield* each(body)) {
    console.log(c);
  }
}

function* getUser(req: any, res: Response): Operation<any> {
  const response = yield* call(
    fetch('https://media.w3.org/2010/05/sintel/trailer.mp4', {
      headers: req.headers
    })
  );
  const headers = Object.fromEntries(Array.from(response.headers.entries()))
  console.log(response.status, req.headers, headers);
  _testAsync(response.body)
  const nodeStream = Readable.fromWeb(response.body);
  res.writeHead(response.status, headers)
  nodeStream.pipe(res);
  // for (const chunk of response.body) {
  //   console.log(chunk);
  //   // force consumption of body
  // }
  // res.pipe();
  // response.body?.stream(res);
  // const video = yield* call(response.blob());
  // console.log('video', video);
  // res.type(video.type)
  // return video;
}

router.use('/video', routerHandler(getUser))

router.use('/proxy1', (req, res) => {
  http.request({
    // host to forward to
    host: 'media.w3.org',
    // port to forward to
    port: 443,
    // path to forward to
    path: req.path,
    method: req.method,
    headers: req.headers,
  }, proxyRes => {
    console.log('proxyRes', proxyRes);
    proxyRes
    .on('data', data => console.log('data', data))
    .on('end', data => console.log('end', data))
  }).end();
});

// router.use('/proxy1', proxy('https://media.w3.org/'));
router.use('/proxy2', createProxyMiddleware({
  target: 'https://media.w3.org/',
  changeOrigin: true,
}));

export default router;
