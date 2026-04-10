import { post } from "@/utils/request";

// 用户相关接口
export const userApi = {
  // 获取认证地址回调
  getAuthRedirectUrl: (data) => {
    return post(`/callback/getAuthRedirectUrl`, data);
  },
  // 获取认证地址回调（测试）
  getAuthRedirectUrlTest: (data) => {
    return post(`/callback/getAuthRedirectUrlTest`, data);
  },
};
// 来访登记接口
export const visitorRegisterApi = {
  // 获取用户信息
  getSalerInfo: (data) => {
    return post("/visit/getSalerInfo", data);
  },
  // 获取知晓途径
  getKnowWay: () => {
    return post("/visit/getKnowWay");
  },
  // 获取到访方式
  getVisitType: () => {
    return post("/visit/getVisitType");
  },
  // 获取项目列表,isAll为true时获取所有项目，false时获取当前用户所属项目
  getProjList: (data) => {
    return post("/visit/getProjList", data);
  },
  // 获取报备列表
  getReportHis: (data) => {
    return post("/visit/getReportHis", data);
  },
  // 获取置业顾问列表
  getSalerList: (data) => {
    return post("/visit/getSalerList", data);
  },
  // 更改置业顾问AB排序
  setSalerAbsort: (data) => {
    return post("/visit/setSalerAbsort", data);
  },
  // 批量保存置业顾问 AB 位排序
  batchSaveSalerAbsort: (data) => {
    return post("/visit/batchSaveSalerAbsort", data);
  },
  // 置业顾问签到
  setSignIn: (data) => {
    return post("/visit/setSignIn", data);
  },
  // 置业顾问签退
  setSignOut: (data) => {
    return post("/visit/setSignOut", data);
  },
  // 新增客户来访记录
  addVisitRec: (data) => {
    return post("/visit/addVisitRec", data);
  },
  // 修改客户来访记录
  editVisitRec: (data) => {
    return post("/visit/editVisitRec", data);
  },
  // 获取客户来访记录
  getVisitHis: (data) => {
    return post("/visit/getVisitHis", data);
  },
  // 批量重新分配置业顾问
  batchResetSaler: (data) => {
    return post("/visit/batchResetSaler", data);
  },
};
