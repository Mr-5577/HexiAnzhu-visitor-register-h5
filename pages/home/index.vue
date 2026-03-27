<template>
    <view class="home-page">
        <custom-navbar title="首页" :show-left="true" :show-more-menu="true" :show-right="true" fixed :translucent="true"
            :border-bottom="false">
            <template #right>
                <view>
                    <uni-icons type="search" size="22" color="#333" />
                </view>
            </template>
        </custom-navbar>
    </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import CustomNavbar from '@/components/custom-navbar/index.vue'

// 生命周期
onMounted(async () => {
})
</script>

<style lang="scss" scoped>
.home-page {
    width: 100%;
    height: 100vh;
    // background: linear-gradient(180deg, #e0f7fa 0%, #ffebee 100%);
}
</style>