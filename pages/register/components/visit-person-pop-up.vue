<!-- 历史带访人列表 -->
<template>
    <uni-popup class="popup-dialog" ref="popupRef" type="bottom" background-color="#fff" border-radius="10px 10px 0 0"
        :is-mask-click="false" :style="{ zIndex: 999 }">
        <view class="popup-contain">
            <view class="popup-top">
                <text class="popup-title">带访人列表</text>
                <uni-icons type="closeempty" size="18" color="#666" class="close-btn" @click="closePopup"></uni-icons>
            </view>

            <!-- 查询表单 -->
            <view class="search-form">
                <view class="search-row">
                    <view class="search-item">
                        <input class="search-input" v-model="searchForm.bringMan" placeholder="带访人姓名" />
                    </view>

                    <view class="search-item">
                        <input class="search-input" v-model="searchForm.bringTel" placeholder="带访人电话" />
                    </view>
                </view>

                <view class="search-row">
                    <view class="search-item search-buttons">
                        <button class="reset-btn" @click="resetSearch">重置</button>
                        <button class="search-btn" @click="handleSearch">查询</button>
                    </view>
                </view>
            </view>

            <scroll-view class="popup-content" scroll-y>
                <!-- 带访人列表 -->
                <view class="report-list" v-if="displayList.length > 0">
                    <view v-for="(item, index) in displayList" :key="index" class="report-item"
                        :class="{ 'report-item-active': selectedId === item.uuid }" @click="selectItem(item)">
                        <view class="report-detail">
                            <view class="select-icon">
                                <uni-icons :type="selectedId === item.uuid ? 'checkmarkempty' : 'circle'" size="20"
                                    :color="selectedId === item.uuid ? '#007AFF' : '#ccc'" />
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">带访人姓名：</text>
                                <text class="detail-value">{{ item.bringMan }}</text>
                            </view>
                            <view class="detail-row">
                                <text class="detail-label">带访人电话：</text>
                                <text class="detail-value">{{ item.bringTel }}</text>
                            </view>
                        </view>
                    </view>
                </view>

                <!-- 空状态 -->
                <view v-else class="empty-state">
                    <text class="empty-text">暂无历史带访人信息</text>
                </view>
            </scroll-view>

            <view class="popup-bottom" v-if="displayList.length > 0">
                <button class="submit-btn" :disabled="!selectedData" @click="confirmSelection">
                    确定选择
                </button>
            </view>
        </view>
    </uni-popup>
</template>

<script setup>
import { ref } from 'vue'
import { v4 as uuidv4 } from "uuid";
import { visitorRegisterApi } from '@/common/api.js'

const props = defineProps({
    visitComId: {
        type: [Number, null],
        required: true,
        default: null
    }
})

// 定义事件
const emit = defineEmits(['bringManSelected'])

// 弹窗引用
const popupRef = ref(null)

// 查询表单
const searchForm = ref({
    bringMan: '',
    bringTel: ''
})

// 原始数据列表（全量数据）
const originalList = ref([])
// 展示的数据列表（过滤后）
const displayList = ref([])

// 选中的带访人
const selectedId = ref(null)
const selectedData = ref(null)

// 过滤数据
const filterData = () => {
    let list = [...originalList.value]

    if (searchForm.value.bringMan) {
        list = list.filter(item => item.bringMan && item.bringMan.includes(searchForm.value.bringMan))
    }
    if (searchForm.value.bringTel) {
        list = list.filter(item => item.bringTel && item.bringTel.includes(searchForm.value.bringTel))
    }

    displayList.value = list
}

// 重置查询
const resetSearch = () => {
    searchForm.value = {
        bringMan: '',
        bringTel: ''
    }
    // 重置后显示全部数据
    filterData()
    // 清空选中状态
    selectedId.value = null
    selectedData.value = null
}

// 查询（执行过滤）
const handleSearch = () => {
    // 清空选中状态
    selectedId.value = null
    selectedData.value = null
    // 执行过滤
    filterData()
}

// 获取历史带访人列表
const fetchBringManList = async () => {
    if (!props.visitComId) {
        console.warn('visitComId is required')
        return
    }

    try {
        const res = await visitorRegisterApi.getBringManList({ visitComId: props.visitComId })
        if (res.code === 200) {
            const list = res.data || []
            // 给每项添加唯一uuid
            originalList.value = list.map(item => ({
                ...item,
                uuid: uuidv4()
            }))
            // 初始化显示列表
            displayList.value = [...originalList.value]
        } else {
            originalList.value = []
            displayList.value = []
            uni.showToast({
                title: res.message || '获取历史带访人失败',
                icon: 'none'
            })
        }
    } catch (error) {
        originalList.value = []
        displayList.value = []
        uni.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
        })
    }
}

// 选择带访人
const selectItem = (item) => {
    if (selectedId.value === item.uuid) {
        // 如果已选中，则取消选中
        selectedId.value = null
        selectedData.value = null
    } else {
        // 否则选中当前项
        selectedId.value = item.uuid
        selectedData.value = item
    }
}

// 确认选择
const confirmSelection = () => {
    if (!selectedData.value) {
        uni.showToast({
            title: '请选择带访人',
            icon: 'none'
        })
        return
    }
    // 关闭弹窗
    closePopup()
    // 触发父组件事件，传递选中的数据
    emit('bringManSelected', selectedData.value)
}

// 打开弹窗
const openPopup = async () => {
    // 重置查询条件
    resetSearch()
    // 清空选中状态
    selectedId.value = null
    selectedData.value = null
    // 获取数据
    await fetchBringManList()
    // 打开弹窗
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
        height: 75vh;
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
        background-color: #fff;
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
            margin-right: 20rpx;

            &:last-child {
                margin-right: 0;
            }

            .search-input {
                flex: 1;
                height: 60rpx;
                background-color: #fff;
                border-radius: 8rpx;
                padding: 0 20rpx;
                font-size: 26rpx;
                color: #333;
                border: 1rpx solid #e0e0e0;

                &::placeholder {
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

    /* 列表样式 */
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
        padding-right: 30rpx;

        .select-icon {
            position: absolute;
            top: 0;
            right: -10rpx;
        }

        .detail-row {
            display: flex;
            margin-bottom: 6rpx;
            font-size: 26rpx;

            &:last-child {
                margin-bottom: 0;
            }

            .detail-label {
                color: #999;
                width: 160rpx;
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
            margin: 0 auto;

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