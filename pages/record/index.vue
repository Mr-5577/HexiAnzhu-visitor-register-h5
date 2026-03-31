<template>
    <view class="record-container">
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
        <scroll-view class="record-list" scroll-y>
            <view v-if="filteredRecordList.length > 0" class="list-container">
                <view v-for="(item, index) in filteredRecordList" :key="index" class="record-item"
                    @click="viewDetail(item)">
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

            <!-- 空状态 -->
            <view v-else class="empty-state">
                <image src="/static/empty.png" mode="aspectFit" class="empty-image" v-if="false" />
                <text class="empty-text">暂无数据</text>
            </view>
        </scroll-view>
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
        visitTime: '2024-01-15 14:30',
        visitMethod: '自驾',
        status: 'completed', // completed: 已完成, pending: 待分配, cancelled: 已取消
        visitType: '自然来访',
        relation: '客户',
        channel: '门店'
    },
    {
        id: 2,
        customerName: '李四',
        customerPhone: '139****1111',
        consultantName: 'BBBBB-小李',
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
        visitTime: '2024-01-12 10:30',
        visitMethod: '自驾',
        status: 'pending',
        visitType: '自然来访',
        relation: '客户',
        channel: '门店'
    }
])

// 筛选后的列表
const filteredRecordList = ref([...originalRecordList.value])

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

    if (filtered.length === 0 && (searchForm.value.visitDate || searchForm.value.customerName)) {
        uni.showToast({
            title: '暂无匹配数据',
            icon: 'none'
        })
    }
}

// 查看详情
const viewDetail = (item) => {
    // 跳转到详情页面
    uni.navigateTo({
        url: `/pages/record/record-detail?id=${item.id}`
    })
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

.record-container {
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
.record-list {
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