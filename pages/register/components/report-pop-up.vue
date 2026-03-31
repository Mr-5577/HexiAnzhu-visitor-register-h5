<template>
    <uni-popup class="popup-dialog" ref="popupRef" type="bottom" background-color="#fff" border-radius="10px 10px 0 0"
        :is-mask-click="false" :style="{ zIndex: 999 }">
        <view class="popup-contain">
            <view class="popup-top">
                <text class="popup-title">选择报备信息</text>
                <uni-icons type="closeempty" size="18" class="close-btn" @click="closePopup"></uni-icons>
            </view>

            <!-- 查询表单 -->
            <view class="search-form">
                <view class="search-row">
                    <view class="search-item">
                        <picker style="z-index: 9999;width: 100%;" mode="selector" :range="reportTypeList"
                            @change="onReportTypeChange">
                            <view class="search-picker">
                                {{ searchForm.reportType || '报备方式' }}
                            </view>
                        </picker>
                    </view>

                    <view class="search-item">
                        <picker style="z-index: 9999;width: 100%;" mode="date" :value="searchForm.reportTime"
                            @change="onReportTimeSearchChange">
                            <view class="search-picker">
                                {{ searchForm.reportTime || '报备时间' }}
                            </view>
                        </picker>
                    </view>
                </view>

                <view class="search-row">
                    <view class="search-item">
                        <input class="search-input" v-model="searchForm.customerName" placeholder="客户姓名/报备号码" />
                    </view>

                    <view class="search-item search-buttons">
                        <button class="reset-btn" @click="resetSearch">重置</button>
                        <button class="search-btn" @click="handleSearch">查询</button>
                    </view>
                </view>
            </view>

            <scroll-view class="popup-content" scroll-y>
                <!-- 报备列表 -->
                <view class="report-list" v-if="filteredReportList.length > 0">
                    <view v-for="(item, index) in filteredReportList" :key="index" class="report-item"
                        :class="{ 'report-item-active': selectedReportId === item.id }" @click="selectReport(item)">
                        <view class="report-detail">
                            <view class="select-icon">
                                <uni-icons :type="selectedReportId === item.id ? 'checkmarkempty' : 'circle'" size="20"
                                    :color="selectedReportId === item.id ? '#007AFF' : '#ccc'" />
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">报备人：</text>
                                <text class="detail-value">{{ item.reporter }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">客户姓名：</text>
                                <text class="detail-value">{{ item.customerName }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">客户电话：</text>
                                <text class="detail-value">{{ item.customerPhone }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">报备时间：</text>
                                <text class="detail-value">{{ item.reportTime }}</text>
                            </view>
                            <view class="detail-row" v-if="item.reportType">
                                <text class="detail-label">报备方式：</text>
                                <text class="detail-value">{{ item.reportType }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view v-else class="empty-state">
                    <text class="empty-text">暂无报备信息</text>
                </view>
            </scroll-view>

            <view class="popup-bottom" v-if="filteredReportList.length > 0">
                <button class="submit-btn" :disabled="!selectedReportData" @click="confirmSelection">
                    确定选择
                </button>
            </view>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref, computed } from 'vue'

// 弹窗引用
const popupRef = ref(null)

// 报备方式列表
const reportTypeList = ref(['全部', '渠道报备', '自然来访', '老带新'])

// 查询表单
const searchForm = ref({
    reportType: '',
    reportTime: '',
    customerName: ''
})

// 原始报备列表数据
const originalReportList = ref([
    {
        id: 1,
        reporter: '张三',
        customerName: '李四',
        customerPhone: '138****0000',
        reportTime: '2024-01-15',
        reportType: '渠道报备'
    },
    {
        id: 2,
        reporter: '王五',
        customerName: '赵六',
        customerPhone: '139****1111',
        reportTime: '2024-01-14',
        reportType: '自然来访'
    },
    {
        id: 3,
        reporter: '陈七',
        customerName: '周八',
        customerPhone: '137****2222',
        reportTime: '2024-01-13',
        reportType: '老带新'
    },
    {
        id: 4,
        reporter: '李明',
        customerName: '王芳',
        customerPhone: '136****3333',
        reportTime: '2024-01-12',
        reportType: '渠道报备'
    },
    {
        id: 5,
        reporter: '赵雷',
        customerName: '孙丽',
        customerPhone: '135****4444',
        reportTime: '2024-01-11',
        reportType: '自然来访'
    }
])

// 筛选后的列表
const filteredReportList = ref([...originalReportList.value])

// 选中的报备信息ID
const selectedReportId = ref(null)
const selectedReportData = ref(null)

// 报备方式选择
const onReportTypeChange = (e) => {
    const index = e.detail.value
    searchForm.value.reportType = reportTypeList.value[index]
    if (searchForm.value.reportType === '全部') {
        searchForm.value.reportType = ''
    }
}

// 报备时间搜索选择
const onReportTimeSearchChange = (e) => {
    searchForm.value.reportTime = e.detail.value
}

// 重置查询
const resetSearch = () => {
    searchForm.value = {
        reportType: '',
        reportTime: '',
        customerName: ''
    }
    handleSearch()
}

// 查询
const handleSearch = () => {
    let filtered = [...originalReportList.value]

    // 按报备方式筛选
    if (searchForm.value.reportType) {
        filtered = filtered.filter(item => item.reportType === searchForm.value.reportType)
    }

    // 按报备时间筛选
    if (searchForm.value.reportTime) {
        filtered = filtered.filter(item => item.reportTime === searchForm.value.reportTime)
    }

    // 按客户姓名筛选（模糊匹配）
    if (searchForm.value.customerName) {
        filtered = filtered.filter(item =>
            item.customerName.includes(searchForm.value.customerName)
        )
    }

    filteredReportList.value = filtered

    // 清空选中状态
    selectedReportId.value = null
    selectedReportData.value = null

    if (filtered.length === 0) {
        uni.showToast({
            title: '暂无匹配数据',
            icon: 'none'
        })
    }
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
    console.log(12346)
    if (!selectedReportData.value) {
        uni.showToast({
            title: '请选择报备信息',
            icon: 'none'
        })
        return
    }

    // 返回选中的数据
    console.log('选中的报备信息:', selectedReportData.value)

    // 关闭弹窗
    closePopup()

    // 触发父组件事件，传递选中的数据
    uni.$emit('reportSelected', selectedReportData.value)

    uni.showToast({
        title: '选择成功',
        icon: 'success'
    })
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
        height: 80rpx;
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
            gap: 20rpx;
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

            &.flex-1 {
                flex: 1;
            }

            .search-picker {
                flex: 1;
                height: 64rpx;
                line-height: 64rpx;
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
                height: 64rpx;
                background-color: #fff;
                border-radius: 8rpx;
                padding: 0 20rpx;
                font-size: 26rpx;
                color: #999;
                border: 1rpx solid #e0e0e0;

                &::placeholder {
                    color: #ccc;
                }
            }
        }

        .search-buttons {
            display: flex;
            gap: 20rpx;

            .reset-btn,
            .search-btn {
                width: 120rpx;
                height: 64rpx;
                line-height: 64rpx;
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
        gap: 20rpx;
    }

    .report-item {
        background: #fff;
        border-radius: 16rpx;
        padding: 12rpx 24rpx;
        border: 2rpx solid #f0f0f0;
        transition: all 0.3s ease;

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
            right: 0;
        }

        .detail-row {
            display: flex;
            align-items: center;
            margin-bottom: 6rpx;
            font-size: 26rpx;

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
            width: 100%;
            height: 88rpx;
            background: linear-gradient(135deg, #007AFF, #0056b3);
            color: #fff;
            font-size: 30rpx;
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