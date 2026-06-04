<!-- 选择职业顾问 弹窗 -->
<template>
    <uni-popup class="popup-dialog" ref="popupRef" type="bottom" background-color="#fff" border-radius="10px 10px 0 0"
        :is-mask-click="false" :style="{ zIndex: 999 }">
        <view class="popup-contain">
            <view class="popup-top">
                <text class="popup-title">选择职业顾问</text>
                <uni-icons type="closeempty" size="18" color="#666" class="close-btn" @click="closePopup" />
            </view>

            <!-- 顾问列表 -->
            <scroll-view class="popup-content" scroll-y>
                <view v-if="consultantList.length > 0" class="consultant-list">
                    <view v-for="item in consultantList" :key="item.id" class="consultant-item"
                        :class="{ 'consultant-item-active': selectedSalerId === item.id }"
                        @click="selectConsultant(item)">
                        <view class="consultant-detail">
                            <view class="select-icon">
                                <uni-icons :type="selectedSalerId === item.id ? 'checkmarkempty' : 'circle'" size="20"
                                    :color="selectedSalerId === item.id ? '#007AFF' : '#ccc'" />
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">顾问姓名：</text>
                                <text class="detail-value">{{ item.salerName }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">团队名称：</text>
                                <text class="detail-value">{{ item.teamName }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view v-else class="empty-state">
                    <text class="empty-text">暂无已签到顾问</text>
                </view>
            </scroll-view>

            <view class="popup-bottom" v-if="consultantList.length > 0">
                <button class="submit-btn" :disabled="!selectedSalerData" @click="confirmSelection">
                    确定选择
                </button>
            </view>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { visitorRegisterApi } from '@/common/api.js'

const props = defineProps({
    projectId: {
        type: [String, Number],
        required: true
    }
})

const emit = defineEmits(['salerSelected'])

// 弹窗引用
const popupRef = ref(null)

// 顾问列表（仅已签到顾问 lastSignStatus  0 未签到，1 已签到，2 已签退）
const consultantList = ref([])

// 选中的顾问
const selectedSalerId = ref(null)
const selectedSalerData = ref(null)

// 获取顾问列表
const fetchConsultantList = async () => {
    if (!props.projectId) return

    try {
        const res = await visitorRegisterApi.getSalerList({ projId: props.projectId })
        if (res.code === 200) {
            const list = res.data || []
            // 只展示已签到的顾问
            consultantList.value = list.filter(item => item.lastSignStatus == 1)
        }
    } catch (error) {
        consultantList.value = []
    }
}

// 选择顾问
const selectConsultant = (item) => {
    if (selectedSalerId.value === item.id) {
        selectedSalerId.value = null
        selectedSalerData.value = null
    } else {
        selectedSalerId.value = item.id
        selectedSalerData.value = item
    }
}

// 确认选择
const confirmSelection = () => {
    if (!selectedSalerData.value) {
        uni.showToast({
            title: '请选择顾问',
            icon: 'none'
        })
        return
    }
    closePopup()
    emit('salerSelected', selectedSalerData.value)
}

// 打开弹窗
const openPopup = () => {
    // 重置选中状态
    selectedSalerId.value = null
    selectedSalerData.value = null
    // 加载顾问列表
    fetchConsultantList()
    popupRef.value.open()
}

// 关闭弹窗
const closePopup = () => {
    popupRef.value.close()
}

// 监听项目ID变化
watch(() => props.projectId, () => {
    if (popupRef.value && popupRef.value.isOpen) {
        fetchConsultantList()
    }
})

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

    .popup-content {
        flex: 1;
        overflow-y: auto;
        padding: 20rpx 30rpx;
        box-sizing: border-box;
    }

    .consultant-list {
        display: flex;
        flex-direction: column;
    }

    .consultant-item {
        background: #fff;
        border-radius: 16rpx;
        padding: 12rpx 24rpx;
        border: 2rpx solid #f0f0f0;
        transition: all 0.3s ease;
        margin-bottom: 20rpx;

        &.consultant-item-active {
            border-color: #007AFF;
            background-color: #f0f8ff;
            box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.1);
        }
    }

    .consultant-detail {
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