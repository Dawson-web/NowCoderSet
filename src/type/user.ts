export type NowcoderUser = {
  userName?: string;
  behaviorScore?: number;
  userLevel?: string;
  registerTime?: string;
  isLegalize?: string;
  eduLevel?: string;
  workTime?: string;
  gender?: string;
  registerClient?: string;
  job?: string;
  expectedPlace?: string;
  expectedSalary?: string;
};

export type NowcoderResume = {
  userHasOnlineResume?: number;
  userHasAttachmentResume?: number;
  userHasDoneResume?: number;
  resumeId?: string;
};

export type NowcoderUserAction = {
  userWorkStatus?: number;
  intentionPosition?: string;
  firstIntentionPositionType?: string;
  secondIntentionPositionType?: string;
  jobHuntingMap?: string;
  userHasPracticedCourse?: number | null;
  userHasBoughtCourse?: number | null;
  userHasFollowedCompanyInCalender?: number | null;
  userHasDeliveredResume?: number | null;
  userHasAttendedImitateaudition?: number | null;
};

export type NowcoderUserData = {
  user?: NowcoderUser;
  resume?: NowcoderResume;
  userAction?: NowcoderUserAction;
  covDeliver?: unknown;
};

export type NowcoderUserResponse = {
  success: boolean;
  code?: number;
  msg?: string;
  data?: NowcoderUserData;
};
