import {
  Alert,
  Button,
  Card,
  Divider,
  Space,
  Spin,
  Typography,
} from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import type { CSSProperties } from 'react';
import { getStoredNcUserId, useNowcoderUserQuery } from '@/service/user';

const { Text } = Typography;

const baseGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 8,
};

const wideGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: 8,
};

const formatFlag = (flag?: number | null) => (flag ? '是' : '否');

function UserInfoCard() {
  const { data, isLoading, isFetching, error, refetch } = useNowcoderUserQuery();
  const userId = getStoredNcUserId();
  const loading = isLoading || isFetching;

  const user = data?.user;
  const resume = data?.resume;
  const userAction = data?.userAction;

  return (
    <Card
      title="用户信息"
      extra={
        <Button
          size="small"
          type="outline"
          icon={<IconRefresh />}
          loading={loading}
          onClick={() => refetch()}
        >
          重新读取
        </Button>
      }
    >
      {error && (
        <Alert
          type="error"
          content={error instanceof Error ? error.message : '加载失败'}
          style={{ marginBottom: 12 }}
        />
      )}
      <Spin loading={loading}>
        <Space direction="vertical" size={10} style={{ width: '100%' }}>
          <Text type="secondary">
            nc_userId：<Text code>{userId ?? '未找到（请先登录牛客或写入 localStorage）'}</Text>
          </Text>

          {data ? (
            <>
              <Divider style={{ margin: '0 0 8px 0' }}>基本信息</Divider>
              <div style={baseGridStyle}>
                <Text>昵称：{user?.userName ?? '-'}</Text>
                <Text>等级：{user?.userLevel ?? '-'}</Text>
                <Text>行为分：{user?.behaviorScore ?? '-'}</Text>
                <Text>性别：{user?.gender ?? '-'}</Text>
                <Text>注册时间：{user?.registerTime ?? '-'}</Text>
                <Text>实名认证：{user?.isLegalize ?? '-'}</Text>
                <Text>学历：{user?.eduLevel ?? '-'}</Text>
                <Text>毕业/工作时间：{user?.workTime ?? '-'}</Text>
                <Text>职位：{user?.job ?? '-'}</Text>
                <Text>注册端：{user?.registerClient ?? '-'}</Text>
                <Text>期望地点：{user?.expectedPlace ?? '-'}</Text>
                <Text>期望薪资：{user?.expectedSalary ?? '-'}</Text>
              </div>

              <Divider style={{ margin: '12px 0 8px 0' }}>求职意向</Divider>
              <div style={wideGridStyle}>
                <Text>第一意向：{userAction?.firstIntentionPositionType ?? '-'}</Text>
                <Text>第二意向：{userAction?.secondIntentionPositionType ?? '-'}</Text>
                <Text>意向岗位：{userAction?.intentionPosition ?? '-'}</Text>
                <Text>行业：{userAction?.jobHuntingMap ?? '-'}</Text>
                <Text>工作状态：{userAction?.userWorkStatus ?? '-'}</Text>
              </div>

              <Divider style={{ margin: '12px 0 8px 0' }}>简历与行为</Divider>
              <div style={wideGridStyle}>
                <Text>在线简历：{formatFlag(resume?.userHasOnlineResume)}</Text>
                <Text>附件简历：{formatFlag(resume?.userHasAttachmentResume)}</Text>
                <Text>简历完成度：{formatFlag(resume?.userHasDoneResume)}</Text>
                <Text>简历 ID：{resume?.resumeId ?? '-'}</Text>
                <Text>已投递：{formatFlag(userAction?.userHasDeliveredResume)}</Text>
                <Text>已练习课程：{formatFlag(userAction?.userHasPracticedCourse)}</Text>
                <Text>已购买课程：{formatFlag(userAction?.userHasBoughtCourse)}</Text>
                <Text>模拟面试：{formatFlag(userAction?.userHasAttendedImitateaudition)}</Text>
              </div>
            </>
          ) : (
            !loading && <Text>暂无用户信息</Text>
          )}
        </Space>
      </Spin>
    </Card>
  );
}

export default UserInfoCard;
