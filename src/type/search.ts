export type SearchPayload = {
  type: string;
  query: string;
  page?: number;
  tag?: Array<string | number>;
  order?: string;
  gioParams?: Record<string, unknown>;
};

export type SearchRecord = {
  trackId?: string;
  rc_type?: number;
  entityDataId?: number;
  data?: {
    contentId?: string;
    contentType?: number;
    userBrief?: {
      userId?: number;
      nickname?: string;
      honorLevelName?: string;
      educationInfo?: string;
    };
    contentData?: {
      id?: string;
      title?: string;
      typeName?: string;
      content?: string;
      createTime?: number;
    };
    frequencyData?: {
      viewCnt?: number;
      commentCnt?: number;
      likeCnt?: number;
    };
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
