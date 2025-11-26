<template>
    <div class="analysis-page">
        <!-- 页面标题 -->
        <div class="page-header">
            <h1>系统分析</h1>
            <p>实时监控系统运行状态和用户行为</p>
        </div>

        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-cards">
            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon user-icon">
                            <el-icon><User /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ stats.totalUsers }}</div>
                            <div class="stats-label">总用户数</div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon role-icon">
                            <el-icon><Setting /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ stats.totalRoles }}</div>
                            <div class="stats-label">角色数量</div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon menu-icon">
                            <el-icon><Menu /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ stats.totalMenus }}</div>
                            <div class="stats-label">菜单数量</div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="12" :lg="6">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon growth-icon">
                            <el-icon><TrendCharts /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ stats.growthRate }}%</div>
                            <div class="stats-label">增长率</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 图表区域 -->
        <el-row :gutter="20" class="chart-row">
            <!-- 访问趋势图 -->
            <el-col :xs="24" :lg="16">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <div class="chart-header">
                            <span>访问趋势</span>
                            <el-select v-model="trendDays" @change="loadAccessTrend" size="small">
                                <el-option label="最近7天" value="7"></el-option>
                                <el-option label="最近30天" value="30"></el-option>
                                <el-option label="最近90天" value="90"></el-option>
                            </el-select>
                        </div>
                    </template>
                    <div ref="trendChart" class="chart-container"></div>
                </el-card>
            </el-col>

            <!-- 角色分布图 -->
            <el-col :xs="24" :lg="8">
                <el-card class="chart-card" shadow="hover">
                    <template #header>
                        <span>角色分布</span>
                    </template>
                    <div ref="roleChart" class="chart-container"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 详细数据 -->
        <el-row :gutter="20" class="detail-row">
            <!-- 活跃用户 -->
            <el-col :xs="24" :lg="12">
                <el-card class="detail-card" shadow="hover">
                    <template #header>
                        <span>活跃用户统计</span>
                    </template>
                    <div class="active-users">
                        <div class="active-item">
                            <div class="active-label">今日登录</div>
                            <div class="active-value">{{ stats.todayLogins }} 次</div>
                        </div>
                        <div class="active-item">
                            <div class="active-label">周活跃用户</div>
                            <div class="active-value">{{ stats.weekActiveUsers }} 人</div>
                        </div>
                        <div class="active-item">
                            <div class="active-label">平均会话时长</div>
                            <div class="active-value">12.5 分钟</div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <!-- 最近访问 -->
            <el-col :xs="24" :lg="12">
                <el-card class="detail-card" shadow="hover">
                    <template #header>
                        <span>最近访问记录</span>
                    </template>
                    <div class="access-list">
                        <div v-for="log in accessLogs" :key="log.id" class="access-item">
                            <div class="access-user">
                                <el-avatar size="small" :style="{ backgroundColor: getUserColor(log.username) }">
                                    {{ log.username.charAt(0).toUpperCase() }}
                                </el-avatar>
                                <span class="username">{{ log.username }}</span>
                            </div>
                            <div class="access-info">
                <span class="method" :class="getMethodClass(log.accessMethod)">
                  {{ log.accessMethod }}
                </span>
                                <span class="path">{{ log.accessPath }}</span>
                                <span class="time">{{ formatTime(log.accessTime) }}</span>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { analysisApi } from '@/api/analysis'
import { User, Setting, Menu, TrendCharts } from '@element-plus/icons-vue'

// 响应式数据
const stats = ref({
    totalUsers: 0,
    totalRoles: 0,
    totalMenus: 0,
    todayLogins: 0,
    weekActiveUsers: 0,
    growthRate: 0
})
const trendDays = ref('7')
const accessLogs = ref([])
const trendChart = ref(null)
const roleChart = ref(null)

let trendChartInstance = null
let roleChartInstance = null

// 生命周期
onMounted(() => {
    loadSystemStats()
    loadAccessTrend()
    loadRoleDistribution()
    loadRecentAccessLogs()
})

// 加载系统统计
const loadSystemStats = async () => {
    try {
        const response = await analysisApi.getSystemStats()
        stats.value = response.data
    } catch (error) {
        console.error('加载系统统计失败:', error)
    }
}

// 加载访问趋势
const loadAccessTrend = async () => {
    try {
        const response = await analysisApi.getAccessTrend(trendDays.value)
        const data = response.data

        nextTick(() => {
            initTrendChart(data)
        })
    } catch (error) {
        console.error('加载访问趋势失败:', error)
    }
}

// 加载角色分布
const loadRoleDistribution = async () => {
    try {
        const response = await analysisApi.getRoleDistribution()
        const data = response.data

        nextTick(() => {
            initRoleChart(data)
        })
    } catch (error) {
        console.error('加载角色分布失败:', error)
    }
}

// 加载最近访问记录
const loadRecentAccessLogs = async () => {
    try {
        const response = await analysisApi.getRecentAccessLogs()
        accessLogs.value = response.data
    } catch (error) {
        console.error('加载访问记录失败:', error)
    }
}

// 初始化趋势图表
const initTrendChart = (data) => {
    if (!trendChart.value) return

    if (!trendChartInstance) {
        trendChartInstance = echarts.init(trendChart.value)
    }

    const option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['访问次数', '用户数量']
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
            data: data.dates
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '访问次数',
                type: 'line',
                smooth: true,
                data: data.accessCounts,
                itemStyle: {
                    color: '#5470c6'
                },
                areaStyle: {
                    color: {
                        type: 'linear',
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [{
                            offset: 0, color: 'rgba(84, 112, 198, 0.5)'
                        }, {
                            offset: 1, color: 'rgba(84, 112, 198, 0.1)'
                        }]
                    }
                }
            },
            {
                name: '用户数量',
                type: 'line',
                smooth: true,
                data: data.userCounts,
                itemStyle: {
                    color: '#91cc75'
                }
            }
        ]
    }

    trendChartInstance.setOption(option)
}

// 初始化角色分布图表
const initRoleChart = (data) => {
    if (!roleChart.value) return

    if (!roleChartInstance) {
        roleChartInstance = echarts.init(roleChart.value)
    }

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            data: data.map(item => item.name)
        },
        series: [
            {
                name: '角色分布',
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
                data: data
            }
        ]
    }

    roleChartInstance.setOption(option)
}

// 工具函数
const getUserColor = (username) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3']
    const index = username.charCodeAt(0) % colors.length
    return colors[index]
}

const getMethodClass = (method) => {
    const classMap = {
        'GET': 'method-get',
        'POST': 'method-post',
        'PUT': 'method-put',
        'DELETE': 'method-delete'
    }
    return classMap[method] || 'method-default'
}

const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 响应窗口大小变化
window.addEventListener('resize', () => {
    trendChartInstance?.resize()
    roleChartInstance?.resize()
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
.role-icon { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.menu-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.growth-icon { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stats-value {
    font-size: 28px;
    font-weight: 700;
    color: #303133;
    line-height: 1;
}

.stats-label {
    margin-top: 8px;
    color: #909399;
    font-size: 14px;
}

.chart-row, .detail-row {
    margin-bottom: 20px;
}

.chart-card, .detail-card {
    border-radius: 12px;
    border: none;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chart-container {
    height: 300px;
    width: 100%;
}

.active-users, .access-list {
    padding: 0;
}

.active-item, .access-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.active-item:last-child, .access-item:last-child {
    border-bottom: none;
}

.active-label {
    color: #606266;
    font-size: 14px;
}

.active-value {
    color: #303133;
    font-weight: 600;
    font-size: 16px;
}

.access-user {
    display: flex;
    align-items: center;
    gap: 8px;
}

.username {
    font-weight: 500;
    color: #303133;
}

.access-info {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
}

.method {
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
    font-size: 10px;
    color: white;
}

.method-get { background-color: #61affe; }
.method-post { background-color: #49cc90; }
.method-put { background-color: #fca130; }
.method-delete { background-color: #f93e3e; }
.method-default { background-color: #909399; }

.path {
    color: #606266;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.time {
    color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .analysis-page {
        padding: 12px;
    }

    .stats-content {
        flex-direction: column;
        text-align: center;
    }

    .stats-icon {
        margin-right: 0;
        margin-bottom: 12px;
    }

    .access-info {
        flex-direction: column;
        gap: 4px;
        align-items: flex-end;
    }
}
</style>
