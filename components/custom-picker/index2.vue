<template>
    <view class="custom-picker-container">
        <!-- 触发区域 -->
        <view class="custom-picker-trigger" :class="{ 'space-between': spaceBetween }" @click="handleOpenPicker">
            <view class="picker-value" :class="{ placeholder: !displayValue }">
                {{ displayValue || placeholder }}
            </view>
            <view class="picker-arrow">›</view>
        </view>

        <view v-if="showPicker" class="custom-picker-mask" @click="maskCloseHandler">
            <view class="custom-picker-container-bottom" @click.stop>
                <view class="picker-header">
                    <text class="picker-cancel" @click="closePicker">取消</text>
                    <text class="picker-confirm" @click="confirmPicker">确定</text>
                </view>
                <scroll-view class="picker-scroll" scroll-y>
                    <template v-if="options && options.length > 0">
                        <view v-for="(item, idx) in options" :key="idx" class="picker-option"
                            :class="{ 'picker-option-active': tempSelectedIndex === idx }" @click="selectOption(idx)">
                            <text class="option-text">{{ item[labelKey] }}</text>
                            <text v-if="tempSelectedIndex === idx" class="option-check">✓</text>
                        </view>
                    </template>
                    <!-- 空状态 -->
                    <view v-else class="empty-state">
                        <image src="/static/empty.png" mode="aspectFit" class="empty-image" />
                        <text class="empty-text">暂无数据</text>
                    </view>
                </scroll-view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    options: { type: Array, default: () => [] },
    modelValue: [String, Number],
    labelKey: { type: String, default: 'name' },
    valueKey: { type: String, default: 'id' },
    placeholder: { type: String, default: '请选择' },
    disabled: { type: Boolean, default: false },
    spaceBetween: { type: Boolean, default: false },
    maskClosable: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'change', 'pickerStateChange'])

const showPicker = ref(false)
const tempSelectedIndex = ref(0)

const displayValue = computed(() => {
    if (!props.modelValue) return ''
    const selected = props.options.find(item => item[props.valueKey] == props.modelValue)
    return selected ? selected[props.labelKey] : ''
})

const openPicker = () => {
    if (props.disabled) return
    const currentIndex = props.options.findIndex(item => item[props.valueKey] == props.modelValue)
    tempSelectedIndex.value = currentIndex !== -1 ? currentIndex : 0
    showPicker.value = true
    emit('pickerStateChange', false)
}

const selectOption = (idx) => {
    tempSelectedIndex.value = idx
}

const confirmPicker = () => {
    const selected = props.options[tempSelectedIndex.value]
    if (selected) {
        const newValue = selected[props.valueKey]
        emit('update:modelValue', newValue)
        emit('change', newValue, selected)
    }
    showPicker.value = false
    emit('pickerStateChange', true)
}

const closePicker = () => {
    showPicker.value = false
    emit('pickerStateChange', true)
}

const handleOpenPicker = () => {
    if (props.disabled) return
    openPicker()
}

const maskCloseHandler = () => {
    if (props.maskClosable) {
        closePicker()
    }
}

defineExpose({ openPicker })
</script>

<style scoped>
.custom-picker-container {
    width: 100%;
}

.custom-picker-trigger {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: relative;
}

.space-between {
    display: flex;
    justify-content: space-between;
    width: 100%;
    border: 1rpx solid #e0e0e0;
    border-radius: 12rpx;
    height: 60rpx;
    padding: 0 16rpx;
    box-sizing: border-box;
}

.picker-value {
    font-size: 28rpx;
    color: #999;
}

.picker-value.placeholder {
    color: #999;
}

.picker-arrow {
    height: 100%;
    display: flex;
    align-items: center;
    font-size: 32rpx;
    color: #999;
    margin-left: 8rpx;
    line-height: 1;
}

.custom-picker-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99999;
}

.custom-picker-container-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    border-top-left-radius: 20rpx;
    border-top-right-radius: 20rpx;
    z-index: 100000;
    display: flex;
    flex-direction: column;
    /* height: 620rpx; */
    min-height: 400rpx;
    /* 最大高度限制 */
    max-height: 60vh;
    /* 添加底部安全区域 */
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
}

.picker-header {
    display: flex;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #eee;
    /* 固定头部，不参与滚动 */
    flex-shrink: 0;
}

.picker-cancel {
    font-size: 32rpx;
    font-weight: 500;
    color: #999;
}

.picker-confirm {
    font-size: 32rpx;
    color: #007AFF;
    font-weight: 500;
}

.picker-scroll {
    /* 关键：flex: 1 让滚动区域自动占满剩余空间 */
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.picker-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 30rpx;
    border-bottom: 1rpx solid #f5f5f5;
}

.picker-option:last-child {
    margin-bottom: 30rpx;
}

.picker-option-active {
    background-color: #f0f7ff;
}

.option-text {
    font-size: 28rpx;
    color: #333;
}

.picker-option-active .option-text {
    color: #007AFF;
    font-weight: 500;
}

.option-check {
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    background-color: #007AFF;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
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
</style>