<template>
    <div class="dashboard">
        <div class="page-header">
            <h1>数据概览</h1>
            <p>实时监控系统关键指标</p>
        </div>

        <!-- 统计卡片 -->
        <el-row :gutter="20" class="stats-row">
            <el-col :xs="12" :sm="6" v-for="stat in statsData" :key="stat.name">
                <el-card class="stats-card" shadow="hover">
                    <div class="stats-content">
                        <div class="stats-icon" :style="{ background: stat.color }">
                            <el-icon><component :is="stat.icon" /></el-icon>
                        </div>
                        <div class="stats-info">
                            <div class="stats-value">{{ stat.value }}</div>
                            <div class="stats-label">{{ stat.label }}</div>
                            <div class="stats-trend" :class="stat.trend">
                                <el-icon v-if="stat.trend === 'up'"><Top /></el-icon>
                                <el-icon v-else><Bottom /></el-icon>
                                {{ stat.change }}
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 图表区域 -->
        <el-row :gutter="20" class="chart-row">
            <el-col :xs="24" :lg="16">
                <el-card class="chart-card">
                    <template #header>
                        <span>销售趋势</span>
                    </template>
                    <div ref="salesChart" class="chart-container"></div>
                </el-card>
            </el-col>
            <el-col :xs="24" :lg="8">
                <el-card class="chart-card">
                    <template #header>
                        <span>用户分布</span>
                    </template>
                    <div ref="userChart" class="chart-container"></div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 最近活动 -->
        <el-row :gutter="20" class="activity-row">
            <el-col :xs="24" :lg="12">
                <el-card>
                    <template #header>
                        <span>最近订单</span>
                    </template>
                    <div class="recent-orders">
                        <div v-for="order in recentOrders" :key="order.id" class="order-item">
                            <div class="order-info">
                                <div class="order-no">{{ order.orderNo }}</div>
                                <div class="order-customer">{{ order.customer }}</div>
                            </div>
                            <div class="order-amount">¥{{ order.amount.toFixed(2) }}</div>
                            <el-tag size="small" :type="getStatusType(order.status)">
                                {{ getStatusText(order.status) }}
                            </el-tag>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <el-col :xs="24" :lg="12">
                <el-card>
                    <template #header>
                        <span>系统日志</span>
                    </template>
                    <div class="system-logs">
                        <div v-for="log in systemLogs" :key="log.id" class="log-item">
                            <div class="log-time">{{ log.time }}</div>
                            <div class="log-content">{{ log.content }}</div>
                            <el-tag size="small" :type="log.type">{{ log.level }}</el-tag>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import {
    User,
    ShoppingCart,
    TrendCharts,
    Wallet,
    Top,
    Bottom,
    Money
} from '@element-plus/icons-vue'

// 模拟数据
const statsData = ref([
    {
        name: 'orders',
        label: '总订单数',
        value: '5,678',
        change: '+15.2%',
        trend: 'up',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        icon: ShoppingCart
    },
    {
        name: 'orders',
        label: '今日订单',
        value: '89',
        change: '+5%',
        trend: 'up',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        icon: ShoppingCart
    },
    {
        name: 'revenue',
        label: '本月收入',
        value: '¥56,789',
        change: '+8.2%',
        trend: 'up',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        icon: Wallet
    },
    {
        name: 'totalRevenue',
        label: '总收入',
        value: '¥1,234,789',
        change: '-2.1%',
        trend: 'down',
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        icon: Money
    }
])

const recentOrders = ref([
    { id: 1, orderNo: 'ORD202401010001', customer: '张三', amount: 2999, status: 'paid' },
    { id: 2, orderNo: 'ORD202401010002', customer: '李四', amount: 1599, status: 'pending' },
    { id: 3, orderNo: 'ORD202401010003', customer: '王五', amount: 899, status: 'completed' }
])

const systemLogs = ref([
    { id: 1, time: '10:30', content: '用户 admin 登录系统', level: 'INFO', type: 'success' },
    { id: 2, time: '10:25', content: '新增用户: testuser', level: 'INFO', type: 'success' },
    { id: 3, time: '10:20', content: '订单支付失败', level: 'WARN', type: 'warning' }
])

const salesChart = ref(null)
const userChart = ref(null)

let salesChartInstance = null
let userChartInstance = null

const initCharts = () => {
    // 销售趋势图
    salesChartInstance = echarts.init(salesChart.value)
    const salesOption = {
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: { type: 'value' },
        series: [{
            data: [120, 200, 150, 80, 70, 110],
            type: 'line',
            smooth: true,
            itemStyle: {
                color: '#409EFF'
            },
            lineStyle: {
                color: '#409EFF'
            }
        }]
    }
    salesChartInstance.setOption(salesOption)

    // 用户分布图
    userChartInstance = echarts.init(userChart.value)
    const userOption = {
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
            name: '用户分布',
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
                { value: 335, name: '普通用户' },
                { value: 310, name: 'VIP用户' },
                { value: 234, name: '管理员' }
            ],
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    }
    userChartInstance.setOption(userOption)
}

const getStatusType = (status) => {
    const typeMap = { pending: 'warning', paid: 'primary', completed: 'success' }
    return typeMap[status] || 'info'
}

const getStatusText = (status) => {
    const textMap = { pending: '待支付', paid: '已支付', completed: '已完成' }
    return textMap[status] || '未知'
}

onMounted(() => {
    // 确保DOM渲染完成后再初始化图表
    setTimeout(() => {
        initCharts()
    }, 100)

    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        salesChartInstance?.resize()
        userChartInstance?.resize()
    })
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
    salesChartInstance?.dispose()
    userChartInstance?.dispose()
})
</script>

<style scoped>
.dashboard {
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

.stats-row {
    margin-bottom: 20px;
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

.stats-value {
    font-size: 24px;
    font-weight: 700;
    color: #303133;
}

.stats-label {
    color: #909399;
    font-size: 14px;
    margin: 4px 0;
}

.stats-trend {
    display: flex;
    align-items: center;
    font-size: 12px;
    margin-top: 4px;
    gap: 4px;
}

.stats-trend.up {
    color: #f56c6c;
}

.stats-trend.down {
    color: #67c23a;
}

.chart-row, .activity-row {
    margin-bottom: 20px;
}

.chart-container {
    height: 300px;
    width: 100%;
}

.recent-orders, .system-logs {
    padding: 0;
}

.order-item, .log-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child, .log-item:last-child {
    border-bottom: none;
}

.order-info {
    flex: 1;
}

.order-no {
    font-weight: 500;
    color: #303133;
}

.order-customer {
    color: #909399;
    font-size: 12px;
}

.order-amount {
    font-weight: 600;
    margin: 0 12px;
}

.log-time {
    color: #909399;
    font-size: 12px;
    width: 50px;
}

.log-content {
    flex: 1;
    margin: 0 12px;
    color: #606266;
}
</style>
