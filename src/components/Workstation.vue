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
                            <div style="display: flex; gap: 8px; align-items: center;">
                <span v-if="todos.length > 0" style="font-size: 12px; color: #909399;">
                    共 {{ todos.length }} 项
                </span>
                                <el-button type="primary" text @click="addTodo">
                                    <el-icon><Plus /></el-icon>
                                    新增
                                </el-button>
                            </div>
                        </div>
                    </template>

                    <div v-loading="loadingTodos" class="todo-list">
                        <div v-if="todos.length === 0" class="empty-todo">
                            <el-empty description="暂无待办事项" :image-size="100">
                                <el-button type="primary" @click="addTodo">创建待办</el-button>
                            </el-empty>
                        </div>

                        <div v-for="(todo, index) in todos" :key="todo.id" class="todo-item">
                            <div class="todo-content">
                                <el-checkbox v-model="todo.completed" @change="updateTodo(todo)">
                                    <span :class="{ 'completed': todo.completed }">{{ todo.title }}</span>
                                </el-checkbox>
                                <div v-if="todo.description" class="todo-description">
                                    {{ todo.description }}
                                </div>
                            </div>
                            <div class="todo-actions">
                                <div class="todo-meta">
                                    <span class="todo-time">{{ todo.time }}</span>
                                    <el-tag size="small" :type="todo.priorityType">{{ todo.priority }}</el-tag>
                                </div>
                                <el-button
                                        size="small"
                                        type="text"
                                        @click="deleteTodo(todo.id, index)"
                                        style="margin-left: 8px;"
                                >
                                    删除
                                </el-button>
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
                        <el-icon><component :is="getIconComponent(notice.icon)" /></el-icon>
                    </div>
                    <div class="notice-content" @click="viewNotification(notice)">
                        <div class="notice-title">
                            {{ notice.title }}
                            <el-tag v-if="!notice.read" size="small" type="danger" style="margin-left: 8px;">未读</el-tag>
                        </div>
                        <div class="notice-desc">{{ notice.description }}</div>
                        <div class="notice-time">{{ formatTimeAgo(notice.createTime) }}</div>
                    </div>
                    <el-button v-if="!notice.read" type="primary" link @click="markAsRead(notice.id)">
                        标记已读
                    </el-button>
                    <el-button v-if="notice.read" type="text" disabled style="color: #909399;">
                        已读
                    </el-button>
                </div>

                <div v-if="notifications.length === 0" class="empty-notification">
                    <el-empty description="暂无系统通知" :image-size="80" />
                </div>
            </div>
        </el-card>

        <!-- 新增系统通知对话框 -->
        <el-dialog
                v-model="notificationDialogVisible"
                :title="currentNotification.title"
                width="600px"
                @closed="notificationDialogVisible = false"
        >
            <div class="notification-detail">
                <div class="detail-header">
                    <div class="detail-type">
                        <el-tag :type="currentNotification.type || 'info'">
                            {{ getNotificationTypeText(currentNotification.type) }}
                        </el-tag>
                        <span class="detail-time">{{ formatTimeAgo(currentNotification.createTime) }}</span>
                    </div>
                    <div v-if="!currentNotification.read" class="detail-status">
                        <el-tag type="danger">未读</el-tag>
                    </div>
                </div>

                <div class="detail-content">
                    <h4>通知内容：</h4>
                    <div class="content-text">{{ currentNotification.content }}</div>
                </div>

                <div v-if="currentNotification.extraData" class="detail-extra">
                    <h4>附加信息：</h4>
                    <pre class="extra-json">{{ JSON.stringify(currentNotification.extraData, null, 2) }}</pre>
                </div>
            </div>

            <template #footer>
        <span class="dialog-footer">
            <el-button v-if="!currentNotification.read" type="primary" @click="markAsRead(currentNotification.id)">
                标记已读并关闭
            </el-button>
            <el-button @click="notificationDialogVisible = false">
                {{ currentNotification.read ? '关闭' : '稍后处理' }}
            </el-button>
        </span>
            </template>
        </el-dialog>
        <!-- 新增待办对话框 -->
        <el-dialog
                v-model="addDialogVisible"
                title="新增待办事项"
                width="500px"
                @closed="addDialogVisible = false"
        >
            <el-form :model="todoForm" :rules="todoRules" label-width="80px">
                <el-form-item label="标题" prop="title">
                    <el-input
                            v-model="todoForm.title"
                            placeholder="请输入待办事项标题"
                            maxlength="50"
                            show-word-limit
                    />
                </el-form-item>

                <el-form-item label="优先级" prop="priority">
                    <el-radio-group v-model="todoForm.priority">
                        <el-radio label="HIGH">
                            <el-tag type="danger">高</el-tag>
                        </el-radio>
                        <el-radio label="MEDIUM">
                            <el-tag type="warning">中</el-tag>
                        </el-radio>
                        <el-radio label="LOW">
                            <el-tag type="success">低</el-tag>
                        </el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item label="截止时间">
                    <el-date-picker
                            v-model="todoForm.dueTime"
                            type="datetime"
                            placeholder="选择截止时间（可选）"
                            format="YYYY-MM-DD HH:mm"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            :default-time="new Date(2000, 1, 1, 23, 59, 0)"
                            style="width: 100%;"
                            @change="handleDueTimeChange"
                    />
                </el-form-item>

                <!-- 新增：提醒时间 -->
                <el-form-item label="提醒时间">
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        <!-- 方案1：直接选择提醒时间 -->
                        <el-date-picker
                                v-model="todoForm.remindTime"
                                type="datetime"
                                placeholder="选择提醒时间（可选）"
                                format="YYYY-MM-DD HH:mm"
                                value-format="YYYY-MM-DD HH:mm:ss"
                                style="width: 100%;"
                                :disabled="!todoForm.dueTime"
                                :disabled-date="disabledRemindDate"
                        />

                        <!-- 方案2：快捷选择按钮（推荐） -->
                        <div v-if="todoForm.dueTime" style="display: flex; flex-wrap: wrap; gap: 8px;">
                            <el-button
                                    size="small"
                                    @click="setReminder('15_MINUTES')"
                                    :type="todoForm.reminderType === '15_MINUTES' ? 'primary' : ''"
                            >
                                提前15分钟
                            </el-button>
                            <el-button
                                    size="small"
                                    @click="setReminder('30_MINUTES')"
                                    :type="todoForm.reminderType === '30_MINUTES' ? 'primary' : ''"
                            >
                                提前30分钟
                            </el-button>
                            <el-button
                                    size="small"
                                    @click="setReminder('1_HOUR')"
                                    :type="todoForm.reminderType === '1_HOUR' ? 'primary' : ''"
                            >
                                提前1小时
                            </el-button>
                            <el-button
                                    size="small"
                                    @click="setReminder('1_DAY')"
                                    :type="todoForm.reminderType === '1_DAY' ? 'primary' : ''"
                            >
                                提前1天
                            </el-button>
                            <el-button
                                    size="small"
                                    @click="setReminder('CUSTOM')"
                                    :type="todoForm.reminderType === 'CUSTOM' ? 'primary' : ''"
                            >
                                自定义
                            </el-button>
                            <el-button
                                    size="small"
                                    @click="clearReminder"
                                    :type="!todoForm.reminderType ? 'primary' : ''"
                            >
                                不提醒
                            </el-button>
                        </div>

                        <!-- 显示提醒时间信息 -->
                        <div v-if="todoForm.remindTime" style="color: #909399; font-size: 12px;">
                            将在 {{ formatRemindTimeInfo() }} 提醒
                        </div>
                    </div>
                </el-form-item>

                <el-form-item label="描述">
                    <el-input
                            v-model="todoForm.description"
                            type="textarea"
                            placeholder="请输入详细描述（可选）"
                            :rows="3"
                            maxlength="200"
                            show-word-limit
                    />
                </el-form-item>

                <el-form-item label="分类">
                    <el-select v-model="todoForm.category" placeholder="请选择分类" style="width: 100%;">
                        <el-option label="工作" value="工作" />
                        <el-option label="学习" value="学习" />
                        <el-option label="生活" value="生活" />
                        <el-option label="会议" value="会议" />
                        <el-option label="其他" value="其他" />
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
        <span class="dialog-footer">
            <el-button @click="addDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitTodo">确定</el-button>
        </span>
            </template>
        </el-dialog>
    </div>

</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    User,
    Setting,
    ShoppingCart,
    TrendCharts,
    Document,
    Warning,
    Plus,
    Bell,
    Message,
    Check,
    CircleCheck,
    InfoFilled,
    Clock
} from '@element-plus/icons-vue'
import { getTodayTodos, deleteTodoById, updateTodoStatus, createTodo } from '@/api/todo'
import { getRecentAccess } from '@/api/recent'
import {
    getNotifications,
    getDashboardNotifications,
    markNotificationAsRead,
    getUnreadCount,
    getNotificationDetail
} from '@/api/notification'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const router = useRouter()
// 动态导入所有图标
const icons = ElementPlusIconsVue
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

// 待办事项（从接口获取）
const todos = ref([])
const loadingTodos = ref(false)

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

// 新增待办对话框相关
const addDialogVisible = ref(false)
const todoForm = reactive({
    title: '',
    priority: 'MEDIUM',
    dueTime: '',
    remindTime: '',
    reminderType: '',
    description: '',
    category: '工作'
})
// 监听截止时间变化
const handleDueTimeChange = (value) => {
    if (value && todoForm.remindTime) {
        // 如果已有提醒时间，检查是否在截止时间之后
        const remindDate = new Date(todoForm.remindTime)
        const dueDate = new Date(value)
        if (remindDate > dueDate) {
            // 提醒时间不能晚于截止时间
            todoForm.remindTime = ''
            todoForm.reminderType = ''
        }
    }
}

// 设置提醒
const setReminder = (type) => {
    if (!todoForm.dueTime) {
        ElMessage.warning('请先设置截止时间')
        return
    }

    const dueDate = new Date(todoForm.dueTime)
    let remindDate = new Date()

    switch (type) {
        case '15_MINUTES':
            remindDate = new Date(dueDate.getTime() - 15 * 60 * 1000)
            break
        case '30_MINUTES':
            remindDate = new Date(dueDate.getTime() - 30 * 60 * 1000)
            break
        case '1_HOUR':
            remindDate = new Date(dueDate.getTime() - 60 * 60 * 1000)
            break
        case '1_DAY':
            remindDate = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000)
            break
        case 'CUSTOM':
            // 自定义模式，不自动设置时间
            todoForm.reminderType = 'CUSTOM'
            return
    }

    // 格式化时间为字符串
    const year = remindDate.getFullYear()
    const month = String(remindDate.getMonth() + 1).padStart(2, '0')
    const day = String(remindDate.getDate()).padStart(2, '0')
    const hours = String(remindDate.getHours()).padStart(2, '0')
    const minutes = String(remindDate.getMinutes()).padStart(2, '0')

    todoForm.remindTime = `${year}-${month}-${day} ${hours}:${minutes}:00`
    todoForm.reminderType = type
}

// 清除提醒
const clearReminder = () => {
    todoForm.remindTime = ''
    todoForm.reminderType = ''
}

// 格式化提醒时间信息
const formatRemindTimeInfo = () => {
    if (!todoForm.remindTime || !todoForm.dueTime) return ''

    const remindDate = new Date(todoForm.remindTime)
    const dueDate = new Date(todoForm.dueTime)
    const timeDiff = dueDate.getTime() - remindDate.getTime()

    if (timeDiff < 0) return '提醒时间晚于截止时间'

    const minutes = Math.floor(timeDiff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `提前${days}天`
    if (hours > 0) return `提前${hours}小时`
    if (minutes > 0) return `提前${minutes}分钟`
    return '截止时提醒'
}

// 禁用提醒日期（不能晚于截止时间）
const disabledRemindDate = (time) => {
    if (!todoForm.dueTime) return false

    const remindDate = new Date(time)
    const dueDate = new Date(todoForm.dueTime)
    return remindDate.getTime() > dueDate.getTime()
}

// 新增待办表单验证规则
const todoRules = {
    title: [
        { required: true, message: '请输入待办标题', trigger: 'blur' },
        { min: 2, max: 50, message: '标题长度为2-50个字符', trigger: 'blur' }
    ],
    priority: [
        { required: true, message: '请选择优先级', trigger: 'change' }
    ]
}

// 加载待办数据
const loadTodos = async () => {
    loadingTodos.value = true
    try {
        const response = await getTodayTodos()
        todos.value = response.data.map(todo => ({
            id: todo.id,
            title: todo.title,
            completed: todo.completed,
            time: todo.timeLabel,
            priority: todo.priorityLabel,
            priorityType: getPriorityType(todo.priority),
            description: todo.description
        }))
    } catch (error) {
        console.error('加载待办事项失败:', error)
        ElMessage.error('加载待办事项失败')
    } finally {
        loadingTodos.value = false
    }
}

// 获取优先级对应的颜色类型
const getPriorityType = (priority) => {
    switch (priority) {
        case 'HIGH': return 'danger'
        case 'MEDIUM': return 'warning'
        case 'LOW': return 'success'
        default: return 'info'
    }
}

// 新增待办
const addTodo = () => {
    addDialogVisible.value = true
    Object.assign(todoForm, {
        title: '',
        priority: 'MEDIUM',
        dueTime: '',
        description: ''
    })
}

// 提交新增待办
const submitTodo = async () => {
    try {
        // 构建待办数据
        const todoData = {
            title: todoForm.title.trim(),
            priority: todoForm.priority,
            description: todoForm.description.trim() || '',
            category: todoForm.category,
            type: 'PERSONAL'  // 默认为个人待办
        }

        // 处理截止时间
        if (todoForm.dueTime) {
            todoData.dueTime = todoForm.dueTime
        }

        // 处理提醒时间
        if (todoForm.remindTime) {
            todoData.remindTime = todoForm.remindTime
        }

        console.log('提交的待办数据:', todoData)

        // 调用API
        await createTodo(todoData)
        ElMessage.success('待办事项创建成功')

        // 重置表单
        resetTodoForm()
        addDialogVisible.value = false

        // 重新加载待办列表
        await loadTodos()
    } catch (error) {
        console.error('创建待办失败:', error)
        ElMessage.error('创建失败: ' + (error.response?.data?.message || error.message))
    }
}

// 重置表单
const resetTodoForm = () => {
    Object.assign(todoForm, {
        title: '',
        priority: 'MEDIUM',
        dueTime: '',
        remindTime: '',
        reminderType: '',
        description: '',
        category: '工作'
    })
}

// 删除待办
const deleteTodo = async (todoId, index) => {
    try {
        await ElMessageBox.confirm('确定要删除这个待办事项吗？', '提示', {
            type: 'warning',
            confirmButtonText: '确定',
            cancelButtonText: '取消'
        });

        // 调用删除接口
        await deleteTodoById(todoId);

        // 从列表中移除
        todos.value.splice(index, 1);
        ElMessage.success('删除成功');
    } catch (error) {
        // 用户取消删除或删除失败
        if (error && error !== 'cancel') {
            console.error('删除待办失败:', error);
            ElMessage.error('删除失败: ' + (error.response?.data?.message || error.message));
        }
    }
};

// 最近访问记录
const recentAccess = ref([])
const loadingRecent = ref(false)

// 加载最近访问记录
const loadRecentAccess = async () => {
    loadingRecent.value = true
    try {
        const response = await getRecentAccess()
        if (response.data && response.data.code === 200) {
            const data = response.data.data
            // 转换数据格式，确保有图标组件
            recentAccess.value = data.map(item => {
                // 获取图标组件，如果找不到则使用默认图标
                const iconComponent = icons[item.menuIcon] || Document

                return {
                    id: item.id,
                    title: item.menuName,
                    path: item.menuPath,
                    icon: iconComponent,
                    time: item.displayTime || '未知时间',
                    rawTime: item.accessTime,
                    visitCount: item.visitCount || 1
                }
            })
        }
    } catch (error) {
        console.error('加载最近访问记录失败:', error)
        ElMessage.error('加载最近访问记录失败')
        // 如果API失败，使用默认数据
        recentAccess.value = getDefaultRecentAccess()
    } finally {
        loadingRecent.value = false
    }
}

// 默认的最近访问数据
const getDefaultRecentAccess = () => {
    return [
        {
            id: 1,
            title: '用户管理',
            path: '/user',
            icon: User,
            time: '10分钟前',
            rawTime: new Date().toISOString(),
            visitCount: 1
        },
        {
            id: 2,
            title: '订单处理',
            path: '/order',
            icon: ShoppingCart,
            time: '30分钟前',
            rawTime: new Date().toISOString(),
            visitCount: 1
        },
        {
            id: 3,
            title: '系统分析',
            path: '/analysis',
            icon: TrendCharts,
            time: '1小时前',
            rawTime: new Date().toISOString(),
            visitCount: 1
        }
    ]
}

const notificationDialogVisible = ref(false)
const currentNotification = ref({})
const loadingNotifications = ref(false)
const notificationPage = reactive({
    pageNum: 1,
    pageSize: 10,
    total: 0
})

// 加载通知数据
const loadNotifications = async () => {
    loadingNotifications.value = true
    try {
        const params = {
            pageNum: notificationPage.pageNum,
            pageSize: 5, // 工作台只显示5条
            status: 'ALL'
        }
        const response = await getDashboardNotifications(params)
        if (response.data && response.data.code === 200) {
            const data = response.data.data
            notifications.value = data.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description || item.content,
                content: item.content,
                type: item.type?.toLowerCase() || 'info',
                icon: item.icon || 'Bell',
                read: item.status === 'READ',
                createTime: item.createTime,
                extraData: item.extraData
            }))
        }
    } catch (error) {
        console.error('加载通知失败:', error)
        ElMessage.error('加载通知失败')
        // 使用模拟数据
        notifications.value = getMockNotifications()
    } finally {
        loadingNotifications.value = false
    }
}

// 加载未读数量
const loadUnreadCount = async () => {
    try {
        const response = await getUnreadCount()
        if (response.data && response.data.code === 200) {
            notificationPage.total = response.data.data
        }
    } catch (error) {
        console.error('加载未读数量失败:', error)
    }
}

// 获取图标组件
const getIconComponent = (iconName) => {
    const iconMap = {
        'bell': Bell,
        'message': Message,
        'warning': Warning,
        'check': Check,
        'success': CircleCheck,
        'info': InfoFilled,
        'clock': Clock,
        'user': User,
        'shopping': ShoppingCart
    }
    return iconMap[iconName?.toLowerCase()] || Bell
}

// 格式化时间（多久前）
const formatTimeAgo = (time) => {
    if (!time) return '未知时间'

    const now = new Date()
    const date = new Date(time)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    if (diffHours < 24) return `${diffHours}小时前`
    if (diffDays < 7) return `${diffDays}天前`

    // 超过7天显示具体日期
    return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// 查看通知详情
const viewNotification = async (notice) => {
    try {
        const response = await getNotificationDetail(notice.id)
        if (response.data && response.data.code === 200) {
            currentNotification.value = response.data.data
            notificationDialogVisible.value = true
        }
    } catch (error) {
        console.error('获取通知详情失败:', error)
        currentNotification.value = notice
        notificationDialogVisible.value = true
    }
}

// 标记为已读
const markAsRead = async (noticeId) => {
    try {
        await markNotificationAsRead(noticeId)

        // 更新本地状态
        const notice = notifications.value.find(n => n.id === noticeId)
        if (notice) {
            notice.read = true
        }

        if (currentNotification.value.id === noticeId) {
            currentNotification.value.read = true
        }

        // 更新未读数量
        await loadUnreadCount()

        ElMessage.success('标记为已读')
    } catch (error) {
        console.error('标记已读失败:', error)
        ElMessage.error('标记失败')
    }
}

// 查看全部通知
const viewAllNotifications = () => {
    router.push('/notification/list')
}

// 获取通知类型文本
const getNotificationTypeText = (type) => {
    const typeMap = {
        'info': '信息',
        'warning': '警告',
        'error': '错误',
        'success': '成功',
        'system': '系统',
        'user': '用户',
        'order': '订单'
    }
    return typeMap[type] || '通知'
}

// 模拟通知数据（备用）
const getMockNotifications = () => {
    return [
        {
            id: 1,
            title: '新用户注册',
            description: '用户"张三"完成了注册，请及时审核',
            content: '用户"张三"（手机号：13800138000）已完成注册，需要管理员审核后才能使用系统功能。',
            type: 'info',
            icon: 'user',
            read: false,
            createTime: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
            extraData: { userId: 123, username: '张三', phone: '13800138000' }
        },
        {
            id: 2,
            title: '订单待处理',
            description: '有3个新订单等待处理',
            content: '当前有3个新订单需要处理，请及时查看和处理。',
            type: 'warning',
            icon: 'shopping',
            read: false,
            createTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            extraData: { orderCount: 3, orderIds: [1001, 1002, 1003] }
        },
        {
            id: 3,
            title: '系统更新完成',
            description: '系统已更新至最新版本 v1.2.0',
            content: '系统已成功更新至 v1.2.0 版本，新增了待办事项提醒功能。',
            type: 'success',
            icon: 'check',
            read: true,
            createTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            extraData: { version: '1.2.0', updateTime: new Date().toISOString() }
        }
    ]
}

// unreadCount 计算属性
const unreadCount = computed(() => {
    return notificationPage.total > 99 ? '99+' : notificationPage.total
})

// 系统通知
const notifications = ref([])
//     {
//         id: 1,
//         title: '新用户注册',
//         description: '用户 "张三" 完成了注册，请及时审核',
//         type: 'info',
//         icon: User,
//         time: '5分钟前',
//         read: false
//     },
//     {
//         id: 2,
//         title: '订单待处理',
//         description: '有3个新订单等待处理',
//         type: 'warning',
//         icon: ShoppingCart,
//         time: '10分钟前',
//         read: false
//     },
//     {
//         id: 3,
//         title: '系统更新',
//         description: '系统已更新至最新版本 v1.2.0',
//         type: 'success',
//         icon: Check,
//         time: '1小时前',
//         read: true
//     }
// ])



const handleAction = (action) => {
    router.push(action.path)
}

// 更新待办状态
const updateTodo = async (todo) => {
    try {
        await updateTodoStatus(todo.id, todo.completed)
        ElMessage.success(`任务 "${todo.title}" ${todo.completed ? '已完成' : '标记为未完成'}`)

        // 如果是完成状态，3秒后从列表中移除
        if (todo.completed) {
            setTimeout(() => {
                todos.value = todos.value.filter(t => t.id !== todo.id)
            }, 3000)
        }
    } catch (error) {
        console.error('更新待办状态失败:', error)
        ElMessage.error('更新失败')
        // 恢复原状态
        todo.completed = !todo.completed
    }
}

const gotoPage = (item) => {
    router.push(item.path)
}


// const markAsRead = (notice) => {
//     notice.read = true
//     ElMessage.success('标记为已读')
// }

onMounted(async () => {
    // loadTodos()
    await Promise.all([
        loadTodos(),
        loadRecentAccess(),
        loadNotifications(),
        loadUnreadCount()
    ])

    // 设置定时刷新最近访问记录（每分钟刷新一次）
    refreshTimer = setInterval(() => {
        loadRecentAccess()
    }, 60000)

    // 设置定时刷新通知（每5分钟刷新一次）
    notificationTimer = setInterval(() => {
        loadNotifications()
        loadUnreadCount()
    }, 300000)
})

// 清理定时器
let refreshTimer = null
let notificationTimer = null
onUnmounted(() => {
    if (refreshTimer) {
        clearInterval(refreshTimer)
    }
    if (notificationTimer) {
        clearInterval(notificationTimer)
    }
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

/* 在 Workstation.vue 的 style 部分添加 */
.todo-content {
    flex: 1;
    min-width: 0;
}

.todo-description {
    color: #909399;
    font-size: 12px;
    margin-top: 4px;
    line-height: 1.4;
    max-height: 36px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.todo-actions {
    display: flex;
    align-items: center;
    gap: 8px;
}

.empty-todo {
    padding: 40px 0;
    text-align: center;
}

.completed {
    text-decoration: line-through;
    color: #909399 !important;
}

/* 待办项悬停效果 */
.todo-item:hover {
    background-color: #fafafa;
    border-radius: 4px;
    margin: 0 -16px;
    padding: 12px 16px;
}

/* 在样式部分添加以下代码 */
.notification-item {
    cursor: pointer;
    transition: all 0.3s;
}

.notification-item:hover {
    background-color: #fafafa;
    border-radius: 4px;
    margin: 0 -16px;
    padding: 12px 16px;
}

.notice-content {
    flex: 1;
    cursor: pointer;
}

.empty-notification {
    padding: 40px 0;
    text-align: center;
}

/* 通知详情样式 */
.notification-detail {
    padding: 0 10px;
}

.detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #f0f0f0;
}

.detail-type {
    display: flex;
    align-items: center;
    gap: 10px;
}

.detail-time {
    color: #909399;
    font-size: 14px;
}

.detail-status {
    margin-left: 10px;
}

.detail-content {
    margin-bottom: 20px;
}

.detail-content h4 {
    margin: 0 0 10px 0;
    color: #303133;
    font-size: 16px;
}

.content-text {
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 4px;
    line-height: 1.6;
    color: #606266;
}

.detail-extra {
    margin-top: 20px;
}

.detail-extra h4 {
    margin: 0 0 10px 0;
    color: #303133;
    font-size: 16px;
}

.extra-json {
    padding: 12px;
    background-color: #f5f7fa;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    line-height: 1.5;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
}
</style>
