<template>
  <el-card class="profile-settings-card">
    <template #header>
      <div class="card-header">
        <span>Profile Settings</span>
      </div>
    </template>

  <el-upload
    class="avatar-uploader"
    action="#"
    :limit="1"
    :file-list="fileList"
    list-type="picture-card"
    :before-upload="beforeUpload"
    :on-exceed="handleExceed"
    :on-remove="handleRemove"
    :on-preview="handlePreview"
    :auto-upload="false"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>

  <el-dialog v-model="dialogVisible">
    <img style="width: 100%" :src="dialogImageUrl" alt="Avatar preview" />
  </el-dialog>

        <el-form :model="form" label-position="top" class="profile-form">
          <el-form-item label="Name">
            <el-input
              v-model="form.name"
              placeholder="Enter your name"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="Bio / Status">
            <el-input
              v-model="form.bio"
              type="textarea"
              :rows="4"
              placeholder="Write something about yourself..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitForm">Save Changes</el-button>
          </el-form-item>
        </el-form>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const fileList = ref([])
const dialogVisible = ref(false)
const dialogImageUrl = ref('')

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('Only image files are allowed.')
    return false
  }

  if (!isLt2M) {
    ElMessage.error('Image must be smaller than 2MB.')
    return false
  }

  fileList.value = [{
    name: file.name,
    url: URL.createObjectURL(file),
    raw: file
  }]

  return false
}

const handleExceed = (files) => {
  ElMessage.warning('Replacing previous image...')
  fileList.value = []
  setTimeout(() => {
    beforeUpload(files[0])
  }, 100)
}

const handleRemove = (file, files) => {
  fileList.value = files
}

const handlePreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

const formRef = ref(null)
const form = ref({
  name: '',
  bio: ''
})

const submitForm = () => {
  const payload = {}

  const nameTrimmed = form.value.name.trim()
  const bioTrimmed = form.value.bio.trim()

  if (nameTrimmed) {
    if (nameTrimmed.length > 50) {
      ElMessage.error('Name cannot exceed 50 characters.')
      return
    }
    payload.name = nameTrimmed
  }

  if (bioTrimmed) {
    if (bioTrimmed.length > 200) {
      ElMessage.error('Bio cannot exceed 200 characters.')
      return
    }
    payload.bio = bioTrimmed
  }

  if (Object.keys(payload).length === 0) {
    ElMessage.info('Nothing to update.')
    return
  }

  // Simulate API call
  console.log('Submitting payload:', payload)
  ElMessage.success('Profile updated!')
}
</script>

<style scoped>

</style>

