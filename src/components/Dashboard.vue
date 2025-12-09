<template>
    <div class="dashboard">
        <div class="page-header">
            <h1>数据概览</h1>
            <p>多维度数据分析，驱动业务增长</p>
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
            <el-col :xs="24" :lg="14">
                <el-card class="chart-card">
                    <template #header>
                        <span>销售趋势</span>
                    </template>
                    <div ref="salesChart" class="chart-container"></div>
                </el-card>
            </el-col>
            <el-col :xs="24" :lg="10">
                <el-card class="chart-card">
                    <template #header>
                        <div class="chart-header">
                            <span>产品销售占比</span>
                            <el-select
                                    v-model="categoryType"
                                    size="small"
                                    style="width: 120px"
                                    @change="fetchCategorySales"
                            >
                                <el-option label="按销量" value="sales" />
                                <el-option label="按金额" value="revenue" />
                            </el-select>
                        </div>
                    </template>
                    <div ref="categoryChart" class="chart-container"></div>
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
import { getPopularProducts, getCategorySales } from '@/api/product'

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

let salesChartInstance = null

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

}

const getStatusType = (status) => {
    const typeMap = { pending: 'warning', paid: 'primary', completed: 'success' }
    return typeMap[status] || 'info'
}

const getStatusText = (status) => {
    const textMap = { pending: '待支付', paid: '已支付', completed: '已完成' }
    return textMap[status] || '未知'
}

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

// 在 data 部分添加
const categoryType = ref('sales')
const categoryChart = ref(null)
let categoryChartInstance = null

// 添加获取品类销售数据的函数
const fetchCategorySales = async () => {
    try {
        const response = await getCategorySales(categoryType.value)

        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status}: 获取品类数据失败`)
        }

        if (response.data) {
            updateCategoryChart(response.data)
        }
    } catch (error) {
        console.error('获取品类销售数据失败:', error)
        // 使用模拟数据
        const mockData = categoryType.value === 'sales' ? [
            { category: '电子产品', value: 1240, color: '#5470c6' },
            { category: '家用电器', value: 890, color: '#91cc75' },
            { category: '服装鞋帽', value: 670, color: '#fac858' },
            { category: '图书文具', value: 450, color: '#ee6666' },
            { category: '其他', value: 320, color: '#73c0de' }
        ] : [
            { category: '电子产品', value: 45600, color: '#5470c6' },
            { category: '家用电器', value: 27800, color: '#91cc75' },
            { category: '服装鞋帽', value: 18900, color: '#fac858' },
            { category: '图书文具', value: 12400, color: '#ee6666' },
            { category: '其他', value: 8900, color: '#73c0de' }
        ]
        updateCategoryChart(mockData)
    }
}

// 更新品类图表
const updateCategoryChart = (data) => {
    if (!categoryChartInstance) {
        categoryChartInstance = echarts.init(categoryChart.value)
    }

    // 计算总数
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const totalText = categoryType.value === 'sales'
            ? `总销量\n${totalValue.toLocaleString()}件`
            : `总金额\n¥${totalValue.toLocaleString()}`;

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: (params) => {
                const value = categoryType.value === 'sales'
                        ? `${params.value}件`
                        : `¥${params.value.toLocaleString()}`
                return `${params.name}<br/>${value} (${params.percent}%)`
            }
        },
        legend: {
            // 图例靠右垂直排列
            orient: 'vertical',
            right: 15,      // 距离右侧15像素
            top: 'middle',   // 垂直居中
            align: 'left',   // 文本左对齐
            textStyle: {
                fontSize: 12,
                color: '#606266'
            },
            itemGap: 8,     // 图例项之间的间距
            itemWidth: 12,   // 图例标记宽度
            itemHeight: 12,  // 图例标记高度
            // 移除百分比，只显示品类名称
            formatter: function (name) {
                return name;  // 只返回品类名称，不显示百分比
            }
        },
        series: [{
            name: '销售占比',
            type: 'pie',
            // 调整饼图位置，向左移动，给右侧图例留空间
            radius: ['40%', '70%'],
            center: ['35%', '50%'],  // 向左移动饼图
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 6,
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
                    fontSize: 14,
                    fontWeight: 'bold',
                    formatter: (params) => {
                        return `${params.name}\n${params.percent}%`
                    }
                },
                scale: true,
                scaleSize: 5
            },
            labelLine: {
                show: false
            },
            data: data.map(item => ({
                name: item.category,
                value: item.value,
                // 使用后端返回的颜色
                itemStyle: {
                    color: item.color || '#999999'
                }
            }))
        }],
        graphic: [
            {
                type: 'text',
                left: '35%',  // 与饼图中心对齐
                top: '50%',
                style: {
                    text: totalText,
                    fontSize: 13,
                    fontWeight: 'bold',
                    fill: '#606266',
                    lineHeight: 20,
                    textAlign: 'center'
                }
            }
        ]
    }

    categoryChartInstance.setOption(option)
}
const getCategoryColor = (category) => {
    const colorMap = {
        '电子产品': '#5470c6',
        '家用电器': '#91cc75',
        '服装鞋帽': '#fac858',
        '图书文具': '#ee6666',
        '数码配件': '#73c0de',
        '运动户外': '#3ba272',
        '美妆个护': '#fc8452',
        '食品饮料': '#9a60b4',
        '家居用品': '#ea7ccc',
        '其他': '#9a60b4'
    };
    return colorMap[category] || '#999999';
};
onMounted(() => {
    // 确保DOM渲染完成后再初始化图表
    setTimeout(() => {
        initCharts()
    }, 100)
    // 获取最近订单
    fetchRecentOrders()
    // 热门产品
    fetchPopularProducts()
    // 初始化品类图表
    fetchCategorySales()
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        salesChartInstance?.resize()
        categoryChartInstance?.resize()
    })
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
    salesChartInstance?.dispose()
    categoryChartInstance?.dispose()
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

/* 为图例区域添加内边距 */
:deep(.el-card__header) {
    padding: 16px 20px;
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 调整销售趋势图的容器样式 */
.sales-chart-container {
    width: 100%;
    height: 100%;
}




/* 确保图表容器有足够高度 */
.chart-container {
    height: 340px;  /* 增加一点高度 */
    width: 100%;
    min-height: 340px;
}

/* 调整图表卡片的内边距，为图例留更多空间 */
.chart-card :deep(.el-card__body) {
    padding: 15px;
}

/* 确保图表区域有足够的空间 */
.chart-row {
    margin-bottom: 20px;
}

.chart-card {
    height: 100%;
}
</style>
