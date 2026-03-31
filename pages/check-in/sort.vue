<template>
    <view class="container">
        <!-- 顶部查询条件 -->
        <view class="search-bar">
            <view class="search-row">
                <view class="search-item">
                    <picker mode="selector" :range="projectList" range-key="name" :value="selectedProjectIndex"
                        @change="onProjectChange" style="width: 100%;">
                        <view class="search-picker">
                            {{ selectedProjectName || '请选择项目' }}
                        </view>
                    </picker>
                </view>

                <view class="search-item">
                    <picker mode="selector" :range="sortTypeList" :value="selectedSortType" @change="onSortTypeChange"
                        style="width: 100%;">
                        <view class="search-picker">
                            {{ sortTypeList[selectedSortType] }}
                        </view>
                    </picker>
                </view>
            </view>
            <view class="search-buttons">
                <button class="reset-btn" @click="resetSort">重置</button>
                <button class="search-btn" @click="handleSearch">查询</button>
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

                    <view class="drag-handle">
                        <text class="drag-icon">☰</text>
                    </view>
                </view>
            </view>
            <!-- 空状态 -->
            <view v-if="list.length === 0" class="empty-state">
                <text class="empty-text">暂无数据</text>
            </view>
        </view>
        <!-- 保存按钮 -->
        <view class="save-section">
            <button class="save-btn" @click="saveSortOrder">保存排序</button>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import Sortable from 'sortablejs'

// 项目列表
const projectList = ref([
    { id: 1, name: '阳光花园项目' },
    { id: 2, name: '滨海新城项目' },
    { id: 3, name: '中央公园项目' },
    { id: 4, name: '翡翠湾项目' }
])
// 选中的项目索引
const selectedProjectIndex = ref(0)
const selectedProjectName = computed(() => projectList.value[selectedProjectIndex.value]?.name)
// 项目切换
const onProjectChange = (e) => {
    const index = e.detail.value
    selectedProjectIndex.value = index
}

// 排序类型列表
const sortTypeList = ref(['默认排序', '手动排序'])
// 选中的排序类型
const selectedSortType = ref(0)
// 排序类型切换
const onSortTypeChange = (e) => {
    const index = e.detail.value
    selectedSortType.value = index
}

// 重置查询
const resetSort = () => {
    // 重置项目、排序类型为默认
    selectedSortType.value = 0
    selectedProjectIndex.value = 0
}

// 查询
const handleSearch = () => {
}


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
                console.log('开始拖拽')
            },
            // 拖拽结束回调
            onEnd: (evt) => {
                // 拖拽结束后更新数据顺序
                // const item = list.value.splice(evt.oldIndex, 1)[0]
                // list.value.splice(evt.newIndex, 0, item)
                console.log('新顺序:', list.value.map(i => i.name))
            },
            // 设置元素位置
            setData: (dataTransfer, dragEl) => {
                // dataTransfer.effectAllowed = 'move'
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
const saveSortOrder = async () => { }

onMounted(() => {
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

// 列表样式
.list-section {
    border-radius: 16rpx;
    overflow: hidden;
    padding: 12rpx 20rpx;
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
    padding: 20rpx 30rpx 40rpx;
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