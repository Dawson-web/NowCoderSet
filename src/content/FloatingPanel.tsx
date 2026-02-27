import { Button, Modal, Tabs, Typography } from '@arco-design/web-react';
import { IconBook, IconBug, IconCalendar, IconClose, IconExclamationCircleFill, IconUser } from '@arco-design/web-react/icon';
import { useCallback, useEffect, useRef, useState } from 'react';
import UserInfoCard from './components/UserInfoCard';
import CrawlPanel from './components/CrawlPanel';
import LogsPanel from './components/LogsPanel';
import HistoryPanel from './components/HistoryPanel';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const NC_WARN_KEY = 'nc-first-visit-warned';
const NC_DOMAIN = 'nowcoder.com';

// 检测当前页面是否为牛客网
const isNowcoderSite = () => window.location.hostname.includes(NC_DOMAIN);

// 弹出层挂载到 sidebar 容器
const getContainer = () =>
  document.getElementById('nowcoder-float-root') ?? document.body;

interface FloatingPanelProps {
  open: boolean;
  onClose: () => void;
}

const FloatingPanel = ({ open, onClose }: FloatingPanelProps) => {
  const [logs, setLogs] = useState<string[]>([]);
  const logsRef = useRef<string[]>([]);
  const [showSiteWarning, setShowSiteWarning] = useState(false);

  // 侧边栏打开时检测是否在牛客网
  useEffect(() => {
    if (!open) {
      return;
    }
    if (!isNowcoderSite()) {
      const warned = localStorage.getItem(NC_WARN_KEY);
      if (!warned) {
        setShowSiteWarning(true);
      }
    }
  }, [open]);

  const handleDismissWarning = useCallback(() => {
    localStorage.setItem(NC_WARN_KEY, '1');
    setShowSiteWarning(false);
  }, []);

  const addLog = useCallback((message: string) => {
    const ts = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLogs((prev) => {
      const next = [...prev, `[${ts}] ${message}`].slice(-200);
      logsRef.current = next;
      return next;
    });
  }, []);

  const getLogs = useCallback(() => logsRef.current, []);

  const handleClearLogs = useCallback(() => {
    setLogs([]);
    logsRef.current = [];
  }, []);

  return (
    <main className="nc-panel">
      <div className="nc-panel-header shrink-0 flex items-center justify-between">
        <Title heading={4} style={{ margin: 0 }}>
          <span className="font-bold" style={{ color: '#165DFE' }}>Now</span>Coder.🐞
        </Title>
        <button
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 transition-colors cursor-pointer"
          onClick={onClose}
          aria-label="关闭面板"
          tabIndex={0}
        >
          <IconClose fontSize={14} />
        </button>
      </div>

      <Tabs tabPosition="right" defaultActiveTab="crawl" className="nc-tabs">
        <TabPane key="profile" title={<IconUser fontSize={18} />}>
          <div className="nc-tab-content">
            <UserInfoCard />
          </div>
        </TabPane>

        <TabPane key="crawl" title={<IconBug fontSize={18} />}>
          <CrawlPanel addLog={addLog} getLogs={getLogs} />
        </TabPane>

        <TabPane key="history" title={<IconCalendar fontSize={18} />}>
          <div className="nc-tab-content">
            <HistoryPanel />
          </div>
        </TabPane>

        <TabPane key="logs" title={<IconBook fontSize={18} />}>
          <div className="nc-tab-content">
            <LogsPanel logs={logs} onClear={handleClearLogs} />
          </div>
        </TabPane>
      </Tabs>

      <Modal
        title={null}
        visible={showSiteWarning}
        onCancel={handleDismissWarning}
        footer={null}
        closable={false}
        maskClosable={false}
        autoFocus={false}
        getPopupContainer={getContainer}
        style={{ maxWidth: 400, zIndex: 2147483647 }}
        maskStyle={{ zIndex: 2147483646 }}
        wrapClassName="nc-modal-wrap"
      >
        <div className="flex flex-col items-center gap-4 py-4 px-2 text-center">
          <IconExclamationCircleFill style={{ fontSize: 48, color: '#FF7D00' }} />
          <Title heading={5} style={{ margin: 0 }}>
            当前页面不是牛客网
          </Title>
          <Text className="text-gray-500 text-sm leading-relaxed">
            本插件的爬虫功能需要在牛客网（nowcoder.com）页面上才能正常使用。请先前往牛客网，再打开插件使用相关功能。
          </Text>
          <div className="flex gap-3 w-full mt-2">
            <Button
              type="outline"
              long
              onClick={handleDismissWarning}
            >
              我知道了
            </Button>
            <Button
              type="primary"
              long
              onClick={() => {
                window.open('https://www.nowcoder.com', '_blank');
                handleDismissWarning();
              }}
            >
              前往牛客网
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default FloatingPanel;
