<template>
    <view class="register-container">
        <!-- 顶部切换Tab -->
        <view class="visit-type-tab">
            <view class="tab-item" :class="{ active: visitType === 'natural' }" @click="visitType = 'natural'">
                自然来访
            </view>
            <view class="tab-item" :class="{ active: visitType === 'channel' }" @click="visitType = 'channel'">
                渠道来访
            </view>
        </view>

        <!-- 表单内容 -->
        <scroll-view class="form-scroll" scroll-y>
            <view class="form-container">
                <view class="form-card">
                    <!-- 客户姓名 -->
                    <view class="form-item">
                        <text class="label required">客户姓名</text>
                        <input class="input" v-model="formData.customerName" placeholder="请输入客户姓名" maxlength="20" />
                    </view>

                    <!-- 客户电话 -->
                    <view class="form-item">
                        <text class="label required">客户电话</text>
                        <input class="input" v-model="formData.customerPhone" type="number" placeholder="请输入客户电话"
                            maxlength="11" />
                    </view>
                    <view class="form-item">
                        <text class="label required">备用电话</text>
                        <input class="input" v-model="formData.customerPhone" type="number" placeholder="请输入客户电话"
                            maxlength="11" />
                    </view>

                    <!-- 到访人数 -->
                    <view class="form-item ">
                        <text class="label required">到访人数</text>
                        <view class="number-input">
                            <view class="number-btn" @click="decreasePeople">-</view>
                            <input class="number-value" v-model="formData.visitorCount" type="number" disabled />
                            <view class="number-btn" @click="increasePeople">+</view>
                        </view>
                    </view>
                </view>
                <view class="form-card">
                    <!-- 到访方式 -->
                    <view class="form-item">
                        <text class="label required">到访方式</text>
                        <picker mode="selector" :range="visitMethodList" @change="onVisitMethodChange">
                            <view class="picker">
                                {{ formData.visitMethod || '请选择到访方式' }}
                            </view>
                        </picker>
                    </view>

                    <!-- 根据到访方式显示不同字段 -->
                    <template v-if="formData.visitMethod === '打车'">
                        <view class="form-item">
                            <text class="label required">带访人</text>
                            <input class="input" v-model="formData.referrer" placeholder="请输入带访人姓名" />
                        </view>

                        <view class="form-item">
                            <text class="label required">带访电话</text>
                            <input class="input" v-model="formData.referrerPhone" type="number"
                                placeholder="请输入带访人电话" />
                        </view>

                        <view class="form-item">
                            <text class="label required">报备人</text>
                            <input class="input" v-model="formData.reporter" placeholder="请输入报备人姓名" />
                        </view>

                        <view class="form-item">
                            <text class="label required">报备时间</text>
                            <picker mode="date" :value="formData.reportTime" @change="onReportTimeChange">
                                <view class="picker">
                                    {{ formData.reportTime || '请选择报备时间' }}
                                </view>
                            </picker>
                        </view>
                    </template>

                    <!-- 到访时间 -->
                    <view class="form-item">
                        <text class="label required">到访时间</text>
                        <picker mode="date" :value="formData.visitTime" @change="onVisitTimeChange">
                            <view class="picker">
                                {{ formData.visitTime || '请选择到访时间' }}
                            </view>
                        </picker>
                    </view>

                    <!-- 渠道来访才显示 人员关系和来访途径 -->
                    <template v-if="visitType === 'channel'">
                        <!-- 人员关系 -->
                        <view class="form-item flex-column">
                            <text class="label required">人员关系</text>
                            <view class="radio-group">
                                <label v-for="item in relationList" :key="item.value" class="radio-item"
                                    :class="{ active: formData.relation === item.value }"
                                    @click="formData.relation = item.value">
                                    <text>{{ item.label }}</text>
                                </label>
                            </view>
                        </view>
    
                        <!-- 来访途径 -->
                        <view class="form-item flex-column">
                            <text class="label required">来访途径</text>
                            <view class="radio-group grid-2">
                                <label v-for="item in channelList" :key="item.value" class="radio-item"
                                    :class="{ active: formData.channel === item.value }"
                                    @click="formData.channel = item.value">
                                    <text>{{ item.label }}</text>
                                </label>
                            </view>
                        </view>
                    </template>

                    <!-- 售楼部 -->
                    <view class="form-item">
                        <text class="label required">售楼部</text>
                        <picker mode="selector" :range="salesOfficeList" @change="onSalesOfficeChange">
                            <view class="picker">
                                {{ formData.salesOffice || '请选择售楼部' }}
                            </view>
                        </picker>
                    </view>
                </view>
            </view>
            <!-- 底部确认按钮 -->
            <view class="bottom-btn">
                <button class="confirm-btn" :disabled="!isFormValid" @click="handleSubmit">
                    确认登记
                </button>
            </view>
        </scroll-view>
        <!-- 报备弹窗 -->
        <ReportPopup ref="reportPopupRef" />
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import ReportPopup from './components/report-pop-up.vue'
// 来访类型
const visitType = ref('channel') // natural: 自然来访, channel: 渠道来访

// 表单数据
const formData = ref({
    customerName: '',
    customerPhone: '',
    visitorCount: 1,
    visitMethod: '',
    referrer: '',      // 带访人
    referrerPhone: '', // 带访电话
    reporter: '',      // 报备人
    reportTime: '',    // 报备时间
    visitTime: '',
    relation: '',
    channel: '',
    salesOffice: ''
})

// 选项数据
const visitMethodList = ['自驾', '步行', '打车', '公交', '地铁']
const relationList = [
    { label: '客户', value: 'customer' },
    { label: '亲戚', value: 'relative' },
    { label: '朋友', value: 'friend' }
]
const channelList = [
    { label: '门店', value: 'store' },
    { label: '电约', value: 'phone' },
    { label: '介绍', value: 'referral' },
    { label: '拓展', value: 'develop' }
]
const salesOfficeList = ['和喜安筑售楼部', '和喜·御景台', '和喜·公园里', '和喜·翡翠湾']

// 表单验证
const isFormValid = computed(() => {
    const baseValid =
        formData.value.customerName &&
        formData.value.customerPhone &&
        formData.value.visitorCount > 0 &&
        formData.value.visitMethod &&
        formData.value.visitTime &&
        formData.value.relation &&
        formData.value.channel &&
        formData.value.salesOffice

    if (visitType.value === 'channel') {
        return baseValid &&
            formData.value.referrer &&
            formData.value.referrerPhone &&
            formData.value.reporter &&
            formData.value.reportTime
    }

    return baseValid
})

// 增加人数
const increasePeople = () => {
    openReportPopup()
    if (formData.value.visitorCount < 20) {
        formData.value.visitorCount++
    }
}

// 减少人数
const decreasePeople = () => {
    if (formData.value.visitorCount > 1) {
        formData.value.visitorCount--
    }
}

// 到访方式选择
const onVisitMethodChange = (e) => {
    formData.value.visitMethod = visitMethodList[e.detail.value]
}

// 报备时间选择
const onReportTimeChange = (e) => {
    formData.value.reportTime = e.detail.value
}

// 到访时间选择
const onVisitTimeChange = (e) => {
    formData.value.visitTime = e.detail.value
}

// 售楼部选择
const onSalesOfficeChange = (e) => {
    formData.value.salesOffice = salesOfficeList[e.detail.value]
}

// 提交表单
const handleSubmit = () => {
    if (!isFormValid.value) {
        uni.showToast({
            title: '请填写完整信息',
            icon: 'none'
        })
        return
    }

    // 准备提交数据
    const submitData = {
        ...formData.value,
        visitType: visitType.value
    }

    console.log('提交数据:', submitData)

    // 这里调用你的 API
    uni.showLoading({ title: '提交中...' })

    // 模拟提交
    setTimeout(() => {
        uni.hideLoading()
        uni.showToast({
            title: '登记成功',
            icon: 'success'
        })
        // 重置表单或跳转
        // resetForm()
    }, 1000)
}

const reportPopupRef = ref(null)
// 打开报备选择弹窗
const openReportPopup = () => {
    reportPopupRef.value.openPopup()
}
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
    gap: 20rpx;
}

/* 表单卡片 */
.form-card {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;

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
    padding: 16rpx 0;
}

.flex-column {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;

    .label {
        margin-bottom: 12rpx;
    }
}

.label {
    display: block;
    font-size: 28rpx;
    color: #333;
}

.label.required::before {
    content: '*';
    color: #ff4444;
    margin-right: 4rpx;
}

/* 输入框 */
.input {
    flex: 1;
    font-size: 28rpx;
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
.picker {
    font-size: 28rpx;
    color: #999;
    // padding: 16rpx 0;
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
    color: #ccc;
}

/* 单选组 */
.radio-group {
    display: flex;
    gap: 16rpx;
}


.radio-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 26rpx;
    color: #999999;
    padding: 6rpx 36rpx;
    border: 1rpx solid #dfdede;
    border-radius: 10rpx;
}

.radio-item.active {
    color: #007AFF;
    border-color: #007AFF;
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