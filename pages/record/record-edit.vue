<template>
    <view class="record-edit-page">
        <!-- 顶部切换Tab -->
        <view class="visit-type-tab">
            <view class="tab-item">
                {{ visitType === 'channel' ? '渠道来访' : '自然来访' }}
            </view>
        </view>
        <!-- 表单内容 -->
        <scroll-view class="form-scroll" scroll-y>
            <view class="form-card">
                <!-- 项目 -->
                <view class="form-item">
                    <text class="label required">项目</text>
                    <input class="input" v-model="detailData.visitProjName" disabled placeholder="项目名称" />
                </view>
                <!-- 客户姓名 -->
                <view class="form-item">
                    <text class="label required">客户姓名</text>
                    <input class="input" v-model="detailData.custName" placeholder="请输入客户姓名" maxlength="20" />
                </view>

                <!-- 客户电话 -->
                <view class="form-item">
                    <text class="label required">客户电话</text>
                    <input class="input" v-model="detailData.custTel" type="tel" placeholder="请输入客户电话" maxlength="11" />
                </view>
                <view class="form-item">
                    <text class="label">备用电话</text>
                    <input class="input" v-model="detailData.custTel2" type="tel" placeholder="请输入备用电话"
                        maxlength="11" />
                </view>

                <!-- 到访人数 -->
                <view class="form-item ">
                    <text class="label required">到访人数</text>
                    <view class="number-input">
                        <view class="number-btn" @click="decreasePeople">-</view>
                        <input class="number-value" v-model="detailData.visitNum" type="number" disabled />
                        <view class="number-btn" @click="increasePeople">+</view>
                    </view>
                </view>
            </view>
            <view class="form-card">
                <view class="form-item">
                    <text class="label required">到访方式</text>
                    <CustomPicker v-model="detailData.visitTypeId" :options="filteredVisitMethodList" label-key="name"
                        value-key="id" placeholder="请选择到访方式" @change="onVisitMethodChange" />
                </view>
                <view class="form-item">
                    <text class="label required">知晓途径</text>
                    <CustomPicker v-model="detailData.knowWayId" :options="channelList" label-key="name" value-key="id"
                        placeholder="请选择知晓途径" @change="onKnowWayChange" />
                </view>

                <!-- 根据到访方式显示不同字段 -->
                <template v-if="visitType === 'channel'">
                    <!-- <view class="form-item">
                        <text class="label">渠道公司</text>
                        <input class="input" v-model="detailData.reportCom" disabled placeholder="渠道公司" />
                    </view> -->

                    <view class="form-item">
                        <text class="label">渠道门店</text>
                        <input class="input" v-model="detailData.reportComArea" placeholder="请输入门店" />
                    </view>
                    <view class="form-item">
                        <text class="label required">带访人</text>
                        <input class="input" v-model="detailData.bringMan" placeholder="请输入带访人" />
                    </view>

                    <view class="form-item">
                        <text class="label required">带访人电话</text>
                        <input class="input" v-model="detailData.bringTel" type="tel" maxlength="11"
                            placeholder="请输入带访电话" />
                    </view>

                    <!-- <view class="form-item">
                        <text class="label">报备人</text>
                        <input class="input" v-model="detailData.reporter" disabled placeholder="报备人" />
                    </view> -->

                    <!-- <view class="form-item">
                        <text class="label">报备时间</text>
                        <picker mode="date" :value="detailData.reportTime" disabled @change="onReportTimeChange">
                            <view class="report-picker">
                                {{ detailData.reportTime || '报备时间' }}
                            </view>
                        </picker>
                    </view> -->
                </template>
            </view>
        </scroll-view>
        <!-- 底部确认按钮 -->
        <view class="bottom-btn">
            <button class="go-back" @click="handleBack">
                返回
            </button>
            <button class="confirm-btn" :disabled="isSubmitting" @click="handleSubmit">
                确认修改
            </button>
        </view>
    </view>
</template>

<script setup>
import dayjs from 'dayjs'
import { onShow, onHide, onLoad } from '@dcloudio/uni-app'
import { ref, computed, onMounted, watch } from 'vue'
import CustomPicker from '@/components/custom-picker/index.vue'
import { visitorRegisterApi } from '@/common/api.js'
import { transformData } from '@/utils/common.js'

// 自然来访,0自然到访、5电转访、8工程抵款、9棚改
const NATURAL_VISIT_IDS = ['0', '5', '8', '9']
// 渠道来访,1老带新,2内渠,3外渠分销,4自拓邀约,6内部员工及推荐,7全民营销
const CHANNEL_VISIT_IDS = ['1', '2', '3', '4', '6', '7']

// 表单数据
const detailData = ref({
    visitProjName: '', // 项目名称
    visitNum: 1, // 到访人数
    visitTypeId: '', // 到访方式id
    knowWayId: '', // 知晓途径id
})

// 来访方式列表
const visitMethodList = ref([])
// 来访途径列表
const channelList = ref([])
// 项目列表
const projectList = ref([])
// 提交锁
const isSubmitting = ref(false)

// 来访类型，natural: 自然来访, channel: 渠道来访
const visitType = computed(() => {
    const visitTypeId = detailData.value.visitTypeId
    if (visitTypeId === undefined || visitTypeId === null || visitTypeId === '') return 'natural'
    const strNum = visitTypeId.toString()
    if (CHANNEL_VISIT_IDS.includes(strNum)) {
        return 'channel'
    }
    return 'natural'
})

// 根据来访类型过滤到访方式选项
const filteredVisitMethodList = computed(() => {
    const filterIds = visitType.value === 'natural' ? NATURAL_VISIT_IDS : CHANNEL_VISIT_IDS
    return visitMethodList.value.filter(item => filterIds.includes(item.id))
})

// 增加人数
const increasePeople = () => {
    if (detailData.value.visitNum < 20) {
        detailData.value.visitNum++
    }
}
// 减少人数
const decreasePeople = () => {
    if (detailData.value.visitNum > 1) {
        detailData.value.visitNum--
    }
}

// 到访方式选择变化
const onVisitMethodChange = (value, selectedItem) => {
    detailData.value.visitTypeName = selectedItem.name
}

// 报备时间选择
const onReportTimeChange = (e) => {
    detailData.value.reportTime = e.detail.value
}

// 知晓途径选择变化
const onKnowWayChange = (value, selectedItem) => {
    detailData.value.knowWayName = selectedItem.name
}
const handleBack = () => {
    uni.navigateBack()
}
// 判断是否为脱敏电话
const isDesensitizedTel = (tel) => {
    if (!tel) return false
    // 匹配格式：1[3-9][0-9] + 4个* + 4位数字, 例如：138****1234
    const desensitizedPattern = /^1[3-9]\d\*{4}\d{4}$/
    return desensitizedPattern.test(tel)
}
// 提交表单
const handleSubmit = async () => {
    console.log('提交表单数据:', detailData.value)
    if (isSubmitting.value) {
        return
    }
    // 字段校验
    if (!detailData.value.custName) {
        uni.showToast({ title: '请输入客户姓名', icon: 'none' })
        return
    }
    // 客户电话校验：如果是脱敏电话则跳过校验，否则校验格式
    if (!isDesensitizedTel(detailData.value.custTel)) {
        if (!/^1[3-9]\d{9}$/.test(detailData.value.custTel)) {
            uni.showToast({ title: '请输入正确的客户电话', icon: 'none' })
            return
        }
    }
    // 备用电话校验：有值且不是脱敏电话时才校验格式
    if (detailData.value.custTel2 && !isDesensitizedTel(detailData.value.custTel2)) {
        if (!/^1[3-9]\d{9}$/.test(detailData.value.custTel2)) {
            uni.showToast({ title: '请输入正确的备用电话', icon: 'none' })
            return
        }
    }
    if (!detailData.value.visitTypeId) {
        uni.showToast({ title: '请选择到访方式', icon: 'none' })
        return
    }
    if (!detailData.value.knowWayId) {
        uni.showToast({ title: '请选择知晓途径', icon: 'none' })
        return
    }

    // 渠道来访额外校验
    if (visitType.value === 'channel') {
        if (!detailData.value.bringMan) {
            uni.showToast({ title: '请输入带访人', icon: 'none' })
            return
        }
        if (!/^1[3-9]\d{9}$/.test(detailData.value.bringTel)) {
            uni.showToast({ title: '请输入正确的带访人电话', icon: 'none' })
            return
        }
    }

    isSubmitting.value = true

    // 提交数据
    let submitData = {
        id: detailData.value.id,
        visitProjId: detailData.value.visitProjId, // 项目ID
        custName: detailData.value.custName, // 客户姓名
        custTel: detailData.value.custTel, // 客户电话
        custTel2: detailData.value.custTel2, // 客户电话
        visitNum: detailData.value.visitNum, // 到访人数
        visitTypeId: detailData.value.visitTypeId, // 到访方式ID
        knowWayId: detailData.value.knowWayId, // 知晓途径ID
        visitTime: detailData.value.visitTime, // 到访时间
    }
    if (visitType.value === 'channel') {
        submitData.reportComArea = detailData.value.reportComArea; // 报备公司门店
        submitData.bringMan = detailData.value.bringMan
        submitData.bringTel = detailData.value.bringTel
    }
    uni.showLoading({ title: '提交中...' })
    try {
        const res = await visitorRegisterApi.editVisitRec(submitData)
        uni.hideLoading()
        if (res.code === 200) {
            uni.showToast({
                title: '修改成功',
                icon: 'success'
            })
            setTimeout(() => {
                uni.$emit('refreshRecordList')
                uni.navigateBack()
            }, 1000)
        } else {
            uni.showToast({
                title: res.message || '修改失败',
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
            const targetData = visitMethodList.value.find(item => item.id == detailData.value.visitTypeId)
            if (targetData) {
                detailData.value.visitTypeName = targetData.name
            }
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
            projectList.value = newData || []
            const targetData = projectList.value.find(item => item.id == detailData.value.visitProjId)
            if (targetData) {
                detailData.value.visitProjName = targetData.name
            }
        }
    } catch (error) {
        projectList.value = []
    }
}

const initFetchData = async () => {
    await Promise.all([fetchGetKnowWay(), fetchGetVisitType(), fetchGetProjList()])
}
const getDetailById = async (id, projId) => {
    const params = {
        projId: projId,
        id: id,
    }
    try {
        const res = await visitorRegisterApi.getVisitHis(params)
        if (res.code === 200) {
            const data = res.data || []
            const [firastData] = data
            const info = firastData || null
            if (info) {
                detailData.value = {
                    ...detailData.value,
                    ...info,
                    visitNum: info.visitNum || 1,
                    knowWayId: info.knowWayId.toString() || '',
                    visitTypeId: info.visitTypeId.toString() || '',
                }
            }
        }
    } catch (error) {
    }
}
onLoad(async (options) => {
    console.log(options)
    const { id, projId } = options
    if (id && projId) {
        await getDetailById(id, projId)
        await initFetchData()
    }
})
onMounted(() => { })
</script>

<style scoped lang="scss">
page {
    height: 100%;
    background-color: #f5f5f5;
}

.record-edit-page {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
}

/* 顶部Tab样式 */
.visit-type-tab {
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;
    flex-shrink: 0;
}

.tab-item {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
    color: #007AFF;
    font-weight: 500;
    position: relative;
}

/* 滚动区域 */
.form-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 20rpx 20rpx;
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

// 底部按钮
.bottom-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20rpx 30rpx;
    box-sizing: border-box;
    background-color: transparent;
    flex-shrink: 0;
}

.go-back {
    width: 40%;
    height: 80rpx;
    background-color: #f5f5f5;
    color: #999;
    font-size: 30rpx;
    font-weight: 500;
    border-radius: 44rpx;
    border: 1rpx solid #e0e0e0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.confirm-btn {
    width: 40%;
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
}
</style>