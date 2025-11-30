<template>
    <div class="operation-log-container">
        <el-card class="search-card" shadow="never">
            <el-form :model="searchForm" :inline="true" label-width="80px">
                <!-- 第一行：操作者和时间范围 -->
                <el-form-item label="操作者">
                    <el-input v-model="searchForm.operator" placeholder="请输入操作者" clearable style="width: 200px" />
                </el-form-item>

                <el-form-item label="时间范围">
                    <el-date-picker
                            v-model="searchForm.timeRange"
                            type="datetimerange"
                            range-separator="至"
                            start-placeholder="开始时间"
                            end-placeholder="结束时间"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            style="width: 400px"
                    />
                </el-form-item>

                <el-form-item label="模块名称">
                    <el-select v-model="searchForm.module" placeholder="请选择模块" clearable style="width: 200px">
                        <el-option label="订单管理" value="订单管理" />
                        <el-option label="用户管理" value="用户管理" />
                        <el-option label="角色管理" value="角色管理" />
                        <el-option label="系统管理" value="系统管理" />
                        <el-option label="系统设置" value="系统设置" />
                        <el-option label="个人中心" value="个人中心" />
                    </el-select>
                </el-form-item>

                <el-form-item label="操作类型">
                    <el-select v-model="searchForm.type" placeholder="请选择操作类型" clearable style="width: 200px">
                        <el-option label="CREATE" value="CREATE" />
                        <el-option label="UPDATE" value="UPDATE" />
                        <el-option label="DELETE" value="DELETE" />
                        <el-option label="QUERY" value="QUERY" />
                        <el-option label="LOGIN" value="LOGIN" />
                    </el-select>
                </el-form-item>

                <el-form-item label="请求方法">
                    <el-select v-model="searchForm.requestMethod" placeholder="请选择请求方法" clearable style="width: 200px">
                        <el-option label="GET" value="GET" />
                        <el-option label="POST" value="POST" />
                        <el-option label="PUT" value="PUT" />
                        <el-option label="DELETE" value="DELETE" />
                    </el-select>
                </el-form-item>

                <el-form-item label="操作结果">
                    <el-select v-model="searchForm.result" placeholder="请选择操作结果" clearable style="width: 200px">
                        <el-option label="SUCCESS" value="SUCCESS" />
                        <el-option label="FAILURE" value="FAILURE" />
                    </el-select>
                </el-form-item>

                <el-form-item label="状态码">
                    <el-select v-model="searchForm.statusCode" placeholder="请选择状态码" clearable style="width: 200px">
                        <el-option label="200" value="200" />
                        <el-option label="400" value="400" />
                        <el-option label="401" value="401" />
                        <el-option label="403" value="403" />
                        <el-option label="500" value="500" />
                    </el-select>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSearch">
                        <el-icon><Search /></el-icon>
                        查询
                    </el-button>
                    <el-button @click="handleReset">
                        <el-icon><Refresh /></el-icon>
                        重置
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-card class="table-card" shadow="never">
            <template #header>
                <div class="card-header">
                    <span>操作日志列表</span>
                    <div>
                        <el-button @click="refreshData">
                            <el-icon><Refresh /></el-icon>
                            刷新
                        </el-button>
                        <el-button type="warning" @click="exportData">
                            <el-icon><Download /></el-icon>
                            导出
                        </el-button>
                    </div>
                </div>
            </template>

            <el-table
                    v-loading="loading"
                    :data="tableData"
                    stripe
                    style="width: 100%"
                    @sort-change="handleSortChange"
                    :default-sort="{ prop: 'id', order: 'ascending' }"
            >
                <el-table-column prop="id" label="ID" width="80" sortable="custom" align="center" />

                <el-table-column prop="module" label="模块" width="120" align="center">
                    <template #default="{ row }">
                        <el-tag class="module-tag" :class="getModuleColor(row.module)"  size="small">{{ row.module }}</el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="operation" label="操作描述" min-width="200" show-overflow-tooltip />

                <el-table-column prop="operator" label="操作者" width="120">
                    <template #default="{ row }">
                        <el-tag type="info" size="small">{{ row.operator }}</el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="requestMethod" label="请求方法" width="100">
                    <template #default="{ row }">
                        <el-tag
                                :type="getMethodType(row.requestMethod)"
                                size="small"
                        >
                            {{ row.requestMethod }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="statusCode" label="状态码" width="100">
                    <template #default="{ row }">
                        <el-tag
                                :type="getStatusCodeType(row.statusCode)"
                                size="small"
                        >
                            {{ row.statusCode }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="executionTime" label="响应时间" width="180" sortable="custom" align="center">
                    <template #default="{ row }">
                        {{ row.executionTime }}ms
                    </template>
                </el-table-column>

                <el-table-column prop="result" label="操作结果" width="100">
                    <template #default="{ row }">
                        <el-tag
                                :type="row.result === 'SUCCESS' ? 'success' : 'danger'"
                                size="small"
                        >
                            {{ row.result === 'SUCCESS' ? '成功' : '失败' }}
                        </el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="accessTime" label="访问时间" width="180" sortable="custom">
                    <template #default="{ row }">
                        {{ formatTime(row.accessTime) }}
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="120" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button
                                link
                                type="primary"
                                size="small"
                                @click="handleViewDetail(row)"
                        >
                            详情
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination
                        background
                        v-model:current-page="pagination.current"
                        v-model:page-size="pagination.size"
                        :total="pagination.total"
                        :page-sizes="[10, 20, 50, 100]"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 日志详情对话框 -->
        <LogDetailDialog
                v-model="detailVisible"
                :log-data="currentLog"
                @refresh="refreshData"
        />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download } from '@element-plus/icons-vue'
import LogDetailDialog from './LogDetailDialog.vue'
import { getOperationLogs, exportOperationLogs } from '@/api/operationLog'

// 搜索表单
const searchForm = reactive({
    module: '',
    type: '',
    operator: '',
    requestMethod: '',
    statusCode: null,
    result: '',
    timeRange: []
})

// 表格数据
const loading = ref(false)
const tableData = ref([])

// 分页
const pagination = reactive({
    current: 1,
    size: 10,
    total: 0
})

// 排序
const sort = reactive({
    prop: '',
    order: ''
})

// 对话框
const detailVisible = ref(false)
const currentLog = ref(null)

// 加载数据
const loadData = async () => {
    loading.value = true
    try {
        const params = {
            page: pagination.current,
            size: pagination.size,
            ...searchForm
        }

        // 处理时间范围
        if (searchForm.timeRange && searchForm.timeRange.length === 2) {
            params.startTime = searchForm.timeRange[0]
            params.endTime = searchForm.timeRange[1]
        }

        // 处理排序
        if (sort.prop) {
            params.sort = `${sort.prop},${sort.order}`
        }

        const response = await getOperationLogs(params)
        const { data } = response

        tableData.value = data.content
        pagination.total = data.totalElements
    } catch (error) {
        console.error('加载操作日志失败:', error)
        ElMessage.error('加载操作日志失败')
        // 使用模拟数据
        loadMockData()
    } finally {
        loading.value = false
    }
}

// 模拟数据
const loadMockData = () => {
    tableData.value = [
        {
            id: 1,
            module: '用户管理',
            type: 'UPDATE',
            operation: '修改了用户"张三"的权限',
            operator: 'admin',
            operatorId: 1,
            operatorIp: '192.168.1.100',
            requestMethod: 'PUT',
            requestUrl: '/api/users/1',
            statusCode: 200,
            executionTime: 45,
            result: 'SUCCESS',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            accessTime: '2024-01-15 10:30:25',
            createTime: '2024-01-15 10:30:25'
        },
        {
            id: 2,
            module: '角色管理',
            type: 'CREATE',
            operation: '创建了新角色"内容编辑"',
            operator: 'admin',
            operatorId: 1,
            operatorIp: '192.168.1.100',
            requestMethod: 'POST',
            requestUrl: '/api/roles',
            statusCode: 200,
            executionTime: 78,
            result: 'SUCCESS',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            accessTime: '2024-01-15 09:15:30',
            createTime: '2024-01-15 09:15:30'
        },
        {
            id: 3,
            module: '系统管理',
            type: 'UPDATE',
            operation: '更新了系统菜单结构',
            operator: 'admin',
            operatorId: 1,
            operatorIp: '192.168.1.100',
            requestMethod: 'PUT',
            requestUrl: '/api/menus',
            statusCode: 200,
            executionTime: 120,
            result: 'SUCCESS',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            accessTime: '2024-01-14 16:20:15',
            createTime: '2024-01-14 16:20:15'
        },
        {
            id: 4,
            module: '系统管理',
            type: 'LOGIN',
            operation: '登录系统',
            operator: 'admin',
            operatorId: 1,
            operatorIp: '192.168.1.100',
            requestMethod: 'POST',
            requestUrl: '/api/login',
            statusCode: 200,
            executionTime: 234,
            result: 'SUCCESS',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            accessTime: '2024-01-14 14:30:45',
            createTime: '2024-01-14 14:30:45'
        },
        {
            id: 5,
            module: '订单管理',
            type: 'DELETE',
            operation: '删除了订单"ORD202401010001"',
            operator: 'admin',
            operatorId: 1,
            operatorIp: '192.168.1.100',
            requestMethod: 'DELETE',
            requestUrl: '/api/orders/1',
            statusCode: 500,
            executionTime: 89,
            result: 'FAILURE',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            errorMessage: '数据库连接超时',
            accessTime: '2024-01-14 11:05:20',
            createTime: '2024-01-14 11:05:20'
        }
    ]
    pagination.total = tableData.value.length
}

// 事件处理
const handleSearch = () => {
    pagination.current = 1
    loadData()
}

const handleReset = () => {
    Object.assign(searchForm, {
        module: '',
        type: '',
        operator: '',
        requestMethod: '',
        statusCode: null,
        result: '',
        timeRange: []
    })
    pagination.current = 1
    loadData()
}

const handleSizeChange = (size) => {
    pagination.size = size
    pagination.current = 1
    loadData()
}

const handleCurrentChange = (current) => {
    pagination.current = current
    loadData()
}

const handleSortChange = (sortInfo) => {
    sort.prop = sortInfo.prop
    sort.order = sortInfo.order === 'ascending' ? 'asc' : 'desc'
    loadData()
}

const refreshData = () => {
    // 保存当前搜索条件和分页状态
    const currentPage = pagination.current
    const currentSize = pagination.size

    loadData().then(() => {
        // 刷新后保持当前页码和页数
        pagination.current = currentPage
        pagination.size = currentSize
    })
}

const exportData = async () => {
    try {
        loading.value = true

        const params = {
            page: pagination.current,
            size: pagination.size,
            ...searchForm
        }

        // 处理时间范围
        if (searchForm.timeRange && searchForm.timeRange.length === 2) {
            params.startTime = searchForm.timeRange[0]
            params.endTime = searchForm.timeRange[1]
        }

        const response = await exportOperationLogs(params)

        // 创建下载链接
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `operation_logs_${new Date().getTime()}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        ElMessage.success('导出成功')
    } catch (error) {
        console.error('导出失败:', error)
        ElMessage.error('导出失败')
    } finally {
        loading.value = false
    }
}

const handleViewDetail = (row) => {
    currentLog.value = row
    detailVisible.value = true
}

// 工具函数
const getMethodType = (method) => {
    const typeMap = {
        'GET': 'primary',
        'POST': 'success',
        'PUT': 'warning',
        'DELETE': 'danger'
    }
    return typeMap[method] || 'info'
}


const moduleColors = {
    '用户管理': 'primary',
    '角色管理': 'success',
    '系统管理': 'warning',
    '系统设置': 'danger',
    '个人中心': 'info',
    '订单管理': '',
    // 预留更多颜色
}

const getModuleColor = (module) => {
    const moduleMap = {
        '用户管理': 'color-user',
        '角色管理': 'color-role',
        '订单管理': 'color-order',
        '系统设置': 'color-settings',
        '个人中心': 'color-profile',
        '菜单管理': 'color-menu',
        '登录系统': 'color-login',
        '注册用户': 'color-register',
        '其他': 'color-other'
    }
    return moduleMap[module] || 'color-default'
}

const getStatusCodeType = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return 'success'
    if (statusCode >= 400 && statusCode < 500) return 'warning'
    if (statusCode >= 500) return 'danger'
    return 'info'
}

const formatTime = (time) => {
    if (!time) return '-'
    return time.replace('T', ' ').substring(0, 19)
}

// 生命周期
onMounted(() => {
    loadData()
})
</script>

<style scoped>
.operation-log-container {
    padding: 20px;
}

.search-card {
    margin-bottom: 16px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-card {
    margin-bottom: 16px;
}

.pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
}

:deep(.el-form-item) {
    margin-bottom: 16px;
}

:deep(.el-select) {
    width: 100%;
}

/* 自定义模块颜色 */
.module-tag.color-user {
    background-color: #409EFF !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-role {
    background-color: #67C23A !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-system {
    background-color: #E6A23C !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-settings {
    background-color: #F56C6C !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-profile {
    background-color: #909399 !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-order {
    background-color: #8E44AD !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-product {
    background-color: #16A085 !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-inventory {
    background-color: #D35400 !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-finance {
    background-color: #C0392B !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-report {
    background-color: #7F8C8D !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-default {
    background-color: #BDC3C7 !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-menu {
    background-color: #9B59B6 !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-login {
    background-color: #3498DB !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-register {
    background-color: #2ECC71 !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-other {
    background-color: #95A5A6 !important;
    color: white !important;
    border: none !important;
}

.module-tag.color-default {
    background-color: #BDC3C7 !important;
    color: white !important;
    border: none !important;
}
</style>
