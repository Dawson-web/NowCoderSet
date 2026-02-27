import { Avatar, Card, List } from '@arco-design/web-react';
import type { ArticleListCardProps } from './types';

const ArticleListCard = ({ listData }: ArticleListCardProps) => (
  <Card className="nc-card shadow-md nc-article-list-card" title="文章列表">
    <div className="nc-article-list-scroll">
      <List
        style={{ width: '100%' }}
        dataSource={listData}
        render={(item, index) => (
          <List.Item key={index}>
            <List.Item.Meta
              avatar={
                <Avatar shape="square">
                  <img alt="avatar" src={`${item.avatar}`} />
                </Avatar>
              }
              title={item.title}
              description={item.description}
            />
          </List.Item>
        )}
      />
    </div>
  </Card>
);

export default ArticleListCard;
