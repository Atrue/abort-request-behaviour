import { Router } from "express";
import { Operation } from 'effection';
import { fetchTask, routerHandler } from "./utils";

const router = Router();

interface RandomUserNameResponse {
  results: {
    name: {
      title: string;
      first: string;
      last: string;
    }
  }[]
}

interface UserGenderResponse {
  count: number;
  name: string;
  gender: string;
  probability: number;
}

interface User {
  name: string;
  gender: string;
}

function* getUser(): Operation<User> {
  const userResponse = yield* fetchTask<RandomUserNameResponse>('https://randomuser.me/api/?inc=name');
  const name = userResponse.results[0].name.first;

  const nameQuery = new URLSearchParams({ name }).toString();
  const { gender } = yield* fetchTask<UserGenderResponse>(`https://api.genderize.io/?${nameQuery}`);

  return { name, gender }
}

router.get('/user', routerHandler(getUser))

export default router;
