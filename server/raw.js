import http from "http";

const port = 5555;

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);
  req
    .on("error", (err) => console.log("err", err))
    .on("data", (data) => console.log("data", data.toString()))
    .on("end", () => console.log("end data"))
    .on("close", () =>
      console.log("closed", [
        req.aborted,
        req.destroyed,
        req.writableFinished,
        res.writableFinished,
      ])
    )
    .on("aborted", () => console.log("aborted"));

  res.on("close", () =>
    console.log("closed RES", [req.writableFinished, res.writableFinished])
  );

  setTimeout(() => {
    console.log("end");
    res.setHeader("Content-Type", "application/json");
    res.writeHead(200);
    res.end(`{"message": "This is a JSON response"}`);
  }, 2000);
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
