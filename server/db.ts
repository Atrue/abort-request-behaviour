import { Router, Request, json } from "express";
import { Operation, sleep, call, all, ensure } from 'effection';
import { routerHandler, ApiError } from "./utils";
import { createClient, Row } from "@libsql/client";

const db1 = createClient({
  url: "file:app1.db",
});
const db2 = createClient({
  url: "file:app2.db",
});

async function prepareDb() {
  const names = Array(20).fill(null).map((_, i) => `item-${i}`);
  const SQL_DROP = 'DROP TABLE IF EXISTS items';
  const SQL_CREATE = 'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, created DATETIME DEFAULT CURRENT_TIMESTAMP);';
  const SQL_INSERT = 'INSERT INTO items (name) values (?)';

  await Promise.all([
    db1.execute(SQL_DROP),
    db2.execute(SQL_DROP),
  ]);

  await Promise.all([
    db1.execute(SQL_CREATE),
    db2.execute(SQL_CREATE),
  ]);

  const sqlBatch = names.map(name => ({
    sql: SQL_INSERT,
    args: [name],
  }));

  await Promise.all([
    db1.batch(sqlBatch, 'write'),
    db2.batch(sqlBatch, 'write'),
  ]);
  console.log('db created');
}

prepareDb();

const router = Router();

interface ListItemsResponse {
  db1: Row[];
  db2: Row[];
}

const SQL_SELECT = 'SELECT id, name, created from items';

function* getItems(): Operation<ListItemsResponse> {
  const [res1, res2] = yield* all([
    call(db1.execute(SQL_SELECT)),
    call(db2.execute(SQL_SELECT)),
  ]);

  return {
    db1: res1.rows,
    db2: res2.rows,
  };
}

interface MoveItemResponse {
  id: number;
}

const SQL_SELECT_BY_ID = 'SELECT id, name, created from items WHERE id = ?';
const SQL_DELETE_BY_ID = 'DELETE from items WHERE id = ?';
const SQL_INSERT = 'INSERT INTO items (name, created) values (?, ?)'

function* moveItem(req: Request): Operation<MoveItemResponse> {
  const { id, db } = req.body;
  const fromDb = db === 'db1' ? db1 : db2;
  const toDb = db === 'db1' ? db2 : db1;
  const selectRes = yield* call(fromDb.execute({ sql: SQL_SELECT_BY_ID, args: [id] }));
  const item = selectRes.rows[0];

  if (!item) throw new ApiError(400);

  // create transactions for each db
  const transaction1 = yield* call(fromDb.transaction("write"));
  const transaction2 = yield* call(toDb.transaction("write"));
  // rollback the transacation when the task is finished or canceled
  yield* ensure(() => {
    if (!transaction1.closed) transaction1.rollback();
    if (!transaction2.closed) transaction2.rollback();
  });

  // delete from selected db
  yield* call(transaction1.execute({ sql: SQL_DELETE_BY_ID, args: [id] }));

  // simulate big delay to be able to abort the request
  yield* sleep(2000);

  // insert to another db
  const insertRes = yield* call(transaction2.execute({ sql: SQL_INSERT, args: [item.name, item.created] }));

  // commit both transactions
  yield* call(transaction1.commit());
  yield* call(transaction2.commit());

  const newId = Number(insertRes.lastInsertRowid);
  return { id: newId };
}

router.use(json());

router.get('/all', routerHandler(getItems))
router.post('/move', routerHandler(moveItem))

export default router;
