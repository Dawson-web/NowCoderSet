import {
  Button,
  Card,
  Form,
  Grid,
  Input,
  Radio,
  Space,
  Switch,
} from '@arco-design/web-react';

const { Col } = Grid;
import { IconPause, IconPlayArrow } from '@arco-design/web-react/icon';
import type { CrawlConfigCardProps } from './types';

const CrawlConfigCard = ({ form, running, onStart }: CrawlConfigCardProps) => (
  <Card
    className="nc-card shadow-md shrink-0"
    title="抓取配置"
    extra={
      <Space>
        <Button type="primary" icon={<IconPlayArrow />} onClick={onStart} loading={running}>
          开始抓取
        </Button>
        <Button type="outline" icon={<IconPause />} disabled>
          暂停
        </Button>
      </Space>
    }
  >
    <Form
      layout="vertical"
      form={form}
      initialValues={{
        pages: 1,
        keyword: '',
        dedup: true,
        format: 'markdown',
      }}
    >
      <Grid.Row gutter={12}>
        <Col span={12}>
          <Form.Item
            label="最大页数"
            field="pages"
            rules={[
              { required: true, message: '请填写最大页数' },
              {
                validator: (_value, cb) => {
                  const num = Number(_value);
                  if (Number.isNaN(num) || num <= 0) {
                    cb('请输入大于 0 的数字');
                  } else {
                    cb();
                  }
                },
              },
            ]}
          >
            <Input placeholder="例如 3 页" inputMode="numeric" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="关键字"
            field="keyword"
            tooltip="匹配标题或正文关键字"
            rules={[{ required: true, message: '请填写关键字' }]}
          >
            <Input placeholder="算法 / 秋招 / Java..." allowClear />
          </Form.Item>
        </Col>
      </Grid.Row>

      <Grid.Row gutter={12}>
        <Col span={12}>
          <Form.Item label="导出格式" field="format">
            <Radio.Group type="button" className="flex">
              <Radio value="markdown">Markdown</Radio>
              <Radio value="json">JSON</Radio>
            </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="是否去重" field="dedup" triggerPropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Grid.Row>
    </Form>
  </Card>
);

export default CrawlConfigCard;
