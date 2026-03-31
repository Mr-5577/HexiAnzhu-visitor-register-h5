<template>
    <view class="customer-container">
        <!-- 顶部查询条件 -->
        <view class="search-bar">
            <view class="search-row">
                <view class="search-item">
                    <picker mode="date" style="width: 100%;" :value="searchForm.visitDate" @change="onDateChange">
                        <view class="search-picker">
                            {{ searchForm.visitDate || '来访日期' }}
                        </view>
                    </picker>
                </view>

                <view class="search-item">
                    <input class="search-input" v-model="searchForm.customerName" placeholder="报备号码/客户名"
                        @confirm="handleSearch" />
                </view>
            </view>

            <view class="search-buttons">
                <button class="reset-btn" @click="resetSearch">重置</button>
                <button class="search-btn" @click="handleSearch">查询</button>
            </view>
        </view>

        <!-- 表单内容 -->
        <scroll-view class="customer-list" scroll-y>
            <view v-if="filteredRecordList.length > 0" class="list-container">
                <view v-for="(item, index) in filteredRecordList" :key="index" class="record-item">
                    <!-- 复选框 -->
                    <view class="checkbox-wrapper" @click.stop="toggleSelect(item.id)">
                        <view :class="['checkbox', selectedIds.includes(item.id) ? 'checked' : '']">
                            <text v-if="selectedIds.includes(item.id)" class="checkmark">✓</text>
                        </view>
                    </view>

                    <!-- 内容区域 -->
                    <view class="item-content">
                        <view class="info-row">
                            <text class="info-label">客户名称：</text>
                            <text class="info-value">{{ item.customerName }}</text>
                        </view>
                        <view class="info-row">
                            <text class="info-label">客户电话：</text>
                            <text class="info-value">{{ item.customerPhone }}</text>
                        </view>
                        <view class="info-row">
                            <text class="info-label">置业顾问：</text>
                            <text class="info-value">{{ item.consultantName || '未分配' }}</text>
                        </view>
                        <view class="info-row" v-if="item.visitMethod">
                            <text class="info-label">来访方式：</text>
                            <text class="info-value">{{ item.visitMethod }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-else class="empty-state">
                <image src="/static/empty.png" mode="aspectFit" class="empty-image" v-if="false" />
                <text class="empty-text">暂无数据</text>
            </view>
        </scroll-view>

        <!-- 底部操作栏 -->
        <view v-if="filteredRecordList.length > 0" class="bottom-bar">
            <view class="select-all" @click="toggleSelectAll">
                <view :class="['checkbox', isAllSelected ? 'checked' : '']">
                    <text v-if="isAllSelected" class="checkmark">✓</text>
                </view>
                <text class="select-all-text">全选</text>
            </view>
            <view class="action-buttons">
                <button class="batch-allocate-btn" @click="showAllocateDialog" :disabled="selectedIds.length === 0">
                    重新分配({{ selectedIds.length }})
                </button>
            </view>
        </view>

        <!-- 重新分配弹窗 -->
        <view class="allocate-mask" v-if="showAllocate" @click="closeAllocateDialog">
            <view class="allocate-dialog" @click.stop>
                <view class="dialog-title">
                    <text>选择置业顾问</text>
                    <text class="close-icon" @click="closeAllocateDialog">✕</text>
                </view>
                <view class="dialog-content">
                    <view class="consultant-list">
                        <view v-for="(consultant, index) in consultantList" :key="index" class="consultant-item"
                            :class="{ active: selectedConsultantId === consultant.id }"
                            @click="selectConsultant(consultant.id)">
                            <text class="consultant-name">{{ consultant.name }}</text>
                            <view v-if="selectedConsultantId === consultant.id" class="check-icon">✓</view>
                        </view>
                    </view>
                </view>
                <view class="dialog-buttons">
                    <button class="cancel-btn" @click="closeAllocateDialog">取消</button>
                    <button class="confirm-btn" @click="confirmAllocate">确定分配</button>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 查询表单
const searchForm = ref({
    visitDate: '',
    customerName: ''
})

// 原始数据列表
const originalRecordList = ref([
    {
        id: 1,
        customerName: '张三',
        customerPhone: '138****0000',
        consultantName: 'AAAAA-小王',
        consultantId: 1,
        visitTime: '2024-01-15 14:30',
        visitMethod: '自驾',
        status: 'completed',
        visitType: '自然来访',
        relation: '客户',
        channel: '门店'
    },
    {
        id: 2,
        customerName: '李四',
        customerPhone: '139****1111',
        consultantName: 'BBBBB-小李',
        consultantId: 2,
        visitTime: '2024-01-15 10:15',
        visitMethod: '步行',
        status: 'completed',
        visitType: '渠道来访',
        relation: '朋友',
        channel: '介绍'
    },
    {
        id: 3,
        customerName: '王五',
        customerPhone: '137****2222',
        consultantName: '',
        consultantId: null,
        visitTime: '2024-01-14 16:45',
        visitMethod: '打车',
        status: 'pending',
        visitType: '自然来访',
        relation: '客户',
        channel: '电约'
    },
    {
        id: 4,
        customerName: '赵六',
        customerPhone: '136****3333',
        consultantName: 'CCCCC-小张',
        consultantId: 3,
        visitTime: '2024-01-14 09:30',
        visitMethod: '自驾',
        status: 'completed',
        visitType: '渠道来访',
        relation: '亲戚',
        channel: '门店'
    },
    {
        id: 5,
        customerName: '孙七',
        customerPhone: '135****4444',
        consultantName: 'AAAAA-小王',
        consultantId: 1,
        visitTime: '2024-01-13 11:20',
        visitMethod: '公交',
        status: 'cancelled',
        visitType: '自然来访',
        relation: '客户',
        channel: '拓展'
    },
    {
        id: 6,
        customerName: '周八',
        customerPhone: '134****5555',
        consultantName: 'BBBBB-小李',
        consultantId: 2,
        visitTime: '2024-01-13 15:00',
        visitMethod: '地铁',
        status: 'completed',
        visitType: '渠道来访',
        relation: '朋友',
        channel: '介绍'
    },
    {
        id: 7,
        customerName: '吴九',
        customerPhone: '133****6666',
        consultantName: '',
        consultantId: null,
        visitTime: '2024-01-12 10:30',
        visitMethod: '自驾',
        status: 'pending',
        visitType: '自然来访',
        relation: '客户',
        channel: '门店'
    }
])

// 置业顾问列表
const consultantList = ref([
    { id: 1, name: 'AAAAA-小王' },
    { id: 2, name: 'BBBBB-小李' },
    { id: 3, name: 'CCCCC-小张' },
    { id: 4, name: 'DDDDD-小刘' },
    { id: 5, name: 'AAAAA-小王' },
    { id: 6, name: 'BBBBB-小李' },
    { id: 7, name: 'CCCCC-小张' },
    { id: 8, name: 'DDDDD-小刘' },
    { id: 11, name: 'AAAAA-小王' },
    { id: 12, name: 'BBBBB-小李' },
    { id: 13, name: 'CCCCC-小张' },
    { id: 14, name: 'DDDDD-小刘' },
    { id: 21, name: 'AAAAA-小王' },
    { id: 22, name: 'BBBBB-小李' },
    { id: 23, name: 'CCCCC-小张' },
    { id: 24, name: 'DDDDD-小刘' },
    { id: 25, name: 'EEEEE-小陈' }
])

// 筛选后的列表
const filteredRecordList = ref([...originalRecordList.value])

// 选中的ID列表
const selectedIds = ref([])

// 是否全选
const isAllSelected = computed(() => {
    return filteredRecordList.value.length > 0 &&
        selectedIds.value.length === filteredRecordList.value.length
})

// 重新分配弹窗控制
const showAllocate = ref(false)
const selectedConsultantId = ref(null)

// 切换单个选中
const toggleSelect = (id) => {
    const index = selectedIds.value.indexOf(id)
    if (index > -1) {
        selectedIds.value.splice(index, 1)
    } else {
        selectedIds.value.push(id)
    }
}

// 全选/取消全选
const toggleSelectAll = () => {
    if (isAllSelected.value) {
        selectedIds.value = []
    } else {
        selectedIds.value = filteredRecordList.value.map(item => item.id)
    }
}

// 显示分配弹窗
const showAllocateDialog = () => {
    if (selectedIds.value.length === 0) return
    selectedConsultantId.value = null
    showAllocate.value = true
}

// 关闭分配弹窗
const closeAllocateDialog = () => {
    showAllocate.value = false
    selectedConsultantId.value = null
}

// 选择置业顾问
const selectConsultant = (id) => {
    selectedConsultantId.value = id
}

// 确认分配
const confirmAllocate = () => {
    if (!selectedConsultantId.value) {
        uni.showToast({
            title: '请选择置业顾问',
            icon: 'none'
        })
        return
    }

    const selectedConsultant = consultantList.value.find(c => c.id === selectedConsultantId.value)

    // 更新选中的记录
    selectedIds.value.forEach(id => {
        const item = originalRecordList.value.find(item => item.id === id)
        if (item) {
            item.consultantId = selectedConsultantId.value
            item.consultantName = selectedConsultant.name
        }
    })

    // 重新筛选刷新列表
    handleSearch()

    // 清空选中状态
    selectedIds.value = []

    // 关闭弹窗
    closeAllocateDialog()

    uni.showToast({
        title: `已分配 ${selectedIds.value.length} 条记录`,
        icon: 'success'
    })
}

// 日期选择
const onDateChange = (e) => {
    searchForm.value.visitDate = e.detail.value
    handleSearch()
}

// 重置查询
const resetSearch = () => {
    searchForm.value = {
        visitDate: '',
        customerName: ''
    }
    handleSearch()
}

// 查询
const handleSearch = () => {
    let filtered = [...originalRecordList.value]

    // 按来访日期筛选
    if (searchForm.value.visitDate) {
        filtered = filtered.filter(item =>
            item.visitTime.startsWith(searchForm.value.visitDate)
        )
    }

    // 按客户名称筛选（模糊匹配）
    if (searchForm.value.customerName) {
        filtered = filtered.filter(item =>
            item.customerName.includes(searchForm.value.customerName)
        )
    }

    filteredRecordList.value = filtered
    // 清空选中状态
    selectedIds.value = []

    if (filtered.length === 0 && (searchForm.value.visitDate || searchForm.value.customerName)) {
        uni.showToast({
            title: '暂无匹配数据',
            icon: 'none'
        })
    }
}

// 页面加载时获取数据
onMounted(() => {
    // 可以在这里调用API获取真实数据
    // getRecordList()
})
</script>

<style scoped lang="scss">
page {
    height: 100%;
    background-color: #f5f5f5;
}

.customer-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
    overflow: hidden;
}

/* 查询条件样式 */
.search-bar {
    background-color: #fff;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;

    .search-row {
        display: flex;
        gap: 20rpx;
        margin-bottom: 20rpx;

        .search-item {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 16rpx;

            .search-picker {
                flex: 1;
                width: 100%;
                height: 64rpx;
                line-height: 64rpx;
                background-color: #f5f5f5;
                border-radius: 10rpx;
                padding: 0 20rpx;
                font-size: 28rpx;
                color: #808080;
                position: relative;

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
                background-color: #f5f5f5;
                border-radius: 10rpx;
                padding: 0 20rpx;
                font-size: 28rpx;
                color: #333;

                &::placeholder {
                    color: #808080;
                }
            }
        }
    }

    .search-buttons {
        display: flex;
        gap: 20rpx;

        .reset-btn,
        .search-btn {
            width: 180rpx;
            height: 64rpx;
            line-height: 64rpx;
            font-size: 28rpx;
            border-radius: 36rpx;
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

/* 滚动区域 */
.customer-list {
    flex: 1;
    overflow-y: auto;
    padding: 20rpx 20rpx;

    .list-container {
        display: flex;
        flex-direction: column;
        gap: 20rpx;
    }

    .record-item {
        background-color: #fff;
        border-radius: 16rpx;
        padding: 24rpx;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 20rpx;

        .checkbox-wrapper {
            flex-shrink: 0;
            padding-top: 4rpx;
        }

        .item-content {
            flex: 1;
        }

        .info-row {
            display: flex;
            align-items: center;
            margin-bottom: 12rpx;
            font-size: 28rpx;

            &:last-child {
                margin-bottom: 0;
            }

            .info-label {
                color: #999;
                width: 140rpx;
                flex-shrink: 0;
            }

            .info-value {
                color: #666;
                flex: 1;
            }
        }
    }
}

/* 复选框样式 */
.checkbox {
    width: 40rpx;
    height: 40rpx;
    border: 2rpx solid #ddd;
    border-radius: 6rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
    transition: all 0.2s ease;

    &.checked {
        background-color: #007AFF;
        border-color: #007AFF;
    }

    .checkmark {
        color: #fff;
        font-size: 28rpx;
        font-weight: bold;
        line-height: 1;
    }
}

/* 底部操作栏 */
.bottom-bar {
    background-color: #fff;
    padding: 20rpx 30rpx;
    border-top: 1rpx solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    .select-all {
        display: flex;
        align-items: center;
        gap: 16rpx;

        .select-all-text {
            font-size: 28rpx;
            color: #333;
        }
    }

    .action-buttons {
        .batch-allocate-btn {
            background: linear-gradient(135deg, #007AFF, #0056b3);
            color: #fff;
            border: none;
            border-radius: 36rpx;
            padding: 0 32rpx;
            height: 64rpx;
            line-height: 64rpx;
            font-size: 28rpx;

            &[disabled] {
                background-color: #ff9999;
                opacity: 0.6;
            }

            &::after {
                border: none;
            }
        }
    }
}

/* 重新分配弹窗样式 */
.allocate-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.allocate-dialog {
    width: 600rpx;
    background-color: #fff;
    border-radius: 24rpx;
    overflow: hidden;

    .dialog-title {
        padding: 24rpx 30rpx;
        border-bottom: 1rpx solid #f0f0f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 30rpx;
        font-weight: bold;
        color: #333;

        .close-icon {
            font-size: 32rpx;
            color: #999;
            cursor: pointer;
        }
    }

    .dialog-content {
        max-height: 500rpx;
        overflow-y: auto;

        .consultant-list {
            padding: 20rpx;

            .consultant-item {
                padding: 12rpx 20rpx;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1rpx solid #f5f5f5;
                cursor: pointer;

                &.active {
                    background-color: #e8f4ff;

                    .consultant-name {
                        color: #007AFF;
                    }
                }

                .consultant-name {
                    font-size: 28rpx;
                    color: #333;
                }

                .check-icon {
                    color: #007AFF;
                    font-size: 32rpx;
                    font-weight: bold;
                }
            }
        }
    }

    .dialog-buttons {
        display: flex;
        border-top: 1rpx solid #f0f0f0;

        button {
            flex: 1;
            height: 88rpx;
            line-height: 88rpx;
            font-size: 28rpx;
            border: none;
            border-radius: 0;
            background: #fff;
            margin: 0;

            &::after {
                border: none;
            }

            &.cancel-btn {
                color: #666;
                border-right: 1rpx solid #f0f0f0;
            }

            &.confirm-btn {
                color: #007AFF;
                font-weight: bold;
            }
        }
    }
}

/* 空状态样式 */
.empty-state {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 100rpx 0;

    .empty-image {
        width: 200rpx;
        height: 200rpx;
        margin-bottom: 20rpx;
    }

    .empty-text {
        font-size: 28rpx;
        color: #999;
    }
}
</style>