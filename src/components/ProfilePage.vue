<template>
    <div class="profile-page">
        <div class="page-header">
            <h1>个人中心</h1>
            <p>管理您的个人信息和账户设置</p>
        </div>

        <div class="profile-content">
            <!-- 基本信息卡片 -->
            <el-card class="info-card">
                <template #header>
                    <div class="card-header">
                        <span>基本信息</span>
                    </div>
                </template>

                <div class="user-info">
                    <div class="avatar-section">
                        <el-avatar :size="80" :src="userInfo.avatar">
                            {{ userInfo.nickname?.charAt(0) || 'U' }}
                        </el-avatar>
                        <div class="user-details">
                            <h3>{{ userInfo.nickname || userInfo.username }}</h3>
                            <p>{{ userInfo.position }} - {{ userInfo.department }}</p>
                        </div>
                    </div>

                    <el-divider />

                    <div class="info-grid">
                        <div class="info-item">
                            <label>用户名:</label>
                            <span>{{ userInfo.username }}</span>
                        </div>
                        <div class="info-item">
                            <label>邮箱:</label>
                            <span>{{ userInfo.email || '未设置' }}</span>
                        </div>
                        <div class="info-item">
                            <label>手机号:</label>
                            <span>{{ userInfo.phone || '未设置' }}</span>
                        </div>
                        <div class="info-item">
                            <label>用户ID:</label>
                            <span>{{ userInfo.id }}</span>
                        </div>
                    </div>
                </div>
            </el-card>

            <!-- 编辑资料表单 -->
            <el-card class="form-card">
                <template #header>
                    <div class="card-header">
                        <span>编辑资料</span>
                    </div>
                </template>

                <el-form :model="profileForm" label-width="80px">
                    <el-form-item label="昵称">
                        <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
                    </el-form-item>

                    <el-form-item label="邮箱">
                        <el-input v-model="profileForm.email" placeholder="请输入邮箱" type="email" />
                    </el-form-item>

                    <el-form-item label="手机号">
                        <el-input v-model="profileForm.phone" placeholder="请输入手机号" />
                    </el-form-item>

                    <el-form-item label="部门">
                        <el-input v-model="profileForm.department" placeholder="请输入部门" />
                    </el-form-item>

                    <el-form-item label="职位">
                        <el-input v-model="profileForm.position" placeholder="请输入职位" />
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="updateProfile">保存更改</el-button>
                        <el-button @click="resetForm">重置</el-button>
                    </el-form-item>
                </el-form>
            </el-card>

            <!-- 修改密码 -->
            <el-card class="form-card">
                <template #header>
                    <div class="card-header">
                        <span>修改密码</span>
                    </div>
                </template>

                <el-form :model="passwordForm" label-width="100px">
                    <el-form-item label="当前密码">
                        <el-input v-model="passwordForm.oldPassword" type="password" show-password />
                    </el-form-item>

                    <el-form-item label="新密码">
                        <el-input v-model="passwordForm.newPassword" type="password" show-password />
                    </el-form-item>

                    <el-form-item label="确认密码">
                        <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" @click="changePassword">修改密码</el-button>
                    </el-form-item>
                </el-form>
            </el-card>
        </div>
    </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

export default {
    name: 'ProfilePage',

    setup() {
        // 用户信息
        const userInfo = ref({
            id: 1,
            username: 'admin',
            nickname: '系统管理员',
            email: 'admin@example.com',
            phone: '13800138000',
            department: '技术部',
            position: '系统管理员',
            avatar: ''
        })

        // 表单数据
        const profileForm = reactive({
            nickname: '',
            email: '',
            phone: '',
            department: '',
            position: ''
        })

        const passwordForm = reactive({
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        })

        // 初始化数据
        const initData = () => {
            profileForm.nickname = userInfo.value.nickname
            profileForm.email = userInfo.value.email
            profileForm.phone = userInfo.value.phone
            profileForm.department = userInfo.value.department
            profileForm.position = userInfo.value.position
        }

        // 更新资料
        const updateProfile = () => {
            // 更新用户信息
            userInfo.value.nickname = profileForm.nickname
            userInfo.value.email = profileForm.email
            userInfo.value.phone = profileForm.phone
            userInfo.value.department = profileForm.department
            userInfo.value.position = profileForm.position

            ElMessage.success('资料更新成功')
        }

        // 修改密码
        const changePassword = () => {
            if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                ElMessage.error('两次输入的密码不一致')
                return
            }

            if (passwordForm.newPassword.length < 6) {
                ElMessage.error('密码长度不能少于6位')
                return
            }

            // 模拟密码修改
            ElMessage.success('密码修改成功')

            // 清空密码表单
            passwordForm.oldPassword = ''
            passwordForm.newPassword = ''
            passwordForm.confirmPassword = ''
        }

        // 重置表单
        const resetForm = () => {
            initData()
        }

        // 生命周期
        onMounted(() => {
            initData()
        })

        return {
            userInfo,
            profileForm,
            passwordForm,
            updateProfile,
            changePassword,
            resetForm
        }
    }
}
</script>

<style scoped>
.profile-page {
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

.profile-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.info-card,
.form-card {
    border-radius: 8px;
}

.card-header {
    font-weight: 600;
    color: #303133;
}

.user-info {
    padding: 0 10px;
}

.avatar-section {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
}

.user-details h3 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 18px;
}

.user-details p {
    margin: 0;
    color: #909399;
    font-size: 14px;
}

.info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-item label {
    color: #909399;
    font-size: 14px;
}

.info-item span {
    color: #303133;
    font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .profile-page {
        padding: 12px;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .avatar-section {
        flex-direction: column;
        text-align: center;
    }
}
</style>
