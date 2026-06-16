<template>
    <view class="register-container">
        <!-- 顶部切换Tab -->
        <view class="visit-type-tab">
            <view class="tab-item" :class="{ active: visitType === 'channel' }" @click="switchTab('channel')">
                渠道来访
            </view>
            <view class="tab-item" :class="{ active: visitType === 'natural' }" @click="switchTab('natural')">
                自然来访
            </view>
        </view>
        <!-- 表单内容 -->
        <scroll-view class="form-scroll" scroll-y>
            <view class="form-card">
                <view class="form-report">
                    <view class="quick-report-btn" v-show="visitType === 'channel'" @click="openReportPopup">
                        <text class="btn-text">选择报备</text>
                        <text class="btn-arrow">›</text>
                    </view>
                    <view class="quick-report-btn" @click="openSecondVisitPopup">
                        <text class="btn-text">二次来访</text>
                        <text class="btn-arrow">›</text>
                    </view>
                </view>

                <view class="form-item">
                    <text class="label required">项目</text>
                    <CustomPicker v-model="formData.visitProjId" :options="projectList" label-key="name" value-key="id"
                        placeholder="请选择项目" @change="onProjectChange" />
                </view>

                <view class="form-item">
                    <text class="label required">客户姓名</text>
                    <input class="input" v-model="formData.custName" placeholder="请输入客户姓名" maxlength="20" />
                </view>

                <view class="form-item">
                    <text class="label required">客户电话</text>
                    <input class="input" v-model="formData.desensitizeCustTel" type="tel" placeholder="请输入客户电话"
                        maxlength="11" />
                </view>

                <!-- 备用电话列表 -->
                <view v-for="(phone, index) in backupPhones" :key="index" class="form-item">
                    <text class="label">备用电话{{ index + 1 }}</text>
                    <view class="input-with-icon">
                        <input class="input" v-model="backupPhones[index]" type="tel" placeholder="请输入备用电话"
                            maxlength="11" />
                        <view class="action-icon" @click="addBackupPhone" v-if="index === backupPhones.length - 1">
                            <text class="icon-plus">+</text>
                        </view>
                        <view class="action-icon" @click="removeBackupPhone(index)" v-else>
                            <text class="icon-minus">-</text>
                        </view>
                    </view>
                </view>

                <!-- 到访人数 -->
                <view class="form-item">
                    <text class="label required">到访人数</text>
                    <view class="number-input">
                        <view class="number-btn" @click="decreasePeople">-</view>
                        <input class="number-value" v-model="formData.visitNum" type="number" disabled />
                        <view class="number-btn" @click="increasePeople">+</view>
                    </view>
                </view>
            </view>
            <view class="form-card">
                <view class="form-item" v-if="formData.lastVisitTime">
                    <text class="label">上次到访时间</text>
                    <input class="input" v-model="formData.lastVisitTime" disabled placeholder="上次来访时间" />
                </view>
                <view class="form-item">
                    <text class="label required">到访方式</text>
                    <CustomPicker v-model="formData.visitTypeId" :options="filteredVisitMethodList"
                        label-key="optionStr" value-key="valueStr" placeholder="请选择到访方式" :selectOnClick="true"
                        @change="onVisitMethodChange" />
                </view>
                <view class="form-item">
                    <text class="label required">知晓途径</text>
                    <CustomPicker v-model="formData.knowWayId" :options="channelList" label-key="optionStr"
                        value-key="valueStr" placeholder="请选择知晓途径" :selectOnClick="true" @change="onKnowWayChange" />
                </view>
                <view class="form-item">
                    <text class="label">预测置业顾问</text>
                    <view class="input-with-btn">
                        <input class="input" v-model="formData.salerName" placeholder="置业顾问名称" disabled />
                        <view class="default-bringman-btn" @click="openSalerPopup">
                            <text class="btn-text-small">选择顾问</text>
                        </view>
                    </view>
                </view>

                <!-- 根据到访方式显示不同字段 -->
                <template v-if="visitType === 'channel'">
                    <view class="form-item">
                        <text class="label required">渠道公司</text>
                        <input class="input" v-model="formData.reportCom" disabled placeholder="渠道公司" />
                    </view>

                    <view class="form-item">
                        <text class="label">渠道门店</text>
                        <input class="input" v-model="formData.reportComArea" placeholder="请输入门店" />
                    </view>
                    <view class="form-item">
                        <text class="label required">带访人</text>
                        <view class="input-with-btn">
                            <input class="input" v-model="formData.bringMan" placeholder="请输入带访人" />
                            <view class="default-bringman-btn" @click="setDefaultBringMan">
                                <text class="btn-text-small">默认带访人</text>
                            </view>
                        </view>
                    </view>

                    <view class="form-item">
                        <text class="label required">带访人电话</text>
                        <input class="input" v-model="formData.bringTel" type="tel" maxlength="11"
                            placeholder="请输入带访电话" />
                    </view>

                    <view class="form-item">
                        <text class="label">报备人</text>
                        <input class="input" v-model="formData.reporter" disabled placeholder="报备人" />
                    </view>

                    <view class="form-item">
                        <text class="label">报备时间</text>
                        <picker mode="date" :value="formData.reportTime" disabled @change="onReportTimeChange">
                            <view class="report-picker">
                                {{ formData.reportTime || '报备时间' }}
                            </view>
                        </picker>
                    </view>
                </template>
            </view>
        </scroll-view>
        <!-- 底部确认按钮 -->
        <view class="bottom-btn">
            <button class="confirm-btn" :disabled="isSubmitting" @click="handleSubmit">
                确认登记
            </button>
        </view>
        <!-- 报备弹窗 -->
        <ReportPopup ref="reportPopupRef" :projectId="formData.visitProjId" @reportSelected="onReportSelected" />
        <!-- 历史带访人列表 -->
        <VisitPersonPopup ref="bringManPopupRef" :visitComId="reportInfo?.visitComId"
            @bringManSelected="onBringManSelected" />
        <!-- 选择职业顾问 -->
        <SaleListPopUp ref="salerPickerRef" :projectId="formData.visitProjId" @salerSelected="onSalerSelected" />
        <!-- 二次来访弹窗 -->
        <SecondVisitPopUp ref="secondVisitPopupRef" :projectId="formData.visitProjId"
            @recordSelected="onRecordSelected" />
    </view>
</template>

<script setup>
import dayjs from 'dayjs'
import { onShow, onHide } from '@dcloudio/uni-app'
import { ref, computed, onMounted, watch } from 'vue'
import ReportPopup from './components/report-pop-up.vue'
import VisitPersonPopup from './components/visit-person-pop-up.vue'
import SaleListPopUp from './components/saler-list-pop-up.vue'
import SecondVisitPopUp from './components/second-visit-pop-up.vue'
import CustomPicker from '@/components/custom-picker/index.vue'
import { visitorRegisterApi } from '@/common/api.js'
import { transformData } from '@/utils/common.js'
import { desensitizePhone } from '@/utils/common.js'

// 自然来访,0自然到访、5电转访、8工程抵款、9棚改
const NATURAL_VISIT_IDS = ['0', '5', '8', '9']
// 渠道来访,1老带新,2内渠,3外渠分销,4自拓邀约,6内部员工及推荐,7全民营销
const CHANNEL_VISIT_IDS = ['1', '2', '3', '4', '6', '7']

// 来访类型
const visitType = ref('channel') // natural: 自然来访, channel: 渠道来访
// 备用电话列表
const backupPhones = ref(['']) // 初始化一个空备用电话
// 表单数据
const formData = ref({
    custName: '', // 客户姓名
    custTel: '', // 客户电话1
    desensitizeCustTel: '', // 脱敏客户电话1
    custTel2: '', // 备用电话（逗号分隔）
    visitNum: 1, // 到访人数
    lastVisitTime: "", // 上次到访时间
    visitTypeId: '', // 到访方式ID
    visitTypeName: '', // 到访方式name
    bringMan: '',      // 带访人
    bringTel: '', // 带访电话
    reportComArea: '', // 报备公司门店
    reportCom: '', // 报备公司
    reportId: '', // 报备ID
    reporter: '',      // 报备人
    reportTime: '',    // 报备时间
    knowWayId: '', // 知晓途径ID
    knowWayName: '', // 知晓途径name
    visitProjId: '', // 项目ID
    visitProjName: '', // 项目
    salerId: '', // 置业顾问ID
    salerName: '暂无', // 置业顾问name
})

// 来访方式列表
const visitMethodList = ref([])
// 来访途径列表
const channelList = ref([])
// 项目列表
const projectList = ref([])
// 提交锁
const isSubmitting = ref(false)
// 报备信息
const reportInfo = ref(null)
// 带访人列表
const bringManList = ref([])
// 报备弹窗ref
const reportPopupRef = ref(null)
// 带访人弹窗ref
const bringManPopupRef = ref(null)
// 置业顾问弹窗ref
const salerPickerRef = ref(null)
// 来访记录弹窗ref
const secondVisitPopupRef = ref(null)

// 根据来访类型过滤到访方式选项
const filteredVisitMethodList = computed(() => {
    const filterIds = visitType.value === 'natural' ? NATURAL_VISIT_IDS : CHANNEL_VISIT_IDS
    return visitMethodList.value.filter(item => filterIds.includes(item.valueStr))
})

// 更新custTel2字段（将所有备用电话用逗号拼接）
const updateCustTel2 = () => {
    // 过滤掉空字符串
    const validPhones = backupPhones.value.filter(phone => phone.trim() !== '')
    formData.value.custTel2 = validPhones.join(',')
}

// 监听备用电话列表变化，自动更新custTel2
const watchBackupPhones = () => {
    updateCustTel2()
}

// 添加备用电话
const addBackupPhone = () => {
    if (backupPhones.value.length >= 5) {
        uni.showToast({ title: '最多添加5个备用电话', icon: 'none' })
        return
    }
    backupPhones.value.push('')
}

// 删除备用电话
const removeBackupPhone = (index) => {
    if (backupPhones.value.length <= 1) {
        uni.showToast({ title: '至少保留一个备用电话', icon: 'none' })
        return
    }
    backupPhones.value.splice(index, 1)
    updateCustTel2()
}

// 初始化表单数据
const resetForm = () => {
    // formData.value.visitProjId = '' // 项目ID
    // formData.value.visitProjName = '' // 项目
    formData.value.custName = '' // 客户姓名
    formData.value.custTel = '' // 客户电话
    formData.value.desensitizeCustTel = '' // 脱敏客户电话
    backupPhones.value = [''] // 重置备用电话列表
    formData.value.custTel2 = '' // 备用电话
    formData.value.visitNum = 1 // 到访人数
    formData.value.lastVisitTime = '' // 上次到访时间
    formData.value.visitTypeId = '' // 到访方式ID
    formData.value.visitTypeName = '' // 到访方式name
    formData.value.bringMan = ''      // 带访人
    formData.value.bringTel = '' // 带访电话
    formData.value.reportComArea = '' // 报备公司门店
    formData.value.reportCom = '' // 报备公司
    formData.value.reportId = '' // 报备ID
    formData.value.reporter = ''      // 报备人
    formData.value.reportTime = ''    // 报备时间
    formData.value.knowWayId = '' // 知晓途径
    formData.value.knowWayName = '' // 知晓途径name
    formData.value.salerId = '' // 置业顾问ID
    formData.value.salerName = '暂无' // 置业顾问name
}

// 解析备用电话字符串，填充到备用电话列表
const parseBackupPhones = (custTel2Str) => {
    if (!custTel2Str) {
        backupPhones.value = ['']
        return
    }
    const phones = custTel2Str.split(',').filter(phone => phone.trim() !== '')
    if (phones.length === 0) {
        backupPhones.value = ['']
    } else {
        backupPhones.value = phones
    }
}

// 增加人数
const increasePeople = () => {
    if (formData.value.visitNum < 20) {
        formData.value.visitNum++
    }
}
// 减少人数
const decreasePeople = () => {
    if (formData.value.visitNum > 1) {
        formData.value.visitNum--
    }
}

// 切换Tab
const switchTab = (type) => {
    visitType.value = type
    resetForm()
    fetchSalerList()
}

// 项目选择变化
const onProjectChange = (value, selectedItem) => {
    // console.log('项目选择变化:', value, selectedItem)
    formData.value.visitProjName = selectedItem.name

    // 清除报备人相关信息
    formData.value.reportId = ''
    formData.value.reportCom = ''
    formData.value.reporter = ''
    formData.value.reportTime = ''
    // 清除置业顾问相关信息
    formData.value.salerId = ""
    formData.value.salerName = "暂无"
    // 切换项目查询当前项目的置业顾问列表
    fetchSalerList()
}

// 到访方式选择变化
const onVisitMethodChange = (value, selectedItem) => {
    formData.value.visitTypeName = selectedItem.optionStr
}

// 报备时间选择
const onReportTimeChange = (e) => {
    formData.value.reportTime = e.detail.value
}

// 知晓途径选择变化
const onKnowWayChange = (value, selectedItem) => {
    formData.value.knowWayName = selectedItem.optionStr
}

// 判断是否为脱敏电话
const isDesensitizedTel = (tel) => {
    if (!tel) return false
    // 匹配格式：1[3-9][0-9] + 4个* + 4位数字, 例如：138****1234
    const desensitizedPattern = /^1[3-9]\d\*{4}\d{4}$/
    return desensitizedPattern.test(tel)
}

// 提交表单
const handleSubmit = async () => {
    // 提交前更新custTel2
    updateCustTel2()

    console.log('提交表单数据:', formData.value)
    if (isSubmitting.value) {
        return
    }
    // 字段校验
    if (!formData.value.visitProjId) {
        uni.showToast({ title: '请选择项目', icon: 'none' })
        return
    }
    if (!formData.value.custName) {
        uni.showToast({ title: '请输入客户姓名', icon: 'none' })
        return
    }
    // 客户电话校验：如果脱敏则跳过校验，否则校验格式
    if (!isDesensitizedTel(formData.value.desensitizeCustTel)) {
        if (!/^1[3-9]\d{9}$/.test(formData.value.desensitizeCustTel)) {
            uni.showToast({ title: '请输入正确的客户电话', icon: 'none' })
            return
        }
    }
    // 校验所有备用电话
    const validPhones = backupPhones.value.filter(phone => phone.trim() !== '')
    for (let i = 0; i < validPhones.length; i++) {
        const phone = validPhones[i]
        // 如果是脱敏电话则跳过校验
        if (!isDesensitizedTel(phone)) {
            if (!/^1[3-9]\d{9}$/.test(validPhones[i])) {
                uni.showToast({ title: `请输入正确的备用电话${i + 1}`, icon: 'none' })
                return
            }
        }
    }
    if (!formData.value.visitTypeId) {
        uni.showToast({ title: '请选择到访方式', icon: 'none' })
        return
    }
    if (!formData.value.knowWayId) {
        uni.showToast({ title: '请选择知晓途径', icon: 'none' })
        return
    }

    // 渠道来访额外校验
    if (visitType.value === 'channel') {
        if (!formData.value.reportId) {
            uni.showToast({ title: '请选择报备公司', icon: 'none' })
            return
        }
        if (!formData.value.bringMan) {
            uni.showToast({ title: '请输入带访人', icon: 'none' })
            return
        }
        if (!/^1[3-9]\d{9}$/.test(formData.value.bringTel)) {
            uni.showToast({ title: '请输入正确的带访人电话', icon: 'none' })
            return
        }
    }

    isSubmitting.value = true

    // 提交数据
    let submitData = {
        visitType: visitType.value, // 来访类型
        custName: formData.value.custName, // 客户姓名
        // custTel: formData.value.custTel, // 客户电话
        custTel2: formData.value.custTel2, // 备用电话（逗号分隔）
        visitNum: formData.value.visitNum, // 到访人数
        visitTypeId: formData.value.visitTypeId, // 到访方式ID
        reportId: formData.value.reportId, // 报备ID
        reportComArea: formData.value.reportComArea, // 报备公司门店
        bringMan: formData.value.bringMan, // 带访人
        bringTel: formData.value.bringTel, // 带访电话
        visitTime: dayjs().format('YYYY-MM-DD HH:mm:ss'), // 到访时间
        visitProjId: formData.value.visitProjId, // 项目ID
        knowWayId: formData.value.knowWayId, // 知晓途径ID
        // 条件添加 salerId
        ...(formData.value.salerId && { salerId: formData.value.salerId })
    }
    // 如果明文电话脱敏后和脱敏电话相同，说明没有修改电话，则使用明文电话，否则使用脱敏电话
    if (desensitizePhone(formData.value.custTel) == formData.value.desensitizeCustTel) {
        submitData.custTel = formData.value.custTel
    } else {
        submitData.custTel = formData.value.desensitizeCustTel
    }
    console.log('提交数据:', submitData)
    uni.showLoading({ title: '提交中...' })
    
    try {
        const res = await visitorRegisterApi.addVisitRec(submitData)
        uni.hideLoading()
        if (res.code === 200) {
            uni.showToast({
                title: '登记成功',
                icon: 'success'
            })
            // 存储到本地
            const storageData = {
                ...formData.value,
                visitTime: submitData.visitTime, // 到访时间
                visitType: visitType.value, // 来访类型
            }
            uni.setStorageSync('registerSuccessData', storageData)
            // 重置表单
            resetForm()

            // 携带记录ID跳转到登记成功页面
            uni.navigateTo({
                url: `/pages/register/success?id=${res.data}`
            })
        } else {
            uni.showToast({
                title: res.message || '登记失败',
                icon: 'none'
            })
        }
    } catch (error) {
        uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
        })
        uni.hideLoading()
    } finally {
        isSubmitting.value = false
    }
}

// 打开报备选择弹窗
const openReportPopup = () => {
    if (formData.value.visitProjId) {
        reportPopupRef.value.openPopup()
    } else {
        uni.showToast({
            title: '请先选择项目',
            icon: 'none'
        })
    }
}

// 处理报备选择
const onReportSelected = (reportData) => {
    console.log('选中的报备数据:', reportData)
    if (!reportData) {
        return
    }
    reportInfo.value = reportData
    // 回填报备信息到表单
    formData.value.reportId = reportData.id
    formData.value.reportCom = reportData.reportCom
    formData.value.reporter = reportData.reportMan
    formData.value.reportTime = reportData.reportTime
    // 回填客户信息
    formData.value.custName = reportData.custName
    formData.value.custTel = reportData.custTel // 明文电话
    formData.value.desensitizeCustTel = reportData.desensitizeCustTel // 脱敏电话
    // 回填备用电话
    if (reportData.custTel2) {
        parseBackupPhones(reportData.custTel2)
    } else {
        backupPhones.value = ['']
    }
}

// 知晓途径数据
const fetchGetKnowWay = async () => {
    try {
        const res = await visitorRegisterApi.getKnowWay()
        if (res.code === 200) {
            channelList.value = res.data || []
        } else {
            uni.showToast({
                title: '获取知晓途径失败',
                icon: 'none'
            })
        }
    } catch (error) {
        channelList.value = []
        uni.showToast({
            title: '网络错误',
            icon: 'none'
        })
    }
}

// 到访方式数据
const fetchGetVisitType = async () => {
    try {
        const res = await visitorRegisterApi.getVisitType()
        if (res.code === 200) {
            visitMethodList.value = res.data || []
        } else {
            uni.showToast({
                title: '获取到访方式失败',
                icon: 'none'
            })
        }
    } catch (error) {
        visitMethodList.value = []
        uni.showToast({
            title: '网络错误',
            icon: 'none'
        })
    }
}

// 项目数据
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
            // 默认选上第一个项目
            if (newData.length > 0) {
                formData.value.visitProjId = newData[0].id
                formData.value.visitProjName = newData[0].name
                // 获取顾问列表并根据条件回显预测置业顾问名称
                fetchSalerList()
            }
        } else {
            uni.showToast({
                title: '获取项目列表失败',
                icon: 'none'
            })
        }
    } catch (error) {
        projectList.value = []
        uni.showToast({
            title: '网络错误',
            icon: 'none'
        })
    }
}

const initFetchData = async () => {
    await Promise.all([fetchGetKnowWay(), fetchGetVisitType(), fetchGetProjList()])
}

// 设置默认带访人
const setDefaultBringMan = async () => {
    // 检查是否已选择报备公司
    if (!reportInfo.value) {
        uni.showToast({
            title: '请先选择报备公司',
            icon: 'none'
        })
        return
    }
    // 打开带访人选择弹窗
    bringManPopupRef.value.openPopup()
}
const onBringManSelected = (bringManData) => {
    if (!bringManData) {
        return
    }
    formData.value.bringMan = bringManData.bringMan
    formData.value.bringTel = bringManData.bringTel
}
const openSalerPopup = async () => {
    if (formData.value.visitProjId) {
        salerPickerRef.value?.openPopup()
    } else {
        uni.showToast({
            title: '请先选择项目',
            icon: 'none'
        })
    }
}
// 处理选择的置业顾问
const onSalerSelected = (salerData) => {
    console.log('选中的置业顾问数据:', salerData)
    if (salerData) {
        formData.value.salerId = salerData.salerId
        formData.value.salerName = salerData.salerName
    } else {
        formData.value.salerId = ''
        formData.value.salerName = '暂无'
    }
}
// 获取顾问列表
const fetchSalerList = async () => {
    if (!formData.value.visitProjId) return
    try {
        const res = await visitorRegisterApi.getSalerList({ projId: formData.value.visitProjId })
        if (res.code === 200) {
            const list = res.data || []
            // 找到已签到顾问：lastSignStatus === 1 且 isNext 为 true 的数据
            const nextData = list.filter(item => item.lastSignStatus == 1 && item.isNext)
            if (nextData && nextData.length > 0) {
                // 如果存在已签到且 isNext 为 true 的数据，预测置业顾问为第一个,只是作为展示使用，不作为提交数据
                formData.value.salerId = ""
                formData.value.salerName = nextData[0].salerName
            } else {
                formData.value.salerId = ""
                formData.value.salerName = "暂无"
            }
        }
    } catch (error) {
        consultantList.value = []
    }
}
const openSecondVisitPopup = async () => {
    if (formData.value.visitProjId) {
        secondVisitPopupRef.value?.openPopup()
    } else {
        uni.showToast({
            title: '请先选择项目',
            icon: 'none'
        })
    }
}
// 处理选择的来访记录
const onRecordSelected = (recordData) => {
    console.log('选中的来访记录数据:', recordData)
    if (recordData) {
        formData.value.custName = recordData.custName
        formData.value.custTel = recordData.custTel
        formData.value.desensitizeCustTel = recordData.desensitizeCustTel
        formData.value.lastVisitTime = recordData.visitTime
        formData.value.salerId = recordData.salerId
        formData.value.salerName = recordData.salerName
    } else {
        formData.value.custName = ''
        formData.value.custTel = ''
        formData.value.desensitizeCustTel = ''
        formData.value.lastVisitTime = ''
        formData.value.salerId = ''
        formData.value.salerName = '暂无'
    }
}
watch(backupPhones, () => {
    updateCustTel2()
}, { deep: true })

onShow(() => { })
onHide(() => { })

// 监听备用电话变化
onMounted(() => {
    initFetchData()
    // 添加watch监听backupPhones变化
    watchBackupPhones()
})
</script>

<style scoped lang="scss">
page {
    height: 100%;
    background-color: #f5f5f5;
}

.register-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
}

/* 顶部Tab样式 */
.visit-type-tab {
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #eee;
    flex-shrink: 0;
}

.tab-item {
    flex: 1;
    text-align: center;
    font-size: 32rpx;
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

/* 滚动区域 */
.form-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 20rpx 20rpx;
}

/* 表单卡片 */
.form-card {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 20rpx;

    .form-item:not(:last-child) {
        border-bottom: 1rpx solid #eee;
    }
}

/* 表单项 */
.form-item {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    height: 80rpx;
}

.label {
    display: block;
    font-size: 30rpx;
    color: #333;
    padding-left: 6rpx;
    box-sizing: border-box;
    position: relative;
    flex-shrink: 0;
}

.label.required::before {
    content: '*';
    color: #ff4444;
    position: absolute;
    left: -10rpx;
    top: 50%;
    transform: translateY(-50%);
}

/* 输入框带图标 */
.input-with-icon {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.input {
    flex: 1;
    font-size: 30rpx;
    color: #999;
    display: flex;
    justify-content: flex-end;
    text-align: right;

    .input-placeholder {
        color: #999;
    }
}

/* 操作图标样式 */
.action-icon {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    background-color: #ededed;
    flex-shrink: 0;
}

.icon-plus,
.icon-minus {
    font-size: 32rpx;
    font-weight: 600;
    color: #007AFF;
    padding-bottom: 6rpx;
    box-sizing: border-box;
}

.icon-minus {
    color: #ff4444;
}

/* 数字输入框 */
.number-input {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 200rpx;
}

.number-btn {
    width: 60rpx;
    height: 60rpx;
    background-color: #f5f5f5;
    border-radius: 10rpx 10rpx;
    display: flex;
    justify-content: center;
    font-size: 40rpx;
    color: #999;
    font-weight: 600;
}

.number-value {
    width: 80rpx;
    text-align: center;
    font-size: 32rpx;
    color: #999;
}

/* 选择器 */
.report-picker {
    font-size: 30rpx;
    color: #999;
    position: relative;
    box-sizing: border-box;
}

.picker {
    font-size: 28rpx;
    color: #999;
    position: relative;
    padding-right: 20rpx;
    box-sizing: border-box;
}

.picker::after {
    content: '>';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

/* 快速报备按钮样式 */
.form-report {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    padding: 16rpx 0;
    gap: 20rpx;
}

.quick-report-btn {
    display: flex;
    align-items: center;
    gap: 6rpx;
    padding: 8rpx 46rpx 10rpx;
    background: linear-gradient(135deg, #007AFF, #0056b3);
    border-radius: 28rpx;
    transition: all 0.3s ease;
}

.btn-text {
    font-size: 26rpx;
    color: #fff;
}

.btn-arrow {
    font-size: 32rpx;
    color: #fff;
}

/* 带访人输入框带按钮样式 */
.input-with-btn {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12rpx;
}

.default-bringman-btn {
    display: flex;
    align-items: center;
    padding: 4rpx 12rpx 8rpx;
    box-sizing: border-box;
    background: linear-gradient(135deg, #007AFF, #0056b3);
    border-radius: 8rpx;
    flex-shrink: 0;
}

.btn-text-small {
    font-size: 24rpx;
    font-weight: 500;
    color: #fff;
    white-space: nowrap;
}

// 底部按钮
.bottom-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20rpx 30rpx;
    box-sizing: border-box;
    background-color: transparent;
    flex-shrink: 0;
}

.confirm-btn {
    width: 70%;
    height: 80rpx;
    background: linear-gradient(135deg, #007AFF, #0056b3);
    color: #fff;
    font-size: 30rpx;
    font-weight: 500;
    border-radius: 44rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
    transition: all 0.3s ease;
}
</style>