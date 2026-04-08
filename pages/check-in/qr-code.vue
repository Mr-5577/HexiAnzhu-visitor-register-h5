<template>
    <view class="qrcode-container">
        <!-- 顶部项目下拉选择框 -->
        <view class="selector-wrapper">
            <view class="selector-label">选择项目</view>
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
import { onShow, onHide } from '@dcloudio/uni-app'
import { ref, computed, onUnmounted, onMounted } from 'vue'
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
        const res = await visitorRegisterApi.getProjList()
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
                refreshQRCode()
            }
        }
    } catch (error) {
        projectList.value = []
    }
}
// 二维码URL
const qrcodeUrl = ref('')
const qrMessage = ref('二维码生成中...')
// 自动登录页面路径
// const originUrl = 'http://sysa.hexianzhu.com/pages/login/autoLogin'
// 签到页面路径
const originUrl = 'http://sysa.hexianzhu.com/pages/check-in/sginIn'
// 生成二维码 
const generateQRCode = async (project) => {
    if (!project?.projId || !project?.projName) {
        qrMessage.value = '没有项目信息'
        return
    }
    qrMessage.value = '二维码生成中...'
    qrcodeUrl.value = '' // 清空旧二维码
    try {
        const { projId, projName } = project
        const timestamp = Date.now()
        const params = new URLSearchParams({
            projectId: projId,
            projectName: projName,
            t: timestamp
        })
        const qrContent = `${originUrl}?${params.toString()}`
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
        return
    }
    uni.showLoading({ title: '二维码生成中...' })
    // 生成二维码
    await generateQRCode(currentProject.value)
    uni.hideLoading()
}

onShow(async () => {
    await fetchGetProjList()
})
onHide(() => {
})
onUnmounted(() => {
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
    margin-bottom: 40rpx;
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