import { Tabs, Typography } from '@arco-design/web-react';
import { IconBook, IconBug, IconCalendar, IconUser } from '@arco-design/web-react/icon';
import { useCallback, useRef, useState } from 'react';
import UserInfoCard from './components/UserInfoCard';
import CrawlPanel from './components/CrawlPanel';
import LogsPanel from './components/LogsPanel';
import HistoryPanel from './components/HistoryPanel';

const { Title } = Typography;
const { TabPane } = Tabs;

const FloatingPanel = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logsRef = useRef<string[]>([]);

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
      <div className="nc-panel-header shrink-0">
        <Title heading={4} style={{ margin: 0 }}>
          <span className="font-bold" style={{ color: '#165DFE' }}>Now</span>Coder.🐞
        </Title>
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
    </main>
  );
};

export default FloatingPanel;
