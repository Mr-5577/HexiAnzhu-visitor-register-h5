<template>
    <view class="customer-container">
        <!-- 顶部查询条件 -->
        <view class="search-bar">
            <view class="query-info-content">
                <view class="title">项目</view>
                <picker mode="selector" :range="projectList" style="width: 100%;" range-key="name"
                    @change="handleProjectChange">
                    <view class="pro-picker">
                        {{ searchForm.visitProjName || '请选择项目' }}
                        <!-- <uni-icons type="closeempty" size="14" color="#999" v-show="searchForm.visitProjName"
                            @click.stop="handleProjectClear"></uni-icons> -->
                    </view>
                </picker>
            </view>
            <view class="filter-icon" @click="openSearchPopup">
                <text class="search-text">更多筛选</text>
                <view class="picker-arrow"></view>
            </view>
        </view>

        <!-- 表单内容 -->
        <scroll-view class="customer-list" scroll-y>
            <view v-if="recordList.length > 0" class="list-container">
                <view v-for="(item, index) in recordList" :key="index" class="record-item">
                    <!-- 复选框 -->
                    <view class="checkbox-wrapper" @click.stop="toggleSelect(item.id)">
                        <view :class="['checkbox', selectedIds.includes(item.id) ? 'checked' : '']">
                            <text v-if="selectedIds.includes(item.id)" class="checkmark">✓</text>
                        </view>
                    </view>

                    <!-- 内容区域 -->
                    <view class="item-content" @click="viewDetail(item)">
                        <view class="info-row">
                            <text class="info-label">客户名称：</text>
                            <text class="info-value">{{ item.custName }}</text>
                        </view>
                        <view class="info-row">
                            <text class="info-label">客户电话：</text>
                            <text class="info-value">{{ item.custTel }}</text>
                        </view>
                        <view class="info-row">
                            <text class="info-label">客户电话2：</text>
                            <text class="info-value">{{ item.custTel2 }}</text>
                        </view>
                        <view class="info-row">
                            <text class="info-label">到访方式：</text>
                            <text class="info-value">{{ getTextRect(item.visitTypeId) }}</text>
                        </view>
                        <view class="info-row">
                            <text class="info-label">置业顾问：</text>
                            <text class="info-value">{{ getSalerTextRect(item.salerId) }}</text>
                        </view>
                        <view class="info-row">
                            <text class="info-label">来访时间：</text>
                            <text class="info-value">{{ item.visitTime }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 空状态 -->
            <view v-else class="empty-state">
                <image src="/static/empty.png" mode="aspectFit" class="empty-image" />
                <text class="empty-text">暂无数据</text>
            </view>
        </scroll-view>

        <!-- 底部操作栏 -->
        <view v-if="recordList.length > 0" class="bottom-bar">
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
                        <view v-for="(consultant, index) in salerList" :key="index" class="consultant-item"
                            :class="{ active: selectedConsultantId === consultant.salerId }"
                            @click="selectConsultant(consultant.salerId)">
                            <text class="consultant-name">{{ consultant.salerName }}</text>
                            <view class="check-icon"
                                :class="{ 'checked': selectedConsultantId === consultant.salerId }">
                                {{ selectedConsultantId === consultant.salerId ? '✓' : '○' }}
                            </view>
                        </view>
                    </view>
                </view>
                <view class="dialog-buttons">
                    <button class="cancel-btn" @click="closeAllocateDialog">取消</button>
                    <button class="confirm-btn" :disabled="isSubmitting" @click="confirmAllocate">确定分配</button>
                </view>
            </view>
        </view>

        <!-- 搜索弹窗组件 -->
        <uni-popup ref="searchPopupRef" type="right" background-color="#fff" border-radius="15rpx 0 0 15rpx"
            :is-mask-click="false" @maskClick="closeSearch">
            <view class="search-popup-form">
                <view class="form-container">
                    <view class="form-item">
                        <view class="item-label">项目</view>
                        <picker mode="selector" :range="projectList" range-key="name" @change="onProjectChange">
                            <view class="picker">
                                {{ tempSearchForm.visitProjName || '请选择项目' }}
                                <!-- <uni-icons type="closeempty" size="14" color="#999"
                                    v-show="tempSearchForm.visitProjName" @click.stop="clearTempProject"></uni-icons> -->
                            </view>
                        </picker>
                    </view>
                    <view class="form-item">
                        <view class="item-label">来访日期</view>
                        <picker mode="date" style="width: 100%;" :value="tempSearchForm.visitDate"
                            @change="onTempDateChange">
                            <view class="picker">
                                {{ tempSearchForm.visitDate || '来访日期' }}
                                <uni-icons type="closeempty" size="14" color="#999" v-show="tempSearchForm.visitDate"
                                    @click.stop="tempSearchForm.visitDate = ''"></uni-icons>
                            </view>
                        </picker>
                    </view>
                    <view class="form-item">
                        <view class="item-label">客户姓名</view>
                        <input class="input" v-model="tempSearchForm.custName" placeholder="请输入客户姓名" maxlength="20" />
                    </view>
                    <view class="form-item">
                        <view class="item-label">客户电话</view>
                        <input class="input" v-model="tempSearchForm.custTel" placeholder="请输入客户电话" />
                    </view>
                    <view class="form-item query-action">
                        <button class="cancel-btn" @click="closeSearch">取消</button>
                        <button class="query-btn" @click="handleSearch">查询</button>
                    </view>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script setup>
import { onShow, onHide } from '@dcloudio/uni-app'
import { ref, computed, onMounted } from 'vue'
import { visitorRegisterApi } from '@/common/api.js'
import { transformData } from '@/utils/common.js'

// 查询表单
const searchForm = ref({
    visitProjId: '',
    visitProjName: '',
    visitDate: '',
    custName: '',
    custTel: ''
})

// 临时搜索表单（弹窗中使用的副本）
const tempSearchForm = ref({
    visitProjId: '',
    visitProjName: '',
    visitDate: '',
    custName: '',
    custTel: ''
})
const isSubmitting = ref(false)
// 数据列表
const recordList = ref([])
// 项目数据
const projectList = ref([])
// 来访方式
const visitMethodList = ref([])
// 置业顾问
const salerList = ref([])
// 选中的ID列表
const selectedIds = ref([])
// 搜索弹窗引用
const searchPopupRef = ref(null)
// 重新分配弹窗控制
const showAllocate = ref(false)
const selectedConsultantId = ref(null)

// 是否全选
const isAllSelected = computed(() => {
    return recordList.value.length > 0 &&
        selectedIds.value.length === recordList.value.length
})

// 项目切换
const handleProjectChange = async (e) => {
    const index = e.detail.value
    searchForm.value.visitProjId = projectList.value[index].id
    searchForm.value.visitProjName = projectList.value[index].name
    selectedIds.value = []
    await fetchGetSalerList() // 重新获取置业顾问列表
    getRecordList()
}

// 清空项目选择
const handleProjectClear = () => {
    searchForm.value.visitProjId = ''
    searchForm.value.visitProjName = ''
    selectedIds.value = []
    getRecordList()
}

// 打开搜索弹窗
const openSearchPopup = () => {
    tempSearchForm.value = {
        visitProjId: searchForm.value.visitProjId,
        visitProjName: searchForm.value.visitProjName,
        visitDate: searchForm.value.visitDate,
        custName: searchForm.value.custName,
        custTel: searchForm.value.custTel,
    }
    searchPopupRef.value?.open()
}

// 弹窗内项目选择
const onProjectChange = (e) => {
    const index = e.detail.value
    tempSearchForm.value.visitProjId = projectList.value[index].id
    tempSearchForm.value.visitProjName = projectList.value[index].name
}

// 清空弹窗内项目选择
const clearTempProject = () => {
    tempSearchForm.value.visitProjId = ''
    tempSearchForm.value.visitProjName = ''
}

// 弹窗内日期选择
const onTempDateChange = (e) => {
    tempSearchForm.value.visitDate = e.detail.value
}

// 关闭搜索弹窗
const closeSearch = () => {
    searchPopupRef.value?.close()
}

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
        selectedIds.value = recordList.value.map(item => item.id)
    }
}

// 查看详情
const viewDetail = (item) => {
    // 跳转到详情页面
    uni.navigateTo({
        url: `/pages/record/record-detail?id=${item?.id}`
    })
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
const confirmAllocate = async () => {
    if (isSubmitting.value) {
        return
    }
    if (!selectedConsultantId.value) {
        uni.showToast({
            title: '请选择置业顾问',
            icon: 'none'
        })
        return
    }
    isSubmitting.value = true
    try {
        uni.showLoading({ title: '分配中...' })
        const params = {
            visitRecIds: selectedIds.value || [], // 选中的来访记录数据
            salerId: selectedConsultantId.value // 置业顾问ID
        }
        const res = await visitorRegisterApi.batchResetSaler(params)
        // await new Promise(resolve => setTimeout(resolve, 500))
        uni.hideLoading()
        if (res.code === 200) {
            closeAllocateDialog() // 关闭选择顾问弹窗
            selectedConsultantId.value = null // 清除选中的置业顾问
            selectedIds.value = [] // 清除选中的客户数据
            getRecordList() // 重新获取列表
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

// 查询
const handleSearch = async () => {
    selectedIds.value = []
    // 将临时表单的值同步到主表单
    searchForm.value = {
        visitProjId: tempSearchForm.value.visitProjId,
        visitProjName: tempSearchForm.value.visitProjName,
        visitDate: tempSearchForm.value.visitDate,
        custName: tempSearchForm.value.custName,
        custTel: tempSearchForm.value.custTel,
    }
    searchPopupRef.value?.close()
    await fetchGetSalerList() // 重新获取置业顾问列表
    getRecordList()
}

// 获取来访方式显示文本
const getTextRect = (val) => {
    const target = visitMethodList.value.find((item) => item.id == val)
    return target?.name || ''
}

// 获取置业顾问显示文本
const getSalerTextRect = (val) => {
    const target = salerList.value.find((item) => item.salerId == val)
    return target?.salerName || '-'
}

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
            // 默认选中第一个项目
            if (newData.length > 0) {
                searchForm.value.visitProjId = newData[0].id
                searchForm.value.visitProjName = newData[0].name
            }
        }
    } catch (error) {
        projectList.value = []
    }
}

// 获取来访方式
const fetchGetVisitType = async () => {
    try {
        const res = await visitorRegisterApi.getVisitType()
        if (res.code === 200) {
            const data = res.data || []
            const [firstData, ...restData] = data
            const { optionStr, valueStr } = firstData || {}
            visitMethodList.value = transformData(optionStr, valueStr)
        }
    } catch (error) {
        visitMethodList.value = []
    }
}

// 获取置业顾问
const fetchGetSalerList = async () => {
    try {
        const res = await visitorRegisterApi.getSalerList({ projId: searchForm.value.visitProjId })
        if (res.code === 200) {
            const dataList = res.data || []
            salerList.value = dataList.map((item) => {
                return {
                    ...item,
                    name: item.salerName
                }
            })
        }
    } catch (error) {
        salerList.value = []
    }
}

// 获取记录列表
const getRecordList = async () => {
    uni.showLoading({ title: '分配中...' })
    recordList.value = []
    try {
        uni.showLoading({
            title: '获取数据中...',
            mask: true,
        });
        let params = {
            projId: searchForm.value.visitProjId,
            custName: searchForm.value.custName,
            custTel: searchForm.value.custTel,
        }
        if (searchForm.value.visitDate) {
            params.visitTimeStart = `${searchForm.value.visitDate} 00:00:00`
            params.visitTimeEnd = `${searchForm.value.visitDate} 23:59:59`
        }
        const res = await visitorRegisterApi.getVisitHis(params)
        uni.hideLoading()
        if (res.code === 200) {
            const data = res.data || []
            recordList.value = data
        }
    } catch (error) {
        console.error('获取记录列表失败:', error)
        uni.hideLoading()
    } finally {
    }
}

// 重置搜索表单
const resetData = () => {
    selectedIds.value = []
    searchForm.value = {
        visitProjId: '',
        visitProjName: '',
        visitDate: '',
        custName: '',
        custTel: '',
    }
    tempSearchForm.value = {
        visitProjId: '',
        visitProjName: '',
        visitDate: '',
        custName: '',
        custTel: '',
    }
    showAllocate.value = false
    selectedConsultantId.value = null
    searchPopupRef.value?.close()
}

// 页面显示时加载数据
onShow(async () => {
    await fetchGetProjList()
    await fetchGetVisitType()
    await fetchGetSalerList()
    await getRecordList()
})
onHide(() => {
    resetData()
})
onMounted(async () => {
    // await fetchGetProjList()
    // await fetchGetVisitType()
    // await fetchGetSalerList()
    // await getRecordList()
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
    padding: 20rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    gap: 20rpx;

    .query-info-content {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 30rpx;
        min-width: 0;

        .title {
            font-size: 28rpx;
            color: #666;
            width: 120rpx;
            text-align: right;
        }

        .pro-picker {
            width: 100%;
            font-size: 28rpx;
            color: #999;
            padding: 8rpx 16rpx;
            box-sizing: border-box;
            height: 60rpx;
            display: flex;
            align-items: center;
            border: 1rpx solid #e0e0e0;
            border-radius: 12rpx;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    }

    .filter-icon {
        width: 150rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;

        .search-text {
            font-size: 28rpx;
            font-weight: bold;
            color: #409eff;
        }

        .picker-arrow {
            width: 0;
            height: 0;
            border-right: 10rpx solid transparent;
            border-bottom: 10rpx solid transparent;
            border-top: 10rpx solid transparent;
            border-left: 12rpx solid #409eff;
            flex-shrink: 0;
            margin-left: 6rpx;
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
                width: 156rpx;
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
    border-bottom: 1rpx solid #f0f0f0;
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
    z-index: 99;
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
                    color: #999;
                    font-size: 28rpx;
                    font-weight: bold;
                }

                .checked {
                    color: #007AFF;

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

// 搜索表单样式
.search-popup-form {
    width: 70vw;
    height: 100%;
    background: #fff;
    padding: 48rpx 40rpx;
    box-sizing: border-box;

    .form-container {
        display: flex;
        flex-direction: column;
        gap: 40rpx;

        .form-item {
            .item-label {
                font-size: 28rpx;
                color: #666;
                margin-bottom: 16rpx;
                font-weight: 500;
            }

            .picker {
                font-size: 28rpx;
                color: #999;
                padding: 8rpx 16rpx;
                box-sizing: border-box;
                height: 64rpx;
                display: flex;
                align-items: center;
                border: 1rpx solid #e0e0e0;
                border-radius: 12rpx;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }

            .input {
                flex: 1;
                font-size: 28rpx;
                color: #999;
                padding: 8rpx 16rpx;
                box-sizing: border-box;
                height: 64rpx;
                display: flex;
                align-items: center;
                border: 1rpx solid #e0e0e0;
                border-radius: 12rpx;

                .input-placeholder {
                    color: #999;
                    font-size: 28rpx;
                }
            }

            &.query-action {
                margin-top: 50rpx;
                display: flex;
                justify-content: space-between;
                gap: 24rpx;

                .cancel-btn,
                .query-btn {
                    height: 60rpx;
                    width: 150rpx;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 28rpx;
                    border-radius: 12rpx;
                    transition: all 0.3s ease;
                    margin: 0;
                }

                .cancel-btn {
                    background: #f8f8f8;
                    color: #666;
                }

                .query-btn {
                    background: linear-gradient(135deg, #409eff 0%, #626aef 100%);
                    color: #fff;
                }
            }
        }
    }
}
</style>