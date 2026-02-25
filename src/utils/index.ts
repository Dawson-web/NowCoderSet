import { SearchRecord } from "@/type/search";
import { title } from "process";

export const filterContentType = (record: SearchRecord) => {
    switch (record.rc_type) {
        case 207:
            return {
                type: '讨论帖',
                uuid: record.data?.contentData?.uuid,
                title: record.data?.contentData?.title,
                content: record.data?.contentData?.content,
                createTime: record.data?.contentData?.createTime,
            }
        case 201:
            return {
                type: 'Feed 动态',
                uuid: record.data?.momentData?.uuid,
                title: record.data?.momentData?.title,
                content: record.data?.momentData?.content,
                createTime: record.data?.momentData?.createdAt,
            }
    }
}