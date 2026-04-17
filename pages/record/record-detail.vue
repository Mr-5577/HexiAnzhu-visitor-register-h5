<template>
    <view class="detail-container">
        <view class="detail-card">
            <!-- 标题 -->
            <view class="title-section">
                <text class="main-title">{{ detailData.projectName || '-' }}</text>
                <text class="sub-title">Visit Confirmation Form</text>
            </view>
            <!-- 来访信息 -->
            <view class="info-section">
                <view class="section-title">基本信息</view>
                <view class="info-row">
                    <text class="label">到访方式：</text>
                    <text class="value">{{ detailData.visitTypeName || '-' }}</text>
                </view>
                <view class="info-row">
                    <text class="label">来访时间：</text>
                    <text class="value">{{ detailData.visitTime || '-' }}</text>
                </view>
                <view class="info-row">
                    <text class="label">到访人数：</text>
                    <text class="value">{{ detailData.visitNum || '-' }}人</text>
                </view>
                <view class="info-row">
                    <text class="label">客户名：</text>
                    <text class="value">{{ detailData.custName || '-' }}</text>
                </view>
                <view class="info-row">
                    <text class="label">客户电话：</text>
                    <text class="value">{{ detailData.custTel || '-' }}</text>
                </view>
                <view class="info-row">
                    <text class="label">备用电话：</text>
                    <text class="value">{{ detailData.custTel2 || '-' }}</text>
                </view>
                <!-- 渠道来访显示 -->
                <template v-if="visitType === 'channel'">
                    <view class="info-row">
                        <text class="label">带访人：</text>
                        <text class="value">{{ detailData.bringMan || '-' }}</text>
                    </view>
                    <view class="info-row">
                        <text class="label">带访人电话：</text>
                        <text class="value">{{ detailData.bringTel || '-' }}</text>
                    </view>
                </template>
            </view>
            <!-- 甲方信息 -->
            <view class="info-section">
                <view class="section-title">甲方信息</view>
                <view class="info-row">
                    <text class="label">甲方：</text>
                    <text class="value">{{ detailData.visitComName || '-' }}</text>
                </view>
            </view>
            <!-- 乙方信息 -->
            <view class="info-section">
                <view class="section-title">乙方信息</view>
                <view class="info-row">
                    <text class="label">乙方：</text>
                    <text class="value">{{ detailData.reportCom || '-' }}</text>
                </view>
            </view>
            <!-- 底部按钮 -->
            <view class="button-group">
                <button class="back-btn" @click="goBack">返 回</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref, computed, onMounted } from 'vue'
import { transformData } from '@/utils/common.js'
import { visitorRegisterApi } from '@/common/api.js'

// 自然来访,0自然到访、5电转访、8工程抵款、9棚改
const NATURAL_VISIT_IDS = ['0', '5', '8', '9']
// 渠道来访,1老带新,2内渠,3外渠分销,4自拓邀约,6内部员工及推荐,7全民营销
const CHANNEL_VISIT_IDS = ['1', '2', '3', '4', '6', '7']

// 详情数据
const detailData = ref({})

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

// 返回上一页
const goBack = () => {
    uni.navigateBack()
}
// 获取项目数据
const fetchGetProjList = async () => {
    try {
        const res = await visitorRegisterApi.getProjList({ isAll: false })
        if (res.code === 200) {
            const data = res.data || []
            const targetData = data.find(item => item.projId === detailData.value.visitProjId)
            if (targetData) {
                detailData.value.projectId = targetData.projId
                detailData.value.projectName = targetData.projName
            }
        }
    } catch (error) {
        projectList.value = []
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
            const visitMethodList = transformData(optionStr, valueStr)
            const targetData = visitMethodList.find(item => item.id == detailData.value.visitTypeId)
            if (targetData) {
                detailData.value.visitTypeName = targetData.name
            }
        }
    } catch (error) {
    }
}
const getDetailById = async (id) => {
    try {
        const res = await visitorRegisterApi.getVisitHis({ id: id })
        if (res.code === 200) {
            const data = res.data || []
            const [firastData] = data
            detailData.value = firastData || {}
        }
    } catch (error) {
    }
}
onLoad(async (options) => {
    if (options.id) {
        await getDetailById(options.id)
        await fetchGetProjList()
        await fetchGetVisitType()
    }
})
onMounted(() => { })
</script>

<style scoped lang="scss">
page {
    background-color: #f5f5f5;
    height: 100%;
}

.detail-container {
    width: 100%;
    height: 100%;
    padding: 20rpx;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.detail-card {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    box-sizing: border-box;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
    flex: 1;

    .title-section {
        text-align: center;
        margin-bottom: 40rpx;
        padding-bottom: 30rpx;
        border-bottom: 1rpx solid #e5e5e5;

        .main-title {
            display: block;
            font-size: 36rpx;
            font-weight: bold;
            color: #333;
            margin-bottom: 10rpx;
        }

        .sub-title {
            display: block;
            font-size: 24rpx;
            color: #999;
            letter-spacing: 2rpx;
        }
    }

    .info-section {
        margin-bottom: 40rpx;

        .section-title {
            font-size: 30rpx;
            font-weight: bold;
            color: #007AFF;
            margin-bottom: 10rpx;
            padding-left: 20rpx;
            position: relative;

            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 6rpx;
                height: 30rpx;
                background-color: #007AFF;
                border-radius: 3rpx;
            }
        }

        .info-row {
            display: flex;
            line-height: 1.5;

            .label {
                // width: 160rpx;
                font-size: 28rpx;
                color: #666;
                flex-shrink: 0;
            }

            .value {
                flex: 1;
                font-size: 28rpx;
                color: #333;

                &.phone-list {
                    .phone-item {
                        display: block;
                        margin-bottom: 8rpx;

                        &:last-child {
                            margin-bottom: 0;
                        }
                    }
                }
            }
        }
    }

    .button-group {
        display: flex;
        gap: 30rpx;
        margin-top: 60rpx;

        .back-btn {
            flex: 1;
            height: 80rpx;
            line-height: 80rpx;
            font-size: 28rpx;
            border-radius: 40rpx;
            border: none;

            &::after {
                border: none;
            }
        }

        .back-btn {
            background-color: #f5f5f5;
            color: #666;
        }
    }
}
</style>