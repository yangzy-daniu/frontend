<template>
    <div class="analysis-page">
        <!-- 页面标题和工具栏 -->
        <div class="page-header">
            <div class="header-content">
                <div class="title-section">
                    <h1>用户分析</h1>
                    <p>实时监控系统运行状态和用户行为</p>
                </div>
                <div class="toolbar">
                    <el-button-group>
                        <el-button
                                :type="timeRange === '7d' ? 'primary' : ''"
                                @click="changeTimeRange('7d')"
                        >
                            最近7天
                        </el-button>
                        <el-button
                                :type="timeRange === '30d' ? 'primary' : ''"
                                @click="changeTimeRange('30d')"
                        >
                            最近30天
                        </el-button>
                        <el-button
                                :type="timeRange === '90d' ? 'primary' : ''"
                                @click="changeTimeRange('90d')"
                        >
                            最近90天
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
                        <div class="stats-icon user-icon">
                            <el-icon><User /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ formatNumber(stats.totalUsers) }}</div>
                            <div class="stats-label">总用户数</div>
                            <div class="stats-change" :class="getChangeClass(stats.userGrowth)">
                                <el-icon><Top v-if="stats.userGrowth >= 0" /><Bottom v-else /></el-icon>
                                {{ Math.abs(stats.userGrowth) }}%
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon active-icon">
                            <el-icon><UserFilled /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ formatNumber(stats.activeUsers) }}</div>
                            <div class="stats-label">活跃用户</div>
                            <div class="stats-change" :class="getChangeClass(stats.activeGrowth)">
                                <el-icon><Top v-if="stats.activeGrowth >= 0" /><Bottom v-else /></el-icon>
                                {{ Math.abs(stats.activeGrowth) }}%
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon order-icon">
                            <el-icon><ShoppingCart /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ formatNumber(stats.totalOrders) }}</div>
                            <div class="stats-label">总订单数</div>
                            <div class="stats-change" :class="getChangeClass(stats.orderGrowth)">
                                <el-icon><Top v-if="stats.orderGrowth >= 0" /><Bottom v-else /></el-icon>
                                {{ Math.abs(stats.orderGrowth) }}%
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon revenue-icon">
                            <el-icon><Money /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">¥{{ formatNumber(stats.totalRevenue) }}</div>
                            <div class="stats-label">总收入</div>
                            <div class="stats-change" :class="getChangeClass(stats.revenueGrowth)">
                                <el-icon><Top v-if="stats.revenueGrowth >= 0" /><Bottom v-else /></el-icon>
                                {{ Math.abs(stats.revenueGrowth) }}%
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 主要图表区域 -->
        <el-row :gutter="20" class="chart-row">
            <!-- 访问趋势图 -->
            <el-col :xs="24" :lg="16">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <div class="chart-header">
                            <span>访问趋势分析</span>
                            <div class="chart-actions">
                                <el-radio-group v-model="trendType" size="small">
                                    <el-radio-button label="visit">访问量</el-radio-button>
                                    <el-radio-button label="user">用户数</el-radio-button>
                                    <el-radio-button label="both">对比视图</el-radio-button>
                                </el-radio-group>
                            </div>
                        </div>
                    </template>
                    <div ref="trendChart" class="chart-container"></div>
                </el-card>
            </el-col>

            <!-- 用户行为分布 -->
            <el-col :xs="24" :lg="8">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <span>用户行为分布</span>
                    </template>
                    <div ref="behaviorChart" class="chart-container"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 第二行图表 -->
        <el-row :gutter="20" class="chart-row">
            <!-- 性能指标 -->
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

        <!-- 数据表格区域 -->
        <el-row :gutter="20" class="table-row">
            <el-col :xs="24">
                <el-card class="table-card" shadow="hover">
                    <template #header>
                        <div class="table-header">
                            <span>详细访问记录</span>
                            <el-button type="primary" text @click="showAllLogs">
                                查看全部
                            </el-button>
                        </div>
                    </template>
                    <el-table
                            :data="accessLogs"
                            v-loading="tableLoading"
                            stripe
                            style="width: 100%"
                            :default-sort="{ prop: 'accessTime', order: 'descending' }"
                    >
                        <el-table-column prop="username" label="用户" width="120">
                            <template #default="{ row }">
                                <div class="user-cell">
                                    <el-avatar :size="32" :src="row.avatar" :style="{ backgroundColor: getUserColor(row.username) }">
                                        {{ row.username.charAt(0).toUpperCase() }}
                                    </el-avatar>
                                    <span class="username">{{ row.username }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="accessMethod" label="方法" width="80">
                            <template #default="{ row }">
                                <el-tag :type="getMethodType(row.accessMethod)" size="small">
                                    {{ row.accessMethod }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="accessPath" label="访问路径" min-width="200" show-overflow-tooltip />
                        <el-table-column prop="statusCode" label="状态" width="80">
                            <template #default="{ row }">
                                <el-tag
                                        :type="getStatusType(row.statusCode)"
                                        size="small"
                                >
                                    {{ row.statusCode }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="responseTime" label="响应时间" width="100">
                            <template #default="{ row }">
                <span :class="getResponseTimeClass(row.responseTime)">
                  {{ row.responseTime }}ms
                </span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="accessTime" label="访问时间" width="180">
                            <template #default="{ row }">
                                {{ formatDateTime(row.accessTime) }}
                            </template>
                        </el-table-column>
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
                title="访问记录详情"
                width="600px"
        >
            <div v-if="selectedLog" class="log-detail">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="用户">
                        <div class="user-info">
                            <el-avatar :size="32" :src="selectedLog.avatar" :style="{ backgroundColor: getUserColor(selectedLog.username) }">
                                {{ selectedLog.username.charAt(0).toUpperCase() }}
                            </el-avatar>
                            <span style="margin-left: 8px;">{{ selectedLog.username }}</span>
                        </div>
                    </el-descriptions-item>
                    <el-descriptions-item label="IP地址">{{ selectedLog.ipAddress }}</el-descriptions-item>
                    <el-descriptions-item label="请求方法">
                        <el-tag :type="getMethodType(selectedLog.accessMethod)">
                            {{ selectedLog.accessMethod }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="状态码">
                        <el-tag :type="getStatusType(selectedLog.statusCode)">
                            {{ selectedLog.statusCode }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="请求路径" :span="2">
                        {{ selectedLog.accessPath }}
                    </el-descriptions-item>
                    <el-descriptions-item label="用户代理" :span="2">
                        <el-text truncated>{{ selectedLog.userAgent }}</el-text>
                    </el-descriptions-item>
                    <el-descriptions-item label="响应时间">
            <span :class="getResponseTimeClass(selectedLog.responseTime)">
              {{ selectedLog.responseTime }}ms
            </span>
                    </el-descriptions-item>
                    <el-descriptions-item label="访问时间">
                        {{ formatDateTime(selectedLog.accessTime) }}
                    </el-descriptions-item>
                </el-descriptions>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import {
    User,
    UserFilled,
    ShoppingCart,
    Money,
    Top,
    Bottom,
    Download,
    Refresh
} from '@element-plus/icons-vue'

// 响应式数据
const timeRange = ref('7d')
const trendType = ref('both')
const exportLoading = ref(false)
const tableLoading = ref(false)
const logDetailVisible = ref(false)
const selectedLog = ref(null)

// 图表引用
const trendChart = ref(null)
const behaviorChart = ref(null)
const performanceChart = ref(null)
const errorChart = ref(null)

// 图表实例
let trendChartInstance = null
let behaviorChartInstance = null
let performanceChartInstance = null
let errorChartInstance = null

// 统计数据
const stats = ref({
    totalUsers: 1234,
    activeUsers: 892,
    totalOrders: 5678,
    totalRevenue: 1234567,
    userGrowth: 12.5,
    activeGrowth: 8.3,
    orderGrowth: 15.2,
    revenueGrowth: 18.7
})

// 分页数据
const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 模拟访问日志数据
const accessLogs = ref([
    {
        id: 1,
        username: 'admin',
        avatar: '',
        accessMethod: 'GET',
        accessPath: '/api/users',
        statusCode: 200,
        responseTime: 45,
        accessTime: new Date('2024-01-15 10:30:25'),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
        id: 2,
        username: 'user01',
        avatar: '',
        accessMethod: 'POST',
        accessPath: '/api/orders',
        statusCode: 201,
        responseTime: 120,
        accessTime: new Date('2024-01-15 10:28:15'),
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    {
        id: 3,
        username: 'user02',
        avatar: '',
        accessMethod: 'GET',
        accessPath: '/api/products',
        statusCode: 200,
        responseTime: 32,
        accessTime: new Date('2024-01-15 10:25:40'),
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    },
    {
        id: 4,
        username: 'admin',
        avatar: '',
        accessMethod: 'PUT',
        accessPath: '/api/users/1',
        statusCode: 200,
        responseTime: 78,
        accessTime: new Date('2024-01-15 10:20:30'),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    {
        id: 5,
        username: 'user03',
        avatar: '',
        accessMethod: 'DELETE',
        accessPath: '/api/orders/5',
        statusCode: 204,
        responseTime: 95,
        accessTime: new Date('2024-01-15 10:18:22'),
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

// 加载数据
const loadData = async () => {
    tableLoading.value = true
    try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 800))
        pagination.total = accessLogs.value.length
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
        initTrendChart()
        initBehaviorChart()
        initPerformanceChart()
        initErrorChart()
    })
}

// 初始化趋势图表
const initTrendChart = () => {
    if (!trendChart.value) return

    trendChartInstance = echarts.init(trendChart.value)
    updateTrendChart()
}

// 初始化行为分布图表
const initBehaviorChart = () => {
    if (!behaviorChart.value) return

    behaviorChartInstance = echarts.init(behaviorChart.value)
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center'
        },
        series: [{
            name: '用户行为',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 18,
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: [
                { value: 335, name: '页面浏览' },
                { value: 310, name: '按钮点击' },
                { value: 234, name: '表单提交' },
                { value: 135, name: '文件下载' },
                { value: 154, name: '其他操作' }
            ]
        }]
    }
    behaviorChartInstance.setOption(option)
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
                { name: '响应时间', max: 100 },
                { name: '吞吐量', max: 1000 },
                { name: '成功率', max: 100 },
                { name: 'CPU使用率', max: 100 },
                { name: '内存使用率', max: 100 }
            ]
        },
        series: [{
            type: 'radar',
            data: [{
                value: [85, 900, 98, 65, 70],
                name: '当前性能',
                areaStyle: {}
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

// 更新趋势图表
const updateTrendChart = () => {
    if (!trendChartInstance) return

    const dates = generateDates(timeRange.value)
    const option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['访问次数', '用户数量', '平均响应时间']
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
        yAxis: [
            {
                type: 'value',
                name: '数量'
            },
            {
                type: 'value',
                name: '时间(ms)',
                position: 'right'
            }
        ],
        series: [
            {
                name: '访问次数',
                type: 'line',
                smooth: true,
                data: generateRandomData(dates.length, 100, 300),
                itemStyle: { color: '#5470c6' },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0, y: 0, x2: 0, y2: 1,
                        colorStops: [
                            { offset: 0, color: 'rgba(84, 112, 198, 0.5)' },
                            { offset: 1, color: 'rgba(84, 112, 198, 0.1)' }
                        ]
                    }
                }
            },
            {
                name: '用户数量',
                type: 'line',
                smooth: true,
                data: generateRandomData(dates.length, 50, 150),
                itemStyle: { color: '#91cc75' }
            },
            {
                name: '平均响应时间',
                type: 'line',
                yAxisIndex: 1,
                smooth: true,
                data: generateRandomData(dates.length, 30, 80),
                itemStyle: { color: '#fac858' }
            }
        ]
    }

    // 根据选择的视图类型显示/隐藏系列
    if (trendType.value === 'visit') {
        option.series[1].show = false
        option.series[2].show = false
    } else if (trendType.value === 'user') {
        option.series[0].show = false
        option.series[2].show = false
    }

    trendChartInstance.setOption(option)
}

// 更新所有图表
const updateCharts = () => {
    updateTrendChart()
}

// 工具函数
const generateDates = (range) => {
    const days = parseInt(range)
    const dates = []
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
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

const getChangeClass = (change) => {
    return change >= 0 ? 'positive' : 'negative'
}

const getUserColor = (username) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57']
    const index = username.charCodeAt(0) % colors.length
    return colors[index]
}

const getMethodType = (method) => {
    const typeMap = {
        'GET': 'primary',
        'POST': 'success',
        'PUT': 'warning',
        'DELETE': 'danger'
    }
    return typeMap[method] || 'info'
}

const getStatusType = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'success'
    if (statusCode >= 300 && statusCode < 400) return 'warning'
    if (statusCode >= 400 && statusCode < 500) return 'danger'
    if (statusCode >= 500) return 'danger'
    return 'info'
}

const getResponseTimeClass = (responseTime) => {
    if (responseTime < 50) return 'fast'
    if (responseTime < 100) return 'medium'
    return 'slow'
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
    ElMessage.info('跳转到完整日志页面')
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
    trendChartInstance?.resize()
    behaviorChartInstance?.resize()
    performanceChartInstance?.resize()
    errorChartInstance?.resize()
})
</script>

<style scoped>
.analysis-page {
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

.user-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.active-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.order-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.revenue-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

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

.stats-change.positive {
    color: #f56c6c;
}

.stats-change.negative {
    color: #67c23a;
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

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 8px;
}

.username {
    font-weight: 500;
}

.fast {
    color: #67c23a;
    font-weight: 600;
}

.medium {
    color: #e6a23c;
    font-weight: 600;
}

.slow {
    color: #f56c6c;
    font-weight: 600;
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}

.log-detail .user-info {
    display: flex;
    align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .analysis-page {
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
}
</style>
