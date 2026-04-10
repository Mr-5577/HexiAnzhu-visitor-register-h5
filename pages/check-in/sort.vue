<template>
    <view class="container">
        <!-- 顶部查询条件 -->
        <view class="search-bar">
            <view class="search-row">
                <view class="selector-label">项目</view>
                <view class="search-item">
                    <picker mode="selector" :range="projectList" range-key="name" :value="selectedProjectIndex"
                        @change="onProjectChange" style="width: 100%;">
                        <view class="search-picker">
                            {{ selectedProject?.name || '请选择项目' }}
                            <view class="picker-arrow"></view>
                        </view>
                    </picker>
                </view>
                <view class="search-buttons">
                    <!-- <button class="reset-btn" @click="resetSort">重置</button> -->
                    <!-- <button class="search-btn" @click="handleSearch">查询</button> -->
                </view>
            </view>
        </view>
        <!-- 营销人员列表 -->
        <view class="list-section">
            <view class="list-wrapper" id="listWrapper">
                <view class="list-header">
                    <text class="header-item sort-header">序号</text>
                    <text class="header-item name-header">人员名称</text>
                    <text class="header-item team-header">团队名称</text>
                    <text class="header-item drag-header">拖动排序</text>
                </view>

                <view v-for="(item, index) in listData" :key="item.id" class="list-item">
                    <view class="sort-number">
                        <text class="sort-text">{{ index + 1 }}</text>
                    </view>

                    <view class="name-content">
                        <text class="name-text">{{ item.salerName }}</text>
                    </view>

                    <view class="team-content">
                        <text class="team-text">{{ item.teamName }}</text>
                    </view>

                    <view class="drag-handle">
                        <text class="drag-icon">☰</text>
                    </view>
                </view>
            </view>
            <!-- 空状态 -->
            <view v-if="listData.length === 0" class="empty-state">
                <text class="empty-text">暂无数据</text>
            </view>
        </view>
        <!-- 保存按钮 -->
        <view class="save-section">
            <button class="save-btn" @click="saveSort">保存排序</button>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import Sortable from 'sortablejs'
import { visitorRegisterApi } from '@/common/api.js'

// 项目列表
const projectList = ref([])
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
// 选中的项目索引
const selectedProjectIndex = ref(0)
const selectedProject = computed(() => projectList.value[selectedProjectIndex.value])
// 项目切换
const onProjectChange = (e) => {
    const index = e.detail.value
    selectedProjectIndex.value = index
    handleSearch()
}

// 重置查询
const resetSort = () => {
    // 重置项目为默认
    selectedProjectIndex.value = 0
    handleSearch()
}

// 查询
const handleSearch = () => {
    fetchSortList()
}

// 列表数据
const listData = ref([])
// 查询列表
const fetchSortList = async () => {
    const id = selectedProject.value?.id || ''
    if (!id) return
    listData.value = []
    try {
        const res = await visitorRegisterApi.getSalerList({ projId: id })
        if (res.code === 200) {
            listData.value = res.data || []
        }
    } catch (error) {
    }
}

let sortableInstance = null
const initSortable = () => {
    // 销毁旧实例
    destroySortable()
    const container = document.getElementById('listWrapper')
    if (container) {
        sortableInstance = new Sortable(container, {
            // 拖拽句柄（右侧的拖动图标）
            handle: '.drag-handle',
            // 指定可拖拽的元素
            draggable: '.list-item',
            // 动画效果
            animation: 300,
            // 移动端优化配置
            touchStartThreshold: 2,     // 防止误触
            scroll: true,               // 自动滚动
            scrollSensitivity: 30,      // 边缘滚动阈值
            scrollSpeed: 10,            // 滚动速度

            // 设置拖拽时排除表头
            filter: '.list-header',
            preventOnFilter: false,

            // 防止元素飞出屏幕
            preventOnFilter: false,
            fallbackClass: 'sortable-fallback',
            fallbackOnBody: false,  // 防止拖拽元素跑到 body 上
            fallbackTolerance: 0,

            // 设置拖拽时的样式
            ghostClass: 'sortable-ghost',    // 占位符样式
            dragClass: 'sortable-drag',      // 拖拽元素样式
            chosenClass: 'sortable-chosen',  // 选中元素样式

            // 拖拽开始回调
            onStart: () => {
                // console.log('开始拖拽')
            },
            // 拖拽结束回调
            onEnd: (evt) => {
                // 拖拽结束后更新数据顺序
                const oldIndex = evt.oldIndex - 1
                const newIndex = evt.newIndex - 1
                const item = listData.value.splice(oldIndex, 1)[0]
                listData.value.splice(newIndex, 0, item)
                // console.log('新顺序:', listData.value.map(i => i.name))
            },
            // 设置元素位置
            setData: (dataTransfer, dragEl) => {
                // dataTransfer.effectAllowed = 'move'
            },
            onUpdate: (evt) => {
                // console.log('拖拽更新', evt)
            },
            onMove: (evt) => {
                // console.log('拖拽移动', evt)
            },
            onFilter: (evt) => {
                // console.log('拖拽过滤', evt)
            },
            onChoose: (evt) => {
                // console.log('拖拽选中', evt)
            }
        })
    }
}
// 销毁 SortableJS 实例
const destroySortable = () => {
    if (sortableInstance) {
        sortableInstance.destroy()
        sortableInstance = null
        console.log('SortableJS 已销毁')
    }
}

// 保存排序
const saveSort = async () => {
    try {
        let params = []
        listData.value.forEach((item, index) => {
            params.push({
                id: item.id,
                absort: index + 1
            })
        })
        const res = await visitorRegisterApi.batchSaveSalerAbsort({ salerList: params })
        if (res.code === 200) {
            uni.showToast({
                title: `${res.message || '保存成功!'}`,
                icon: 'none'
            })
            fetchSortList()
        }
    } catch (error) {
    }
}

onMounted(async () => {
    await fetchGetProjList()
    await fetchSortList()
    initSortable()
})

onUnmounted(() => {
    destroySortable()
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
    padding: 20rpx;
    box-sizing: border-box;
    background: #f5f5f5;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    // 防止拖拽时页面滚动
    touch-action: pan-y; // 允许垂直滚动，但会优化拖拽
}

/* 查询条件样式 */
.search-bar {
    background-color: #fff;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;

    .search-row {
        display: flex;
        align-items: center;
        gap: 20rpx;

        .selector-label {
            font-size: 28rpx;
            color: #808080;
            flex-shrink: 0; // 防止标签被压缩
        }

        .search-item {
            flex: 1;
            display: flex;
            align-items: center;
            background-color: #ffffff;
            border-radius: 12rpx;
            gap: 16rpx;

            .search-picker {
                flex: 1;
                width: 100%;
                height: 64rpx;
                line-height: 64rpx;
                border: 1rpx solid #e4e7ed;
                background-color: #f8f9fc;
                border-radius: 12rpx;
                padding: 0 20rpx;
                font-size: 28rpx;
                color: #808080;
                display: flex;
                align-items: center;
                justify-content: space-between; // 让文字和箭头分布在两端
                overflow: hidden; // 防止内容溢出
                text-overflow: ellipsis; // 文字过长时显示省略号
                white-space: nowrap;

                .picker-arrow {
                    width: 0;
                    height: 0;
                    border-left: 10rpx solid transparent;
                    border-right: 10rpx solid transparent;
                    border-top: 12rpx solid #909399;
                    flex-shrink: 0; // 箭头不被压缩
                }
            }
        }
    }

    .search-buttons {
        display: flex;
        gap: 20rpx;

        .reset-btn,
        .search-btn {
            width: 140rpx;
            height: 60rpx;
            line-height: 60rpx;
            font-size: 28rpx;
            border-radius: 12rpx;
            border: none;
            padding: 0;
            margin: 0;

            &::after {
                border: none;
                height: 56rpx;
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

// 列表样式
.list-section {
    border-radius: 16rpx;
    overflow: hidden;
    padding: 12rpx 0;
    box-sizing: border-box;
    border-radius: 20rpx;
    overflow-y: auto;
    flex: 1;

    .list-header {
        display: flex;
        background: #fafafa;
        padding: 12rpx 16rpx;
        border-bottom: 1rpx solid #f0f0f0;
    }

    .header-item {
        font-size: 26rpx;
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
        width: 240rpx;
    }

    .drag-header {
        width: 120rpx;
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
        width: 240rpx;
    }

    .team-text {
        font-size: 26rpx;
        color: #666;
    }

    .drag-handle {
        width: 120rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        touch-action: none; // 关键：禁用触摸滚动，让拖拽手柄完全控制拖拽
        user-select: none;
        -webkit-user-select: none;

        &:active {
            cursor: grabbing;
        }
    }

    .drag-icon {
        font-size: 40rpx;
        color: #999;
        font-weight: 300;
    }
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

/* 保存按钮样式 */
.save-section {
    flex-shrink: 0;
    background: transparent;
    padding: 20rpx 30rpx;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.save-btn {
    width: 50%;
    height: 72rpx;
    background: linear-gradient(135deg, #007AFF, #0056b3);
    border-radius: 44rpx;
    border: none;
    font-size: 30rpx;
    font-weight: 500;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    transition: all 0.3s ease;

    &:active {
        transform: scale(0.98);
        opacity: 0.9;
    }
}

/* SortableJS 样式 */
.sortable-ghost {
    opacity: 0.4;
    background: #e3f2fd;
    border: 1rpx dashed #2196f3;
}

.sortable-chosen {
    background: #f8f9ff;
}

.sortable-drag {
    opacity: 0.8;
    transform: scale(1.02);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
    cursor: grabbing !important;
}
</style>