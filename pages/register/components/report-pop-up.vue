<template>
    <uni-popup class="popup-dialog" ref="popupRef" type="bottom" background-color="#fff" border-radius="10px 10px 0 0"
        :is-mask-click="false" :style="{ zIndex: 999 }">
        <view class="popup-contain">
            <view class="popup-top">
                <text class="popup-title">报备记录</text>
                <uni-icons type="closeempty" size="18" color="#666" class="close-btn" @click="closePopup"></uni-icons>
            </view>

            <!-- 查询表单 -->
            <view class="search-form">
                <view class="search-row">
                    <view class="search-item">
                        <input class="search-input" v-model="searchForm.custName" placeholder="客户姓名" />
                    </view>

                    <view class="search-item">
                        <input class="search-input" v-model="searchForm.custTel" placeholder="客户电话" />
                    </view>
                </view>

                <view class="search-row">
                    <view class="search-item">
                        <picker style="z-index: 9999;width: 100%;" mode="date" :value="searchForm.reportTime"
                            @change="onReportTimeSearchChange">
                            <view class="search-picker">
                                {{ searchForm.reportTime || '报备时间' }}
                            </view>
                        </picker>
                    </view>

                    <view class="search-item search-buttons">
                        <button class="reset-btn" @click="resetSearch">重置</button>
                        <button class="search-btn" @click="handleSearch">查询</button>
                    </view>
                </view>
            </view>

            <scroll-view class="popup-content" scroll-y>
                <!-- 报备列表 -->
                <view class="report-list" v-if="reportList.length > 0">
                    <view v-for="(item, index) in reportList" :key="index" class="report-item"
                        :class="{ 'report-item-active': selectedReportId === item.id }" @click="selectReport(item)">
                        <view class="report-detail">
                            <view class="select-icon">
                                <uni-icons :type="selectedReportId === item.id ? 'checkmarkempty' : 'circle'" size="20"
                                    :color="selectedReportId === item.id ? '#007AFF' : '#ccc'" />
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">渠道公司：</text>
                                <text class="detail-value">{{ item.reportCom }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">报备人：</text>
                                <text class="detail-value">{{ item.reportMan }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">客户姓名：</text>
                                <text class="detail-value">{{ item.custName }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">客户电话：</text>
                                <text class="detail-value">{{ item.custTel }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">报备时间：</text>
                                <text class="detail-value">{{ item.reportTime }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view v-else class="empty-state">
                    <text class="empty-text">暂无报备信息</text>
                </view>
            </scroll-view>

            <view class="popup-bottom" v-if="reportList.length > 0">
                <button class="submit-btn" :disabled="!selectedReportData" @click="confirmSelection">
                    确定选择
                </button>
            </view>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref } from 'vue'
import { visitorRegisterApi } from '@/common/api.js'

const props = defineProps({
    projectId: {
        type: [String, Number],
    }
})

// 定义事件
const emit = defineEmits(['reportSelected'])

// 弹窗引用
const popupRef = ref(null)

// 查询表单
const searchForm = ref({
    custTel: '',
    custName: '',
    reportTime: ''
})

// 列表数据
const reportList = ref([])

// 选中的报备信息ID
const selectedReportId = ref(null)
const selectedReportData = ref(null)

// 报备时间搜索选择
const onReportTimeSearchChange = (e) => {
    searchForm.value.reportTime = e.detail.value
}

// 重置查询
const resetSearch = () => {
    searchForm.value = {
        custTel: '',
        custName: '',
        reportTime: ''
    }
    handleSearch()
}

// 查询
const handleSearch = () => {
    // 清空选中状态
    selectedReportId.value = null
    selectedReportData.value = null
    fetchReportList()
}

const fetchReportList = () => {
    reportList.value = []
    const params = {
        projId: props.projectId,
        custTel: searchForm.value.custTel,
        custName: searchForm.value.custName,
        reportTimeStart: searchForm.value.reportTime ? `${searchForm.value.reportTime} 00:00:00` : '',
        reportTimeEnd: searchForm.value.reportTime ? `${searchForm.value.reportTime} 23:59:59` : ''
    }
    visitorRegisterApi.getReportHis(params).then((res) => {
        if (res.code === 200) {
            reportList.value = res.data || []
        }
    }).catch((err) => {
        uni.showToast({
            title: '查询失败，请稍后重试',
            icon: 'none'
        })
    })
}

// 选择报备信息
const selectReport = (item) => {
    if (selectedReportId.value === item.id) {
        // 如果已选中，则取消选中
        selectedReportId.value = null
        selectedReportData.value = null
    } else {
        // 否则选中当前项
        selectedReportId.value = item.id
        selectedReportData.value = item
    }
}

// 确认选择
const confirmSelection = () => {
    if (!selectedReportData.value) {
        uni.showToast({
            title: '请选择报备信息',
            icon: 'none'
        })
        return
    }
    // 关闭弹窗
    closePopup()
    // 触发父组件事件，传递选中的数据
    emit('reportSelected', selectedReportData.value)
}

// 打开弹窗
const openPopup = () => {
    // 重置查询条件
    resetSearch()
    popupRef.value.open()
}

// 关闭弹窗
const closePopup = () => {
    popupRef.value.close()
}

// 暴露方法给父组件
defineExpose({
    openPopup,
    closePopup
})
</script>

<style lang="scss" scoped>
.popup-dialog {
    .popup-contain {
        width: 100%;
        height: 85vh;
        display: flex;
        flex-direction: column;
        background-color: #fff;
        border-radius: 20rpx 20rpx 0 0;
    }

    .popup-top {
        width: 100%;
        height: 70rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        border-bottom: 1rpx solid #f0f0f0;
        flex-shrink: 0;

        .popup-title {
            color: #333;
            font-size: 32rpx;
            font-weight: 600;
        }

        .close-btn {
            position: absolute;
            top: 50%;
            right: 30rpx;
            transform: translateY(-50%);
            padding: 10rpx;
        }
    }

    /* 查询表单样式 */
    .search-form {
        padding: 20rpx 30rpx;
        background-color: #f8f8f8;
        border-bottom: 1rpx solid #f0f0f0;
        flex-shrink: 0;
        width: 100%;

        .search-row {
            display: flex;
            margin-bottom: 20rpx;
            width: 100%;
            align-items: center;
            flex-wrap: nowrap;

            &:last-child {
                margin-bottom: 0;
            }
        }

        .search-item {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 16rpx;
            width: 50%;
            margin-right: 20rpx;
            &:last-child {
                margin-right: 0;
            }
            &.flex-1 {
                flex: 1;
            }

            .search-picker {
                flex: 1;
                height: 60rpx;
                line-height: 60rpx;
                background-color: #fff;
                border-radius: 8rpx;
                padding: 0 20rpx;
                font-size: 26rpx;
                color: #999;
                border: 1rpx solid #e0e0e0;
                position: relative;
                width: 100%;

                &::after {
                    content: '>';
                    position: absolute;
                    right: 20rpx;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #ccc;
                    font-size: 24rpx;
                }
            }

            .search-input {
                flex: 1;
                height: 60rpx;
                background-color: #fff;
                border-radius: 8rpx;
                padding: 0 20rpx;
                font-size: 26rpx;
                color: #999;
                border: 1rpx solid #e0e0e0;

                .input-placeholder {
                    color: #999;
                }
            }
        }

        .search-buttons {
            display: flex;
            .reset-btn,
            .search-btn {
                width: 120rpx;
                height: 60rpx;
                line-height: 60rpx;
                font-size: 26rpx;
                border-radius: 8rpx;
                border: none;
                padding: 0;
                margin: 0;

                &::after {
                    border: none;
                }
            }

            .reset-btn {
                background-color: #fff;
                color: #666;
                border: 1rpx solid #e0e0e0;
                margin-right: 20rpx;
            }

            .search-btn {
                background: linear-gradient(135deg, #007AFF, #0056b3);
                color: #fff;
            }
        }
    }

    .popup-content {
        flex: 1;
        overflow-y: auto;
        padding: 20rpx 30rpx;
        box-sizing: border-box;
    }

    /* 报备列表样式 */
    .report-list {
        display: flex;
        flex-direction: column;
    }

    .report-item {
        background: #fff;
        border-radius: 16rpx;
        padding: 12rpx 24rpx;
        border: 2rpx solid #f0f0f0;
        transition: all 0.3s ease;
        margin-bottom: 20rpx;
        &.report-item-active {
            border-color: #007AFF;
            background-color: #f0f8ff;
            box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.1);
        }
    }

    .report-detail {
        position: relative;

        .select-icon {
            flex-shrink: 0;
            position: absolute;
            top: 0;
            right: -10rpx;
        }

        .detail-row {
            display: flex;
            margin-bottom: 6rpx;
            font-size: 26rpx;
            padding-right: 20rpx;
            box-sizing: border-box;

            &:last-child {
                margin-bottom: 0;
            }

            .detail-label {
                color: #999;
                width: 140rpx;
                flex-shrink: 0;
            }

            .detail-value {
                color: #333;
                flex: 1;
            }
        }
    }

    /* 空状态样式 */
    .empty-state {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 100rpx 0;

        .empty-text {
            font-size: 28rpx;
            color: #999;
        }
    }

    .popup-bottom {
        width: 100%;
        padding: 20rpx 30rpx;
        padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
        box-sizing: border-box;
        border-top: 1rpx solid #f0f0f0;
        flex-shrink: 0;

        .submit-btn {
            width: 60%;
            height: 66rpx;
            background: linear-gradient(135deg, #007AFF, #0056b3);
            color: #fff;
            font-size: 28rpx;
            font-weight: 500;
            border-radius: 44rpx;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;

            &::after {
                border: none;
            }

            &:active {
                opacity: 0.9;
                transform: scale(0.98);
            }
        }

        .submit-btn[disabled] {
            background: #e0e0e0;
            color: #999;
            box-shadow: none;
            transform: none;

            &:active {
                transform: none;
            }
        }
    }
}
</style>