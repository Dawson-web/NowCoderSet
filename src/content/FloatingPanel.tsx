import {
  Button,
  Card,
  Form,
  Grid,
  Input,
  List,
  Progress,
  Radio,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from '@arco-design/web-react';
import {
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconDownload,
  IconMinusCircleFill,
  IconPause,
  IconPlayArrow,
  IconRefresh,
} from '@arco-design/web-react/icon';
import { useMemo, useState } from 'react';
import UserInfoCard from './components/UserInfoCard';
import { useSearchQuery } from '@/service/search';
import type { SearchRecord } from '@/type/search';
import { filterContentType } from '@/utils';

const { Title, Text } = Typography;
const { Row, Col } = Grid;

const mockLogs = [
  '[10:03:12] 已解析帖子列表，待抓取 12 篇',
  '[10:03:15] 正在抓取：秋招算法求职经验分享',
  '[10:03:20] 保存成功：秋招算法求职经验分享',
  '[10:03:42] 正在抓取：牛客论坛抓取需求示例（仅样式）',
];

function FloatingPanel() {
  const [searchKeyword, setSearchKeyword] = useState('腾讯');
  const [searchPage, setSearchPage] = useState(1);
  const searchPayload = {
    type: 'all',
    query: searchKeyword,
    page: searchPage,
    tag: [],
    order: '',
    gioParams: {},
  };
  const { data: searchData, isFetching: searchLoading, error: searchError } = useSearchQuery(
    searchKeyword ? searchPayload : null
  );
  const searchResult =
    searchData ?? { current: searchPage, size: 20, total: 0, totalPage: 0, records: [] };

  const summary = useMemo(
    () => ({
      total: 24,
      finished: 9,
      failed: 1,
      progress: Math.round((9 / 24) * 100),
    }),
    []
  );

  return (
    <main className="popup nc-trancy">
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div className="nc-hero">
          <div className="nc-hero__logo">NC</div>
          <div className="nc-hero__text">
            <Title heading={4} style={{ margin: 0 }}>
              NowCoder Panel
            </Title>
            <Text type="secondary">更圆润的采集助手</Text>
          </div>
          <Button type="primary" size="small" className="nc-glass-btn" icon={<IconPlayArrow />}>
            新建任务
          </Button>
        </div>

        <Grid.Row gutter={12}>
          <Col span={12}>
            <Card className="nc-card nc-pill" bodyStyle={{ padding: 14 }}>
              <div className="nc-pill__icon success">✔</div>
              <div className="nc-pill__text">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  已完成
                </Text>
                <Title heading={3} style={{ margin: 0 }}>
                  {summary.finished}
                </Title>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card className="nc-card nc-pill" bodyStyle={{ padding: 14 }}>
              <div className="nc-pill__icon purple">☁</div>
              <div className="nc-pill__text">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  待抓取
                </Text>
                <Title heading={3} style={{ margin: 0 }}>
                  {summary.total}
                </Title>
              </div>
            </Card>
          </Col>
        </Grid.Row>

        <UserInfoCard />

        <Card
          className="nc-card"
          title="抓取配置"
          extra={
            <Space>
              <Button type="primary" icon={<IconPlayArrow />}>
                开始抓取
              </Button>
              <Button type="outline" icon={<IconPause />}>
                暂停
              </Button>
              <Button icon={<IconDownload />}>导出结果</Button>
            </Space>
          }
        >
          <Form
            layout="vertical"
            initialValues={{
              dedup: true,
              format: 'markdown',
            }}
          >
            <Grid.Row gutter={12}>
              <Col span={12}>
                <Form.Item label="最大页数" field="pages" rules={[{ required: true, message: '请填写最大页数' }]}>
                  <Input placeholder="例如 3 页" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="关键字过滤（可选）"
                  field="keyword"
                  tooltip="匹配标题或正文关键字"
                >
                  <Input placeholder="算法 / 秋招 / Java..." allowClear />
                </Form.Item>
              </Col>
            </Grid.Row>

            <Grid.Row gutter={12}>
              <Col span={12}>
                <Form.Item label="导出格式" field="format" >
                  <Radio.Group type="button" className="flex">
                    <Radio value="markdown">Markdown</Radio>
                    <Radio value="json">JSON</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="是否去重"
                  field="dedup"
                  triggerPropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Grid.Row>
          </Form>
        </Card>

        <Row gutter={12}>
          <Col span={12}>
            <Card className="nc-card" title="进度概览" bordered={false}>
              <div className="progress-row">
                <Progress type='circle' percent={10} />

                <div className="progress-stats  ">
                  <Text type="primary"><IconMinusCircleFill className='mr-1' />进行中：{summary.total}</Text>
                  <Text type="success"><IconCheckCircleFill className='mr-1' />已完成：{summary.finished}</Text>
                  <Text type="error"><IconCloseCircleFill className='mr-1' />已失败：{summary.failed}</Text>
                </div>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card className="nc-card" title="常用操作" bordered={false}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <Button long type="outline" icon={<IconDownload />}>
                  导出 Markdown
                </Button>
                <Button long icon={<IconDownload />}>
                  导出 JSON
                </Button>
                <Button long type="text" icon={<IconRefresh />}>
                  清空列表
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card
          className="nc-card"
          title="文章列表"
          extra={
            <Space>
              <Input
                allowClear
                placeholder="输入关键词（如：腾讯）"
                value={searchKeyword}
                onChange={(v) => {
                  setSearchKeyword(v);
                  setSearchPage(1);
                }}
                style={{ width: 180 }}
              />
              <Button type="primary" icon={<IconRefresh />} onClick={() => setSearchPage(1)}>
                搜索
              </Button>
            </Space>
          }
        >
          {searchError && (
            <Text type="error">
              {(searchError as Error).message}
            </Text>
          )}
          <Table<SearchRecord>
            size="small"
            loading={searchLoading}
            pagination={{
              current: searchResult.current || searchPage,
              pageSize: searchResult.size || 20,
              total: searchResult.total || 0,
              onChange: (page) => setSearchPage(page),
            }}
            rowKey={(row) => row.data?.contentId || row.trackId || String(row.entityDataId)}
            data={searchResult.records}
            columns={[
              {
                title: '标题',
                width: 200,
                render: (_col, record) => (
                  <Text ellipsis>{filterContentType(record)?.title ?? '-'}</Text>
                ),
              },
              {
                title: '作者',
                width: 120,
                render: (_col, record) => record.data?.userBrief?.nickname ?? '-',
              },
              {
                title: '状态',
                width: 110,
                render: (_col, record) => (
                  <Tag color="purple" size="small">
                    {filterContentType(record)?.type || '-'}
                  </Tag>
                ),
              },
              {
                title: '发布时间',
                width: 140,
                render: (_col, record) =>
                  filterContentType(record)?.createTime ? filterContentType(record)?.createTime?.toLocaleString() : '-',
              },
            ]}
          />
        </Card>

        <Card title="运行日志" extra={<Button type="text" size="small">清空</Button>}>
          <List
            size="small"
            dataSource={mockLogs}
            render={(item, idx) => <List.Item key={idx}>{item}</List.Item>}
          />
        </Card>
      </Space>
    </main>
  );
}

export default FloatingPanel;
