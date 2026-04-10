<template>
    <view class="qrcode-container">
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

        <!-- 二维码展示区域 -->
        <view class="qrcode-wrapper">
            <view class="qrcode-card">
                <image v-if="qrcodeUrl" :src="qrcodeUrl" class="qrcode-image" mode="aspectFit"></image>
                <view v-else class="qrcode-placeholder">
                    <text class="placeholder-text">{{ qrMessage }}</text>
                </view>
            </view>
            <view class="qrcode-tip">
                <text class="tip-title">扫码签到</text>
                <text class="tip-title marginLeft">1. 选择项目生成二维码</text>
                <text class="tip-title marginLeft">2. 使用企业微信扫码签到</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import QRCode from 'qrcode';
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { visitorRegisterApi } from '@/common/api.js'
import config from '@/utils/config.js'

// 项目列表
const projectList = ref([])
// 当前选中的项目索引
const selectedIndex = ref(0)
// 当前选中的项目
const currentProject = computed(() => projectList.value[selectedIndex.value])
// 获取项目数据
const fetchGetProjList = async () => {
    try {
        const res = await visitorRegisterApi.getProjList({ isAll: true })
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
            // 默认选中第一个项目并生成二维码
            if (newData.length > 0) {
                selectedIndex.value = 0
                await refreshQRCode()
            }
        }
    } catch (error) {
        projectList.value = []
    }
}
// 二维码URL
const qrcodeUrl = ref('')
const qrMessage = ref('二维码生成中...')
let autoRefreshTimer = null

// 获取当前时间距离下一个半小时的延迟时间
const getNextHalfHourDelay = () => {
    const now = new Date()
    const minutes = now.getMinutes()
    const nextBoundary = new Date(now)
    if (minutes < 30) {
        // minutes < 30 → 刷新到本小时的 xx:30
        nextBoundary.setMinutes(30, 0, 0)
    } else {
        // minutes >= 30 → 统一设置到下一小时的00分
        nextBoundary.setHours(now.getHours() + 1, 0, 0, 0)
    }
    return nextBoundary.getTime() - now.getTime()
}
// 清除自动刷新定时器
const clearAutoRefresh = () => {
    if (autoRefreshTimer) {
        clearTimeout(autoRefreshTimer)
        autoRefreshTimer = null
    }
}
// 自动刷新二维码
const scheduleAutoRefresh = () => {
    clearAutoRefresh()
    const delay = Math.max(0, getNextHalfHourDelay())
    autoRefreshTimer = setTimeout(async () => {
        await refreshQRCode()
    }, delay)
}

// 自动登录页面路径
// const originUrl = 'http://sysa.hexianzhu.com/pages/login/autoLogin'
const originUrl = `${config.baseUrlActual}/pages/login/autoLogin`
// 签到页面路径
// const originUrl = `http://sysa.hexianzhu.com/pages/check-in/sginIn`
// const originUrl = `${config.baseUrlActual}/pages/check-in/sginIn`
// 生成二维码 
const generateQRCode = async (project) => {
    if (!project?.projId || !project?.projName) {
        qrMessage.value = '没有项目信息'
        return
    }
    qrMessage.value = '二维码生成中...'
    qrcodeUrl.value = '' // 清空旧二维码
    try {
        const { projId } = project
        // 增加时间戳，二维码只保留半个小时，自动登录页面需要处理是否过期问题
        const timestamp = Date.now()
        const params = new URLSearchParams({
            toPath: `/pages/check-in/sginIn?projId=${projId}`, // 将要跳转的页面路径，此处为 签到页面路径
            t: timestamp
        })
        const qrContent = `${originUrl}?${params.toString()}`
        // const qrContent = `${originUrl}?projId=${projId}`
        const apiUrl = await QRCode.toDataURL(qrContent, {
            width: 200,
            margin: 2,
            errorCorrectionLevel: 'M' // 添加纠错级别
        })
        qrcodeUrl.value = apiUrl
        qrMessage.value = '' // 清空提示信息
    } catch (error) {
        qrMessage.value = '二维码生成失败！'
        qrcodeUrl.value = ''
    }
}

// 项目切换处理
const onProjectChange = async (e) => {
    selectedIndex.value = e.detail.value
    await refreshQRCode()
}

// 刷新二维码
const refreshQRCode = async () => {
    if (!currentProject.value) {
        qrcodeUrl.value = ''
        qrMessage.value = '请选择项目！'
        clearAutoRefresh()
        return
    }
    try {
        uni.showLoading({ title: '二维码生成中...' })
        await generateQRCode(currentProject.value)
    } catch (error) {
        qrMessage.value = '二维码生成失败'
    } finally {
        uni.hideLoading()
        scheduleAutoRefresh()
    }
}

onMounted(async () => {
    await fetchGetProjList()
})
onUnmounted(() => {
    clearAutoRefresh()
})
</script>

<style scoped lang="scss">
page {
    width: 100%;
    height: 100%;
}

.qrcode-container {
    height: 100%;
    background: linear-gradient(135deg, #f5f7fa 0%, #e9edf2 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
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

    .picker-content span {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
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

/* 二维码卡片区域 */
.qrcode-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24rpx 30rpx;
    box-sizing: border-box;
    background-color: #ffffff;
    border-radius: 20rpx;
    flex: 1;
}

.qrcode-card {
    padding: 40rpx 40rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    max-width: 500rpx;
    transition: transform 0.2s;
}

.qrcode-image {
    width: 400rpx;
    height: 400rpx;
    border-radius: 24rpx;
    background-color: #fafafa;
    box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
}

.qrcode-placeholder {
    width: 400rpx;
    height: 400rpx;
    background-color: #f8f9fc;
    border-radius: 24rpx;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20rpx;
    border: 2rpx dashed #dcdfe6;
}

.placeholder-text {
    font-size: 28rpx;
    color: #909399;
    text-align: center;
    padding: 0 30rpx;
}

.qrcode-tip {
    width: 400rpx;
    display: flex;
    flex-direction: column;
    margin-top: 30rpx;
    gap: 8rpx;

    .tip-title {
        font-size: 26rpx;
        color: #909399;
    }

    .marginLeft {
        margin-left: 40rpx;
    }
}
</style>