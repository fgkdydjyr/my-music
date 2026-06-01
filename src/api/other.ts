import request from "@/utils/request";

// 获取仓库更新日志
export const updateLog = () => {
  return request({
    baseURL: "https://gitee.com/api/v5",
    withCredentials: false,
    url: "/repos/linyongbin01/my-music/releases",
  });
};
