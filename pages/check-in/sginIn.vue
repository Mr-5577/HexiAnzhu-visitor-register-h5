<template>
    <view class="container">
        <template v-if="userInfo.id">
            <!-- 项目名称 -->
            <view class="project-card">
                <text class="project-name">{{ userInfo.projName || '-' }}</text>
            </view>

            <!-- 签到人信息 -->
            <view class="user-card">
                <view class="user-avatar">
                    <text class="avatar-text">{{ userInfo.salerName ? userInfo.salerName.charAt(0) : '-' }}</text>
                </view>
                <view class="user-info">
                    <text class="user-name">{{ userInfo.salerName || '-' }}</text>
                    <text class="sign-time">登录时间：{{ signTime || '-' }}</text>
                </view>
            </view>

            <!-- 接待顺序 -->
            <view class="queue-card">
                <text class="queue-label">当前接待顺序</text>
                <text class="queue-number">{{ queueNumber || '-' }}</text>
            </view>

            <!-- 按钮区域 -->
            <view class="button-group">
                <button class="btn btn-signin" @click="handleSignIn">签到</button>
                <button class="btn btn-signout" @click="handleSignOut">签退</button>
            </view>
        </template>
        <view class="not-permission" v-else>
            <view class="empty-state">
                <text class="empty-title">暂无签到权限</text>
                <text class="empty-desc">您当前没有该项目的签到权限</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import dayjs from 'dayjs'
import { visitorRegisterApi } from '@/common/api.js'

// 用户信息
const userInfo = ref({})
// 登录时间
const signTime = ref('')
// 接待顺序
const queueNumber = ref(0)

// 更新时间
const updateSignTime = () => {
    signTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
}

// 获取用户信息
const getUserInfo = async (projId) => {
    try {
        const res = await visitorRegisterApi.getSalerInfo({ projId })
        if (res.code === 200) {
            userInfo.value = res.data || {}
        }
    } catch (error) {
    }
}
// 查询AB位列表
const fetchSortList = async () => {
    const projId = userInfo.value?.projId || ''
    const salerId = userInfo.value?.salerId || ''
    if (!projId || !salerId) {
        queueNumber.value = 0
        return
    }
    try {
        const res = await visitorRegisterApi.getSalerList({ projId: projId })
        if (res.code === 200) {
            const listData = res.data || []
            // 获取已签到列表
            const signedList = listData.filter(item => item.lastSignStatus === 1)
            // 找到当前用户在已签到列表中的位置
            const indexInSigned = signedList.findIndex(item => item.salerId === salerId)
            // 排名 = 索引 + 1（找不到为0）
            queueNumber.value = indexInSigned !== -1 ? indexInSigned + 1 : 0
        }
    } catch (error) {
        queueNumber.value = 0
    }
}
// 签到
const handleSignIn = async () => {
    if (!userInfo.value.id) {
        uni.showToast({
            title: '用户信息异常，无用户ID',
            icon: 'none'
        })
        return
    }
    try {
        uni.showLoading({ title: '签到中...' })
        const res = await visitorRegisterApi.setSignIn({ id: userInfo.value.id })
        if (res.code === 200) {
            // 更新签到时间
            updateSignTime()
            uni.hideLoading()
            uni.showToast({
                title: '签到成功',
                icon: 'success'
            })
            // 获取置业顾问列表并查询最新的排序
            fetchSortList()
        } else {
            uni.hideLoading()
            uni.showToast({
                title: res.message || '签到失败',
                icon: 'none'
            })
        }
    } catch (error) {
        uni.hideLoading()
    }
}

// 签退
const handleSignOut = () => {
    if (!userInfo.value.id) {
        uni.showToast({
            title: '用户信息异常，无用户ID',
            icon: 'none'
        })
        return
    }
    uni.showModal({
        title: '提示',
        content: '确认签退吗？',
        success: (res) => {
            if (res.confirm) {
                fetchSignOut()
            }
        }
    })
}
// 签退请求
const fetchSignOut = () => {
    uni.showLoading({ title: '签退中...' })
    visitorRegisterApi.setSignOut({ id: userInfo.value.id }).then((res) => {
        if (res.code === 200) {
            uni.hideLoading()
            uni.showToast({
                title: '签退成功',
                icon: 'success'
            })
            // 获取置业顾问列表并查询最新的排序
            fetchSortList()
        } else {
            uni.hideLoading()
            uni.showToast({
                title: '签退失败',
                icon: 'none'
            })
        }
    }).catch(() => {
        uni.hideLoading()
    })
}
onLoad(async (options) => {
    console.log(options)
    if (options.projId) {
        updateSignTime()
        await getUserInfo(options.projId)
        fetchSortList()
    }
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
    padding: 50rpx 30rpx;
    margin-bottom: 24rpx;
    border: 1rpx solid #fbfbfb;
    display: flex;
    justify-content: center;
    align-items: center;

    .project-name {
        font-size: 40rpx;
        font-weight: 500;
        color: #333;
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
        color: #707070;
        display: block;
        margin-bottom: 20rpx;
    }

    .queue-number {
        font-size: 64rpx;
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

.not-permission {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    
    .empty-state {
        text-align: center;
        padding: 40rpx;
        
        .empty-title {
            display: block;
            font-size: 32rpx;
            font-weight: 500;
            color: #333;
            margin-bottom: 16rpx;
        }
        
        .empty-desc {
            display: block;
            font-size: 28rpx;
            color: #999;
            margin-bottom: 60rpx;
        }
        
    }
}
</style>