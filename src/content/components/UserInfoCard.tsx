import {
  Alert,
  Avatar,
  Button,
  Card,
  Spin,
  Tag,
  Typography,
} from '@arco-design/web-react';
import {
  IconBook,
  IconCalendar,
  IconCheckCircleFill,
  IconCloseCircleFill,
  IconFile,
  IconHome,
  IconIdcard,
  IconLocation,
  IconRefresh,
  IconStar,
  IconUser,
} from '@arco-design/web-react/icon';
import type { ReactNode } from 'react';
import { getStoredNcUserId, useNowcoderUserQuery } from '@/service/user';

const { Text, Title } = Typography;

// 分区标题：左侧色条 + 加粗文字
const SectionTitle = ({ children, color = '#165DFE' }: { children: ReactNode; color?: string }) => (
  <div className="flex items-center gap-2 mt-3 mb-2">
    <div className="w-1 h-4 rounded-sm" style={{ background: color }} />
    <Text className="text-sm font-semibold" style={{ color }}>{children}</Text>
  </div>
);

// 信息项：label + value 纵向排列
const InfoItem = ({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) => (
  <div className="flex flex-col gap-0.5 rounded-lg bg-gray-50 px-3 py-2">
    <div className="flex items-center gap-1">
      {icon && <span className="text-gray-400 text-xs">{icon}</span>}
      <Text className="text-xs text-gray-400">{label}</Text>
    </div>
    <Text className="text-sm font-medium">{value || '-'}</Text>
  </div>
);

// 布尔状态标签
const StatusTag = ({ label, flag }: { label: string; flag?: number | null }) => {
  const active = !!flag;
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2">
      {active
        ? <IconCheckCircleFill className="text-green-500 text-sm" />
        : <IconCloseCircleFill className="text-gray-300 text-sm" />
      }
      <Text className={`text-sm ${active ? 'text-gray-700' : 'text-gray-400'}`}>{label}</Text>
    </div>
  );
};

const UserInfoCard = () => {
  const { data, isLoading, isFetching, error, refetch } = useNowcoderUserQuery();
  const userId = getStoredNcUserId();
  const loading = isLoading || isFetching;

  const user = data?.user;
  const resume = data?.resume;
  const userAction = data?.userAction;

  return (
    <Card
      title="用户信息"
      className="nc-card shadow-md "
      extra={
        <Button
          size="small"
          type="outline"
          icon={<IconRefresh />}
          loading={loading}
          onClick={() => refetch()}
        >
          刷新
        </Button>
      }
    >
      {error && (
        <Alert
          type="error"
          content={error instanceof Error ? error.message : '加载失败'}
          className="mb-3"
        />
      )}

      <Spin loading={loading}>
        <div className="flex flex-col gap-1 w-full user-info-card">
          {data ? (
            <>
              {/* 顶部概要区 */}
              <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-3 mb-1">
                <Avatar size={48} className="bg-blue-500 shrink-0">
                  {user?.userName?.charAt(0) ?? 'U'}
                </Avatar>
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Title heading={6} className="m-0 truncate">{user?.userName ?? '未知用户'}</Title>
                    {user?.userLevel && (
                      <Tag size="small" color="arcoblue">Lv.{user.userLevel}</Tag>
                    )}
                    {user?.behaviorScore !== undefined && (
                      <Tag size="small" color="green">行为分 {user.behaviorScore}</Tag>
                    )}
                  </div>
                  <Text className="text-xs text-gray-400 truncate">
                    ID：{userId ?? '未找到（请先登录牛客）'}
                  </Text>
                </div>
              </div>

              {/* 基本信息 */}
              <SectionTitle>基本信息</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <InfoItem label="性别" value={user?.gender} icon={<IconUser />} />
                <InfoItem label="学历" value={user?.eduLevel} icon={<IconBook />} />
                <InfoItem label="职位" value={user?.job} icon={<IconIdcard />} />
                <InfoItem label="毕业/工作时间" value={user?.workTime} icon={<IconCalendar />} />
                <InfoItem label="注册时间" value={user?.registerTime} icon={<IconCalendar />} />
                <InfoItem label="实名认证" value={user?.isLegalize} icon={<IconStar />} />
                <InfoItem label="注册端" value={user?.registerClient} icon={<IconHome />} />
                <InfoItem label="期望地点" value={user?.expectedPlace} icon={<IconLocation />} />
                <InfoItem label="期望薪资" value={user?.expectedSalary} icon={<IconStar />} />
              </div>

              {/* 求职意向 */}
              <SectionTitle color="#722ED1">求职意向</SectionTitle>
              <div className="flex flex-wrap gap-1.5 mb-1">
                {userAction?.intentionPosition && (
                  <Tag color="arcoblue" size="small">{userAction.intentionPosition}</Tag>
                )}
                {userAction?.firstIntentionPositionType && (
                  <Tag color="purple" size="small">{userAction.firstIntentionPositionType}</Tag>
                )}
                {userAction?.secondIntentionPositionType && (
                  <Tag color="pinkpurple" size="small">{userAction.secondIntentionPositionType}</Tag>
                )}
                {userAction?.jobHuntingMap && (
                  <Tag color="cyan" size="small">{userAction.jobHuntingMap}</Tag>
                )}
                {userAction?.userWorkStatus !== undefined && (
                  <Tag color="gray" size="small">工作状态：{userAction.userWorkStatus}</Tag>
                )}
                {!userAction?.intentionPosition
                  && !userAction?.firstIntentionPositionType
                  && !userAction?.jobHuntingMap
                  && <Text className="text-xs text-gray-400">暂无求职意向数据</Text>
                }
              </div>

              {/* 简历与行为 */}
              <SectionTitle color="#00B42A">简历与行为</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                <InfoItem label="简历 ID" value={resume?.resumeId} icon={<IconFile />} />
                <StatusTag label="在线简历" flag={resume?.userHasOnlineResume} />
                <StatusTag label="附件简历" flag={resume?.userHasAttachmentResume} />
                <StatusTag label="简历完成" flag={resume?.userHasDoneResume} />
                <StatusTag label="已投递" flag={userAction?.userHasDeliveredResume} />
                <StatusTag label="已练习课程" flag={userAction?.userHasPracticedCourse} />
                <StatusTag label="已购买课程" flag={userAction?.userHasBoughtCourse} />
                <StatusTag label="模拟面试" flag={userAction?.userHasAttendedImitateaudition} />
              </div>
            </>
          ) : (
            !loading && <Text className="text-gray-400 text-center py-8">暂无用户信息</Text>
          )}
        </div>
      </Spin>
    </Card>
  );
};

export default UserInfoCard;
