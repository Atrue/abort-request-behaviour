import { useEffect, useState } from "react";
import { Operation } from "effection";
import { FormData, Item } from "@/types/item";
import useTaskCallback from "@/hooks/useTaskCallback";
import fetchTask from "@/utils/fetchTask";
import Form from "./form";
import List from "./list";

function useItems() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Item[]>([]);

  const [refresh] = useTaskCallback(function* (): Operation<void> {
    setLoading(true);
    const items = yield* fetchTask<Item[]>("/api/items");
    setData(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { loading, data, refresh };
}

function useForm() {
  const [loading, setLoading] = useState(false);

  const [submit, cancel] = useTaskCallback(function* (
    data: FormData
  ): Operation<void> {
    console.log("submitting", data);
    setLoading(true);
    const res = yield* fetchTask<Item>("/api/items", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("reciving", res);
    setLoading(false);
  },
  []);

  return { loading, submit, cancel };
}

export default function Page() {
  const itemsHook = useItems();
  const formHook = useForm();

  return (
    <>
      <Form
        loading={formHook.loading}
        onSubmit={formHook.submit}
        onCancel={formHook.cancel}
      />
      <List items={itemsHook.data} loading={itemsHook.loading} />
    </>
  );
}
