<template>
    <view class="check-in-container">
        <!-- 顶部切换Tab -->
        <view class="type-tab">
            <view class="tab-item" :class="{ active: checkInType === 'qr-code' }" @click="checkInType = 'qr-code'">
                签到二维码
            </view>
            <view class="tab-item" :class="{ active: checkInType === 'list' }" @click="checkInType = 'list'">
                签到列表
            </view>
        </view>
        <!-- 二维码 -->
        <qr-code v-if="checkInType === 'qr-code'"></qr-code>
        <!-- 签到列表 -->
        <list v-if="checkInType === 'list'"></list>
    </view>
</template>

<script setup>
import { onShow, onHide } from '@dcloudio/uni-app'
import { ref } from 'vue'
import List from './list.vue'
import QrCode from './qr-code.vue';

const checkInType = ref('qr-code')
onShow(() => {
    checkInType.value = 'qr-code'
})
onHide(() => {
    checkInType.value = ''
})
</script>

<style scoped lang="scss">
page {
    height: 100%;
    background-color: #f5f5f5;
}

.check-in-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
    overflow: hidden;
}

/* 顶部Tab样式 */
.type-tab {
    display: flex;
    background-color: #fff;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;
    flex-shrink: 0;
    z-index: 10;
}

.tab-item {
    flex: 1;
    text-align: center;
    font-size: 30rpx;
    color: #666;
    position: relative;
}

.tab-item.active {
    color: #007AFF;
    font-weight: 500;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: -20rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 60rpx;
    height: 4rpx;
    background-color: #007AFF;
    border-radius: 2rpx;
}

.qrcode-content,
.list-content {
    width: 100%;
    flex: 1;
    overflow-y: auto;
}
</style>