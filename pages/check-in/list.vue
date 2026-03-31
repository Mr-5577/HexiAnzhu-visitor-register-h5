<template>
    <view class="container">
        <!-- 固定表头 -->
        <view class="list-header fixed-header">
            <text class="header-item sort-header">序号</text>
            <text class="header-item name-header">人员姓名</text>
            <text class="header-item team-header">团队名称</text>
            <text class="header-item action-header">操作</text>
        </view>

        <!-- 人员列表（可滚动区域） -->
        <scroll-view class="list-section" scroll-y>
            <view class="list-wrapper">
                <view v-for="(item, index) in list" :key="item.id" class="list-item">
                    <view class="sort-number">
                        <text class="sort-text">{{ index + 1 }}</text>
                    </view>

                    <view class="name-content">
                        <text class="name-text">{{ item.name }}</text>
                    </view>

                    <view class="team-content">
                        <text class="team-text">{{ item.teamName }}</text>
                    </view>

                    <view class="action-handle" @click="handleForceSignOut(item)">
                        <text class="action-text">强制签退</text>
                    </view>
                </view>
            </view>
            <!-- 空状态 -->
            <view v-if="list.length === 0" class="empty-state">
                <text class="empty-text">暂无数据</text>
            </view>
        </scroll-view>
    </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 列表数据
const list = ref([
    { id: 101, name: '张三', teamName: '营销一部' },
    { id: 102, name: '李四', teamName: '营销二部' },
    { id: 103, name: '王五', teamName: '营销一部' },
    { id: 104, name: '赵六', teamName: '营销三部' },
    { id: 105, name: '钱七', teamName: '营销二部' },
    { id: 106, name: '孙八', teamName: '营销一部' },
    { id: 107, name: '周九', teamName: '营销一部' },
    { id: 108, name: '吴十', teamName: '营销一部' },
    { id: 109, name: '郑十一', teamName: '营销一部' },
    { id: 110, name: '王十二', teamName: '营销一部' },
    { id: 112, name: '孙八', teamName: '营销一部' },
    { id: 113, name: '周九', teamName: '营销一部' },
    { id: 114, name: '周九', teamName: '营销一部' },
    { id: 115, name: '周九', teamName: '营销一部' },
    { id: 116, name: '周九', teamName: '营销一部' },
    { id: 117, name: '周九', teamName: '营销一部' },
])

// 强制签退处理函数
const handleForceSignOut = (item) => {
    uni.showModal({
        title: '提示',
        content: `确认强制签退 ${item.name} 吗？`,
        success: (res) => {
            if (res.confirm) {
                // 这里调用签退接口
                console.log('强制签退:', item)
                uni.showToast({
                    title: '签退成功',
                    icon: 'success'
                })
            }
        }
    })
}

onMounted(() => {
})

onUnmounted(() => {
})
</script>

<style lang="scss" scoped>
page {
    height: 100%;
    background-color: #f5f5f5;
}

.container {
    width: 100%;
    height: 100%;
    background: #f5f5f5;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 20rpx 20rpx;
    box-sizing: border-box;
}

// 固定表头样式
.fixed-header {
    position: sticky;
    top: 0;
    z-index: 10;
    background: #fafafa;
    border-top: 1rpx solid #f0f0f0;
}

// 列表样式
.list-header {
    display: flex;
    background-color: #fff;
    padding: 20rpx 16rpx;
    box-sizing: border-box;
}

.list-section {
    flex: 1;
    overflow-y: auto;
}

.list-wrapper {
    background: white;
    border-radius: 16rpx;
    overflow: hidden;
}

.header-item {
    font-size: 28rpx;
    color: #666;
    font-weight: 500;
}

.sort-header {
    width: 120rpx;
    text-align: center;
}

.name-header {
    flex: 1;
}

.team-header {
    width: 200rpx;
}

.action-header {
    width: 180rpx;
    text-align: center;
}

.list-item {
    display: flex;
    align-items: center;
    padding: 12rpx 16rpx;
    border-bottom: 1rpx solid #f0f0f0;
    background: white;

    &:last-child {
        border-bottom: none;
    }
}

.sort-number {
    width: 120rpx;
    text-align: center;
}

.sort-text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
}

.name-content {
    flex: 1;
}

.name-text {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
}

.team-content {
    width: 200rpx;
}

.team-text {
    font-size: 26rpx;
    color: #666;
}

.action-handle {
    width: 180rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.action-text {
    font-size: 26rpx;
    color: #2196f3;
}

/* 空状态样式 */
.empty-state {
    padding: 120rpx 0;
    text-align: center;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}
</style>