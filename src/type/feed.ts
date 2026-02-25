export type MomentDetailData = {
  /** 帖子主体数据，字段随接口返回，保持可选以适配后续扩展 */
  momentData?: Record<string, unknown>;
  /** 附带的评论、互动等数据 */
  [key: string]: unknown;
};

export type MomentDetailResponse = {
  success?: boolean;
  code?: number;
  msg?: string;
  data?: MomentDetailData;
};
