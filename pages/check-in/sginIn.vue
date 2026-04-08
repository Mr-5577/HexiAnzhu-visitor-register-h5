<template>
    <view class="container">
        <!-- 项目名称 -->
        <view class="project-card">
            <text class="project-name">{{ projectName }}</text>
        </view>

        <!-- 签到人信息 -->
        <view class="user-card">
            <view class="user-avatar">
                <text class="avatar-text">{{ userName.charAt(0) }}</text>
            </view>
            <view class="user-info">
                <text class="user-name">{{ userName }}</text>
                <text class="sign-time">登录时间：{{ signTime }}</text>
            </view>
        </view>

        <!-- 接待顺序 -->
        <view class="queue-card">
            <text class="queue-label">当前接待顺序</text>
            <text class="queue-number">{{ queueNumber }}</text>
        </view>

        <!-- 按钮区域 -->
        <view class="button-group">
            <button class="btn btn-signin" @click="handleSignIn">签到</button>
            <button class="btn btn-signout" @click="handleSignOut">签退</button>
        </view>
    </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import dayjs from 'dayjs'
import { visitorRegisterApi } from '@/common/api.js'

// 项目名称
const projectName = ref('')
// 签到人姓名
const userName = ref('张三')
// 签到时间
const signTime = ref('')
// 接待顺序
const queueNumber = ref(0)

// 更新时间
const updateSignTime = () => {
    signTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

// 获取接待顺序
const fetchQueueNumber = async (options) => {
    try {
        // 调用接口获取当前排队序号
        const res = await uni.request({
            url: '/api/queue/number',
            method: 'GET',
            data: {
                projectId: options.projectId
            }
        })
        if (res.data.code === 200) {
            queueNumber.value = res.data.data.queueNumber
        }
    } catch (error) {
        // 模拟数据
        queueNumber.value = Math.floor(Math.random() * 50) + 1
    }
}

// 签到
const handleSignIn = async () => {
    try {
        uni.showLoading({ title: '签到中...' })
        const res = await visitorRegisterApi.setSignIn({ id: '' })
        if (res.code === 200) {
            // 更新签到时间
            updateSignTime()
            // 签到成功后重新获取排队顺序
            fetchQueueNumber()
            setTimeout(() => {
                uni.hideLoading()
                uni.showToast({
                    title: '签到成功',
                    icon: 'success'
                })
            }, 500)
        }
    } catch (error) {
        uni.hideLoading()
    }
}

// 签退
const handleSignOut = () => {
    uni.showModal({
        title: '提示',
        content: '确认签退吗？',
        success: (res) => {
            if (res.confirm) {
                uni.showLoading({ title: '签退中...' })
                setTimeout(() => {
                    uni.hideLoading()
                    uni.showToast({
                        title: '签退成功',
                        icon: 'success'
                    })
                    // 签退后重置排队顺序
                    queueNumber.value = 0
                }, 500)
            }
        }
    })
}
// 签退请求
const fetchSignOut = () => {
    uni.showLoading({ title: '签退中...' })
    visitorRegisterApi.setSignOut({ id: '' }).then((res) => {
        if (res.code === 200) {
            uni.hideLoading()
            uni.showToast({
                title: '签退成功',
                icon: 'success'
            })
            // 签退后重置排队顺序
            queueNumber.value = 0
        }
    }).catch(() => {
        uni.hideLoading()
    })
}

// 获取URL参数
onLoad((options) => {
    // 从二维码获取项目名称
    projectName.value = decodeURIComponent(options.projectName || '测试项目')
    // 获取当前用户信息（从本地存储或登录信息获取）
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
        userName.value = userInfo.name || '未知用户'
    }
    // 获取当前时间
    updateSignTime()

    // 获取接待顺序（从接口获取）
    fetchQueueNumber(options)
})
</script>

<style lang="scss" scoped>
page {
    width: 100%;
    height: 100%;
    background: #f5f5f5;
}

.container {
    width: 100%;
    height: 100%;
    padding: 30rpx;
    box-sizing: border-box;
}

// 项目名称卡片
.project-card {
    background: #fff;
    border-radius: 8rpx;
    padding: 40rpx 30rpx;
    margin-bottom: 24rpx;
    padding: 30rpx;
    box-sizing: border-box;
}

// 项目名称卡片
.project-card {
    background: #fff;
    border-radius: 8rpx;
    padding: 40rpx 30rpx;
    margin-bottom: 24rpx;
    border: 1rpx solid #fbfbfb;

    .project-name {
        font-size: 32rpx;
        font-weight: normal;
        color: #333;
        line-height: 1.4;
    }
}

// 用户信息卡片
.user-card {
    background: #fff;
    border-radius: 8rpx;
    padding: 30rpx;
    margin-bottom: 24rpx;
    display: flex;
    align-items: center;
    border: 1rpx solid #fbfbfb;

    .user-avatar {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        // background: #e5e5e5;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        background: linear-gradient(135deg, #8598ec, #c189f8);

        .avatar-text {
            font-size: 36rpx;
            // color: #666;
            color: #fff;
            font-weight: normal;
        }
    }

    .user-info {
        flex: 1;

        .user-name {
            font-size: 32rpx;
            color: #333;
            display: block;
            margin-bottom: 12rpx;
        }

        .sign-time {
            font-size: 28rpx;
            color: #999;
        }
    }
}

// 接待顺序卡片
.queue-card {
    background: #fff;
    border-radius: 8rpx;
    padding: 40rpx 30rpx;
    margin-bottom: 40rpx;
    text-align: center;
    border: 1rpx solid #fbfbfb;

    .queue-label {
        font-size: 28rpx;
        color: #999;
        display: block;
        margin-bottom: 20rpx;
    }

    .queue-number {
        font-size: 80rpx;
        font-weight: normal;
        color: #333;
        margin: 0 8rpx;
    }
}

// 按钮区域
.button-group {
    display: flex;
    gap: 24rpx;

    .btn {
        flex: 1;
        height: 76rpx;
        line-height: 76rpx;
        border-radius: 10rpx;
        font-size: 30rpx;
        border: none;
        background: #fff;

        &::after {
            border: none;
        }

        &.btn-signin {
            background: linear-gradient(135deg, #52c41a, #389e0d);
            color: #fff;
            border: none;
        }

        &.btn-signout {
            background: linear-gradient(135deg, #ff4d4f, #cf1322);
            color: #fff;
            border: none;
        }

        &:active {
            opacity: 0.7;
        }
    }
}
</style>