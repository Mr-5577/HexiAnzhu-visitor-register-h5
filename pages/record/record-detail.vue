<template>
    <view class="detail-container">
        <view class="detail-card">
            <!-- 标题 -->
            <view class="title-section">
                <text class="main-title">成都和喜·域峰到访确认单</text>
                <text class="sub-title">Visit Confirmation Form</text>
            </view>

            <!-- 甲方信息 -->
            <view class="info-section">
                <view class="section-title">甲方信息</view>
                <view class="info-row">
                    <text class="label">甲方：</text>
                    <text class="value">成都和安瑞成房地产开发有限公司</text>
                </view>
                <view class="info-row">
                    <text class="label">联系地址：</text>
                    <text class="value">成都市成华区建设路三段88号</text>
                </view>
            </view>

            <!-- 乙方信息 -->
            <view class="info-section">
                <view class="section-title">乙方信息</view>
                <view class="info-row">
                    <text class="label">乙方：</text>
                    <text class="value">{{ detailData.channelCompany || '*****渠道公司' }}</text>
                </view>
            </view>

            <!-- 来访信息 -->
            <view class="info-section">
                <view class="section-title">来访信息</view>
                <view class="info-row">
                    <text class="label">来访时间：</text>
                    <text class="value">{{ detailData.visitTime }}</text>
                </view>
                <view class="info-row">
                    <text class="label">到访人数：</text>
                    <text class="value">{{ detailData.visitorCount || '4' }}人</text>
                </view>
                <view class="info-row">
                    <text class="label">来访方式：</text>
                    <text class="value">{{ detailData.visitMethod || '自驾' }}</text>
                </view>
                <view class="info-row">
                    <text class="label">来访类型：</text>
                    <text class="value">{{ detailData.visitType || '自然来访' }}</text>
                </view>
            </view>

            <!-- 客户信息 -->
            <view class="info-section">
                <view class="section-title">客户信息</view>
                <view class="info-row">
                    <text class="label">客户名：</text>
                    <text class="value">{{ detailData.customerName }}</text>
                </view>
                <view class="info-row">
                    <text class="label">客户电话：</text>
                    <view class="value phone-list">
                        <text v-for="(phone, index) in customerPhones" :key="index" class="phone-item">
                            {{ phone }}
                        </text>
                    </view>
                </view>
                <view class="info-row" v-if="detailData.relation">
                    <text class="label">客户关系：</text>
                    <text class="value">{{ detailData.relation }}</text>
                </view>
                <view class="info-row" v-if="detailData.channel">
                    <text class="label">客户渠道：</text>
                    <text class="value">{{ detailData.channel }}</text>
                </view>
            </view>

            <!-- 带访人信息 -->
            <view class="info-section">
                <view class="section-title">带访人信息</view>
                <view class="info-row">
                    <text class="label">带访人：</text>
                    <text class="value">{{ detailData.consultantName || '未分配' }}</text>
                </view>
                <view class="info-row">
                    <text class="label">带访人电话：</text>
                    <text class="value">{{ detailData.consultantPhone || '158****0000' }}</text>
                </view>
            </view>

            <!-- 底部按钮 -->
            <view class="button-group">
                <!-- <button class="back-btn" @click="goBack">返回</button> -->
                <button class="print-btn" @click="handlePrint">打印确认单</button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 详情数据
const detailData = ref({
    id: null,
    customerName: '',
    customerPhone: '',
    consultantName: '',
    consultantPhone: '',
    visitTime: '',
    visitMethod: '',
    visitType: '',
    relation: '',
    channel: '',
    visitorCount: 4,
    channelCompany: ''
})

// 客户电话列表（支持多个电话）
const customerPhones = computed(() => {
    if (!detailData.value.customerPhone) return []
    // 如果电话包含多个，用换行或空格分割
    if (detailData.value.customerPhone.includes('\n')) {
        return detailData.value.customerPhone.split('\n')
    }
    if (detailData.value.customerPhone.includes(' ')) {
        return detailData.value.customerPhone.split(' ')
    }
    return [detailData.value.customerPhone]
})

// 当前日期
const currentDate = ref('')

// 获取详情数据
const getDetailData = () => {
    // 从路由参数获取ID
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.$page?.options || {}
    const id = options.id

    if (!id) {
        uni.showToast({
            title: '参数错误',
            icon: 'none'
        })
        return
    }

    const mockData = {
        1: {
            id: 1,
            customerName: '张三',
            customerPhone: '138****0000\n158****0001',
            consultantName: 'AAAAA-小王',
            consultantPhone: '139****8888',
            visitTime: '2024-01-15 14:30',
            visitMethod: '自驾',
            visitType: '自然来访',
            relation: '客户',
            channel: '门店',
            visitorCount: 4,
            channelCompany: '成都兴和渠道公司'
        },
        2: {
            id: 2,
            customerName: '李四',
            customerPhone: '139****1111',
            consultantName: 'BBBBB-小李',
            consultantPhone: '137****6666',
            visitTime: '2024-01-15 10:15',
            visitMethod: '步行',
            visitType: '渠道来访',
            relation: '朋友',
            channel: '介绍',
            visitorCount: 2,
            channelCompany: '成都众信渠道公司'
        },
        3: {
            id: 3,
            customerName: '王五',
            customerPhone: '137****2222',
            consultantName: '',
            consultantPhone: '',
            visitTime: '2024-01-14 16:45',
            visitMethod: '打车',
            visitType: '自然来访',
            relation: '客户',
            channel: '电约',
            visitorCount: 3,
            channelCompany: ''
        }
    }

    detailData.value = mockData[id] || {
        id: parseInt(id),
        customerName: '张三',
        customerPhone: '158****0000\n158****0001',
        consultantName: '渠道人2',
        consultantPhone: '158****0000',
        visitTime: '2026-03-25 18:00',
        visitMethod: '自驾',
        visitType: '自然来访',
        relation: '客户',
        channel: '门店',
        visitorCount: 4,
        channelCompany: '*****渠道公司'
    }
}

// 返回上一页
const goBack = () => {
    uni.navigateBack()
}

// 打印确认单
const handlePrint = () => {
    // 打印功能实现
    uni.showModal({
        title: '提示',
        content: '确认打印到访确认单？',
        success: (res) => {
            if (res.confirm) {
                // 调用打印接口或生成PDF
                uni.showToast({
                    title: '打印功能开发中',
                    icon: 'none'
                })
            }
        }
    })
}

// 设置当前日期
const setCurrentDate = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    currentDate.value = `${year}-${month}-${day}`
}

onMounted(() => {
    getDetailData()
    setCurrentDate()
})
</script>

<style scoped lang="scss">
page {
    background-color: #f5f5f5;
    padding: 20rpx;
}

.detail-container {
    min-height: 100vh;
}

.detail-card {
    background-color: #fff;
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

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

        .back-btn,
        .print-btn {
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

        .print-btn {
            background: linear-gradient(135deg, #007AFF, #0056b3);
            color: #fff;
        }
    }
}
</style>