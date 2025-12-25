<template>
    <div class="welcome-container">
        <!-- 顶部欢迎横幅 -->
        <div class="welcome-banner">
            <div class="banner-content">
                <h1 class="welcome-title">欢迎使用RBAC管理系统</h1>
                <p class="welcome-subtitle">{{ welcomeMessage }}</p>
            </div>
            <div class="banner-decoration">
                <div class="decoration-circle circle-1"></div>
                <div class="decoration-circle circle-2"></div>
                <div class="decoration-circle circle-3"></div>
            </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
            <!-- 左侧快捷操作区域 -->
            <div class="left-panel">
                <el-card class="quick-actions-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <el-icon><Operation /></el-icon>
                            <span>快捷操作</span>
                        </div>
                    </template>
                    <div class="quick-actions-grid">
                        <div class="action-item" @click="goToUserManagement">
                            <div class="action-icon user-icon">
                                <el-icon><User /></el-icon>
                            </div>
                            <div class="action-content">
                                <h3>用户管理</h3>
                                <p>管理系统用户和权限</p>
                            </div>
                        </div>
                        <div class="action-item" @click="goToRoleManagement">
                            <div class="action-icon role-icon">
                                <el-icon><Key /></el-icon>
                            </div>
                            <div class="action-content">
                                <h3>角色管理</h3>
                                <p>配置角色和权限分配</p>
                            </div>
                        </div>
                        <div class="action-item" @click="goToMenuManagement">
                            <div class="action-icon menu-icon">
                                <el-icon><Menu /></el-icon>
                            </div>
                            <div class="action-content">
                                <h3>菜单管理</h3>
                                <p>管理系统导航菜单</p>
                            </div>
                        </div>
                        <div class="action-item" @click="goToDashboard">
                            <div class="action-icon dashboard-icon">
                                <el-icon><DataAnalysis /></el-icon>
                            </div>
                            <div class="action-content">
                                <h3>系统概览</h3>
                                <p>查看系统运行状态</p>
                            </div>
                        </div>
                    </div>
                </el-card>

                <!-- 最近活动 -->
                <el-card class="recent-activity-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <el-icon><Clock /></el-icon>
                            <span>最近活动</span>
                        </div>
                    </template>
                    <div class="activity-list">
                        <div class="activity-item" v-for="(activity, index) in recentActivities" :key="index">
                            <div class="activity-icon">
                                <el-icon><CircleCheck /></el-icon>
                            </div>
                            <div class="activity-content">
                                <p>{{ activity.description }}</p>
                                <span class="activity-time">{{ activity.time }}</span>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>

            <!-- 右侧信息区域 -->
            <div class="right-panel">
                <!-- 用户信息卡片 -->
                <el-card class="user-info-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <el-icon><UserFilled /></el-icon>
                            <span>用户信息</span>
                        </div>
                    </template>
                    <div class="user-profile">
                        <div class="avatar-container">
                            <el-avatar :size="80" :src="userInfo.avatar" :alt="userInfo.name">
                                {{ userInfo.name.charAt(0) }}
                            </el-avatar>
                        </div>
                        <div class="user-details">
                            <h2>{{ userInfo.name }}</h2>
                            <p class="user-role">{{ userInfo.roleName }}</p>
                            <p class="login-time">登录时间: {{ loginTime }}</p>
                        </div>
                    </div>
                    <div class="user-stats">
                        <div class="stat-item">
                            <span class="stat-value">{{ todayAccess }}</span>
                            <span class="stat-label">今日访问</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">{{ monthOperations }}</span>
                            <span class="stat-label">本月操作</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">{{ completionRate }}%</span>
                            <span class="stat-label">完成率</span>
                        </div>
                    </div>
                </el-card>

                <!-- 系统信息卡片 -->
                <el-card class="system-info-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <el-icon><Monitor /></el-icon>
                            <span>系统信息</span>
                        </div>
                    </template>
                    <div class="system-info-list">
                        <div class="info-item">
                            <span class="info-label">系统版本</span>
                            <span class="info-value">{{ systemInfo.systemVersion }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">最后更新</span>
                            <span class="info-value">{{ systemInfo.lastUpdate }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">在线用户</span>
                            <span class="info-value">{{ systemInfo.onlineUsers }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">系统状态</span>
                            <el-tag :type="systemInfo.systemStatus === '运行正常' ? 'success' : 'danger'" size="small">
                                {{ systemInfo.systemStatus }}
                            </el-tag>
                        </div>
                    </div>
                </el-card>

                <!-- 快速统计卡片 -->
                <el-card class="stats-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <el-icon><TrendCharts /></el-icon>
                            <span>快速统计</span>
                        </div>
                    </template>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon user-stat">
                                <el-icon><User /></el-icon>
                            </div>
                            <div class="stat-data">
                                <span class="stat-number">{{ formatNumber(systemStats.totalUsers) }}</span>
                                <span class="stat-title">总用户数</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon role-stat">
                                <el-icon><Key /></el-icon>
                            </div>
                            <div class="stat-data">
                                <span class="stat-number">{{ formatNumber(systemStats.totalRoles) }}</span>
                                <span class="stat-title">角色数量</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon menu-stat">
                                <el-icon><Menu /></el-icon>
                            </div>
                            <div class="stat-data">
                                <span class="stat-number">{{ formatNumber(systemStats.totalMenus) }}</span>
                                <span class="stat-title">菜单项</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon log-stat">
                                <el-icon><Document /></el-icon>
                            </div>
                            <div class="stat-data">
                                <span class="stat-number">{{ formatNumber(systemStats.totalLogs) }}</span>
                                <span class="stat-title">操作日志</span>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRecentActions, getQuickStats } from '@/api/analysis'
import { getSystemInfo } from '@/api/system'
import {
    User, Key, Menu, DataAnalysis,
    UserFilled, Monitor, TrendCharts,
    Document, Clock, CircleCheck, Operation
} from '@element-plus/icons-vue'

const router = useRouter()
const userInfo = ref({
    name: '',
    roleName: '',
    avatar: ''
})

const loginTime = ref(new Date().toLocaleString())
const todayAccess = ref(0)
const monthOperations = ref(0)
const completionRate = ref(0)
const recentActivities = ref([])

// 添加快速统计数据
const systemStats = ref({
    totalUsers: 0,
    totalRoles: 0,
    totalMenus: 0,
    totalLogs: 0
})
// 添加系统信息数据
const systemInfo = ref({
    systemVersion: 'v2.1.0',
    lastUpdate: '2023-10-15',
    onlineUsers: 24,
    systemStatus: '运行正常'
})

// 加载系统信息
const loadSystemInfo = async () => {
    try {
        const response = await getSystemInfo()
        console.log('系统信息响应:', response) // 调试日志
        // 根据实际响应结构调整
        const data = response.data || response
        systemInfo.value = {
            systemVersion: data.systemVersion || 'v2.1.0',
            lastUpdate: data.lastUpdate || '2023-10-15',
            onlineUsers: data.onlineUsers || 0,
            systemStatus: data.systemStatus === 'RUNNING' ? '运行正常' : '系统异常'
        }
    } catch (error) {
        console.error('获取系统信息失败:', error)
        // 使用默认值
    }
}

const welcomeMessage = computed(() => {
    const hour = new Date().getHours()
    if (hour < 6) return '凌晨好！新的一天开始了！'
    if (hour < 12) return '上午好！祝您工作愉快！'
    if (hour < 14) return '中午好！记得适当休息！'
    if (hour < 18) return '下午好！继续加油！'
    return '晚上好！注意休息！'
})

const loadUserInfo = async () => {
    try {
        const storedUserInfo = localStorage.getItem('userInfo')
        if (storedUserInfo) {
            userInfo.value = JSON.parse(storedUserInfo)
        } else {
            // 如果本地没有用户信息，设置默认值
            userInfo.value = {
                name: '管理员',
                roleName: '系统管理员',
                avatar: ''
            }
        }
    } catch (error) {
        console.error('解析用户信息失败:', error)
        userInfo.value = {
            name: '管理员',
            roleName: '系统管理员',
            avatar: ''
        }
    }
}

const loadDashboardStats = async () => {
    try {
        const response = await getRecentActions()
        todayAccess.value = response.data.todayAccess || 0
        monthOperations.value = response.data.monthOperations || 0
        completionRate.value = response.data.completionRate || 0
        recentActivities.value = response.data.recentActivities || []

        // 如果最近活动为空，添加登录记录
        if (recentActivities.value.length === 0) {
            recentActivities.value.push({
                description: '登录系统',
                time: '刚刚'
            })
        }
    } catch (error) {
        console.error('获取仪表盘数据失败:', error)
        // 如果API调用失败，使用默认数据
        todayAccess.value = 1
        monthOperations.value = 0
        completionRate.value = 95
        recentActivities.value = [
            { description: '登录系统', time: '刚刚' }
        ]
    }
}

const loadSystemStats = async () => {
    try {
        const response = await getQuickStats()
        systemStats.value = response.data
        console.log('系统统计数据加载成功:', systemStats.value)
    } catch (error) {
        console.error('获取系统统计数据失败:', error)
        // 使用默认值
        systemStats.value = {
            totalUsers: 156,
            totalRoles: 12,
            totalMenus: 24,
            totalLogs: 1258
        }
    }
}

// 添加数字格式化方法
const formatNumber = (num) => {
    if (!num && num !== 0) return '0'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const goToUserManagement = () => {
    router.push('/user')
}

const goToRoleManagement = () => {
    router.push('/role')
}

const goToMenuManagement = () => {
    router.push('/menu')
}

const goToDashboard = () => {
    router.push('/monitor')
}

onMounted(async () => {
    await loadUserInfo()
    await loadDashboardStats()
    await loadSystemStats()
    await loadSystemInfo()
})
</script>

<style scoped>
.welcome-container {
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
    min-height: 100vh;
}

.welcome-banner {
    position: relative;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 30px 40px;
    margin-bottom: 24px;
    color: white;
    overflow: hidden;
}

.banner-content {
    position: relative;
    z-index: 2;
}

.welcome-title {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 10px 0;
}

.welcome-subtitle {
    font-size: 16px;
    margin: 0;
    opacity: 0.9;
}

.banner-decoration {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.decoration-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
}

.circle-1 {
    width: 120px;
    height: 120px;
    top: -40px;
    right: -40px;
}

.circle-2 {
    width: 80px;
    height: 80px;
    top: 20px;
    right: 100px;
}

.circle-3 {
    width: 60px;
    height: 60px;
    bottom: -20px;
    right: 200px;
}

.main-content {
    display: flex;
    gap: 24px;
}

.left-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.right-panel {
    width: 360px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}

/* 卡片通用样式 */
:deep(.el-card) {
    border-radius: 12px;
    border: none;
}

:deep(.el-card__header) {
    padding: 16px 20px;
    border-bottom: 1px solid #f0f0f0;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
}

.card-header .el-icon {
    font-size: 18px;
    color: #409eff;
}

:deep(.el-card__body) {
    padding: 20px;
}

/* 快捷操作样式 */
.quick-actions-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.action-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border-radius: 8px;
    background-color: #f8f9fa;
    cursor: pointer;
    transition: all 0.3s ease;
}

.action-item:hover {
    background-color: #e9f5ff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.action-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 8px;
    margin-right: 16px;
    font-size: 20px;
    color: white;
}

.user-icon {
    background: linear-gradient(135deg, #36d1dc, #5b86e5);
}

.role-icon {
    background: linear-gradient(135deg, #ff9a9e, #fad0c4);
}

.menu-icon {
    background: linear-gradient(135deg, #a1c4fd, #c2e9fb);
}

.dashboard-icon {
    background: linear-gradient(135deg, #ffecd2, #fcb69f);
}

.action-content h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
}

.action-content p {
    margin: 0;
    font-size: 12px;
    color: #909399;
}

/* 最近活动样式 */
.activity-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.activity-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.activity-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #f0f9ff;
    color: #409eff;
    flex-shrink: 0;
    margin-top: 2px;
}

.activity-content p {
    margin: 0 0 4px 0;
    font-size: 14px;
}

.activity-time {
    font-size: 12px;
    color: #909399;
}

/* 用户信息样式 */
.user-profile {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.avatar-container {
    margin-right: 16px;
}

.user-details h2 {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 600;
}

.user-role {
    margin: 0 0 8px 0;
    color: #409eff;
    font-weight: 500;
}

.login-time {
    margin: 0;
    font-size: 12px;
    color: #909399;
}

.user-stats {
    display: flex;
    justify-content: space-around;
    border-top: 1px solid #f0f0f0;
    padding-top: 16px;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-value {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
}

.stat-label {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
}

/* 系统信息样式 */
.system-info-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.info-label {
    color: #606266;
}

.info-value {
    font-weight: 500;
}

/* 统计卡片样式 */
.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.stat-card {
    display: flex;
    align-items: center;
    padding: 16px;
    border-radius: 8px;
    background-color: #f8f9fa;
}

.stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    margin-right: 12px;
    font-size: 18px;
    color: white;
}

.user-stat {
    background: linear-gradient(135deg, #36d1dc, #5b86e5);
}

.role-stat {
    background: linear-gradient(135deg, #ff9a9e, #fad0c4);
}

.menu-stat {
    background: linear-gradient(135deg, #a1c4fd, #c2e9fb);
}

.log-stat {
    background: linear-gradient(135deg, #ffecd2, #fcb69f);
}

.stat-data {
    display: flex;
    flex-direction: column;
}

.stat-number {
    font-size: 18px;
    font-weight: 700;
    color: #303133;
}

.stat-title {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .main-content {
        flex-direction: column;
    }

    .right-panel {
        width: 100%;
    }

    .quick-actions-grid {
        grid-template-columns: 1fr;
    }
}
</style>
