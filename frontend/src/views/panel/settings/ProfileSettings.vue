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
  :http-request="handleUpload"
  :on-exceed="handleExceed"
  :on-remove="handleRemove"
  :on-preview="handlePreview"
  :auto-upload="true"
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
import axios from 'axios'
import { useAuth } from '../../../composables/useAuth';
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const fileList = ref([])
const dialogVisible = ref(false)
const dialogImageUrl = ref('')
const form = ref({ name: '', bio: '' })
const avatarFile = ref(null)
const {updateProfile} = useAuth();


const handleUpload = (uploadRequest) => {
  const file = uploadRequest.file; 
 

  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('Only image files are allowed.');
    return;
  }

  if (!isLt2M) {
    ElMessage.error('Image must be smaller than 2MB.');
    return;
  }

  fileList.value = [{
    name: file.name,
    url: URL.createObjectURL(file),
    raw: file
  }];

  avatarFile.value = file;
};


const handleExceed = (files) => {
  ElMessage.warning('Replacing previous image...')
  fileList.value = []
  setTimeout(() => beforeUpload(files[0]), 100)
}

const handleRemove = () => {
  avatarFile.value = null
  fileList.value = []
}

const handlePreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

const submitForm = async () => {
  const nameTrimmed = form.value.name.trim()
  const bioTrimmed = form.value.bio.trim()

  if (!nameTrimmed) {
    ElMessage.error('Name is required.')
    return
  }

  if (nameTrimmed.length > 50) {
    ElMessage.error('Name cannot exceed 50 characters.')
    return
  }

  if (bioTrimmed.length > 500) {
    ElMessage.error('Bio cannot exceed 500 characters.')
    return
  }

  const formData = new FormData()
  formData.append('name', nameTrimmed)
  formData.append('bio', bioTrimmed)

  if (avatarFile.value) {
    formData.append('avatar', avatarFile.value)
  }

  try {
    
   await updateProfile(formData);
    ElMessage.success('Profile updated!')
    setTimeout(() => {
    location.reload()
    }, 500)
  } catch (err) {
    ElMessage.error(err.response?.data?.error || 'Update failed')
  }
}
</script>


<style scoped>

</style>

