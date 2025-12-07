<template>
    <div class="system-update-check">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>系统更新</span>
                    <div>
                        <el-button type="primary" @click="checkForUpdates" :loading="checking">
                            <el-icon><Refresh /></el-icon>
                            检查更新
                        </el-button>
                        <el-button @click="viewUpdateHistory" v-if="hasUpdateHistory">
                            更新历史
                        </el-button>
                    </div>
                </div>
            </template>

            <!-- 更新状态 -->
            <div v-if="updateInfo" class="update-status">
                <div v-if="updateInfo.hasUpdate" class="update-available">
                    <el-alert
                            :title="updateInfo.message"
                            :type="updateInfo.forceUpdate ? 'error' : 'warning'"
                            :closable="false"
                            show-icon
                    >
                        <template #default>
                            <div class="update-details">
                                <h4>{{ updateInfo.latestUpdate.title }} ({{ updateInfo.latestUpdate.version }})</h4>
                                <p>{{ updateInfo.latestUpdate.description }}</p>

                                <div class="update-meta">
                                    <el-tag size="small">{{ updateInfo.latestUpdate.updateTypeLabel }}</el-tag>
                                    <span class="update-time">
                                        发布时间：{{ formatDate(updateInfo.latestUpdate.releaseTime) }}
                                    </span>
                                    <span v-if="updateInfo.latestUpdate.fileSize" class="file-size">
                                        文件大小：{{ updateInfo.latestUpdate.fileSizeFormat }}
                                    </span>
                                </div>

                                <!-- 更新日志 -->
                                <div v-if="updateInfo.latestUpdate.releaseNotes" class="release-notes">
                                    <h5>更新日志：</h5>
                                    <pre>{{ updateInfo.latestUpdate.releaseNotes }}</pre>
                                </div>

                                <!-- 操作按钮 -->
                                <div class="update-actions">
                                    <el-button
                                            type="primary"
                                            @click="applyUpdate"
                                            :loading="applying"
                                    >
                                        立即更新
                                    </el-button>

                                    <el-button
                                            v-if="!updateInfo.forceUpdate"
                                            @click="remindLater"
                                    >
                                        稍后提醒
                                    </el-button>

                                    <el-button
                                            type="danger"
                                            @click="ignoreUpdate"
                                            v-if="!updateInfo.forceUpdate"
                                    >
                                        忽略此版本
                                    </el-button>
                                </div>
                            </div>
                        </template>
                    </el-alert>
                </div>

                <div v-else class="no-update">
                    <el-result
                            icon="success"
                            title="系统已是最新版本"
                            :sub-title="updateInfo.message"
                    >
                        <template #extra>
                            <el-button type="primary" @click="checkForUpdates">
                                重新检查
                            </el-button>
                        </template>
                    </el-result>

                    <div v-if="currentVersion" class="current-version">
                        当前版本：<el-tag type="info">{{ currentVersion }}</el-tag>
                    </div>
                </div>
            </div>

            <!-- 加载状态 -->
            <div v-else-if="checking" class="loading">
                <el-skeleton :rows="3" animated />
            </div>
        </el-card>

        <!-- 更新历史对话框 -->
        <el-dialog
                v-model="historyDialogVisible"
                title="更新历史"
                width="800px"
        >
            <div v-loading="loadingHistory">
                <el-timeline v-if="updateHistory.length > 0">
                    <el-timeline-item
                            v-for="update in updateHistory"
                            :key="update.id"
                            :timestamp="formatDate(update.releaseTime)"
                            :type="getTimelineType(update.updateType)"
                            placement="top"
                    >
                        <el-card>
                            <template #header>
                                <div class="history-item-header">
                                    <strong>{{ update.title }}</strong>
                                    <div>
                                        <el-tag size="small" :type="getTagType(update.updateType)">
                                            {{ update.updateTypeLabel }}
                                        </el-tag>
                                        <el-tag size="small" type="info">
                                            {{ update.version }}
                                        </el-tag>
                                    </div>
                                </div>
                            </template>
                            <p>{{ update.description }}</p>
                            <div v-if="update.releaseNotes" class="history-release-notes">
                                <p><strong>更新内容：</strong></p>
                                <pre>{{ update.releaseNotes }}</pre>
                            </div>
                            <div class="history-meta">
                                <span>发布人：{{ update.createdByName || '系统' }}</span>
                                <span>发布时间：{{ formatDate(update.releaseTime) }}</span>
                            </div>
                        </el-card>
                    </el-timeline-item>
                </el-timeline>

                <el-empty v-else description="暂无更新历史" />
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import {
    checkSystemUpdates,
    getUpdateHistory,
    applySystemUpdate, getCurrentVersion
} from '@/api/system'

const checking = ref(false)
const applying = ref(false)
const loadingHistory = ref(false)
const historyDialogVisible = ref(false)

const updateInfo = ref(null)
const currentVersion = ref('')
const updateHistory = ref([])

// 检查更新
const checkForUpdates = async () => {
    checking.value = true
    try {
        // 先获取当前版本
        const versionRes = await getCurrentVersion()
        currentVersion.value = versionRes.data.version

        // 然后检查是否有更新
        const response = await checkSystemUpdates(currentVersion.value)
        updateInfo.value = response.data

        // 如果有更新，检查是否被忽略
        if (updateInfo.value?.hasUpdate && updateInfo.value?.latestUpdate?.version) {
            const ignoredVersions = JSON.parse(localStorage.getItem('ignoredVersions') || '[]')
            if (ignoredVersions.includes(updateInfo.value.latestUpdate.version)) {
                updateInfo.value = {
                    ...updateInfo.value,
                    hasUpdate: false,
                    message: '您已忽略此版本更新'
                }
            }
        }
    } catch (error) {
        console.error('检查更新失败:', error)
        ElMessage.error('检查更新失败: ' + error.message)
    } finally {
        checking.value = false
    }
}

// 获取详细版本信息
const getVersionDetails = async () => {
    try {
        const response = await getVersionInfo()
        console.log('版本详细信息:', response.data)
        return response.data
    } catch (error) {
        console.error('获取版本信息失败:', error)
    }
}

// 应用更新
const applyUpdate = async () => {
    try {
        await ElMessageBox.confirm(
                '确定要应用此更新吗？更新过程中请不要关闭浏览器。',
                '确认更新',
                {
                    type: 'warning',
                    confirmButtonText: '确定更新',
                    cancelButtonText: '取消'
                }
        )

        applying.value = true
        // 这里调用实际的应用更新接口
        // await applySystemUpdate(updateInfo.value.latestUpdate.id)

        // 模拟更新过程
        setTimeout(() => {
            applying.value = false
            ElMessage.success('更新成功，请刷新页面')
            // 更新当前版本显示
            currentVersion.value = updateInfo.value.latestVersion
            updateInfo.value = null
        }, 2000)

    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('更新失败: ' + error.message)
        }
        applying.value = false
    }
}

// 稍后提醒
const remindLater = () => {
    localStorage.setItem('ignoreUpdateUntil', Date.now() + 24 * 60 * 60 * 1000) // 24小时后
    updateInfo.value = null
    ElMessage.info('已设置24小时后提醒')
}

// 忽略此版本
const ignoreUpdate = () => {
    if (updateInfo.value?.latestUpdate?.version) {
        const ignoredVersions = JSON.parse(localStorage.getItem('ignoredVersions') || '[]')
        ignoredVersions.push(updateInfo.value.latestUpdate.version)
        localStorage.setItem('ignoredVersions', JSON.stringify(ignoredVersions))
        updateInfo.value = null
        ElMessage.info('已忽略此版本')
    }
}

// 查看更新历史
const viewUpdateHistory = async () => {
    historyDialogVisible.value = true
    if (updateHistory.value.length === 0) {
        loadingHistory.value = true
        try {
            const response = await getUpdateHistory()
            updateHistory.value = response.data
        } catch (error) {
            console.error('获取更新历史失败:', error)
        } finally {
            loadingHistory.value = false
        }
    }
}

// 格式化日期
const formatDate = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 获取时间线类型
const getTimelineType = (updateType) => {
    const types = {
        'FEATURE': 'primary',
        'BUG_FIX': 'success',
        'SECURITY': 'danger',
        'OPTIMIZATION': 'warning'
    }
    return types[updateType] || ''
}

// 获取标签类型
const getTagType = (updateType) => {
    const types = {
        'FEATURE': '',
        'BUG_FIX': 'success',
        'SECURITY': 'danger',
        'OPTIMIZATION': 'warning'
    }
    return types[updateType] || ''
}

// 是否有更新历史
const hasUpdateHistory = computed(() => {
    return updateHistory.value.length > 0 || updateInfo.value?.hasUpdate
})

onMounted(() => {
    // 页面加载时自动检查更新
    checkForUpdates()
    // 获取详细版本信息（可选）
    // getVersionDetails()
    // 获取当前版本
    currentVersion.value = localStorage.getItem('systemVersion') || '1.0.0'
})
</script>

<style scoped>
.system-update-check {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.update-status {
    margin: 20px 0;
}

.update-details {
    margin-top: 10px;
}

.update-details h4 {
    margin: 10px 0 5px;
    color: #303133;
}

.update-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px 0;
    color: #909399;
    font-size: 14px;
}

.release-notes {
    margin: 15px 0;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
}

.release-notes h5 {
    margin: 0 0 5px;
    color: #606266;
}

.release-notes pre {
    margin: 0;
    white-space: pre-wrap;
    font-size: 13px;
    line-height: 1.5;
    color: #606266;
}

.update-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
}

.no-update {
    text-align: center;
    padding: 40px 0;
}

.current-version {
    margin-top: 20px;
}

.history-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.history-release-notes {
    margin: 10px 0;
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-size: 13px;
}

.history-release-notes pre {
    margin: 5px 0 0;
    white-space: pre-wrap;
    line-height: 1.4;
}

.history-meta {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    color: #909399;
    font-size: 12px;
}
</style>
