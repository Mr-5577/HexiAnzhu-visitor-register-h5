<template>
    <view class="register-success">
        <view class="property-consultant">
            <text class="title">置业顾问</text>
            <text class="name">{{ detailData.salerName || '-' }}</text>
        </view>
        <view class="register-detail">
            <view class="detail-card">
                <view class="detail-row">
                    <text class="detail-label">客户姓名：</text>
                    <text class="detail-value">{{ detailData.custName || '-' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">客户电话：</text>
                    <text class="detail-value">{{ detailData.custTel || '-' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">备用电话：</text>
                    <text class="detail-value">{{ detailData.custTel2 || '-' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">到访人数：</text>
                    <text class="detail-value">{{ detailData.visitNum || '-' }}人</text>
                </view>
            </view>
            <view class="detail-card">
                <view class="detail-row">
                    <text class="detail-label">来访方式：</text>
                    <text class="detail-value">{{ detailData.visitTypeName || '-' }}</text>
                </view>
                <!-- 渠道来访展示一下信息 channel：渠道来访   natural：自然来访 -->
                <template v-if="detailData.visitType == 'channel'">
                    <view class="detail-row">
                        <text class="detail-label">带访人：</text>
                        <text class="detail-value">{{ detailData.bringMan || '-' }}</text>
                    </view>
                    <view class="detail-row">
                        <text class="detail-label">带访人电话：</text>
                        <text class="detail-value">{{ detailData.bringTel || '-' }}</text>
                    </view>
                    <view class="detail-row">
                        <text class="detail-label">报备人：</text>
                        <text class="detail-value">{{ detailData.reporter || '-' }}</text>
                    </view>
                    <view class="detail-row">
                        <text class="detail-label">报备时间：</text>
                        <text class="detail-value">{{ detailData.reportTime || '-' }}</text>
                    </view>
                </template>

                <view class="detail-row">
                    <text class="detail-label">到访时间：</text>
                    <text class="detail-value">{{ detailData.visitTime || '-' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">知晓途径：</text>
                    <text class="detail-value">{{ detailData.knowWayName || '' }}</text>
                </view>
                <view class="detail-row">
                    <text class="detail-label">售楼部：</text>
                    <text class="detail-value">{{ detailData.visitProjName || '-' }}</text>
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
        border-radius="10px 10px 0 0" :is-mask-click="false" :style="{ zIndex: 999 }">
        <view class="reassign-contain">
            <view class="popup-top">
                <text class="popup-title">选择置业顾问</text>
                <uni-icons type="closeempty" size="18" class="close-btn" @click="closeReassignPopup"></uni-icons>
            </view>

            <!-- 搜索框 -->
            <!-- <view class="search-box">
                <input class="search-input" v-model="searchKeyword" placeholder="搜索置业顾问姓名" @input="handleSearch" />
                <uni-icons type="search" size="18" color="#999" class="search-icon" />
            </view> -->

            <scroll-view class="consultant-list" scroll-y>
                <view v-for="item in filteredConsultantList" :key="item.salerId" class="consultant-item"
                    :class="{ 'consultant-item-active': selectedConsultantId === item.salerId }"
                    @click="selectConsultant(item)">
                    <view class="consultant-info">
                        <view class="consultant-name">{{ item.salerName }}</view>
                        <view class="consultant-detail">
                            <text class="consultant-dept">{{ item.projName }}</text>
                            <text class="consultant-name">{{ item.teamName }}</text>
                        </view>
                    </view>
                    <view class="select-icon">
                        <uni-icons :type="selectedConsultantId === item.salerId ? 'checkmarkempty' : 'circle'" size="20"
                            :color="selectedConsultantId === item.salerId ? '#007AFF' : '#ccc'" />
                    </view>
                </view>

                <!-- 空状态 -->
                <view v-if="filteredConsultantList.length === 0" class="empty-state">
                    <text class="empty-text">暂无置业顾问数据</text>
                </view>
            </scroll-view>

            <view class="popup-bottom">
                <button class="confirm-btn" :disabled="!selectedConsultantData || isSubmitting"
                    @click="confirmReassign">
                    确认分配
                </button>
            </view>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { visitorRegisterApi } from '@/common/api.js'
import { onLoad, onUnload } from '@dcloudio/uni-app'

// 多个根节点会警告，禁用属性继承 可以消除警告
defineOptions({
    inheritAttrs: false
})

// 提交锁
const isSubmitting = ref(false)
const detailData = ref({
    id: '',
    visitType: '',
    custName: "",
    custTel: "",
    custTel2: "",
    visitNum: 0,
    visitTypeId: "",
    visitTypeName: "",
    bringMan: "",
    bringTel: "",
    reportId: "",
    reporter: "",
    reportTime: "",
    visitTime: "",
    visitProjId: '',
    visitProjName: "",
    knowWayId: "",
    knowWayName: "",
    salerId: "",
    salerName: "",
})

// 弹窗引用
const reassignPopupRef = ref(null)
// 置业顾问列表
const consultantList = ref([])
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
        item.name.includes(searchKeyword.value)
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
    if (selectedConsultantId.value === item.salerId) {
        // 取消选中
        selectedConsultantId.value = null
        selectedConsultantData.value = null
    } else {
        // 选中
        selectedConsultantId.value = item.salerId
        selectedConsultantData.value = item
    }
}
// 打开重新分配弹窗
const openReassignPopup = async () => {
    reassignPopupRef.value.open()
}

// 关闭弹窗
const closeReassignPopup = () => {
    // 重置状态
    searchKeyword.value = ''
    selectedConsultantId.value = null
    selectedConsultantData.value = null
    // 关闭弹窗
    reassignPopupRef.value.close()
}

// 确认分配
const confirmReassign = async () => {
    if (isSubmitting.value) {
        return
    }
    if (!selectedConsultantData.value) {
        uni.showToast({
            title: '请选择置业顾问',
            icon: 'none'
        })
        return
    }
    isSubmitting.value = true
    uni.showLoading({ title: '分配中...' })
    try {
        const params = {
            visitRecIds: [detailData.value.id], // 来访登记成功的记录数据ID
            salerId: selectedConsultantId.value // 置业顾问ID
        }
        const res = await visitorRegisterApi.batchResetSaler(params)
        uni.hideLoading()
        if (res.code === 200) {
            // await new Promise(resolve => setTimeout(resolve, 500))
            // 更新分配的顾问信息
            const targetData = consultantList.value.find((item) => item.salerId === selectedConsultantId.value)
            if (targetData) {
                detailData.value.salerId = targetData.salerId || ''
                detailData.value.salerName = targetData.salerName || ''
            }
            closeReassignPopup() // 关闭选择顾问弹窗
            uni.showToast({
                title: `${res.message || '分配成功'}`,
                icon: 'none'
            })
        } else {
            uni.showToast({
                title: `${res.message || '分配失败'}`,
                icon: 'none'
            })
        }
    } catch (error) {
        uni.hideLoading()
    } finally {
        isSubmitting.value = false
    }
}

// 继续登记，返回到登记页面
const continueRegister = () => {
    uni.navigateBack()
}
const getRecDetailById = async (id) => {
    try {
        const res = await visitorRegisterApi.getVisitHis({ id: id })
        if (res.code === 200) {
            const data = res.data || []
            const [firastData] = data
            const targetData = consultantList.value.find((item) => item.salerId === firastData.salerId)
            if (targetData) {
                detailData.value.salerId = targetData.salerId || ''
                detailData.value.salerName = targetData.salerName || ''
            }
        }
    } catch (error) {
    }
}
// 通过选中的项目ID获取对应项目的 置业顾问列表
const fetchGetSalerList = async () => {
    consultantList.value = []
    try {
        const res = await visitorRegisterApi.getSalerList({ projId: detailData.value.visitProjId })
        if (res.code === 200) {
            const dataList = res.data || []
            consultantList.value = dataList.map((item) => {
                return {
                    ...item,
                    name: item.salerName
                }
            })
        }
    } catch (error) {

    }
}
onLoad(async (options) => {
    console.log(options)
    const data = uni.getStorageSync('registerSuccessData')
    if (data) {
        detailData.value = {
            ...detailData.value,
            ...data
        }

        // 根据选择的项目ID，获取置业顾问列表
        await fetchGetSalerList()
    }
    // 通过来访记录ID获取信息
    if (options.id) {
        detailData.value.id = options.id
        getRecDetailById(options.id)
    }
})
// 页面卸载时
onUnload(() => {
    // 清除存储的登记成功数据
    uni.removeStorageSync('registerSuccessData')
})
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
                .consultant-name {
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