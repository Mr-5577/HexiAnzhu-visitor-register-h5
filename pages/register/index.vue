<template>
    <view class="register-container">
        <!-- 顶部切换Tab -->
        <view class="visit-type-tab">
            <view class="tab-item" :class="{ active: visitType === 'channel' }" @click="switchTab('channel')">
                渠道来访
            </view>
            <view class="tab-item" :class="{ active: visitType === 'natural' }" @click="switchTab('natural')">
                自然来访
            </view>
        </view>
        <!-- 表单内容 -->
        <scroll-view class="form-scroll" scroll-y>
            <view class="form-container">
                <view class="form-card">
                    <view class="form-report" v-show="visitType === 'channel'">
                        <view class="quick-report-btn" @click="openReportPopup">
                            <text class="btn-text">选择报备</text>
                            <text class="btn-arrow">›</text>
                        </view>
                    </view>
                    <!-- 项目 -->
                    <view class="form-item">
                        <text class="label required">项目</text>
                        <CustomPicker v-model="formData.visitProjId" :options="projectList" label-key="name"
                            value-key="id" placeholder="请选择项目" @change="onProjectChange" />
                    </view>
                    <!-- 客户姓名 -->
                    <view class="form-item">
                        <text class="label required">客户姓名</text>
                        <input class="input" v-model="formData.custName" placeholder="请输入客户姓名" maxlength="20" />
                    </view>

                    <!-- 客户电话 -->
                    <view class="form-item">
                        <text class="label required">客户电话</text>
                        <input class="input" v-model="formData.custTel" type="tel" placeholder="请输入客户电话"
                            maxlength="11" />
                    </view>
                    <view class="form-item">
                        <text class="label">备用电话</text>
                        <input class="input" v-model="formData.custTel2" type="tel" placeholder="请输入备用电话"
                            maxlength="11" />
                    </view>

                    <!-- 到访人数 -->
                    <view class="form-item ">
                        <text class="label required">到访人数</text>
                        <view class="number-input">
                            <view class="number-btn" @click="decreasePeople">-</view>
                            <input class="number-value" v-model="formData.visitNum" type="number" disabled />
                            <view class="number-btn" @click="increasePeople">+</view>
                        </view>
                    </view>
                </view>
                <view class="form-card">
                    <view class="form-item">
                        <text class="label required">到访方式</text>
                        <CustomPicker v-model="formData.visitTypeId" :options="filteredVisitMethodList" label-key="name"
                            value-key="id" placeholder="请选择到访方式" @change="onVisitMethodChange" />
                    </view>
                    <view class="form-item">
                        <text class="label required">知晓途径</text>
                        <CustomPicker v-model="formData.knowWayId" :options="channelList" label-key="name"
                            value-key="id" placeholder="请选择知晓途径" @change="onKnowWayChange" />
                    </view>

                    <!-- 根据到访方式显示不同字段 -->
                    <template v-if="visitType === 'channel'">
                        <view class="form-item">
                            <text class="label">渠道公司</text>
                            <input class="input" v-model="formData.reportCom" disabled placeholder="渠道公司" />
                        </view>

                        <view class="form-item">
                            <text class="label">渠道门店</text>
                            <input class="input" v-model="formData.reportComArea" placeholder="请输入门店" />
                        </view>
                        <view class="form-item">
                            <text class="label required">带访人</text>
                            <input class="input" v-model="formData.bringMan" placeholder="请输入带访人" />
                        </view>

                        <view class="form-item">
                            <text class="label required">带访人电话</text>
                            <input class="input" v-model="formData.bringTel" type="tel" maxlength="11"
                                placeholder="请输入带访电话" />
                        </view>

                        <view class="form-item">
                            <text class="label">报备人</text>
                            <input class="input" v-model="formData.reporter" disabled placeholder="报备人" />
                        </view>

                        <view class="form-item">
                            <text class="label">报备时间</text>
                            <picker mode="date" :value="formData.reportTime" disabled @change="onReportTimeChange">
                                <view class="report-picker">
                                    {{ formData.reportTime || '报备时间' }}
                                </view>
                            </picker>
                        </view>
                    </template>
                </view>
            </view>
        </scroll-view>
        <!-- 底部确认按钮 -->
        <view class="bottom-btn">
            <button class="confirm-btn" :disabled="isSubmitting" @click="handleSubmit">
                确认登记
            </button>
        </view>
        <!-- 报备弹窗 -->
        <ReportPopup ref="reportPopupRef" :projectId="formData.visitProjId" @reportSelected="onReportSelected" />
    </view>
</template>

<script setup>
import dayjs from 'dayjs'
import { onShow, onHide } from '@dcloudio/uni-app'
import { ref, computed, onMounted } from 'vue'
import ReportPopup from './components/report-pop-up.vue'
import CustomPicker from '@/components/custom-picker/index.vue'
import { visitorRegisterApi } from '@/common/api.js'
import { transformData } from '@/utils/common.js'

// 来访类型
const visitType = ref('channel') // natural: 自然来访, channel: 渠道来访
// 表单数据
const formData = ref({
    custName: '', // 客户姓名
    custTel: '', // 客户电话1
    custTel2: '', // 备用电话
    visitNum: 1, // 到访人数
    visitTypeId: '', // 到访方式ID
    visitTypeName: '', // 到访方式name
    bringMan: '',      // 带访人
    bringTel: '', // 带访电话
    reportComArea: '', // 报备公司门店
    reportCom: '', // 报备公司
    reportId: '', // 报备ID
    reporter: '',      // 报备人
    reportTime: '',    // 报备时间
    knowWayId: '', // 知晓途径ID
    knowWayName: '', // 知晓途径name
    visitProjId: '', // 项目ID
    visitProjName: '' // 项目
})

// 来访方式列表
const visitMethodList = ref([])
// 来访途径列表
const channelList = ref([])
// 项目列表
const projectList = ref([])
// 提交锁
const isSubmitting = ref(false)

// 根据来访类型过滤到访方式选项
const filteredVisitMethodList = computed(() => {
    // 自然来访,0自然到访、5电转访、8工程抵款、0棚改
    const NATURAL_VISIT_IDS = ['0', '5', '8', '9']
    // 渠道来访,1老带新,2内渠,3外渠分销,4自拓邀约,6内部员工及推荐,6全民营销
    const CHANNEL_VISIT_IDS = ['1', '2', '3', '4', '6', '7']
    const filterIds = visitType.value === 'natural' ? NATURAL_VISIT_IDS : CHANNEL_VISIT_IDS
    return visitMethodList.value.filter(item => filterIds.includes(item.id))
})

// 初始化表单数据
const resetForm = () => {
    formData.value.custName = '' // 客户姓名
    formData.value.custTel = '' // 客户电话
    formData.value.custTel2 = '' // 备用电话
    formData.value.visitNum = 1 // 到访人数
    formData.value.visitTypeId = '' // 到访方式ID
    formData.value.visitTypeName = '' // 到访方式name
    formData.value.bringMan = ''      // 带访人
    formData.value.bringTel = '' // 带访电话
    formData.value.reportCom = '' // 报备公司
    formData.value.reportId = '' // 报备ID
    formData.value.reporter = ''      // 报备人
    formData.value.reportTime = ''    // 报备时间
    formData.value.knowWayId = '' // 知晓途径
    formData.value.knowWayName = '' // 知晓途径name
    // formData.value.visitProjId = '' // 项目ID
    // formData.value.visitProjName = '' // 项目
}

// 增加人数
const increasePeople = () => {
    if (formData.value.visitNum < 20) {
        formData.value.visitNum++
    }
}
// 减少人数
const decreasePeople = () => {
    if (formData.value.visitNum > 1) {
        formData.value.visitNum--
    }
}

// 切换Tab
const switchTab = (type) => {
    visitType.value = type
    resetForm()
    // 默认选中第一个项目
    // if (projectList.value.length) {
    //     formData.value.visitProjId = projectList.value[0].id
    //     formData.value.visitProjName = projectList.value[0].name
    // }
}

// 项目选择变化
const onProjectChange = (value, selectedItem) => {
    formData.value.visitProjName = selectedItem.name

    // 清除报备人相关信息
    formData.value.reportId = ''
    formData.value.reportCom = ''
    formData.value.reporter = ''
    formData.value.reportTime = ''
}

// 到访方式选择变化
const onVisitMethodChange = (value, selectedItem) => {
    formData.value.visitTypeName = selectedItem.name

    // 清除报备人相关信息
    // formData.value.reportId = ''
    // formData.value.reportCom = ''
    // formData.value.reporter = ''
    // formData.value.reportTime = ''
}

// 报备时间选择
const onReportTimeChange = (e) => {
    formData.value.reportTime = e.detail.value
}

// 知晓途径选择变化
const onKnowWayChange = (value, selectedItem) => {
    formData.value.knowWayName = selectedItem.name
}

// 提交表单
const handleSubmit = async () => {
    console.log('提交表单数据:', formData.value)
    if (isSubmitting.value) {
        return
    }
    // 字段校验
    if (!formData.value.visitProjId) {
        uni.showToast({ title: '请选择项目', icon: 'none' })
        return
    }
    if (!formData.value.custName) {
        uni.showToast({ title: '请输入客户姓名', icon: 'none' })
        return
    }
    if (!/^1[3-9]\d{9}$/.test(formData.value.custTel)) {
        uni.showToast({ title: '请输入正确的客户电话', icon: 'none' })
        return
    }
    if (formData.value.custTel2 && !/^1[3-9]\d{9}$/.test(formData.value.custTel2)) {
        uni.showToast({ title: '请输入正确的备用电话', icon: 'none' })
        return
    }
    if (!formData.value.visitTypeId) {
        uni.showToast({ title: '请选择到访方式', icon: 'none' })
        return
    }
    if (!formData.value.knowWayId) {
        uni.showToast({ title: '请选择知晓途径', icon: 'none' })
        return
    }

    // 渠道来访额外校验
    if (visitType.value === 'channel') {
        if (!formData.value.bringMan) {
            uni.showToast({ title: '请输入带访人', icon: 'none' })
            return
        }
        if (!/^1[3-9]\d{9}$/.test(formData.value.bringTel)) {
            uni.showToast({ title: '请输入正确的带访人电话', icon: 'none' })
            return
        }
    }

    isSubmitting.value = true

    // 提交数据
    const submitData = {
        visitType: visitType.value, // 来访类型
        custName: formData.value.custName, // 客户姓名
        custTel: formData.value.custTel, // 客户电话
        custTel2: formData.value.custTel2, // 客户电话
        visitNum: formData.value.visitNum, // 到访人数
        visitTypeId: formData.value.visitTypeId, // 到访方式ID
        reportId: formData.value.reportId, // 报备ID
        reportComArea: formData.value.reportComArea, // 报备公司门店
        bringMan: formData.value.bringMan, // 带访人
        bringTel: formData.value.bringTel, // 带访电话
        visitTime: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 到访时间
        visitProjId: formData.value.visitProjId, // 项目ID
        knowWayId: formData.value.knowWayId, // 知晓途径ID
    }
    uni.showLoading({ title: '提交中...' })
    try {
        const res = await visitorRegisterApi.addVisitRec(submitData)
        uni.hideLoading()
        if (res.code === 200) {
            uni.showToast({
                title: '登记成功',
                icon: 'success'
            })
            // 存储到本地
            const storageData = {
                ...formData.value,
                visitTime: submitData.visitTime, // 到访时间
                visitType: visitType.value, // 来访类型
            }
            uni.setStorageSync('registerSuccessData', storageData)
            // 携带记录ID跳转到登记成功页面
            uni.navigateTo({
                url: `/pages/register/success?id=${res.data}`
            })
        } else {
            uni.showToast({
                title: res.message || '登记失败',
                icon: 'none'
            })
        }
    } catch (error) {
        uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
        })
        uni.hideLoading()
    } finally {
        isSubmitting.value = false
    }
}

// 报备弹窗ref
const reportPopupRef = ref(null)

// 打开报备选择弹窗
const openReportPopup = () => {
    if (formData.value.visitProjId) {
        reportPopupRef.value.openPopup()
    } else {
        uni.showToast({
            title: '请先选择项目',
            icon: 'none'
        })
    }
}

// 处理报备选择
const onReportSelected = (reportData) => {
    console.log('选中的报备数据:', reportData)
    if (!reportData) {
        return
    }
    // 回填报备信息到表单
    formData.value.reportId = reportData.id
    formData.value.reportCom = reportData.reportCom
    formData.value.reporter = reportData.reportMan
    formData.value.reportTime = reportData.reportTime
    // 回填客户信息
    formData.value.custName = reportData.custName
    formData.value.custTel = reportData.custTel
    if (reportData.custTel2) {
        formData.value.custTel2 = reportData.custTel2
    }
}

// 知晓途径数据
const fetchGetKnowWay = async () => {
    try {
        const res = await visitorRegisterApi.getKnowWay()
        if (res.code === 200) {
            const data = res.data || []
            const [firstData, ...restData] = data
            const { optionStr, valueStr } = firstData || {}
            channelList.value = transformData(optionStr, valueStr)
        } else {
            uni.showToast({
                title: '获取知晓途径失败',
                icon: 'none'
            })
        }
    } catch (error) {
        channelList.value = []
        uni.showToast({
            title: '网络错误',
            icon: 'none'
        })
    }
}

// 到访方式数据
const fetchGetVisitType = async () => {
    try {
        const res = await visitorRegisterApi.getVisitType()
        if (res.code === 200) {
            const data = res.data || []
            const [firstData, ...restData] = data
            const { optionStr, valueStr } = firstData || {}
            visitMethodList.value = transformData(optionStr, valueStr)
        } else {
            uni.showToast({
                title: '获取到访方式失败',
                icon: 'none'
            })
        }
    } catch (error) {
        visitMethodList.value = []
        uni.showToast({
            title: '网络错误',
            icon: 'none'
        })
    }
}

// 项目数据
const fetchGetProjList = async () => {
    try {
        const res = await visitorRegisterApi.getProjList({ isAll: false })
        if (res.code === 200) {
            const data = res.data || []
            const newData = data.map((item) => {
                return {
                    ...item,
                    id: item.projId,
                    name: item.projName
                }
            })
            projectList.value = newData
            // 默认选上第一个项目
            if (newData.length > 0) {
                formData.value.visitProjId = newData[0].id
                formData.value.visitProjName = newData[0].name
            }
        } else {
            uni.showToast({
                title: '获取项目列表失败',
                icon: 'none'
            })
        }
    } catch (error) {
        projectList.value = []
        uni.showToast({
            title: '网络错误',
            icon: 'none'
        })
    }
}

const initFetchData = async () => {
    await Promise.all([fetchGetKnowWay(), fetchGetVisitType(), fetchGetProjList()])
}

onShow(() => {
    // initFetchData()
})

onHide(() => {
    // visitType.value = 'channel'
    // resetForm()
    // reportPopupRef.value?.closePopup()
})

onMounted(() => {
    console.log(123)
    initFetchData()
})
</script>

<style scoped lang="scss">
page {
    height: 100%;
    background-color: #f5f5f5;
}

.register-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
    overflow: hidden;
}

/* 顶部Tab样式 */
.visit-type-tab {
    display: flex;
    background-color: #fff;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;
    flex-shrink: 0;
    z-index: 10;
}

.tab-item {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    color: #666;
    position: relative;
}

.tab-item.active {
    color: #007AFF;
    font-weight: 500;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: -20rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 60rpx;
    height: 4rpx;
    background-color: #007AFF;
    border-radius: 2rpx;
}

/* 滚动区域 */
.form-scroll {
    flex: 1;
    overflow-y: auto;
}

/* 表单容器 */
.form-container {
    padding: 20rpx 30rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

/* 表单卡片 */
.form-card {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;

    .form-item:not(:last-child) {
        border-bottom: 1rpx solid #eee;
    }
}

/* 表单项 */
.form-item {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    // padding: 16rpx 0;
    height: 80rpx;
}

.label {
    display: block;
    font-size: 30rpx;
    color: #333;
    padding-left: 6rpx;
    box-sizing: border-box;
    position: relative;
    flex-shrink: 0;
}

.label.required::before {
    content: '*';
    color: #ff4444;
    // margin-right: 4rpx;
    position: absolute;
    left: -10rpx;
    top: 50%;
    transform: translateY(-50%);
}

/* 输入框 */
.input {
    flex: 1;
    font-size: 30rpx;
    color: #999;
    display: flex;
    justify-content: flex-end;
    text-align: right;

    .input-placeholder {
        color: #999;
    }
}

/* 数字输入框 */
.number-input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 200rpx;
}

.number-btn {
    width: 60rpx;
    height: 60rpx;
    background-color: #f5f5f5;
    border-radius: 10rpx 10rpx;
    display: flex;
    justify-content: center;
    font-size: 40rpx;
    color: #999;
    font-weight: 600;
}

.number-value {
    width: 80rpx;
    text-align: center;
    font-size: 32rpx;
    color: #999;
}

/* 选择器 */
.report-picker {
    font-size: 30rpx;
    color: #999;
    position: relative;
    box-sizing: border-box;
}

.picker {
    font-size: 28rpx;
    color: #999;
    position: relative;
    padding-right: 20rpx;
    box-sizing: border-box;
}

.picker::after {
    content: '>';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

/* 单选组 */
.radio-group {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
}


.radio-item {
    width: 200rpx;
    height: 54rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    font-size: 26rpx;
    color: #999999;
    // padding: 6rpx 36rpx;
    border: 1rpx solid #dfdede;
    border-radius: 10rpx;
}

.radio-item.active {
    color: #007AFF;
    border-color: #007AFF;
}

/* 快速报备按钮样式 */
.form-report {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    padding: 16rpx 0;
}

.quick-report-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 8rpx 80rpx 10rpx;
    background: linear-gradient(135deg, #007AFF, #0056b3);
    border-radius: 28rpx;
    transition: all 0.3s ease;
}

.btn-text {
    font-size: 26rpx;
    color: #fff;
}

.btn-arrow {
    font-size: 32rpx;
    color: #fff;
}

// 底部按钮
.bottom-btn {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    background-color: transparent;
}

.confirm-btn {
    width: 70%;
    height: 80rpx;
    background: linear-gradient(135deg, #007AFF, #0056b3);
    color: #fff;
    font-size: 30rpx;
    font-weight: 500;
    border-radius: 44rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
    transition: all 0.3s ease;

    &::after {
        border: none;
    }

    &:active {
        transform: scale(0.98);
        opacity: 0.9;
    }
}

.confirm-btn[disabled] {
    background: #e0e0e0;
    color: #999;
    box-shadow: none;
    transform: none;

    &:active {
        transform: none;
    }
}
</style>