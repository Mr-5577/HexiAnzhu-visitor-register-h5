<template>
    <view class="container">
        <!-- 顶部项目下拉选择框 -->
        <view class="selector-wrapper">
            <view class="selector-label">项目</view>
            <picker mode="selector" :range="projectList" :range-key="'name'" @change="onProjectChange"
                :value="selectedIndex" class="picker-custom">
                <view class="picker-content">
                    {{ currentProject ? currentProject.name : '请选择项目' }}
                    <view class="picker-arrow"></view>
                </view>
            </picker>
        </view>
        <view class="list-container">
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
                    <view v-for="(item, index) in filterSalerList" :key="item.id" class="list-item">
                        <view class="sort-number">
                            <text class="sort-text">{{ index + 1 }}</text>
                        </view>

                        <view class="name-content">
                            <text class="name-text">{{ item.salerName }}</text>
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
                <view v-if="filterSalerList.length === 0" class="empty-state">
                    <image src="/static/empty.png" mode="aspectFit" class="empty-image" />
                    <text class="empty-text">暂无数据</text>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { visitorRegisterApi } from '@/common/api.js'

// 项目列表
const projectList = ref([])
// 当前选中的项目索引
const selectedIndex = ref(0)
// 当前选中的项目
const currentProject = computed(() => projectList.value[selectedIndex.value])
// 获取项目数据
const fetchGetProjList = async () => {
    try {
        const res = await visitorRegisterApi.getProjList({ isAll: false })
        if (res.code === 200) {
            const data = res.data || []
            const newData = data.map((item) => {
                return {
                    ...item,
                    id: item.projId,
                    name: item.projName
                }
            })
            projectList.value = newData
        }
    } catch (error) {
        projectList.value = []
    }
}
// 项目切换处理
const onProjectChange = (e) => {
    selectedIndex.value = e.detail.value
    setTimeout(() => {
        fetchGetSalerList()
    }, 100)
}
// 列表数据
const salerList = ref([])
// 过滤出已签到的数据，lastSignStatus  0 未签到，1 已签到，2 已签退
const filterSalerList = computed(() => salerList.value.filter((item) => item.lastSignStatus == 1))
// 获取置业顾问
const fetchGetSalerList = async () => {
    try {
        const res = await visitorRegisterApi.getSalerList({ projId: currentProject.value.projId })
        if (res.code === 200) {
            salerList.value = res.data || []
        }
    } catch (error) {
        salerList.value = []
    }
}
// 强制签退处理函数
const handleForceSignOut = (item) => {
    uni.showModal({
        title: '提示',
        content: `确认强制签退 ${item.salerName} 吗？`,
        success: (res) => {
            if (res.confirm) {
                fetchSignOut(item)
            }
        }
    })
}
// 签退请求
const fetchSignOut = (item) => {
    uni.showLoading({ title: '签退中...' })
    visitorRegisterApi.setSignOut({ id: item.id }).then((res) => {
        if (res.code === 200) {
            uni.hideLoading()
            uni.showToast({
                title: '签退成功！',
                icon: 'success'
            })
            // 重新获取数据
            fetchGetSalerList()
        }
    }).catch(() => {
        uni.hideLoading()
    })
}

onMounted(async () => {
    // 先获取项目
    await fetchGetProjList()
    await fetchGetSalerList()
})
onUnmounted(() => {
    selectedIndex.value = 0
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

/* 下拉选择器样式 */
.selector-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    background-color: #ffffff;
    border-radius: 12rpx;
    padding: 20rpx 30rpx;
    margin-bottom: 20rpx;
    gap: 20rpx;

    .selector-label {
        font-size: 28rpx;
        color: #808080;
        flex-shrink: 0; // 防止标签被压缩
    }

    // 给 picker 组件设置 flex: 1 占满剩余宽度
    .picker-custom {
        flex: 1;
        min-width: 0; // 防止 flex 子元素溢出
    }

    .picker-content {
        width: 100%; // 占满父级宽度
        height: 64rpx;
        line-height: 64rpx;
        background-color: #f8f9fc;
        border-radius: 12rpx;
        padding: 0 32rpx; // 修改 padding，只保留左右内边距
        font-size: 28rpx;
        color: #808080;
        display: flex;
        align-items: center;
        justify-content: space-between; // 让文字和箭头分布在两端
        gap: 16rpx;
        border: 1rpx solid #e4e7ed;
        box-sizing: border-box;
        overflow: hidden; // 防止内容溢出
        text-overflow: ellipsis; // 文字过长时显示省略号
        white-space: nowrap;
    }

    .picker-arrow {
        width: 0;
        height: 0;
        border-left: 10rpx solid transparent;
        border-right: 10rpx solid transparent;
        border-top: 12rpx solid #909399;
        flex-shrink: 0; // 箭头不被压缩
    }
}

.list-container {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-radius: 20rpx;

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
        border-radius: 20rpx;
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
}
</style>