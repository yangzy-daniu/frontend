<template>
    <div class="monitor-page">
        <!-- 页面标题和工具栏 -->
        <div class="page-header">
            <div class="header-content">
                <div class="title-section">
                    <h1>系统监控</h1>
                    <p>实时监控系统运行状态和性能指标</p>
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
                                :type="timeRange === '6h' ? 'primary' : ''"
                                @click="changeTimeRange('6h')"
                        >
                            最近6小时
                        </el-button>
                        <el-button
                                :type="timeRange === '24h' ? 'primary' : ''"
                                @click="changeTimeRange('24h')"
                        >
                            最近24小时
                        </el-button>
                    </el-button-group>
                    <el-button
                            type="primary"
                            @click="exportData"
                            :loading="exportLoading"
                    >
                        <el-icon><Download /></el-icon>
                        导出数据
                    </el-button>
                    <el-button @click="refreshData">
                        <el-icon><Refresh /></el-icon>
                        刷新
                    </el-button>
                </div>
            </div>
        </div>

        <!-- 关键指标卡片 -->
        <el-row :gutter="20" class="stats-cards">
            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon cpu-icon">
                            <el-icon><Cpu /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ stats.cpuUsage }}%</div>
                            <div class="stats-label">CPU使用率</div>
                            <div class="stats-change" :class="getUsageClass(stats.cpuUsage)">
                                <el-icon><Warning v-if="stats.cpuUsage > 80" /></el-icon>
                                {{ stats.cpuUsage > 80 ? '高负载' : '正常' }}
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon memory-icon">
                            <el-icon><DataBoard /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ stats.memoryUsage }}%</div>
                            <div class="stats-label">内存使用率</div>
                            <div class="stats-change" :class="getUsageClass(stats.memoryUsage)">
                                <el-icon><Warning v-if="stats.memoryUsage > 85" /></el-icon>
                                {{ stats.memoryUsage > 85 ? '高负载' : '正常' }}
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon disk-icon">
                            <el-icon><Box /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ stats.diskUsage }}%</div>
                            <div class="stats-label">磁盘使用率</div>
                            <div class="stats-change" :class="getUsageClass(stats.diskUsage)">
                                <el-icon><Warning v-if="stats.diskUsage > 90" /></el-icon>
                                {{ stats.diskUsage > 90 ? '空间不足' : '正常' }}
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon network-icon">
                            <el-icon><Connection /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ formatNumber(stats.networkTraffic) }}</div>
                            <div class="stats-label">网络流量(KB/s)</div>
                            <div class="stats-change" :class="getTrafficClass(stats.networkTraffic)">
                                <el-icon><Top v-if="stats.networkTraffic > 1000" /><Bottom v-else /></el-icon>
                                {{ stats.networkTraffic > 1000 ? '高流量' : '正常' }}
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 主要图表区域 -->
        <el-row :gutter="20" class="chart-row">
            <!-- 系统性能指标 -->
            <el-col :xs="24" :lg="12">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <span>系统性能指标</span>
                    </template>
                    <div ref="performanceChart" class="chart-container"></div>
                </el-card>
            </el-col>

            <!-- 错误统计 -->
            <el-col :xs="24" :lg="12">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <span>错误统计</span>
                    </template>
                    <div ref="errorChart" class="chart-container"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 第二行图表 -->
        <el-row :gutter="20" class="chart-row">
            <!-- 资源使用趋势 -->
            <el-col :xs="24" :lg="12">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <div class="chart-header">
                            <span>资源使用趋势</span>
                            <div class="chart-actions">
                                <el-radio-group v-model="resourceType" size="small">
                                    <el-radio-button label="cpu">CPU</el-radio-button>
                                    <el-radio-button label="memory">内存</el-radio-button>
                                    <el-radio-button label="disk">磁盘</el-radio-button>
                                </el-radio-group>
                            </div>
                        </div>
                    </template>
                    <div ref="resourceChart" class="chart-container"></div>
                </el-card>
            </el-col>

            <!-- 服务状态 -->
            <el-col :xs="24" :lg="12">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <span>服务状态</span>
                    </template>
                    <div class="service-status">
                        <div v-for="service in services" :key="service.name" class="service-item">
                            <div class="service-info">
                                <div class="service-name">{{ service.name }}</div>
                                <div class="service-desc">{{ service.description }}</div>
                            </div>
                            <div class="service-status-indicator">
                                <el-tag :type="service.status === 'running' ? 'success' : 'danger'">
                                    {{ service.status === 'running' ? '运行中' : '异常' }}
                                </el-tag>
                                <div class="service-uptime">运行时间: {{ service.uptime }}</div>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 数据表格区域 -->
        <el-row :gutter="20" class="table-row">
            <el-col :xs="24">
                <el-card class="table-card" shadow="hover">
                    <template #header>
                        <div class="table-header">
                            <span>系统事件日志</span>
                            <el-button type="primary" text @click="showAllLogs">
                                查看全部
                            </el-button>
                        </div>
                    </template>
                    <el-table
                            :data="systemLogs"
                            v-loading="tableLoading"
                            stripe
                            style="width: 100%"
                            :default-sort="{ prop: 'timestamp', order: 'descending' }"
                    >
                        <el-table-column prop="timestamp" label="时间" width="160">
                            <template #default="{ row }">
                                {{ formatDateTime(row.timestamp) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="level" label="级别" width="100">
                            <template #default="{ row }">
                                <el-tag :type="getLogLevelType(row.level)" size="small">
                                    {{ row.level }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="service" label="服务" width="120" />
                        <el-table-column prop="message" label="消息" min-width="300" show-overflow-tooltip />
                        <el-table-column label="操作" width="80">
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
                                layout="total, sizes, prev, pager, next, jumper"
                                @size-change="handleSizeChange"
                                @current-change="handleCurrentChange"
                        />
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 日志详情对话框 -->
        <el-dialog
                v-model="logDetailVisible"
                title="系统事件详情"
                width="700px"
        >
            <div v-if="selectedLog" class="log-detail">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="时间" :span="2">
                        {{ formatDateTime(selectedLog.timestamp) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="级别" :span="1">
                        <el-tag :type="getLogLevelType(selectedLog.level)">
                            {{ selectedLog.level }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="服务" :span="1">
                        {{ selectedLog.service }}
                    </el-descriptions-item>
                    <el-descriptions-item label="消息" :span="2">
                        <el-text class="message-text">{{ selectedLog.message }}</el-text>
                    </el-descriptions-item>
                    <el-descriptions-item v-if="selectedLog.details" label="详细信息" :span="2">
                        <pre class="details-text">{{ selectedLog.details }}</pre>
                    </el-descriptions-item>
                </el-descriptions>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import {
    Cpu,           // CPU
    DataBoard,     // 数据面板
    // Memory,        // 内存
    Monitor,       // 显示器
    Connection,    // 网络连接
    Box,           // 盒子（可代表磁盘）
    Files,         // 文件
    Collection,    // 集合
    Setting,       // 设置
    Warning,       // 警告
    InfoFilled,    // 信息

    Download,
    Refresh,
    Top,
    Bottom
} from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const timeRange = ref('1h')
const resourceType = ref('cpu')
const exportLoading = ref(false)
const tableLoading = ref(false)
const logDetailVisible = ref(false)
const selectedLog = ref(null)

// 图表引用
const performanceChart = ref(null)
const errorChart = ref(null)
const resourceChart = ref(null)

// 图表实例
let performanceChartInstance = null
let errorChartInstance = null
let resourceChartInstance = null

// 统计数据
const stats = ref({
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 72,
    networkTraffic: 850,
    responseTime: 120,
    throughput: 1250,
    successRate: 99.2
})

// 服务状态
const services = ref([
    { name: 'API网关', description: '处理所有API请求', status: 'running', uptime: '15天2小时' },
    { name: '用户服务', description: '管理用户数据和认证', status: 'running', uptime: '12天8小时' },
    { name: '订单服务', description: '处理订单业务', status: 'running', uptime: '10天5小时' },
    { name: '支付服务', description: '处理支付交易', status: 'running', uptime: '8天12小时' },
    { name: '消息队列', description: '异步消息处理', status: 'running', uptime: '20天3小时' },
    { name: '数据库', description: '数据存储服务', status: 'running', uptime: '30天1小时' }
])

// 分页数据
const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 系统日志数据
const systemLogs = ref([
    {
        id: 1,
        timestamp: new Date('2024-01-15 10:30:25'),
        level: 'INFO',
        service: 'API网关',
        message: '用户登录成功',
        details: ''
    },
    {
        id: 2,
        timestamp: new Date('2024-01-15 10:28:15'),
        level: 'WARNING',
        service: '数据库',
        message: '数据库连接池使用率超过80%',
        details: '当前连接池使用率: 82%, 建议增加连接池大小或优化查询'
    },
    {
        id: 3,
        timestamp: new Date('2024-01-15 10:25:40'),
        level: 'ERROR',
        service: '支付服务',
        message: '支付回调处理失败',
        details: '第三方支付平台返回异常: TIMEOUT, 订单ID: 20240115001'
    },
    {
        id: 4,
        timestamp: new Date('2024-01-15 10:20:30'),
        level: 'INFO',
        service: '用户服务',
        message: '新用户注册成功',
        details: ''
    },
    {
        id: 5,
        timestamp: new Date('2024-01-15 10:18:22'),
        level: 'INFO',
        service: '订单服务',
        message: '订单创建成功',
        details: ''
    }
])

// 生命周期
onMounted(() => {
    loadData()
    initCharts()
})

// 监听时间范围变化
watch(timeRange, () => {
    loadData()
})

// 监听资源类型变化
watch(resourceType, () => {
    updateResourceChart()
})

// 加载数据
const loadData = async () => {
    tableLoading.value = true
    try {
        // 模拟API调用获取数据
        await new Promise(resolve => setTimeout(resolve, 500))

        // 更新统计数据（模拟实时数据变化）
        stats.value = {
            cpuUsage: Math.min(100, Math.max(0, stats.value.cpuUsage + (Math.random() * 10 - 5))),
            memoryUsage: Math.min(100, Math.max(0, stats.value.memoryUsage + (Math.random() * 5 - 2.5))),
            diskUsage: Math.min(100, Math.max(0, stats.value.diskUsage + (Math.random() * 2 - 1))),
            networkTraffic: Math.max(0, stats.value.networkTraffic + (Math.random() * 200 - 100)),
            responseTime: Math.max(10, stats.value.responseTime + (Math.random() * 20 - 10)),
            throughput: Math.max(0, stats.value.throughput + (Math.random() * 100 - 50)),
            successRate: Math.min(100, Math.max(95, stats.value.successRate + (Math.random() * 0.5 - 0.25)))
        }

        pagination.total = systemLogs.value.length
        updateCharts()
    } catch (error) {
        console.error('加载数据失败:', error)
        ElMessage.error('加载数据失败')
    } finally {
        tableLoading.value = false
    }
}

// 初始化图表
const initCharts = () => {
    nextTick(() => {
        initPerformanceChart()
        initErrorChart()
        initResourceChart()
    })
}

// 初始化性能图表
const initPerformanceChart = () => {
    if (!performanceChart.value) return

    performanceChartInstance = echarts.init(performanceChart.value)
    const option = {
        tooltip: {
            trigger: 'axis'
        },
        radar: {
            indicator: [
                { name: '客户流量', max: 1000 },
                { name: '响应时间', max: 500 },
                { name: '内存使用率', max: 100 },
                { name: '成功率', max: 100 },
                { name: 'CPU使用率', max: 100 }
            ]
        },
        series: [{
            type: 'radar',
            data: [{
                value: [850, 120, 68, 99.2, 45],
                name: '当前性能',
                areaStyle: {
                    // color: 'rgba(84, 112, 198, 0.5)'
                },
                lineStyle: {
                    color: '#5470c6'
                },
                itemStyle: {
                    color: '#5470c6'
                }
            }]
        }]
    }
    performanceChartInstance.setOption(option)
}

// 初始化错误统计图表
const initErrorChart = () => {
    if (!errorChart.value) return

    errorChartInstance = echarts.init(errorChart.value)
    const option = {
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: ['4xx错误', '5xx错误', '超时错误', '数据库错误', '网络错误']
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: [12, 5, 8, 3, 7],
            type: 'bar',
            itemStyle: {
                color: function(params) {
                    const colorList = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
                    return colorList[params.dataIndex]
                }
            }
        }]
    }
    errorChartInstance.setOption(option)
}

// 初始化资源图表
const initResourceChart = () => {
    if (!resourceChart.value) return

    resourceChartInstance = echarts.init(resourceChart.value)
    updateResourceChart()
}

// 更新资源图表
const updateResourceChart = () => {
    if (!resourceChartInstance) return

    const dates = generateDates(timeRange.value)
    let data, title, color

    switch(resourceType.value) {
        case 'cpu':
            data = generateRandomData(dates.length, 20, 80)
            title = 'CPU使用率(%)'
            color = '#5470c6'
            break
        case 'memory':
            data = generateRandomData(dates.length, 50, 90)
            title = '内存使用率(%)'
            color = '#91cc75'
            break
        case 'disk':
            data = generateRandomData(dates.length, 60, 95)
            title = '磁盘使用率(%)'
            color = '#fac858'
            break
    }

    const option = {
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: dates
        },
        yAxis: {
            type: 'value',
            name: title,
            max: 100
        },
        series: [{
            name: title,
            type: 'line',
            smooth: true,
            data: data,
            itemStyle: { color: color },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: color + '80' },
                        { offset: 1, color: color + '10' }
                    ]
                }
            }
        }]
    }

    resourceChartInstance.setOption(option)
}

// 更新所有图表
const updateCharts = () => {
    updateResourceChart()
}

// 工具函数
const generateDates = (range) => {
    let count
    switch(range) {
        case '1h': count = 12; break // 5分钟间隔
        case '6h': count = 12; break // 30分钟间隔
        case '24h': count = 24; break // 1小时间隔
        default: count = 12
    }

    const dates = []
    const now = new Date()

    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now)

        switch(range) {
            case '1h':
                date.setMinutes(date.getMinutes() - i * 5)
                dates.push(`${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`)
                break
            case '6h':
                date.setMinutes(date.getMinutes() - i * 30)
                dates.push(`${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`)
                break
            case '24h':
                date.setHours(date.getHours() - i)
                dates.push(`${date.getHours()}:00`)
                break
        }
    }
    return dates
}

const generateRandomData = (count, min, max) => {
    return Array.from({ length: count }, () =>
            Math.floor(Math.random() * (max - min + 1)) + min
    )
}

const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const formatDateTime = (date) => {
    return new Date(date).toLocaleString('zh-CN')
}

const getUsageClass = (usage) => {
    if (usage > 80) return 'high'
    if (usage > 60) return 'medium'
    return 'low'
}

const getTrafficClass = (traffic) => {
    return traffic > 1000 ? 'high' : 'normal'
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

// 事件处理
const changeTimeRange = (range) => {
    timeRange.value = range
}

const exportData = async () => {
    exportLoading.value = true
    try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        ElMessage.success('数据导出成功')
    } catch (error) {
        ElMessage.error('导出失败')
    } finally {
        exportLoading.value = false
    }
}

const refreshData = () => {
    loadData()
    ElMessage.success('数据已刷新')
}

const showAllLogs = () => {
    router.push('/systemLogs')
}

const viewLogDetail = (log) => {
    selectedLog.value = log
    logDetailVisible.value = true
}

const handleSizeChange = (size) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    loadData()
}

const handleCurrentChange = (page) => {
    pagination.currentPage = page
    loadData()
}

// 响应窗口大小变化
window.addEventListener('resize', () => {
    performanceChartInstance?.resize()
    errorChartInstance?.resize()
    resourceChartInstance?.resize()
})
</script>

<style scoped>
.monitor-page {
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

.stats-cards {
    margin-bottom: 20px;
}

.stats-card {
    border-radius: 12px;
    border: none;
}

.stats-card :deep(.el-card__body) {
    padding: 20px;
}

.stats-content {
    display: flex;
    align-items: center;
}

.stats-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    font-size: 24px;
    color: white;
}

.cpu-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.memory-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.disk-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.network-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stats-value {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    line-height: 1;
}

.stats-label {
    margin: 4px 0;
    color: #909399;
    font-size: 14px;
}

.stats-change {
    display: flex;
    align-items: center;
    font-size: 12px;
    margin-top: 4px;
}

.stats-change.high {
    color: #f56c6c;
}

.stats-change.medium {
    color: #e6a23c;
}

.stats-change.low {
    color: #67c23a;
}

.stats-change.normal {
    color: #909399;
}

.chart-row, .table-row {
    margin-bottom: 20px;
}

.chart-card, .table-card {
    border-radius: 12px;
    border: none;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chart-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}

.chart-container {
    height: 300px;
    width: 100%;
}

.service-status {
    padding: 10px 0;
}

.service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.service-item:last-child {
    border-bottom: none;
}

.service-info {
    flex: 1;
}

.service-name {
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
}

.service-desc {
    font-size: 12px;
    color: #909399;
}

.service-status-indicator {
    text-align: right;
}

.service-uptime {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    padding: 10px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    max-height: 200px;
    overflow-y: auto;
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

/* 响应式调整 */
@media (max-width: 768px) {
    .monitor-page {
        padding: 12px;
    }

    .header-content {
        flex-direction: column;
        gap: 16px;
    }

    .toolbar {
        width: 100%;
        justify-content: space-between;
    }

    .stats-content {
        flex-direction: column;
        text-align: center;
    }

    .stats-icon {
        margin-right: 0;
        margin-bottom: 12px;
    }

    .chart-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
    }

    .service-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }

    .service-status-indicator {
        text-align: left;
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .log-detail {
        max-height: 60vh;
    }

    :deep(.el-descriptions) {
        font-size: 14px;
    }

    :deep(.el-descriptions__label) {
        width: 80px;
    }
}
</style>
