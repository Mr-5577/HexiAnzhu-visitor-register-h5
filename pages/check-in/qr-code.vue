<template>
    <view class="qrcode-container">
        <!-- 顶部项目下拉选择框 -->
        <view class="selector-wrapper">
            <view class="selector-label">项目</view>
            <CustomPicker v-model="selectedProjectId" :options="projectList" label-key="name" value-key="id"
                placeholder="请选择项目" :spaceBetween="true" @change="onProjectChange" />
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
                <text class="tip-title marginLeft">3. 长按可保存二维码图片</text>
            </view>
            <!-- <view class="saveQrCode" @click="saveQRCode">保存二维码</view> -->
        </view>
    </view>
</template>

<script setup>
import QRCode from 'qrcode';
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { visitorRegisterApi } from '@/common/api.js'
import config from '@/utils/config.js'
import CustomPicker from '@/components/custom-picker/index.vue'

// 项目列表
const projectList = ref([])
// 当前选中的项目ID
const selectedProjectId = ref('')
// 当前选中的项目
const currentProject = computed(() => {
    return projectList.value.find(item => item.id === selectedProjectId.value) || null
})

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
                selectedProjectId.value = newData[0].id
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
// const originUrl = `${config.baseUrlActual}/pages/login/autoLogin`
const originUrl = `http://192.168.1.24:8099/pages/check-in/index`
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
        const { projId, projName } = project
        // 增加时间戳，二维码只保留半个小时，自动登录页面需要处理是否过期问题
        const timestamp = Date.now()
        // const timestamp = 1776236118931 // 2026-04-15 14:55:40
        const params = new URLSearchParams({
            toPath: `/pages/check-in/sginIn?projId=${projId}`, // 将要跳转的页面路径，此处为 签到页面路径
            t: timestamp
        })
        const qrContent = `${originUrl}?${params.toString()}`
        // const qrContent = `${originUrl}?projId=${projId}`
        const apiUrl = await QRCode.toDataURL(qrContent, {
            width: 200,
            margin: 2,
            errorCorrectionLevel: 'M'
        })
        // qrcodeUrl.value = apiUrl

        // 使用 Canvas 添加项目名称
        const finalImage = await addProjectNameToQR(apiUrl, projName)
        qrcodeUrl.value = finalImage
        qrMessage.value = '' // 清空提示信息
    } catch (error) {
        qrMessage.value = '二维码生成失败！'
        qrcodeUrl.value = ''
    }
}

// 在二维码下方添加项目名称
const addProjectNameToQR = (qrBase64, projName) => {
    return new Promise((resolve, reject) => {
        // #ifdef H5
        // H5 端使用 HTML5 Canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        img.onload = () => {
            // 设置 Canvas 尺寸：二维码 200x200 + 文字区域 + 顶部留白
            const qrSize = 200
            const textHeight = 40
            const topPadding = 30  // 顶部留白
            const bottomPadding = 20  // 底部留白
            canvas.width = qrSize
            canvas.height = qrSize + textHeight + topPadding + bottomPadding
            
            // 绘制白色背景
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            // 绘制二维码（从顶部留白位置开始）
            ctx.drawImage(img, 0, topPadding, qrSize, qrSize)
            
            // 绘制项目名称
            ctx.fillStyle = '#333333'
            ctx.font = '20px Arial'
            ctx.textAlign = 'center'
            ctx.fillText(projName, canvas.width / 2, topPadding + qrSize + textHeight)
            
            // 导出为 base64
            const finalBase64 = canvas.toDataURL('image/png')
            resolve(finalBase64)
        }
        
        img.onerror = reject
        img.src = qrBase64
        // #endif
        
        // #ifndef H5
        // App/小程序端使用 uni-app Canvas API
        const ctx = uni.createCanvasContext('qr-canvas', this)
        const qrSize = 200
        const textHeight = 40
        const padding = 20
        
        // 这里需要先将 base64 转换为临时图片路径，然后绘制
        // 由于 uni-app Canvas API 较为复杂，这里简化处理
        // 实际项目中可能需要使用第三方库或更复杂的 Canvas 操作
        resolve(qrBase64) // 暂时返回原二维码，后续扩展
        // #endif
    })
}

// 项目切换处理
const onProjectChange = async (value, selectedItem) => {
    selectedProjectId.value = value
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

// 保存二维码到本地
const saveQRCode = () => {
    if (!qrcodeUrl.value) {
        uni.showToast({
            title: '二维码未生成',
            icon: 'none'
        })
        return
    }

    // #ifdef H5
    // H5 端：下载二维码图片
    try {
        const link = document.createElement('a')
        link.href = qrcodeUrl.value
        link.download = `qrcode_${currentProject.value?.projName || 'project'}_${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        uni.showToast({
            title: '下载成功',
            icon: 'success'
        })
    } catch (error) {
        uni.showToast({
            title: '下载失败',
            icon: 'none'
        })
    }
    // #endif

    // #ifndef H5
    // App、小程序端：保存到相册
    uni.showLoading({ title: '保存中...' })
    try {
        // 获取文件系统管理器
        const fs = uni.getFileSystemManager()
        // 生成临时文件路径
        const tempFilePath = `${wx.env.USER_DATA_PATH}/qrcode_${Date.now()}.png`
        // 移除 base64 前缀
        const base64Data = qrcodeUrl.value.replace(/^data:image\/png;base64,/, '')
        // 写入临时文件
        fs.writeFileSync(tempFilePath, base64Data, 'base64')
        // 保存到相册
        uni.saveImageToPhotosAlbum({
            filePath: tempFilePath,
            success: () => {
                uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                })
            },
            fail: (err) => {
                console.error('保存失败:', err)
                uni.showToast({
                    title: '保存失败，请检查相册权限',
                    icon: 'none'
                })
            }
        })
    } catch (error) {
        console.error('保存过程出错:', error)
        uni.showToast({
            title: '保存失败',
            icon: 'none'
        })
    } finally {
        uni.hideLoading()
    }
    // #endif
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
    padding: 30rpx 30rpx;
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
    // background-color: #fafafa;
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

.saveQrCode {
    width: 400rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    font-size: 32rpx;
    font-weight: 500;
    border-radius: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 40rpx;
    box-shadow: 0 8rpx 16rpx rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;

    &:active {
        transform: scale(0.96);
        opacity: 0.9;
    }
}
</style>