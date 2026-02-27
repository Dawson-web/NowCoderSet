import {
  Button,
  Card,
  Grid,
  Progress,
  Space,
  Typography,
} from '@arco-design/web-react';
import {
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconDownload,
  IconMinusCircleFill,
  IconRefresh,
} from '@arco-design/web-react/icon';
import type { ProgressAndActionsProps } from './types';

const { Row, Col } = Grid;
const { Text } = Typography;

const ProgressAndActions = ({
  summary,
  hasTask,
  onExportMarkdown,
  onExportJson,
  onClear,
}: ProgressAndActionsProps) => (
  <Row gutter={12} className="shrink-0">
    <Col span={12}>
      <Card className="nc-card shadow-md" title="进度概览" bordered={false}>
        <div className="flex items-center gap-3.5" style={{ height: '110px' }}>
          <Progress type="circle" percent={summary.progress} />
          <div className="grid gap-1.5">
            <Text type="primary">
              <IconMinusCircleFill className="mr-1" />
              进行中：{summary.pending}
            </Text>
            <Text type="success">
              <IconCheckCircleFill className="mr-1" />
              已完成：{summary.finished}
            </Text>
            <Text type="error">
              <IconCloseCircleFill className="mr-1" />
              已失败：{summary.failed}
            </Text>
          </div>
        </div>
      </Card>
    </Col>
    <Col span={12}>
      <Card className="nc-card shadow-md" title="常用操作" bordered={false}>
        <Space direction="vertical" size={8} style={{ width: '100%', height: '110px' }}>
          <Button long type="outline" icon={<IconDownload />} onClick={onExportMarkdown} disabled={!hasTask}>
            导出 Markdown
          </Button>
          <Button long icon={<IconDownload />} onClick={onExportJson} disabled={!hasTask}>
            导出 JSON
          </Button>
          <Button long type="text" icon={<IconRefresh />} onClick={onClear}>
            清空列表
          </Button>
        </Space>
      </Card>
    </Col>
  </Row>
);

export default ProgressAndActions;
