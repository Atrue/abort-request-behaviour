import { List, Card } from "antd";
import { Item } from "@/types/item";

interface CardListProps {
  loading: boolean;
  items?: Item[];
}

export default function ContentList({ loading, items }: CardListProps) {
  return (
    <List
      style={{ width: "100%" }}
      grid={{
        gutter: 16,
        xs: 1,
        sm: 2,
        md: 4,
        lg: 4,
        xl: 6,
        xxl: 3,
      }}
      loading={loading}
      dataSource={items}
      renderItem={(item) => (
        <List.Item key={item.id}>
          <Card title={item.name}>{item.description}</Card>
        </List.Item>
      )}
    />
  );
}
