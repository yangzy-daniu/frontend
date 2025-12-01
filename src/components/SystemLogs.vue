<template>
    <div class="system-logs-page">
        <!-- 页面标题和工具栏 -->
        <div class="page-header">
            <div class="header-content">
                <div class="title-section">
                    <h1>系统日志</h1>
                    <p>查看系统运行状态和事件记录</p>
                </div>
                <div class="toolbar">
                    <el-button-group>
                        <el-button
                                :type="timeRange === '1h' ? 'primary' : ''"
                                @click="changeTimeRange('1h')"
                        >
                            最近1小时
                        </el-button>
                        <el-button
                                :type="timeRange === '24h' ? 'primary' : ''"
                                @click="changeTimeRange('24h')"
                        >
                            最近24小时
                        </el-button>
                        <el-button
                                :type="timeRange === '7d' ? 'primary' : ''"
                                @click="changeTimeRange('7d')"
                        >
                            最近7天
                        </el-button>
                    </el-button-group>
                    <el-button
                            type="primary"
                            @click="exportData"
                            :loading="exportLoading"
                    >
                        <el-icon><Download /></el-icon>
                        导出日志
                    </el-button>
                    <el-button @click="refreshData">
                        <el-icon><Refresh /></el-icon>
                        刷新
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 筛选条件 -->
        <el-card class="filter-card" shadow="never">
            <el-form :model="filterForm" inline>
                <el-form-item label="日志级别">
                    <el-select v-model="filterForm.level" placeholder="全部级别" clearable filterable>
                        <el-option label="信息" value="INFO" />
                        <el-option label="警告" value="WARNING" />
                        <el-option label="错误" value="ERROR" />
                        <el-option label="严重" value="CRITICAL" />
                    </el-select>
                </el-form-item>

                <el-form-item label="服务名称">
                    <el-select v-model="filterForm.service" placeholder="全部服务" clearable filterable>
                        <el-option label="API网关" value="API网关" />
                        <el-option label="用户服务" value="用户服务" />
                        <el-option label="订单服务" value="订单服务" />
                        <el-option label="支付服务" value="支付服务" />
                        <el-option label="数据库" value="数据库" />
                        <el-option label="消息队列" value="消息队列" />
                    </el-select>
                </el-form-item>

                <el-form-item label="模块">
                    <el-input v-model="filterForm.module" placeholder="模块名称" clearable />
                </el-form-item>

                <el-form-item label="用户">
                    <el-input v-model="filterForm.username" placeholder="用户名" clearable />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSearch">查询</el-button>
                    <el-button @click="handleReset">重置</el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 统计卡片 -->
        <el-row class="stats-cards">
            <el-col :span="24">
                <el-card class="stats-container" shadow="never">
                    <div class="stats-row">
                        <div class="stats-item info-stats">
                            <div class="stats-icon">
                                <el-icon><InfoFilled /></el-icon>
                            </div>
                            <div class="stats-info">
                                <div class="stats-value">{{ stats.infoCount || 0 }}</div>
                                <div class="stats-label">信息</div>
                            </div>
                        </div>

                        <div class="stats-item warning-stats">
                            <div class="stats-icon">
                                <el-icon><Warning /></el-icon>
                            </div>
                            <div class="stats-info">
                                <div class="stats-value">{{ stats.warningCount || 0 }}</div>
                                <div class="stats-label">警告</div>
                            </div>
                        </div>

                        <div class="stats-item error-stats">
                            <div class="stats-icon">
                                <el-icon><CircleCloseFilled /></el-icon>
                            </div>
                            <div class="stats-info">
                                <div class="stats-value">{{ stats.errorCount || 0 }}</div>
                                <div class="stats-label">错误</div>
                            </div>
                        </div>

                        <div class="stats-item critical-stats">
                            <div class="stats-icon">
                                <el-icon><RemoveFilled /></el-icon>
                            </div>
                            <div class="stats-info">
                                <div class="stats-value">{{ stats.criticalCount || 0 }}</div>
                                <div class="stats-label">严重</div>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 日志表格 -->
        <el-card class="table-card" shadow="never">
            <template #header>
                <div class="table-header">
                    <span>系统日志记录</span>
                    <div class="table-actions">
                        <el-button text @click="clearLogs" :loading="clearLoading">
                            <el-icon><Delete /></el-icon>
                            清空日志
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table
                    :data="logData"
                    v-loading="tableLoading"
                    stripe
                    style="width: 100%"
                    :default-sort="{ prop: 'timestamp', order: 'descending' }"
            >
                <el-table-column prop="timestamp" label="时间" width="160" sortable>
                    <template #default="{ row }">
                        {{ formatDateTime(row.timestamp) }}
                    </template>
                </el-table-column>

                <el-table-column prop="level" label="级别" width="100" sortable>
                    <template #default="{ row }">
                        <el-tag :type="getLogLevelType(row.level)" size="small" effect="dark">
                            {{ getLevelText(row.level) }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="service" label="服务" width="120" show-overflow-tooltip />

                <el-table-column prop="module" label="模块" width="120" show-overflow-tooltip />

                <el-table-column prop="username" label="用户" width="100" show-overflow-tooltip>
                    <template #default="{ row }">
                        {{ row.username || '系统' }}
                    </template>
                </el-table-column>

                <el-table-column prop="message" label="消息" min-width="200" show-overflow-tooltip />

                <el-table-column label="操作" width="80" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="viewLogDetail(row)">
                            详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination
                        background
                        v-model:current-page="pagination.currentPage"
                        v-model:page-size="pagination.pageSize"
                        :total="pagination.total"
                        :page-sizes="[10, 20, 50, 100]"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 日志详情对话框 -->
        <el-dialog
                v-model="logDetailVisible"
                title="系统日志详情"
                width="700px"
        >
            <div v-if="selectedLog" class="log-detail">
                <el-descriptions :column="1" border>
                    <el-descriptions-item label="时间">
                        {{ formatDateTime(selectedLog.timestamp) }}
                    </el-descriptions-item>

                    <el-descriptions-item label="级别">
                        <el-tag :type="getLogLevelType(selectedLog.level)" effect="dark">
                            {{ getLevelText(selectedLog.level) }}
                        </el-tag>
                    </el-descriptions-item>

                    <el-descriptions-item label="服务">
                        {{ selectedLog.service }}
                    </el-descriptions-item>

                    <el-descriptions-item label="模块">
                        {{ selectedLog.module || '无' }}
                    </el-descriptions-item>

                    <el-descriptions-item label="用户">
                        {{ selectedLog.username || '系统' }}
                    </el-descriptions-item>

                    <el-descriptions-item label="IP地址">
                        {{ selectedLog.ipAddress || '无' }}
                    </el-descriptions-item>

                    <el-descriptions-item label="操作">
                        {{ selectedLog.operation || '无' }}
                    </el-descriptions-item>

                    <el-descriptions-item label="消息">
                        <el-text class="message-text">{{ selectedLog.message }}</el-text>
                    </el-descriptions-item>

                    <el-descriptions-item v-if="selectedLog.details" label="详细信息">
                        <pre class="details-text">{{ selectedLog.details }}</pre>
                    </el-descriptions-item>
                </el-descriptions>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import {ref, reactive, computed, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {
    getSystemLogs,
    getRecentLogs,
    getSystemLogStats,
    clearSystemLogs,
    exportSystemLogs
} from '@/api/systemLog'
import {
    Download,
    Refresh,
    InfoFilled,
    Warning,
    CircleCloseFilled,
    RemoveFilled,
    Delete
} from '@element-plus/icons-vue'

// 响应式数据
const timeRange = ref('24h')
const exportLoading = ref(false)
const tableLoading = ref(false)
const clearLoading = ref(false)
const logDetailVisible = ref(false)
const selectedLog = ref(null)

// 筛选表单
const filterForm = reactive({
    level: '',
    service: '',
    module: '',
    username: ''
})

// 统计数据
const stats = ref({
    infoCount: 0,
    warningCount: 0,
    errorCount: 0,
    criticalCount: 0
})

// 分页数据
const pagination = reactive({
    currentPage: 1,
    pageSize: 20,
    total: 0
})

// 日志数据
const logData = ref([])

// 计算时间范围
const timeRangeMap = computed(() => {
    const now = new Date()
    const ranges = {
        '1h': {start: new Date(now.getTime() - 1 * 60 * 60 * 1000), end: now},
        '24h': {start: new Date(now.getTime() - 24 * 60 * 60 * 1000), end: now},
        '7d': {start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), end: now}
    }
    return ranges[timeRange.value] || ranges['24h']
})

// 生命周期
onMounted(() => {
    loadLogData()
    loadStats()
})

// 加载日志数据
const loadLogData = async () => {
    tableLoading.value = true
    try {
        const params = {
            page: pagination.currentPage,
            size: pagination.pageSize,
            ...filterForm,
            startTime: formatDateTimeForApi(timeRangeMap.value.start),
            endTime: formatDateTimeForApi(timeRangeMap.value.end)
        }

        // 移除空值参数
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null || params[key] === undefined) {
                delete params[key]
            }
        })

        const response = await getSystemLogs(params)
        if (response.status === 200) {
            logData.value = response.data.content || response.data.items || []
            pagination.total = response.data.totalElements || response.data.total || 0
        } else {
            ElMessage.error('获取日志数据失败')
        }
    } catch (error) {
        console.error('加载日志数据失败:', error)
        ElMessage.error('加载日志数据失败')
    } finally {
        tableLoading.value = false
    }
}

// 加载统计数据
const loadStats = async () => {
    try {
        const params = {
            startTime: formatDateTimeForApi(timeRangeMap.value.start),
            endTime: formatDateTimeForApi(timeRangeMap.value.end)
        }

        const response = await getSystemLogStats(params)
        if (response.status === 200) {
            // stats.value = response.data
            stats.value = response.data.data || response.data
        } else {
            ElMessage.error('获取统计数据失败')
        }
    } catch (error) {
        console.error('加载统计数据失败:', error)
        ElMessage.error('加载统计数据失败')
    }
}

// 工具函数
const formatDateTime = (date) => {
    return new Date(date).toLocaleString('zh-CN')
}

const formatDateTimeForApi = (date) => {
    // 格式化为 yyyy-MM-dd HH:mm:ss
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const getLogLevelType = (level) => {
    const typeMap = {
        'INFO': 'primary',
        'WARNING': 'warning',
        'ERROR': 'danger',
        'CRITICAL': 'danger'
    }
    return typeMap[level] || 'info'
}

const getLevelText = (level) => {
    const textMap = {
        'INFO': '信息',
        'WARNING': '警告',
        'ERROR': '错误',
        'CRITICAL': '严重'
    }
    return textMap[level] || level
}

// 事件处理
const changeTimeRange = (range) => {
    timeRange.value = range
    pagination.currentPage = 1
    loadLogData()
    loadStats()
}

const handleSearch = () => {
    pagination.currentPage = 1
    loadLogData()
}

const handleReset = () => {
    Object.keys(filterForm).forEach(key => {
        filterForm[key] = ''
    })
    pagination.currentPage = 1
    loadLogData()
}

const exportData = async () => {
    exportLoading.value = true
    try {
        const params = {
            ...filterForm,
            startTime: formatDateTimeForApi(timeRangeMap.value.start),
            endTime: formatDateTimeForApi(timeRangeMap.value.end)
        }
        // 添加responseType: 'blob'告诉axios返回Blob数据
        const response = await exportSystemLogs(params, {
            responseType: 'blob'
        })
        // const response = await exportSystemLogs(params)

        // 获取后端返回的文件名（如果有的话）
        const contentDisposition = response.headers['content-disposition']
        let fileName = `系统日志_${new Date().getTime()}.xlsx`
        if (contentDisposition) {
            const match = contentDisposition.match(/filename\*=UTF-8''(.+)/)
            if (match && match[1]) {
                fileName = decodeURIComponent(match[1])
            }
        }
        // 使用responseType: 'blob'后，response.data就是Blob对象
        const blob = new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        // const blob = new Blob([response], {type: 'application/vnd.ms-excel'})

        // 创建下载链接
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = fileName // `系统日志_${new Date().toLocaleDateString()}.xlsx`

        // 添加到文档中并点击（兼容部分浏览器）
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)

        ElMessage.success('日志导出成功')
    } catch (error) {
        console.error('导出失败:', error)
        ElMessage.error('导出失败')
    } finally {
        exportLoading.value = false
    }
}

const refreshData = () => {
    loadLogData()
    loadStats()
    ElMessage.success('数据已刷新')
}

const clearLogs = async () => {
    try {
        await ElMessageBox.confirm('确定要清空所有系统日志吗？此操作不可恢复。', '警告', {
            type: 'warning',
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        })

        clearLoading.value = true
        await clearSystemLogs()
        ElMessage.success('日志清空成功')
        await loadLogData()
        await loadStats()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('清空日志失败')
        }
    } finally {
        clearLoading.value = false
    }
}

const viewLogDetail = (log) => {
    selectedLog.value = log
    logDetailVisible.value = true
}

const handleSizeChange = (size) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    loadLogData()
}

const handleCurrentChange = (page) => {
    pagination.currentPage = page
    loadLogData()
}
</script>

<style scoped>
.system-logs-page {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: calc(100vh - 60px);
}

.page-header {
    margin-bottom: 24px;
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.title-section h1 {
    margin: 0;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
}

.title-section p {
    margin: 8px 0 0;
    color: #909399;
    font-size: 14px;
}

.toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
}

.filter-card {
    margin-bottom: 20px;
    border-radius: 8px;
}

.filter-card :deep(.el-card__body) {
    padding: 20px;
}

.info-card .stats-icon {
    background-color: #409EFF;
}

.warning-card .stats-icon {
    background-color: #E6A23C;
}

.error-card .stats-icon {
    background-color: #F56C6C;
}

.critical-card .stats-icon {
    background-color: #F56C6C;
}

.table-card {
    border-radius: 8px;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-actions {
    display: flex;
    gap: 8px;
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.log-detail {
    max-height: 70vh;
    overflow-y: auto;
}

.message-text, .details-text {
    word-break: break-all;
    white-space: normal;
}

.details-text {
    background-color: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.4;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
}

:deep(.el-descriptions) {
    margin-top: 10px;
}

:deep(.el-descriptions__body) {
    background-color: #fafafa;
}

:deep(.el-descriptions__label) {
    font-weight: 600;
    color: #606266;
    width: 100px;
}

:deep(.el-descriptions__content) {
    color: #303133;
}

.stats-card :deep(.el-card__body) {
    padding: 20px 16px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 统计卡片样式修复 */
.stats-cards {
    margin-bottom: 20px;
}

.stats-container {
    border-radius: 8px;
    border: none;
}

.stats-container :deep(.el-card__body) {
    padding: 0;
}

.stats-row {
    display: flex;
    width: 100%;
    gap: 1px;
}

.stats-item {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 20px 16px;
    border-right: 1px solid #f0f0f0;
}

.stats-item:last-child {
    border-right: none;
}

.stats-icon {
    width: 50px;
    height: 50px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 22px;
    color: white;
    flex-shrink: 0;
}

.stats-info {
    flex: 1;
    min-width: 0;
}

.stats-value {
    font-size: 24px;
    font-weight: 700;
    color: #303133;
    line-height: 1.2;
    margin-bottom: 4px;
}

.stats-label {
    color: #909399;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
}

/* 确保卡片颜色正确 */
.info-stats .stats-icon { background-color: #409EFF; }
.warning-stats .stats-icon { background-color: #E6A23C; }
.error-stats .stats-icon { background-color: #F56C6C; }
.critical-stats .stats-icon { background-color: #F56C6C; }

/* 移动端优化 */
@media (max-width: 768px) {
    .stats-item {
        padding: 16px 12px;
        flex-direction: column;
        text-align: center;
    }

    .stats-icon {
        width: 40px;
        height: 40px;
        font-size: 18px;
        margin-right: 0;
        margin-bottom: 8px;
    }

    .stats-value {
        font-size: 20px;
        margin-bottom: 2px;
    }

    .stats-label {
        font-size: 12px;
    }
}

@media (max-width: 480px) {
    .stats-item {
        padding: 12px 8px;
    }

    .stats-icon {
        width: 36px;
        height: 36px;
        font-size: 16px;
        margin-bottom: 6px;
    }

    .stats-value {
        font-size: 18px;
    }

    .stats-label {
        font-size: 11px;
    }
}
</style>
