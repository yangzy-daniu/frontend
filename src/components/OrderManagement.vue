<template>
    <div class="order-management">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>订单管理</span>
                    <el-button type="primary" @click="handleCreate">
                        <el-icon><Plus /></el-icon>
                        新建订单
                    </el-button>
                </div>
            </template>

            <!-- 搜索区域 -->
            <el-form inline :model="searchForm" class="search-form">
                <el-form-item label="订单号">
                    <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
                </el-form-item>
                <el-form-item label="客户">
                    <el-input v-model="searchForm.customer" placeholder="请输入客户名称" clearable />
                </el-form-item>
                <el-form-item label="状态">
                    <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
                        <el-option label="待支付" value="pending" />
                        <el-option label="已支付" value="paid" />
                        <el-option label="已发货" value="shipped" />
                        <el-option label="已完成" value="completed" />
                        <el-option label="已取消" value="cancelled" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch">
                        <el-icon><Search /></el-icon>
                        搜索
                    </el-button>
                    <el-button @click="resetSearch">
                        <el-icon><Refresh /></el-icon>
                        重置
                    </el-button>
                </el-form-item>
            </el-form>

            <!-- 订单表格 -->
            <el-table :data="orderList" v-loading="loading" stripe>
                <el-table-column prop="orderNo" label="订单号" width="180" />
                <el-table-column prop="customer" label="客户" width="120" />
                <el-table-column prop="amount" label="金额" width="100" align="right">
                    <template #default="{ row }">
                        ¥{{ row.amount.toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row.status)">
                            {{ getStatusText(row.status) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180" />
                <el-table-column prop="productCount" label="商品数量" width="100" align="center" />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button size="small" @click="handleView(row)">查看</el-button>
                        <el-button
                                size="small"
                                type="primary"
                                @click="handleEdit(row)"
                                v-if="hasPermission('order:edit')"
                        >
                            编辑
                        </el-button>
                        <el-button
                                size="small"
                                type="danger"
                                @click="handleDelete(row.id)"
                                v-if="hasPermission('order:delete')"
                        >
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
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

        <!-- 订单详情对话框 -->
        <OrderDetailDialog
                v-model="detailVisible"
                :order-id="selectedOrderId"
                @refresh="loadOrders"
        />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'
import OrderDetailDialog from './OrderDetailDialog.vue'

// 模拟数据
const mockOrders = [
    {
        id: 1,
        orderNo: 'ORD202401010001',
        customer: '张三',
        amount: 2999.00,
        status: 'paid',
        createTime: '2024-01-01 10:00:00',
        productCount: 2
    },
    {
        id: 2,
        orderNo: 'ORD202401010002',
        customer: '李四',
        amount: 1599.50,
        status: 'pending',
        createTime: '2024-01-01 11:30:00',
        productCount: 1
    }
]

const loading = ref(false)
const orderList = ref([])
const detailVisible = ref(false)
const selectedOrderId = ref(null)

const searchForm = reactive({
    orderNo: '',
    customer: '',
    status: ''
})

const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 权限检查
const hasPermission = (permission) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return userInfo.role === 'admin' || userInfo.role === 'super'
}

const loadOrders = async () => {
    loading.value = true
    try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 500))

        // 过滤数据
        let filteredOrders = [...mockOrders]
        if (searchForm.orderNo) {
            filteredOrders = filteredOrders.filter(order =>
                    order.orderNo.includes(searchForm.orderNo)
            )
        }
        if (searchForm.customer) {
            filteredOrders = filteredOrders.filter(order =>
                    order.customer.includes(searchForm.customer)
            )
        }
        if (searchForm.status) {
            filteredOrders = filteredOrders.filter(order =>
                    order.status === searchForm.status
            )
        }

        orderList.value = filteredOrders
        pagination.total = filteredOrders.length
    } catch (error) {
        console.error('加载订单失败:', error)
        ElMessage.error('加载订单失败')
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    pagination.currentPage = 1
    loadOrders()
}

const resetSearch = () => {
    Object.assign(searchForm, {
        orderNo: '',
        customer: '',
        status: ''
    })
    loadOrders()
}

const handleCreate = () => {
    ElMessage.info('新建订单功能开发中...')
}

const handleView = (row) => {
    selectedOrderId.value = row.id
    detailVisible.value = true
}

const handleEdit = (row) => {
    ElMessage.info(`编辑订单: ${row.orderNo}`)
}

const handleDelete = async (id) => {
    try {
        await ElMessageBox.confirm('确定删除该订单吗？', '提示', { type: 'warning' })
        ElMessage.success('删除成功')
        loadOrders()
    } catch (error) {
        // 用户取消
    }
}

const getStatusType = (status) => {
    const typeMap = {
        pending: 'warning',
        paid: 'primary',
        shipped: 'info',
        completed: 'success',
        cancelled: 'danger'
    }
    return typeMap[status] || 'info'
}

const getStatusText = (status) => {
    const textMap = {
        pending: '待支付',
        paid: '已支付',
        shipped: '已发货',
        completed: '已完成',
        cancelled: '已取消'
    }
    return textMap[status] || '未知'
}

const handleSizeChange = (size) => {
    pagination.pageSize = size
    loadOrders()
}

const handleCurrentChange = (page) => {
    pagination.currentPage = page
    loadOrders()
}

onMounted(() => {
    loadOrders()
})
</script>

<style scoped>
.order-management {
    padding: 0;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.search-form {
    margin-bottom: 20px;
}

.pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
}
</style>
