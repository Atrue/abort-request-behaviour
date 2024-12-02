import { Button, Form, Input, Typography, Space } from "antd";
import { FormData } from "@/types/item";

interface FormProps {
  loading: boolean;
  onSubmit(data: FormData): void;
  onCancel(): void;
}

export default function FormContent({
  loading,
  onSubmit,
  onCancel,
}: FormProps) {
  return (
    <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      disabled={loading}
      onFinish={onSubmit}
      autoComplete="off"
    >
      <Typography.Title>Create a new item</Typography.Title>
      <Form.Item<FormData>
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please input the name!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FormData>
        label="Description"
        name="description"
        rules={[{ required: true, message: "Please input the description!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Space>
          <Button loading={loading} type="primary" htmlType="submit">
            Create
          </Button>
          <Button disabled={false} onClick={onCancel}>Cancel request</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
