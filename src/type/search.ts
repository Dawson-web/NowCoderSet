import { b, S } from "node_modules/vite/dist/node/types.d-aGj9QkWt";

export type SearchPayload = {
  type: string;
  query: string;
  page?: number;
  tag?: Array<string | number>;
  order?: string;
  gioParams?: Record<string, unknown>;
};

export type RichTextFragment = {
  text: string;
  color: string | null;
  router: string | null;
};

export type RichTextContent = {
  data: RichTextFragment[];
};

export type ActivityIcon = {
  imgUrl: string;
  expireTime: number | null;
  name: string;
  discussLink: string | null;
  appLink: string | null;
  pcLink: string | null;
  content: string | null;
  source: string | null;
  type: string | null;
};

export type ExtraInfo = {
  contentType_var?: string;
  trackID_var?: string;
  contentID_var?: string;
  trackId?: string;
  dolphin_var?: string;
  entityId?: string;
  searchTaxonomyEnum?: unknown;
  entityID_var?: string;
};

export type UserBrief = {
  userId?: number;
  nickname?: string;
  admin?: boolean;
  followed?: boolean;
  headImgUrl?: string;
  gender?: string;
  headDecorateUrl?: string;
  honorLevel?: number;
  honorLevelName?: string;
  honorLevelColor?: string;
  workTime?: string;
  educationInfo?: string;
  secondMajorName?: string;
  identityList?: unknown;
  activityIconList?: ActivityIcon[];
  activityIconListV2?: ActivityIcon[];
  memberIdentity?: number;
  memberStartTime?: number | null;
  memberEndTime?: number | null;
  member?: unknown;
  authDisplayInfo?: string;
  enterpriseInfo?: unknown;
  badgeIconUrl?: string | null;
};

export type MomentData = {
  ip4?: string;
  ip4Location?: string;
  id?: number;
  uuid?: string;
  userId?: number;
  title?: string;
  newTitle?: RichTextContent;
  content?: string;
  newContent?: RichTextContent;
  type?: number;
  status?: number;
  hasEdit?: boolean;
  isAnonymousFlag?: boolean;
  beMyOnly?: boolean;
  linkMoment?: unknown;
  imgMoment?: unknown;
  clockMoment?: unknown;
  videoMoment?: unknown;
  createdAt?: number;
  circle?: unknown;
  editTime?: number;
  edited?: boolean;
  showTime?: number;
};

export type SubjectData = {
  id?: number;
  uuid?: string;
  tagId?: number;
  subjectType?: number;
  content?: string;
  createdAt?: number;
  isFollow?: boolean | null;
  official?: number;
  hadVote?: number;
};

export type VoteData = {
  voteId?: number;
  withVote?: boolean;
  voteTitle?: string | null;
  voteType?: number | null;
};

export type FrequencyData = {
  likeCnt?: number;
  followCnt?: number;
  commentCnt?: number;
  totalCommentCnt?: number;
  viewCnt?: number;
  shareCnt?: number;
  isLike?: boolean;
  isFollow?: boolean;
  flowerData?: unknown;
};

export type CommentExposure = {
  commentId?: number;
  headImgUrl?: string;
  nickname?: string;
  content?: string;
  commentType?: number;
  contentJsonList?: RichTextContent;
  images?: unknown;
  cardActivityIcon?: unknown;
  cardActivityIconInContent?: unknown;
};

export type ContentData = {
  id: String,
  uuid: string;
  authorId: number;
  title: string;
  richText: null;
  content: string;
  typeName: string;
  beMyOnly: boolean;
  contentImageUrls: string[];
  isTop: boolean | null;
  hot: boolean;
  isGilded: boolean;
  isReward: boolean;
  reward: number;
  hasOfferCompareTag: boolean;
  staffAnswer: boolean;
  withAnonymousOffer: boolean;
  isAnonymousFlag: boolean;
  isWithAcceptFlag: null;
  postCertify: number;
  entityId: number;
  entityType: number;
  newReferral: null;
  createTime: number;
  editTime: number;
  recommendAd: boolean;
  edited: boolean;
  showTime: number;
};

export type SearchRecord = {
  rc_type?: number;
  entityDataId?: number;
  triggerId?: number | string | null;
  trackId?: string;
  title?: string | null;
  expandType?: number;
  extraInfo?: ExtraInfo;
  data?: {
    contentId?: string;
    contentType?: number;
    interviewExp?: unknown;
    userBrief?: UserBrief;
    momentData?: MomentData;
    contentData?: ContentData;
    subjectData?: SubjectData[];
    voteData?: VoteData;
    blogZhuanlan?: unknown;
    frequencyData?: FrequencyData;
    extraInfo?: ExtraInfo;
    commentExposure?: CommentExposure | null;
    internalRecommend?: unknown;
  };
};

export type SearchResponse = {
  success: boolean;
  code: number;
  msg: string;
  data?: {
    current: number;
    size: number;
    total: number;
    totalPage: number;
    records: SearchRecord[];
  };
};
