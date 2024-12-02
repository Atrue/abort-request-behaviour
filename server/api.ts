import { Router } from "express";
import apiFetch from './fetch';
import apiDb from './db';
import apiStream from './stream';

const router = Router();

router.use('/fetch', apiFetch);
router.use('/db', apiDb);
router.use('/stream', apiStream);

export default router;
