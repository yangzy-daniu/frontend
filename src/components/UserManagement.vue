<template>
    <div class="user-management">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>用户管理</span>
                    <el-button type="primary" @click="handleAdd">
                        <el-icon><Plus /></el-icon>
                        新增用户
                    </el-button>
                </div>
            </template>

            <!-- 搜索区域 -->
            <el-form inline :model="searchForm" class="search-form">
                <el-form-item label="关键词">
                    <el-input
                            v-model="searchForm.keyword"
                            placeholder="请输入用户名或姓名"
                            clearable
                            @clear="handleSearch"
                            @keyup.enter="handleSearch"
                    />
                </el-form-item>
                <el-form-item label="角色">
                    <el-select
                            v-model="searchForm.role"
                            placeholder="请选择角色"
                            clearable
                            @change="handleSearch"
                            style="width: 140px"
                    >
                        <el-option label="普通用户" value="user" />
                        <el-option label="管理员" value="admin" />
                        <el-option label="超级管理员" value="super" />
                        <el-option label="系统管理" value="system" />
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

            <!-- 表格区域 -->
            <el-table
                    :data="tableData"
                    v-loading="loading"
                    stripe
                    style="width:100%"
                    @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" />
                <el-table-column prop="username" label="用户名" min-width="120" />
                <el-table-column prop="name" label="姓名" min-width="120" />
                <el-table-column prop="role" label="角色" width="120">
                    <template #default="scope">
                        <!-- 保持原有 admin/user 颜色，新增两种角色用 warning / success 区分 -->
                        <el-tag
                            :type="scope.row.role === 'admin'
                            ? 'danger'
                            : scope.row.role === 'user'
                            ? 'primary'
                            : scope.row.role === 'super'
                            ? 'warning'
                            : 'success'"
                        >
                            {{
                                scope.row.role === 'admin'
                                        ? '管理员'
                                        : scope.row.role === 'user'
                                                ? '普通用户'
                                                : scope.row.role === 'super'
                                                        ? '超级管理员'
                                                        : '系统管理'
                            }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180">
                    <template #default="scope">
                        {{ formatDate(scope.row.createTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="scope">
                        <el-button size="small" @click="handleEdit(scope.row)">
                            <el-icon><Edit /></el-icon>
                            编辑
                        </el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">
                            <el-icon><Delete /></el-icon>
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <div class="pagination-container">
                <div class="batch-actions" v-if="selectedRows.length > 0">
                    <el-button type="danger" size="small" @click="handleBatchDelete">
                        <el-icon><Delete /></el-icon>
                        批量删除 ({{ selectedRows.length }})
                    </el-button>
                </div>

                <el-pagination
                        background
                        v-model:current-page="pagination.currentPage"
                        v-model:page-size="pagination.pageSize"
                        :page-sizes="[10, 20, 50, 100]"
                        :total="pagination.total"
                        layout="total, sizes, prev, pager, next, jumper"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                />
            </div>
        </el-card>

        <!-- 新增/编辑对话框 -->
        <el-dialog
                :title="dialogTitle"
                v-model="dialogVisible"
                width="600px"
                :before-close="handleDialogClose"
        >
            <el-form
                    ref="userFormRef"
                    :model="userForm"
                    :rules="userRules"
                    label-width="80px"
            >
                <el-form-item label="用户名" prop="username">
                    <el-input
                            v-model="userForm.username"
                            placeholder="请输入用户名"
                            :disabled="isEdit"
                    />
                </el-form-item>

                <el-form-item label="密码" prop="password" v-if="!isEdit">
                    <el-input
                            v-model="userForm.password"
                            type="password"
                            placeholder="请输入密码"
                            show-password
                    />
                </el-form-item>

                <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
                    <el-input
                            v-model="userForm.confirmPassword"
                            type="password"
                            placeholder="请确认密码"
                            show-password
                    />
                </el-form-item>

                <el-form-item label="姓名" prop="name">
                    <el-input v-model="userForm.name" placeholder="请输入姓名" />
                </el-form-item>

                <el-form-item label="角色" prop="role">
                    <el-radio-group v-model="userForm.role">
                        <el-radio label="user">普通用户</el-radio>
                        <el-radio label="admin">管理员</el-radio>
                        <el-radio label="super">超级管理员</el-radio>
                        <el-radio label="system">系统管理</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="handleDialogClose">取消</el-button>
                <el-button type="primary" @click="handleSubmit" :loading="submitting">
                    确定
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    Plus,
    Search,
    Edit,
    Delete,
    Refresh
} from '@element-plus/icons-vue'
import {
    listUserByPage,
    addUser,
    delUser,
    batchDeleteUsers,
    updateUser
} from '@/api/user'

const loading = ref(false)
const dialogVisible = ref(false)
const submitting = ref(false)
const isEdit = ref(false)
const selectedRows = ref([])
const userFormRef = ref()

// 搜索表单
const searchForm = reactive({
    keyword: '',
    role: ''
})

// 分页数据
const pagination = reactive({
    currentPage: 1,
    pageSize: 10,
    total: 0
})

// 表格数据
const tableData = ref([])

// 用户表单
const userForm = reactive({
    id: null,
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'user'
})

// 表单验证规则
const userRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
    ],
    password: [
        {
            required: true,
            message: '请输入密码',
            trigger: 'blur',
            validator: (rule, value, callback) => {
                if (!isEdit.value && (!value || value.length < 6)) {
                    callback(new Error('密码长度不能少于6个字符'))
                } else {
                    callback()
                }
            }
        }
    ],
    confirmPassword: [
        {
            required: true,
            message: '请确认密码',
            trigger: 'blur',
            validator: (rule, value, callback) => {
                if (!isEdit.value) {
                    if (!value) {
                        callback(new Error('请确认密码'))
                    } else if (value !== userForm.password) {
                        callback(new Error('两次输入密码不一致'))
                    } else {
                        callback()
                    }
                } else {
                    callback()
                }
            }
        }
    ],
    name: [
        { required: true, message: '请输入姓名', trigger: 'blur' }
    ],
    role: [
        { required: true, message: '请选择角色', trigger: 'change' }
    ]
}

const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '新增用户')

// 构建查询参数
const buildQueryParams = () => {
    const params = {
        page: pagination.currentPage,
        size: pagination.pageSize
    }

    if (searchForm.keyword) {
        params.keyword = searchForm.keyword
    }

    if (searchForm.role) {
        params.role = searchForm.role
    }

    return params
}

// 加载用户数据
const loadUsers = async () => {
    loading.value = true
    try {
        const params = buildQueryParams()
        const response = await listUserByPage(params)
        tableData.value = response.data.content
        pagination.total = response.data.totalElements
    } catch (error) {
        console.error('加载用户数据失败:', error)
        ElMessage.error('加载用户数据失败')
        // 失败时清空数据
        tableData.value = []
        pagination.total = 0
    } finally {
        loading.value = false
    }
}

// 搜索
const handleSearch = () => {
    pagination.currentPage = 1
    loadUsers()
}

// 重置搜索
const resetSearch = () => {
    searchForm.keyword = ''
    searchForm.role = ''
    pagination.currentPage = 1
    loadUsers()
}

// 新增用户
const handleAdd = () => {
    isEdit.value = false
    resetForm()
    dialogVisible.value = true
}

// 编辑用户
const handleEdit = (row) => {
    isEdit.value = true
    Object.assign(userForm, {
        id: row.id,
        username: row.username,
        password: '',
        confirmPassword: '',
        name: row.name,
        role: row.role
    })
    dialogVisible.value = true
}

// 删除用户
const handleDelete = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
            type: 'warning'
        })

        await delUser(id)
        ElMessage.success('删除成功')
        await loadUsers()
    } catch (error) {
        // 用户取消删除
    }
}

// 批量删除
const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
        ElMessage.warning('请选择要删除的用户')
        return
    }

    try {
        await ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个用户吗？`, '提示', {
            type: 'warning'
        })

        const ids = selectedRows.value.map(row => row.id)
        await batchDeleteUsers(ids)
        ElMessage.success('批量删除成功')
        selectedRows.value = []
        await loadUsers()
    } catch (error) {
        // 用户取消删除
    }
}

// 重置表单
const resetForm = () => {
    Object.assign(userForm, {
        id: null,
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        role: 'user'
    })
    if (userFormRef.value) {
        userFormRef.value.clearValidate()
    }
}

// 提交表单
const handleSubmit = async () => {
    if (!userFormRef.value) return

    try {
        const valid = await userFormRef.value.validate()
        if (!valid) return

        submitting.value = true

        if (isEdit.value) {
            // 编辑时只传需要更新的字段
            const updateData = {
                name: userForm.name,
                role: userForm.role
            }
            // 如果密码不为空，则更新密码
            if (userForm.password) {
                updateData.password = userForm.password
            }
            await updateUser(userForm.id, updateData)
            ElMessage.success('更新成功')
        } else {
            await addUser(userForm)
            ElMessage.success('新增成功')
        }

        dialogVisible.value = false
        await loadUsers()
    } catch (error) {
        console.error('保存用户失败:', error)
        ElMessage.error('保存用户失败: ' + (error.response?.data?.message || error.message))
    } finally {
        submitting.value = false
    }
}

// 关闭对话框
const handleDialogClose = () => {
    dialogVisible.value = false
    resetForm()
}

// 选择行变化
const handleSelectionChange = (selection) => {
    selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (size) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    loadUsers()
}

// 当前页变化
const handleCurrentChange = (page) => {
    pagination.currentPage = page
    loadUsers()
}

// 格式化日期
const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString()
}

onMounted(() => {
    loadUsers()
})
</script>

<style scoped>
.user-management {
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
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
}

.batch-actions {
    display: flex;
    align-items: center;
}
</style>
