<!-- 来访记录 弹窗 -->
<template>
    <uni-popup class="popup-dialog" ref="popupRef" type="bottom" background-color="#fff" border-radius="10px 10px 0 0"
        :is-mask-click="false" :style="{ zIndex: 999 }">
        <view class="popup-contain">
            <view class="popup-top">
                <text class="popup-title">选择来访记录</text>
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
                        <picker style="width: 100%;" mode="date" :value="searchForm.visitDate"
                            @change="onVisitDateChange">
                            <view class="search-picker">
                                {{ searchForm.visitDate || '来访日期' }}
                                <uni-icons type="closeempty" size="14" color="#999" style="z-index: 9999"
                                    v-show="searchForm.visitDate" @click.stop="searchForm.visitDate = ''"></uni-icons>
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
                <view class="record-list" v-if="recordList.length > 0">
                    <view v-for="(item, index) in recordList" :key="index" class="record-item"
                        :class="{ 'record-item-active': selectedRecordId === item.id }" @click="selectRecord(item)">
                        <view class="record-detail">
                            <view class="select-icon">
                                <uni-icons :type="selectedRecordId === item.id ? 'checkmarkempty' : 'circle'" size="20"
                                    :color="selectedRecordId === item.id ? '#007AFF' : '#ccc'" />
                            </view>
                            <view class="info-row">
                                <text class="info-label">客户名称：</text>
                                <text class="info-value">{{ item.custName }}</text>
                            </view>
                            <view class="info-row">
                                <text class="info-label">客户电话：</text>
                                <!-- <text class="info-value">{{ item.custTel }}</text> -->
                                <text class="info-value">{{ item.desensitizeCustTel }}</text>
                            </view>
                            <view class="info-row">
                                <text class="info-label">置业顾问：</text>
                                <text class="info-value">{{ item.salerName }}</text>
                            </view>
                            <view class="info-row">
                                <text class="info-label">来访时间：</text>
                                <text class="info-value">{{ item.visitTime }}</text>
                            </view>
                        </view>
                    </view>
                </view>
                <view v-else class="empty-state">
                    <text class="empty-text">暂无来访记录</text>
                </view>
            </scroll-view>

            <view class="popup-bottom" v-if="recordList.length > 0">
                <button class="submit-btn" :disabled="!selectedRecordData" @click="confirmSelection">
                    确定选择
                </button>
            </view>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref } from 'vue'
import { visitorRegisterApi } from '@/common/api.js'
import { desensitizePhone } from '@/utils/common.js'

const props = defineProps({
    projectId: {
        type: [String, Number],
        required: true
    }
})

const emit = defineEmits(['recordSelected'])

const popupRef = ref(null)
const salerList = ref([])
const recordList = ref([])
const selectedRecordId = ref(null)
const selectedRecordData = ref(null)

const searchForm = ref({
    custName: '',
    custTel: '',
    visitDate: ''
})

const onVisitDateChange = (e) => {
    searchForm.value.visitDate = e.detail.value
}

const resetSearch = () => {
    searchForm.value = {
        custName: '',
        custTel: '',
        visitDate: ''
    }
    handleSearch()
}
// 获取置业顾问显示文本
const getSalerTextRect = (val) => {
    const target = salerList.value?.find((item) => item.salerId == val)
    return target?.salerName || '-'
}

// 获取置业顾问
const fetchGetSalerList = async () => {
    try {
        const res = await visitorRegisterApi.getSalerList({ projId: props.projectId })
        if (res.code === 200) {
            const dataList = res.data || []
            salerList.value = res.data || []
        }
    } catch (error) {
        salerList.value = []
    }
}

const fetchRecordList = async () => {
    try {
        uni.showLoading({ title: '加载中...', mask: true })
        const params = {
            projId: props.projectId,
            custName: searchForm.value.custName,
            custTel: searchForm.value.custTel,
            isShowTel: true, // 是否明文显示电话
        }
        if (searchForm.value.visitDate) {
            params.visitTimeStart = `${searchForm.value.visitDate} 00:00:00`
            params.visitTimeEnd = `${searchForm.value.visitDate} 23:59:59`
        }
        const res = await visitorRegisterApi.getVisitHis(params)
        if (res.code === 200) {
            const list = res.data || []
            recordList.value = list.map((item) => {
                return {
                    ...item,
                    salerName: getSalerTextRect(item.salerId),
                    desensitizeCustTel: desensitizePhone(item.custTel)
                }
            })
        }
    } catch (error) {
        uni.showToast({ title: '查询失败', icon: 'none' })
    } finally {
        uni.hideLoading()
    }
}

const handleSearch = () => {
    selectedRecordId.value = null
    selectedRecordData.value = null
    fetchRecordList()
}

const selectRecord = (item) => {
    if (selectedRecordId.value === item.id) {
        selectedRecordId.value = null
        selectedRecordData.value = null
    } else {
        selectedRecordId.value = item.id
        selectedRecordData.value = item
    }
}

const confirmSelection = () => {
    if (!selectedRecordData.value) {
        uni.showToast({ title: '请选择来访记录', icon: 'none' })
        return
    }
    closePopup()
    emit('recordSelected', selectedRecordData.value)
}

const openPopup = async () => {
    await fetchGetSalerList()
    resetSearch()
    popupRef.value.open()
}

const closePopup = () => {
    popupRef.value.close()
}

defineExpose({ openPopup, closePopup })
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

    .search-form {
        padding: 20rpx 30rpx;
        background-color: #f8f8f8;
        border-bottom: 1rpx solid #f0f0f0;
        flex-shrink: 0;

        .search-row {
            display: flex;
            margin-bottom: 20rpx;
            width: 100%;
            align-items: center;

            &:last-child {
                margin-bottom: 0;
            }
        }

        .search-item {
            flex: 1;
            display: flex;
            align-items: center;
            margin-right: 20rpx;

            &:last-child {
                margin-right: 0;
            }
        }

        .search-input {
            flex: 1;
            height: 60rpx;
            background-color: #fff;
            border-radius: 8rpx;
            padding: 0 20rpx;
            font-size: 26rpx;
            color: #666;
            border: 1rpx solid #e0e0e0;
        }

        .search-picker {
            flex: 1;
            height: 60rpx;
            line-height: 60rpx;
            background-color: #fff;
            border-radius: 8rpx;
            padding: 0 20rpx;
            font-size: 26rpx;
            color: #666;
            border: 1rpx solid #e0e0e0;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .search-buttons {
            display: flex;
            gap: 20rpx;

            .reset-btn,
            .search-btn {
                width: 120rpx;
                height: 60rpx;
                line-height: 60rpx;
                font-size: 26rpx;
                border-radius: 8rpx;
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
    }

    .record-list {
        display: flex;
        flex-direction: column;
    }

    .record-item {
        background: #fff;
        border-radius: 16rpx;
        padding: 20rpx 24rpx;
        border: 2rpx solid #f0f0f0;
        margin-bottom: 20rpx;
        transition: all 0.3s ease;

        &.record-item-active {
            border-color: #007AFF;
            background-color: #f0f8ff;
        }
    }

    .record-detail {
        position: relative;

        .select-icon {
            position: absolute;
            top: 0;
            right: -10rpx;
        }

        .info-row {
            display: flex;
            margin-bottom: 12rpx;
            font-size: 26rpx;
            padding-right: 30rpx;

            &:last-child {
                margin-bottom: 0;
            }

            .info-label {
                color: #999;
                width: 140rpx;
                flex-shrink: 0;
            }

            .info-value {
                color: #333;
                flex: 1;
            }
        }
    }

    .empty-state {
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
        display: flex;
        justify-content: center;

        .submit-btn {
            width: 60%;
            height: 66rpx;
            background: linear-gradient(135deg, #007AFF, #0056b3);
            color: #fff;
            font-size: 28rpx;
            font-weight: 500;
            border-radius: 44rpx;
            display: flex;
            align-items: center;
            justify-content: center;

            &::after {
                border: none;
            }

            &:active {
                opacity: 0.9;
            }
        }

        .submit-btn[disabled] {
            background: #e0e0e0;
            color: #999;
        }
    }
}
</style>