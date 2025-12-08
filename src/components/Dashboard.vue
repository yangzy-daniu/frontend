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
                        <div class="card-header">
                            <span>最近订单</span>
                            <el-button
                                    type="primary"
                                    size="small"
                                    link
                                    @click="router.push('/order')"
                            >
                                查看更多
                            </el-button>
                        </div>
                    </template>
                    <div v-loading="orderLoading" class="recent-orders">
                        <div v-if="recentOrders.length === 0 && !orderLoading" class="empty-data">
                            暂无订单数据
                        </div>
                        <div v-for="order in recentOrders" :key="order.id" class="order-item">
                            <div class="order-info">
                                <div class="order-no">{{ order.orderNo }}</div>
                                <div class="order-customer">{{ order.customer }}</div>
                            </div>
                            <div class="order-amount">¥{{ order.amount?.toFixed(2) }}</div>
                            <el-tag size="small" :type="getStatusType(order.status)">
                                {{ getStatusText(order.status) }}
                            </el-tag>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <!-- 替换系统日志部分 -->
            <el-col :xs="24" :lg="12">
                <el-card>
                    <template #header>
                        <span>热门产品</span>
                    </template>
                    <div class="popular-products">
                        <div v-for="product in popularProducts" :key="product.id" class="product-item">
                            <div class="product-rank" :class="`rank-${product.rank}`">
                                {{ product.rank }}
                            </div>
                            <div class="product-info">
                                <div class="product-name">{{ product.name }}</div>
                                <div class="product-sales">销量: {{ product.sales }}</div>
                            </div>
                            <div class="product-growth">
                                <el-tag size="small" :type="product.growth >= 0 ? 'success' : 'danger'">
                                    {{ product.growth >= 0 ? '+' : '' }}{{ product.growth }}%
                                </el-tag>
                            </div>
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
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { listOrderByPage } from '@/api/order'
import { getPopularProducts } from '@/api/product'

const router = useRouter()
// 添加订单加载状态
const orderLoading = ref(false)

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
const recentOrders = ref([])
// 获取最近订单的函数
const fetchRecentOrders = async () => {
    orderLoading.value = true
    try {
        const response = await listOrderByPage({
            params: {
                page: 1,
                size: 5,
            }
        })
        // 检查HTTP状态码
        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}: 获取订单列表失败`)
        }

        if (response.data && response.data.content) {
            // 将获取的数据赋值给 recentOrders
            recentOrders.value = response.data.content.map(order => ({
                id: order.id,
                orderNo: order.orderNo,
                customer: order.customer,
                amount: order.amount,
                status: order.status
            }))
        }
    } catch (error) {
        console.error('获取最近订单失败:', error)
        ElMessage.error('获取最近订单失败')
        // 失败时保持空数组
        recentOrders.value = []
    } finally {
        orderLoading.value = false
    }
}

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

// const popularProducts = ref([
//     { id: 1, name: '智能手机 Pro', rank: 1, sales: '2,345', growth: 12.5 },
//     { id: 2, name: '无线耳机', rank: 2, sales: '1,890', growth: 8.2 },
//     { id: 3, name: '智能手表', rank: 3, sales: '1,567', growth: -3.1 },
//     { id: 4, name: '笔记本电脑', rank: 4, sales: '1,234', growth: 5.6 },
//     { id: 5, name: '平板电脑', rank: 5, sales: '987', growth: 15.3 }
// ])
const popularProducts = ref([])

// 添加获取热门产品的函数
const fetchPopularProducts = async () => {
    try {
        const response = await getPopularProducts()
        // 检查HTTP状态码
        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}: 获取热门产品失败`)
        }

        if (response.data) {
            popularProducts.value = response.data.map((product, index) => ({
                id: product.id,
                name: product.name,
                rank: index + 1,
                sales: product.monthlySales?.toLocaleString() || '0',
                growth: product.growthRate ? parseFloat(product.growthRate) : 0
            }))
        }
    } catch (error) {
        console.error('获取热门产品失败:', error)
        // 失败时使用模拟数据
        popularProducts.value = [
            { id: 1, name: '智能手机 Pro', rank: 1, sales: '2,345', growth: 12.5 },
            { id: 2, name: '无线耳机', rank: 2, sales: '1,890', growth: 8.2 },
            { id: 3, name: '智能手表', rank: 3, sales: '1,567', growth: -3.1 },
            { id: 4, name: '笔记本电脑', rank: 4, sales: '1,234', growth: 5.6 },
            { id: 5, name: '平板电脑', rank: 5, sales: '987', growth: 15.3 }
        ]
    }
}

onMounted(() => {
    // 确保DOM渲染完成后再初始化图表
    setTimeout(() => {
        initCharts()
    }, 100)
    // 获取最近订单
    fetchRecentOrders()
    // 热门产品
    fetchPopularProducts()
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

/* 添加 card-header 样式 */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 添加空数据提示样式 */
.empty-data {
    text-align: center;
    padding: 40px 0;
    color: #909399;
    font-size: 14px;
}

/* 确保 order-item 的样式保持不变 */
.order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.order-item:last-child {
    border-bottom: none;
}

.popular-products {
    padding: 0;
}

.product-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
}

.product-item:last-child {
    border-bottom: none;
}

.product-rank {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 12px;
    margin-right: 12px;
}

.rank-1 {
    background-color: #FFD700;
    color: #fff;
}

.rank-2 {
    background-color: #C0C0C0;
    color: #fff;
}

.rank-3 {
    background-color: #CD7F32;
    color: #fff;
}

.rank-4, .rank-5 {
    background-color: #f5f5f5;
    color: #909399;
}

.product-info {
    flex: 1;
}

.product-name {
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
}

.product-sales {
    color: #909399;
    font-size: 12px;
}

.product-growth {
    margin-left: 12px;
}
</style>
