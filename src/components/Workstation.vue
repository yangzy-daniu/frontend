<template>
    <div class="dashboard">
        <div class="page-header">
            <h1>我的工作台</h1>
            <p>欢迎回来，{{ userInfo.name }}！今天是 {{ currentDate }}</p>
        </div>

        <!-- 快捷操作 -->
        <el-row :gutter="20" class="quick-actions">
            <el-col :xs="12" :sm="6" v-for="action in quickActions" :key="action.name">
                <el-card class="action-card" shadow="hover" @click="handleAction(action)">
                    <div class="action-content">
                        <div class="action-icon" :style="{ background: action.color }">
                            <el-icon><component :is="action.icon" /></el-icon>
                        </div>
                        <div class="action-info">
                            <div class="action-title">{{ action.title }}</div>
                            <div class="action-desc">{{ action.desc }}</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 待办事项 -->
        <el-row :gutter="20" class="main-content">
            <el-col :xs="24" :lg="12">
                <el-card class="todo-card">
                    <template #header>
                        <div class="card-header">
                            <span>待办事项</span>
                            <el-button type="primary" text @click="addTodo">新增</el-button>
                        </div>
                    </template>
                    <div class="todo-list">
                        <div v-for="todo in todos" :key="todo.id" class="todo-item">
                            <el-checkbox v-model="todo.completed" @change="updateTodo(todo)">
                                <span :class="{ 'completed': todo.completed }">{{ todo.title }}</span>
                            </el-checkbox>
                            <div class="todo-meta">
                                <span class="todo-time">{{ todo.time }}</span>
                                <el-tag size="small" :type="todo.priorityType">{{ todo.priority }}</el-tag>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>

            <!-- 最近访问 -->
            <el-col :xs="24" :lg="12">
                <el-card class="recent-card">
                    <template #header>
                        <span>最近访问</span>
                    </template>
                    <div class="recent-list">
                        <div v-for="item in recentAccess" :key="item.id" class="recent-item" @click="gotoPage(item)">
                            <div class="recent-icon">
                                <el-icon><component :is="item.icon" /></el-icon>
                            </div>
                            <div class="recent-info">
                                <div class="recent-title">{{ item.title }}</div>
                                <div class="recent-time">{{ item.time }}</div>
                            </div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 系统通知 -->
        <el-card class="notification-card">
            <template #header>
                <div class="card-header">
                    <span>系统通知</span>
                    <el-badge :value="unreadCount" :max="99">
                        <el-button type="primary" text @click="viewAllNotifications">查看全部</el-button>
                    </el-badge>
                </div>
            </template>
            <div class="notification-list">
                <div v-for="notice in notifications" :key="notice.id" class="notification-item">
                    <div class="notice-icon" :class="notice.type">
                        <el-icon><component :is="notice.icon" /></el-icon>
                    </div>
                    <div class="notice-content">
                        <div class="notice-title">{{ notice.title }}</div>
                        <div class="notice-desc">{{ notice.description }}</div>
                        <div class="notice-time">{{ notice.time }}</div>
                    </div>
                    <el-button v-if="!notice.read" type="primary" link @click="markAsRead(notice)">
                        标记已读
                    </el-button>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
    User,
    Setting,
    ShoppingCart,
    TrendCharts,
    Bell,
    Clock,
    Star,
    Document,
    Check,
    Warning
} from '@element-plus/icons-vue'

const router = useRouter()

const userInfo = ref({
    name: '管理员',
    role: '系统管理员'
})

const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
}))

// 快捷操作
const quickActions = ref([
    {
        name: 'userManagement',
        title: '用户管理',
        desc: '管理系统用户',
        icon: User,
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        path: '/user'
    },
    {
        name: 'orderManagement',
        title: '订单处理',
        desc: '查看待处理订单',
        icon: ShoppingCart,
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        path: '/order'
    },
    {
        name: 'dataAnalysis',
        title: '数据分析',
        desc: '查看系统报表',
        icon: TrendCharts,
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        path: '/dashboard'
    },
    {
        name: 'systemSetting',
        title: '系统设置',
        desc: '配置系统参数',
        icon: Setting,
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        path: '/system'
    }
])

// 待办事项
const todos = ref([
    {
        id: 1,
        title: '审核新用户注册申请',
        completed: false,
        time: '今天 14:00',
        priority: '高',
        priorityType: 'danger'
    },
    {
        id: 2,
        title: '处理待发货订单',
        completed: false,
        time: '今天 16:00',
        priority: '中',
        priorityType: 'warning'
    },
    {
        id: 3,
        title: '更新系统菜单权限',
        completed: true,
        time: '昨天',
        priority: '低',
        priorityType: 'success'
    }
])

// 最近访问
const recentAccess = ref([
    {
        id: 1,
        title: '用户管理',
        path: '/user',
        icon: User,
        time: '10分钟前'
    },
    {
        id: 2,
        title: '订单管理',
        path: '/order',
        icon: ShoppingCart,
        time: '30分钟前'
    },
    {
        id: 3,
        title: '系统分析',
        path: '/analysis',
        icon: TrendCharts,
        time: '1小时前'
    }
])

// 系统通知
const notifications = ref([
    {
        id: 1,
        title: '新用户注册',
        description: '用户 "张三" 完成了注册，请及时审核',
        type: 'info',
        icon: User,
        time: '5分钟前',
        read: false
    },
    {
        id: 2,
        title: '订单待处理',
        description: '有3个新订单等待处理',
        type: 'warning',
        icon: ShoppingCart,
        time: '10分钟前',
        read: false
    },
    {
        id: 3,
        title: '系统更新',
        description: '系统已更新至最新版本 v1.2.0',
        type: 'success',
        icon: Check,
        time: '1小时前',
        read: true
    }
])

const unreadCount = computed(() => {
    return notifications.value.filter(notice => !notice.read).length
})

const handleAction = (action) => {
    router.push(action.path)
}

const addTodo = () => {
    ElMessage.info('新增待办功能开发中...')
}

const updateTodo = (todo) => {
    ElMessage.success(`任务 "${todo.title}" ${todo.completed ? '已完成' : '标记为未完成'}`)
}

const gotoPage = (item) => {
    router.push(item.path)
}

const viewAllNotifications = () => {
    ElMessage.info('查看全部通知功能开发中...')
}

const markAsRead = (notice) => {
    notice.read = true
    ElMessage.success('标记为已读')
}

onMounted(() => {
    // 可以在这里加载用户数据
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

.quick-actions {
    margin-bottom: 20px;
}

.action-card {
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 12px;
}

.action-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.action-content {
    display: flex;
    align-items: center;
    padding: 8px 0;
}

.action-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 16px;
    font-size: 20px;
    color: white;
}

.action-title {
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
}

.action-desc {
    color: #909399;
    font-size: 12px;
}

.main-content {
    margin-bottom: 20px;
}

.todo-list, .recent-list, .notification-list {
    padding: 0;
}

.todo-item, .recent-item, .notification-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
}

.todo-item:last-child, .recent-item:last-child, .notification-item:last-child {
    border-bottom: none;
}

.todo-item {
    justify-content: space-between;
}

.completed {
    text-decoration: line-through;
    color: #909399;
}

.todo-meta {
    display: flex;
    align-items: center;
    gap: 8px;
}

.todo-time {
    color: #909399;
    font-size: 12px;
}

.recent-item {
    gap: 12px;
}

.recent-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409EFF;
}

.recent-title {
    font-weight: 500;
    color: #303133;
}

.recent-time {
    color: #909399;
    font-size: 12px;
    margin-top: 2px;
}

.notice-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 18px;
}

.notice-icon.info {
    background: #ecf5ff;
    color: #409EFF;
}

.notice-icon.warning {
    background: #fdf6ec;
    color: #e6a23c;
}

.notice-icon.success {
    background: #f0f9eb;
    color: #67c23a;
}

.notice-content {
    flex: 1;
}

.notice-title {
    font-weight: 500;
    color: #303133;
    margin-bottom: 4px;
}

.notice-desc {
    color: #606266;
    font-size: 14px;
    margin-bottom: 4px;
}

.notice-time {
    color: #909399;
    font-size: 12px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>
