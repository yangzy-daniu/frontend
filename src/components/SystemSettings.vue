<template>
    <div class="system-settings">
        <div class="page-header">
            <h1>系统设置</h1>
            <p>管理系统参数和个性化配置</p>
        </div>

        <el-row :gutter="20">
            <!-- 左侧导航 -->
            <el-col :xs="24" :sm="8" :lg="6">
                <el-card class="setting-nav">
                    <el-menu
                            :default-active="activeTab"
                            class="setting-menu"
                            @select="handleTabChange"
                    >
                        <el-menu-item index="basic">
                            <el-icon><Setting /></el-icon>
                            <span>基本设置</span>
                        </el-menu-item>
                        <el-menu-item index="personalize">
                            <el-icon><Brush /></el-icon>
                            <span>个性化</span>
                        </el-menu-item>
                        <el-menu-item index="security">
                            <el-icon><Lock /></el-icon>
                            <span>安全设置</span>
                        </el-menu-item>
                        <el-menu-item index="notification">
                            <el-icon><Bell /></el-icon>
                            <span>通知设置</span>
                        </el-menu-item>
                        <el-menu-item index="backup">
                            <el-icon><DataBoard /></el-icon>
                            <span>数据备份</span>
                        </el-menu-item>
                        <el-menu-item index="about">
                            <el-icon><InfoFilled /></el-icon>
                            <span>关于系统</span>
                        </el-menu-item>
                    </el-menu>
                </el-card>
            </el-col>

            <!-- 右侧内容 -->
            <el-col :xs="24" :sm="16" :lg="18">
                <el-card class="setting-content">
                    <!-- 基本设置 -->
                    <div v-if="activeTab === 'basic'" class="tab-content">
                        <h2>基本设置</h2>
                        <el-form :model="basicForm" label-width="120px">
                            <el-form-item label="系统名称">
                                <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
                            </el-form-item>
                            <el-form-item label="系统版本">
                                <el-input v-model="basicForm.version" disabled />
                            </el-form-item>
                            <el-form-item label="公司名称">
                                <el-input v-model="basicForm.company" placeholder="请输入公司名称" />
                            </el-form-item>
                            <el-form-item label="系统语言">
                                <el-select v-model="basicForm.language" placeholder="请选择语言">
                                    <el-option label="简体中文" value="zh-CN" />
                                    <el-option label="English" value="en-US" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="时区设置">
                                <el-select v-model="basicForm.timezone" placeholder="请选择时区">
                                    <el-option label="北京时间 (UTC+8)" value="UTC+8" />
                                    <el-option label="格林威治时间" value="UTC+0" />
                                </el-select>
                            </el-form-item>
                            <el-form-item label="系统描述">
                                <el-input
                                        v-model="basicForm.description"
                                        type="textarea"
                                        :rows="3"
                                        placeholder="请输入系统描述"
                                />
                            </el-form-item>
                        </el-form>
                        <div class="form-actions">
                            <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
                            <el-button @click="resetBasicSettings">重置</el-button>
                        </div>
                    </div>

                    <!-- 个性化设置 -->
                    <div v-if="activeTab === 'personalize'" class="tab-content">
                        <h2>个性化设置</h2>
                        <el-form :model="personalizeForm" label-width="120px">
                            <el-form-item label="主题颜色">
                                <div class="theme-colors">
                                    <div
                                            v-for="color in themeColors"
                                            :key="color.value"
                                            class="color-option"
                                            :class="{ active: personalizeForm.theme === color.value }"
                                            :style="{ backgroundColor: color.color }"
                                            @click="personalizeForm.theme = color.value"
                                    >
                                        <el-icon v-if="personalizeForm.theme === color.value"><Check /></el-icon>
                                    </div>
                                </div>
                            </el-form-item>
                            <el-form-item label="导航模式">
                                <el-radio-group v-model="personalizeForm.navMode">
                                    <el-radio label="sidebar">侧边导航</el-radio>
                                    <el-radio label="top">顶部导航</el-radio>
                                    <el-radio label="mix">混合导航</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="菜单颜色">
                                <el-color-picker v-model="personalizeForm.menuColor" />
                            </el-form-item>
                            <el-form-item label="固定头部">
                                <el-switch v-model="personalizeForm.fixedHeader" />
                            </el-form-item>
                            <el-form-item label="显示标签页">
                                <el-switch v-model="personalizeForm.showTags" />
                            </el-form-item>
                            <el-form-item label="显示Logo">
                                <el-switch v-model="personalizeForm.showLogo" />
                            </el-form-item>
                            <el-form-item label="主题模式">
                                <el-radio-group v-model="personalizeForm.mode">
                                    <el-radio label="light">浅色模式</el-radio>
                                    <el-radio label="dark">深色模式</el-radio>
                                    <el-radio label="auto">跟随系统</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-form>
                        <div class="form-actions">
                            <el-button type="primary" @click="savePersonalizeSettings">保存设置</el-button>
                            <el-button @click="resetPersonalizeSettings">重置</el-button>
                        </div>
                    </div>

                    <!-- 安全设置 -->
                    <div v-if="activeTab === 'security'" class="tab-content">
                        <h2>安全设置</h2>
                        <el-form :model="securityForm" label-width="120px">
                            <el-form-item label="密码策略">
                                <el-checkbox-group v-model="securityForm.passwordPolicy">
                                    <el-checkbox label="minLength">至少8位字符</el-checkbox>
                                    <el-checkbox label="requireNumber">包含数字</el-checkbox>
                                    <el-checkbox label="requireLetter">包含字母</el-checkbox>
                                    <el-checkbox label="requireSpecial">包含特殊字符</el-checkbox>
                                </el-checkbox-group>
                            </el-form-item>
                            <el-form-item label="会话超时">
                                <el-input-number
                                        v-model="securityForm.sessionTimeout"
                                        :min="5"
                                        :max="480"
                                        controls-position="right"
                                />
                                <span class="unit-text">分钟</span>
                            </el-form-item>
                            <el-form-item label="登录尝试限制">
                                <el-input-number
                                        v-model="securityForm.maxLoginAttempts"
                                        :min="1"
                                        :max="10"
                                        controls-position="right"
                                />
                                <span class="unit-text">次</span>
                            </el-form-item>
                            <el-form-item label="启用验证码">
                                <el-switch v-model="securityForm.enableCaptcha" />
                            </el-form-item>
                            <el-form-item label="操作日志保留">
                                <el-input-number
                                        v-model="securityForm.logRetention"
                                        :min="30"
                                        :max="365"
                                        controls-position="right"
                                />
                                <span class="unit-text">天</span>
                            </el-form-item>
                            <el-form-item label="IP白名单">
                                <el-input
                                        v-model="securityForm.ipWhitelist"
                                        type="textarea"
                                        :rows="3"
                                        placeholder="请输入IP地址，多个用逗号分隔"
                                />
                            </el-form-item>
                        </el-form>
                        <div class="form-actions">
                            <el-button type="primary" @click="saveSecuritySettings">保存设置</el-button>
                            <el-button @click="resetSecuritySettings">重置</el-button>
                        </div>
                    </div>

                    <!-- 通知设置 -->
                    <div v-if="activeTab === 'notification'" class="tab-content">
                        <h2>通知设置</h2>
                        <el-form :model="notificationForm" label-width="120px">
                            <el-form-item label="系统通知">
                                <el-switch v-model="notificationForm.systemNotify" />
                            </el-form-item>
                            <el-form-item label="邮件通知">
                                <el-switch v-model="notificationForm.emailNotify" />
                            </el-form-item>
                            <el-form-item label="短信通知">
                                <el-switch v-model="notificationForm.smsNotify" />
                            </el-form-item>
                            <el-form-item label="新用户注册">
                                <el-switch v-model="notificationForm.newUserNotify" />
                            </el-form-item>
                            <el-form-item label="订单通知">
                                <el-switch v-model="notificationForm.orderNotify" />
                            </el-form-item>
                            <el-form-item label="系统更新">
                                <el-switch v-model="notificationForm.updateNotify" />
                            </el-form-item>
                            <el-form-item label="通知频率">
                                <el-radio-group v-model="notificationForm.frequency">
                                    <el-radio label="realtime">实时通知</el-radio>
                                    <el-radio label="hourly">每小时汇总</el-radio>
                                    <el-radio label="daily">每日汇总</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-form>
                        <div class="form-actions">
                            <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
                            <el-button @click="resetNotificationSettings">重置</el-button>
                        </div>
                    </div>

                    <!-- 数据备份 -->
                    <div v-if="activeTab === 'backup'" class="tab-content">
                        <h2>数据备份与恢复</h2>
                        <el-row :gutter="20">
                            <el-col :span="12">
                                <el-card class="backup-card">
                                    <template #header>
                                        <span>数据备份</span>
                                    </template>
                                    <div class="backup-info">
                                        <p>上次备份时间: {{ lastBackupTime || '暂无备份' }}</p>
                                        <p>备份文件大小: {{ backupSize || '0 MB' }}</p>
                                    </div>
                                    <div class="backup-actions">
                                        <el-button type="primary" @click="handleBackup">
                                            <el-icon><Download /></el-icon>
                                            立即备份
                                        </el-button>
                                        <el-button @click="showBackupHistory = true">
                                            <el-icon><Clock /></el-icon>
                                            备份历史
                                        </el-button>
                                    </div>
                                </el-card>
                            </el-col>
                            <el-col :span="12">
                                <el-card class="restore-card">
                                    <template #header>
                                        <span>数据恢复</span>
                                    </template>
                                    <div class="restore-info">
                                        <p>选择备份文件进行系统恢复</p>
                                        <el-upload
                                                class="backup-upload"
                                                action="#"
                                                :auto-upload="false"
                                                :on-change="handleFileChange"
                                                :show-file-list="false"
                                        >
                                            <el-button type="warning">
                                                <el-icon><Upload /></el-icon>
                                                选择备份文件
                                            </el-button>
                                        </el-upload>
                                    </div>
                                    <div class="restore-actions">
                                        <el-button type="warning" :disabled="!selectedFile" @click="handleRestore">
                                            恢复数据
                                        </el-button>
                                    </div>
                                </el-card>
                            </el-col>
                        </el-row>

                        <!-- 自动备份设置 -->
                        <el-card class="auto-backup-card" style="margin-top: 20px;">
                            <template #header>
                                <span>自动备份设置</span>
                            </template>
                            <el-form :model="backupForm" label-width="120px">
                                <el-form-item label="自动备份">
                                    <el-switch v-model="backupForm.autoBackup" />
                                </el-form-item>
                                <el-form-item label="备份频率" v-if="backupForm.autoBackup">
                                    <el-select v-model="backupForm.frequency" placeholder="请选择备份频率">
                                        <el-option label="每天" value="daily" />
                                        <el-option label="每周" value="weekly" />
                                        <el-option label="每月" value="monthly" />
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="保留备份" v-if="backupForm.autoBackup">
                                    <el-input-number
                                            v-model="backupForm.retention"
                                            :min="1"
                                            :max="30"
                                            controls-position="right"
                                    />
                                    <span class="unit-text">个</span>
                                </el-form-item>
                            </el-form>
                            <div class="form-actions">
                                <el-button type="primary" @click="saveBackupSettings">保存设置</el-button>
                            </div>
                        </el-card>
                    </div>

                    <!-- 关于系统 -->
                    <div v-if="activeTab === 'about'" class="tab-content">
                        <h2>关于系统</h2>
                        <div class="about-content">
                            <div class="system-info">
                                <div class="info-item">
                                    <span class="label">系统名称:</span>
                                    <span class="value">{{ systemInfo.name }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">系统版本:</span>
                                    <span class="value">{{ systemInfo.version }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">最后更新:</span>
                                    <span class="value">{{ systemInfo.lastUpdate }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">技术支持:</span>
                                    <span class="value">{{ systemInfo.support }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="label">版权信息:</span>
                                    <span class="value">{{ systemInfo.copyright }}</span>
                                </div>
                            </div>
                            <div class="system-stats">
                                <el-row :gutter="20">
                                    <el-col :span="8">
                                        <div class="stat-card">
                                            <div class="stat-number">{{ systemStats.users }}</div>
                                            <div class="stat-label">用户数量</div>
                                        </div>
                                    </el-col>
                                    <el-col :span="8">
                                        <div class="stat-card">
                                            <div class="stat-number">{{ systemStats.orders }}</div>
                                            <div class="stat-label">订单数量</div>
                                        </div>
                                    </el-col>
                                    <el-col :span="8">
                                        <div class="stat-card">
                                            <div class="stat-number">{{ systemStats.days }}</div>
                                            <div class="stat-label">运行天数</div>
                                        </div>
                                    </el-col>
                                </el-row>
                            </div>
                            <div class="system-actions">
                                <el-button type="primary" @click="checkUpdate">
                                    <el-icon><Refresh /></el-icon>
                                    检查更新
                                </el-button>
                                <el-button @click="showLicense = true">
                                    <el-icon><Document /></el-icon>
                                    查看许可证
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 备份历史对话框 -->
        <el-dialog v-model="showBackupHistory" title="备份历史" width="600px">
            <el-table :data="backupHistory" empty-text="暂无备份记录">
                <el-table-column prop="date" label="备份时间" width="180" />
                <el-table-column prop="size" label="文件大小" width="100" />
                <el-table-column prop="type" label="备份类型" width="100">
                    <template #default="scope">
                        <el-tag :type="scope.row.type === '自动' ? 'success' : 'primary'">
                            {{ scope.row.type }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="primary" link @click="downloadBackup(scope.row)">下载</el-button>
                        <el-button type="danger" link @click="deleteBackup(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <!-- 许可证对话框 -->
        <el-dialog v-model="showLicense" title="软件许可证" width="500px">
            <div class="license-content">
                <p>这是一个示例系统管理软件的许可证信息。</p>
                <p>版权所有 © 2024 示例公司。保留所有权利。</p>
                <p>本软件按MIT许可证条款分发。</p>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Setting,
    Brush,
    Lock,
    Bell,
    DataBoard,
    InfoFilled,
    Check,
    Download,
    Upload,
    Clock,
    Document,
    Refresh
} from '@element-plus/icons-vue'

const activeTab = ref('basic')

// 基本设置表单
const basicForm = reactive({
    systemName: '管理系统',
    version: 'v1.2.0',
    company: '示例公司',
    language: 'zh-CN',
    timezone: 'UTC+8',
    description: '这是一个功能强大的管理系统'
})

// 个性化设置表单
const personalizeForm = reactive({
    theme: 'blue',
    navMode: 'sidebar',
    menuColor: '#409EFF',
    fixedHeader: true,
    showTags: true,
    showLogo: true,
    mode: 'light'
})

const themeColors = ref([
    { value: 'blue', color: '#409EFF' },
    { value: 'green', color: '#67C23A' },
    { value: 'orange', color: '#E6A23C' },
    { value: 'red', color: '#F56C6C' },
    { value: 'purple', color: '#8E44AD' }
])

// 安全设置表单
const securityForm = reactive({
    passwordPolicy: ['minLength', 'requireNumber', 'requireLetter'],
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableCaptcha: true,
    logRetention: 90,
    ipWhitelist: ''
})

// 通知设置表单
const notificationForm = reactive({
    systemNotify: true,
    emailNotify: true,
    smsNotify: false,
    newUserNotify: true,
    orderNotify: true,
    updateNotify: true,
    frequency: 'realtime'
})

// 备份相关数据
const lastBackupTime = ref('2024-01-15 14:30:25')
const backupSize = ref('45.2 MB')
const selectedFile = ref(null)
const showBackupHistory = ref(false)
const backupHistory = ref([
    { date: '2024-01-15 14:30:25', size: '45.2 MB', type: '自动' },
    { date: '2024-01-14 10:15:30', size: '44.8 MB', type: '手动' },
    { date: '2024-01-13 09:20:15', size: '44.5 MB', type: '自动' }
])

const backupForm = reactive({
    autoBackup: true,
    frequency: 'daily',
    retention: 7
})

// 系统信息
const systemInfo = reactive({
    name: '管理系统',
    version: 'v1.2.0',
    lastUpdate: '2024-01-15',
    support: 'support@example.com',
    copyright: '© 2024 示例公司. 保留所有权利.'
})

const systemStats = reactive({
    users: 156,
    orders: 892,
    days: 45
})

const showLicense = ref(false)

const handleTabChange = (key) => {
    activeTab.value = key
}

// 保存设置的方法
const saveBasicSettings = async () => {
    try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('基本设置保存成功')
    } catch (error) {
        ElMessage.error('保存失败')
    }
}

const savePersonalizeSettings = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('个性化设置保存成功')
    } catch (error) {
        ElMessage.error('保存失败')
    }
}

const saveSecuritySettings = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('安全设置保存成功')
    } catch (error) {
        ElMessage.error('保存失败')
    }
}

const saveNotificationSettings = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('通知设置保存成功')
    } catch (error) {
        ElMessage.error('保存失败')
    }
}

const saveBackupSettings = async () => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('备份设置保存成功')
    } catch (error) {
        ElMessage.error('保存失败')
    }
}

// 重置方法
const resetBasicSettings = () => {
    Object.assign(basicForm, {
        systemName: '管理系统',
        version: 'v1.2.0',
        company: '示例公司',
        language: 'zh-CN',
        timezone: 'UTC+8',
        description: '这是一个功能强大的管理系统'
    })
    ElMessage.info('已重置为默认值')
}

const resetPersonalizeSettings = () => {
    Object.assign(personalizeForm, {
        theme: 'blue',
        navMode: 'sidebar',
        menuColor: '#409EFF',
        fixedHeader: true,
        showTags: true,
        showLogo: true,
        mode: 'light'
    })
    ElMessage.info('已重置为默认值')
}

const resetSecuritySettings = () => {
    Object.assign(securityForm, {
        passwordPolicy: ['minLength', 'requireNumber', 'requireLetter'],
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        enableCaptcha: true,
        logRetention: 90,
        ipWhitelist: ''
    })
    ElMessage.info('已重置为默认值')
}

const resetNotificationSettings = () => {
    Object.assign(notificationForm, {
        systemNotify: true,
        emailNotify: true,
        smsNotify: false,
        newUserNotify: true,
        orderNotify: true,
        updateNotify: true,
        frequency: 'realtime'
    })
    ElMessage.info('已重置为默认值')
}

// 备份相关方法
const handleBackup = async () => {
    try {
        ElMessage.info('开始备份数据...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        ElMessage.success('数据备份完成')

        // 更新备份信息
        lastBackupTime.value = new Date().toLocaleString('zh-CN')
        backupSize.value = '46.1 MB'

        // 添加到备份历史
        backupHistory.value.unshift({
            date: lastBackupTime.value,
            size: backupSize.value,
            type: '手动'
        })
    } catch (error) {
        ElMessage.error('备份失败')
    }
}

const handleFileChange = (file) => {
    selectedFile.value = file
    ElMessage.info(`已选择文件: ${file.name}`)
}

const handleRestore = async () => {
    if (!selectedFile.value) {
        ElMessage.warning('请先选择备份文件')
        return
    }

    try {
        await ElMessageBox.confirm(
                '此操作将使用备份文件恢复系统数据，可能会覆盖现有数据。确定要继续吗？',
                '警告',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
        )

        ElMessage.info('开始恢复数据...')
        await new Promise(resolve => setTimeout(resolve, 3000))
        ElMessage.success('数据恢复完成')
        selectedFile.value = null
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('恢复失败')
        }
    }
}

const downloadBackup = (backup) => {
    ElMessage.info(`开始下载备份: ${backup.date}`)
}

const deleteBackup = async (backup) => {
    try {
        await ElMessageBox.confirm(
                `确定要删除备份文件 ${backup.date} 吗？`,
                '确认删除',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                }
        )

        const index = backupHistory.value.findIndex(item => item.date === backup.date)
        if (index > -1) {
            backupHistory.value.splice(index, 1)
            ElMessage.success('备份文件已删除')
        }
    } catch (error) {
        // 用户取消删除
    }
}

const checkUpdate = async () => {
    ElMessage.info('正在检查更新...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    ElMessage.success('当前已是最新版本')
}

onMounted(() => {
    // 可以在这里加载保存的设置
})
</script>

<style scoped>
.system-settings {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
}

.page-header {
    margin-bottom: 24px;
}

.page-header h1 {
    margin: 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
}

.page-header p {
    margin: 8px 0 0;
    color: #909399;
    font-size: 14px;
}

.setting-nav {
    margin-bottom: 20px;
}

.setting-menu {
    border: none;
}

.setting-content {
    min-height: 600px;
}

.tab-content h2 {
    margin: 0 0 20px 0;
    color: #303133;
    font-size: 20px;
    font-weight: 600;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
}

.form-actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    text-align: right;
}

.unit-text {
    margin-left: 8px;
    color: #909399;
}

.theme-colors {
    display: flex;
    gap: 12px;
}

.color-option {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border: 2px solid transparent;
    transition: all 0.3s;
}

.color-option.active {
    border-color: #303133;
    transform: scale(1.1);
}

.backup-card,
.restore-card {
    text-align: center;
}

.backup-info,
.restore-info {
    margin-bottom: 20px;
}

.backup-info p,
.restore-info p {
    margin: 8px 0;
    color: #606266;
}

.backup-actions,
.restore-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.backup-upload {
    margin-top: 12px;
}

.about-content {
    max-width: 600px;
}

.system-info {
    margin-bottom: 30px;
}

.info-item {
    display: flex;
    margin-bottom: 12px;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.info-item .label {
    width: 100px;
    font-weight: 500;
    color: #606266;
}

.info-item .value {
    flex: 1;
    color: #303133;
}

.system-stats {
    margin-bottom: 30px;
}

.stat-card {
    text-align: center;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.stat-number {
    font-size: 28px;
    font-weight: 600;
    color: #409EFF;
    margin-bottom: 8px;
}

.stat-label {
    color: #909399;
    font-size: 14px;
}

.system-actions {
    text-align: center;
}

.license-content {
    line-height: 1.6;
    color: #606266;
}

.license-content p {
    margin-bottom: 12px;
}

:deep(.el-menu-item) {
    height: 50px;
    line-height: 50px;
    margin: 4px 0;
    border-radius: 6px;
}

:deep(.el-menu-item.is-active) {
    background-color: #ecf5ff;
    color: #409EFF;
}

:deep(.el-card__header) {
    border-bottom: 1px solid #f0f0f0;
    padding: 16px 20px;
}

:deep(.el-form-item) {
    margin-bottom: 20px;
}
</style>
