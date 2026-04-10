<template>
    <view class="custom-picker-container">
        <!-- 触发区域 -->
        <view class="custom-picker-trigger" :class="{ 'space-between': spaceBetween }" @click="handleOpenPicker">
            <view class="picker-value" :class="{ placeholder: !displayValue }">
                {{ displayValue || placeholder }}
            </view>
            <view class="picker-arrow">›</view>
        </view>

        <!-- 自定义弹窗，使用超高 z-index -->
        <view v-if="showPicker" class="custom-picker-mask" @click="closePicker">
            <view class="custom-picker-container-bottom" @click.stop>
                <view class="picker-header">
                    <text class="picker-cancel" @click="closePicker">取消</text>
                    <text class="picker-confirm" @click="confirmPicker">确定</text>
                </view>
                <picker-view class="picker-view" :value="tempIndex" @change="onPickerChange">
                    <picker-view-column>
                        <view class="picker-item" v-for="(item, idx) in options" :key="idx">
                            {{ item[labelKey] }}
                        </view>
                    </picker-view-column>
                </picker-view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    options: {
        type: Array,
        default: () => []
    },
    modelValue: [String, Number],
    labelKey: {
        type: String,
        default: 'name'
    },
    valueKey: {
        type: String,
        default: 'id'
    },
    placeholder: {
        type: String,
        default: '请选择'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    spaceBetween: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'change'])

const showPicker = ref(false)
const tempIndex = ref([0])

const displayValue = computed(() => {
    if (!props.modelValue) return ''
    const selected = props.options.find(item => item[props.valueKey] == props.modelValue)
    return selected ? selected[props.labelKey] : ''
})

const openPicker = () => {
    if (props.disabled) return
    const currentIndex = props.options.findIndex(item => item[props.valueKey] == props.modelValue)
    tempIndex.value = [currentIndex !== -1 ? currentIndex : 0]
    showPicker.value = true
}

const onPickerChange = (e) => {
    tempIndex.value = [e.detail.value[0]]
}

const confirmPicker = () => {
    const selected = props.options[tempIndex.value[0]]
    if (selected) {
        const newValue = selected[props.valueKey]
        emit('update:modelValue', newValue)
        emit('change', newValue, selected)
    }
    showPicker.value = false
}

const closePicker = () => {
    showPicker.value = false
}

const handleOpenPicker = () => {
    if (props.disabled) return
    openPicker()
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

/* 弹窗样式 - 使用固定定位 + 超高 z-index */
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
}

.picker-header {
    display: flex;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #eee;
}

.picker-cancel {
    font-size: 28rpx;
    color: #999;
}

.picker-confirm {
    font-size: 28rpx;
    color: #007AFF;
    font-weight: 500;
}

.picker-view {
    width: 100%;
    height: 500rpx;
}

.picker-item {
    height: 70rpx;
    line-height: 70rpx;
    text-align: center;
    font-size: 28rpx;
    color: #333;
}
</style>

<!-- 额外添加全局样式，确保覆盖 tabbar -->
<style>
/* 确保弹窗在 tabbar 之上 */
.custom-picker-mask,
.custom-picker-container-bottom {
    z-index: 99999 !important;
}

/* 临时降低 tabbar 的层级（可选，如果上述方法不生效） */
.uni-tabbar-bottom,
.uni-tabbar,
.tabbar {
    z-index: 9998 !important;
}
</style>