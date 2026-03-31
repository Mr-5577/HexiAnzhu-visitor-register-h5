<template>
    <view class="register-success">
        <view class="property-consultant">
            <text class="title">置业顾问</text>
            <text class="name">{{ currentConsultant.name || 'AAAAA-小王' }}</text>
        </view>
        <view class="register-detail">
            <view class="detail-card">
                <view class="detail-row">
                    <text class="detail-label">客户姓名：</text>
                    <text class="detail-value">{{ formData.customerName || '-' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">客户电话：</text>
                    <text class="detail-value">{{ formData.customerPhone || '-' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">备用电话：</text>
                    <text class="detail-value">{{ formData.backupPhone || '无' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">到访人数：</text>
                    <text class="detail-value">{{ formData.visitorCount || '0' }}人</text>
                </view>
            </view>
            <view class="detail-card">
                <view class="detail-row">
                    <text class="detail-label">来访方式：</text>
                    <text class="detail-value">{{ formData.visitMethod || '-' }}</text>
                </view>
                <view class="detail-row" v-if="formData.referrer">
                    <text class="detail-label">带访人：</text>
                    <text class="detail-value">{{ formData.referrer || '-' }}</text>
                </view>
                <view class="detail-row" v-if="formData.referrerPhone">
                    <text class="detail-label">带访电话：</text>
                    <text class="detail-value">{{ formData.referrerPhone || '-' }}</text>
                </view>
                <view class="detail-row" v-if="formData.reporter">
                    <text class="detail-label">报备人：</text>
                    <text class="detail-value">{{ formData.reporter || '-' }}</text>
                </view>
                <view class="detail-row" v-if="formData.reportTime">
                    <text class="detail-label">报备时间：</text>
                    <text class="detail-value">{{ formData.reportTime || '-' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">到访时间：</text>
                    <text class="detail-value">{{ formData.visitTime || '-' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">人员关系：</text>
                    <text class="detail-value">{{ getRelationText(formData.relation) }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">来访渠道：</text>
                    <text class="detail-value">{{ getChannelText(formData.channel) }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">售楼部：</text>
                    <text class="detail-value">{{ formData.salesOffice || '-' }}</text>
                </view>
            </view>
        </view>
        <!-- 底部按钮 -->
        <view class="bottom-buttons">
            <button class="submit-btn continue-btn" @click="continueRegister">
                继续登记
            </button>
            <button class="submit-btn reassign-btn" @click="openReassignPopup">
                重新分配
            </button>
        </view>
    </view>

    <!-- 重新分配弹窗 -->
    <uni-popup class="reassign-popup" ref="reassignPopupRef" type="bottom" background-color="#fff"
        border-radius="10px 10px 0 0" :is-mask-click="false">
        <view class="reassign-contain">
            <view class="popup-top">
                <text class="popup-title">选择置业顾问</text>
                <uni-icons type="closeempty" size="18" class="close-btn" @click="closeReassignPopup"></uni-icons>
            </view>

            <!-- 搜索框 -->
            <view class="search-box">
                <input class="search-input" v-model="searchKeyword" placeholder="搜索置业顾问姓名/工号" @input="handleSearch" />
                <uni-icons type="search" size="18" color="#999" class="search-icon" />
            </view>

            <scroll-view class="consultant-list" scroll-y>
                <view v-for="item in filteredConsultantList" :key="item.id" class="consultant-item"
                    :class="{ 'consultant-item-active': selectedConsultantId === item.id }"
                    @click="selectConsultant(item)">
                    <view class="consultant-info">
                        <view class="consultant-name">{{ item.name }}</view>
                        <view class="consultant-detail">
                            <text class="consultant-dept">{{ item.department }}</text>
                            <text class="consultant-phone">{{ item.phone }}</text>
                        </view>
                    </view>
                    <view class="select-icon">
                        <uni-icons :type="selectedConsultantId === item.id ? 'checkmarkempty' : 'circle'" size="20"
                            :color="selectedConsultantId === item.id ? '#007AFF' : '#ccc'" />
                    </view>
                </view>

                <!-- 空状态 -->
                <view v-if="filteredConsultantList.length === 0" class="empty-state">
                    <text class="empty-text">暂无匹配的置业顾问</text>
                </view>
            </scroll-view>

            <view class="popup-bottom">
                <button class="confirm-btn" :disabled="!selectedConsultantData" @click="confirmReassign">
                    确认分配
                </button>
            </view>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 接收页面参数
const props = defineProps({
    formData: {
        type: Object,
        default: () => ({})
    }
})

// 当前置业顾问
const currentConsultant = ref({
    id: 1,
    name: 'AAAAA-小王',
    department: '销售一部',
    phone: '138****0000'
})

// 弹窗引用
const reassignPopupRef = ref(null)

// 置业顾问列表
const consultantList = ref([
    {
        id: 1,
        name: 'AAAAA-小王',
        department: '销售一部',
        phone: '138****0000'
    },
    {
        id: 2,
        name: 'BBBBB-小李',
        department: '销售一部',
        phone: '139****1111'
    },
    {
        id: 3,
        name: 'CCCCC-小张',
        department: '销售二部',
        phone: '137****2222'
    },
    {
        id: 4,
        name: 'DDDDD-小赵',
        department: '销售二部',
        phone: '136****3333'
    },
    {
        id: 5,
        name: 'EEEEE-小刘',
        department: '销售三部',
        phone: '135****4444'
    }
])

// 搜索关键词
const searchKeyword = ref('')

// 选中的顾问
const selectedConsultantId = ref(null)
const selectedConsultantData = ref(null)

// 过滤后的顾问列表
const filteredConsultantList = computed(() => {
    if (!searchKeyword.value) {
        return consultantList.value
    }
    return consultantList.value.filter(item =>
        item.name.includes(searchKeyword.value) ||
        item.phone.includes(searchKeyword.value)
    )
})

// 搜索
const handleSearch = () => {
    // 搜索时清空选中状态
    selectedConsultantId.value = null
    selectedConsultantData.value = null
}

// 选择顾问
const selectConsultant = (item) => {
    if (selectedConsultantId.value === item.id) {
        // 取消选中
        selectedConsultantId.value = null
        selectedConsultantData.value = null
    } else {
        // 选中
        selectedConsultantId.value = item.id
        selectedConsultantData.value = item
    }
}

// 打开重新分配弹窗
const openReassignPopup = () => {
    // 重置状态
    searchKeyword.value = ''
    selectedConsultantId.value = null
    selectedConsultantData.value = null
    reassignPopupRef.value.open()
}

// 关闭弹窗
const closeReassignPopup = () => {
    reassignPopupRef.value.close()
}

// 确认分配
const confirmReassign = () => {
    if (!selectedConsultantData.value) {
        uni.showToast({
            title: '请选择置业顾问',
            icon: 'none'
        })
        return
    }

    // 更新当前顾问
    currentConsultant.value = selectedConsultantData.value

    // 关闭弹窗
    closeReassignPopup()

    // 提示成功
    uni.showToast({
        title: `已分配给${selectedConsultantData.value.name}`,
        icon: 'success'
    })

    // 可以在这里调用API，更新分配信息
    console.log('重新分配成功:', selectedConsultantData.value)
}

// 继续登记,跳转到登记页面
const continueRegister = () => {
    uni.navigateTo({
        url: '/pages/register/index'
    })
}

// 获取关系文本
const getRelationText = (value) => {
    const map = {
        customer: '客户',
        relative: '亲戚',
        friend: '朋友'
    }
    return map[value] || value
}

// 获取渠道文本
const getChannelText = (value) => {
    const map = {
        store: '门店',
        phone: '电约',
        referral: '介绍',
        develop: '拓展'
    }
    return map[value] || value
}
</script>

<style scoped lang="scss">
page {
    height: 100%;
    background-color: #f5f5f5;
}

.register-success {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
    overflow-y: auto;

    .property-consultant {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #fff;
        padding: 30rpx 0;
        flex-shrink: 0;
        z-index: 10;

        .title {
            font-size: 30rpx;
            color: #666;
        }

        .name {
            font-size: 40rpx;
            color: #333;
            font-weight: bold;
            margin-top: 20rpx;
        }
    }

    .register-detail {
        display: flex;
        flex-direction: column;
        padding: 20rpx 30rpx;
        box-sizing: border-box;
        gap: 20rpx;
        flex: 1;
    }

    .detail-card {
        display: flex;
        flex-direction: column;
        background-color: #fff;
        border-radius: 16rpx;
        padding: 24rpx;
        gap: 12rpx;

        .detail-row {
            display: flex;
            align-items: center;
            font-size: 28rpx;

            .detail-label {
                color: #666;
                width: 140rpx;
                flex-shrink: 0;
                text-align: right;
            }

            .detail-value {
                color: #999;
                flex: 1;
            }
        }
    }
}

.bottom-buttons {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
    gap: 20rpx;
    background-color: #fff;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);

    .submit-btn {
        flex: 1;
        height: 80rpx;
        font-size: 28rpx;
        border-radius: 40rpx;
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

        &.continue-btn {
            background: linear-gradient(135deg, #007AFF, #0056b3);
            color: #fff;
        }

        &.reassign-btn {
            background-color: #fff;
            color: #007AFF;
            border: 2rpx solid #007AFF;
        }
    }
}

/* 重新分配弹窗样式 */
.reassign-popup {
    .reassign-contain {
        width: 100%;
        height: 70vh;
        display: flex;
        flex-direction: column;
        background-color: #fff;
        border-radius: 20rpx 20rpx 0 0;
    }

    .popup-top {
        width: 100%;
        height: 100rpx;
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

    .search-box {
        padding: 20rpx 30rpx;
        position: relative;
        flex-shrink: 0;

        .search-input {
            width: 100%;
            height: 72rpx;
            background-color: #f5f5f5;
            border-radius: 36rpx;
            padding: 0 60rpx 0 30rpx;
            font-size: 28rpx;
            color: #333;
            border: none;

            &::placeholder {
                color: #ccc;
            }
        }

        .search-icon {
            position: absolute;
            right: 50rpx;
            top: 50%;
            transform: translateY(-50%);
        }
    }

    .consultant-list {
        flex: 1;
        overflow-y: auto;
        padding: 0 30rpx;
    }

    .consultant-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16rpx 20rpx;
        border-bottom: 1rpx solid #f0f0f0;
        transition: all 0.3s ease;

        &.consultant-item-active {
            .consultant-name {
                color: #007AFF;
            }
        }

        .consultant-info {
            flex: 1;

            .consultant-name {
                font-size: 30rpx;
                color: #333;
                font-weight: 500;
            }

            .consultant-detail {
                display: flex;
                gap: 24rpx;

                .consultant-dept,
                .consultant-phone {
                    font-size: 24rpx;
                    color: #999;
                }
            }
        }

        .select-icon {
            flex-shrink: 0;
            margin-left: 16rpx;
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

        .confirm-btn {
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

            &[disabled] {
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
}
</style>