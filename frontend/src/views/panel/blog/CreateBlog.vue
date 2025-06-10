<template>
  <div class="panel-container space-y-6">
    <div class="blog-block-header">
      <div class="flex items-center">
        <span class="mr-3 title">Create blog</span>
      </div>
    </div>

    <div class="blog-block flex gap-10">
      <div class="blog-block-left w-2/3 dash-element">
        <div>
          <el-form label-position="top" class="space-y-4">
            <el-form-item label="Title">
              <el-input v-model="title" placeholder="Enter blog title" />
            </el-form-item>

            <el-form-item label="Description">
              <el-input
                v-model="description"
                type="textarea"
                :rows="3"
                placeholder="Enter a brief description"
              />
            </el-form-item>
          </el-form>

          <el-divider content-position="left">Blog content</el-divider>
          <div id="editorjs" class="p-4 rounded bg-white" />

          <el-divider content-position="left">Cover Photo</el-divider>
          <el-form class="mt-4">
            <el-form-item label="Upload Cover Image">
              <el-upload
                class="cover-uploader w-full"
                :limit="1"
                :file-list="coverFileList"
                :on-change="handleCoverChange"
                :on-remove="removeCoverImage"
                :auto-upload="false"
                list-type="picture-card"
                :show-file-list="true"
              >
                <template #default>
                  <div v-if="coverFileList.length === 0" class="w-full h-48 flex items-center justify-center border border-dashed border-gray-300 rounded">
                    <el-icon class="text-2xl text-gray-400"><i-ep-plus /></el-icon>
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-form>



          <el-form class="mt-4">
            <el-form-item label="Tags (Programming Languages)">
              <el-select
                v-model="selectedTags"
                multiple
                filterable
                default-first-option
                placeholder="Select languages"
              >
                <el-option
                  v-for="lang in programmingLanguages"
                  :key="lang"
                  :label="lang"
                  :value="lang"
                />
              </el-select>
            </el-form-item>
          </el-form>

        <div class="mt-4 space-y-4">
          <el-form label-position="top">
            <el-form-item label="Allow Comments">
              <el-switch v-model="allowComments" active-text="Yes" inactive-text="No" />
            </el-form-item>
          </el-form>
        </div>

        </div>
      </div>

      <div class="blog-block-right w-1/3 dash-element">
        <div class="blog-menu-elements">
          <div class="mt-6 flex flex-wrap gap-2 justify-center">
            <el-button @click="saveDraft">Save as Draft</el-button>
            <el-button type="success" @click="publish">Publish</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>




<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import Paragraph from '@editorjs/paragraph'
import Code from '@editorjs/code'
import ImageTool from '@editorjs/image'
import TextColor from 'editorjs-text-color-plugin'
import Marker from '@editorjs/marker'
import InlineCode from '@editorjs/inline-code'
import EditorJsToHtml from 'editorjs-html'

const title = ref('')
const selectedTags = ref([])
const description = ref('')
const allowComments = ref(true)
const isDraft = ref(true)


const programmingLanguages = [
  'JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'TypeScript', 'Ruby', 'PHP', 'C#'
]

let editor = null
const uploadedFiles = []

import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'


const coverImage = ref(null)
const coverFileList = ref([])

const handleCoverChange = (uploadFile, uploadFiles) => {
  coverImage.value = uploadFile.raw
  coverFileList.value = [{
    name: uploadFile.name,
    url: URL.createObjectURL(uploadFile.raw)
  }]
}

const removeCoverImage = () => {
  coverImage.value = null
  coverFileList.value = []
}


const ejToHtml = EditorJsToHtml({
  paragraph: data => `<p class="mb-4 text-base">${data.text}</p>`,
  header: data => `<h${data.level} class="mb-2 font-bold text-lg">${data.text}</h${data.level}>`,
  code: data => `<pre class="bg-gray-100 p-3 rounded"><code>${data.code}</code></pre>`,
  image: data => `<img src="${data.file.url}" alt="image" class="my-4 rounded" />`
})


const initEditor = async (data = null) => {
  editor = new EditorJS({
    holder: 'editorjs',
    data: data ?? undefined,
tools: {
  header: {
    class: Header,
    inlineToolbar: true,
    config: { levels: [1, 2, 3], defaultLevel: 2 }
  },
  paragraph: {
    class: Paragraph,
    inlineToolbar: ['marker', 'underline', 'textColor', 'inlineCode']
  },
  code: Code,
  image: {
    class: ImageTool,
    config: {
      uploader: {
        async uploadByFile(file) {
          uploadedFiles.push(file)
          return {
            success: 1,
            file: { url: URL.createObjectURL(file) }
          }
        }
      }
    }
  },
  textColor: {
    class: TextColor,
    config: {
      type: 'text',
      colorCollections: ['#FF1300', '#EC7878', '#9C27B0', '#673AB7', '#3F51B5', '#0070FF', '#03A9F4', '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FFF'],
      defaultColor: '#FF1300',
      customPicker: true
    },
    sanitize: {
      color: true,
      background: true
    }
  },
  marker: {
    class: Marker,
    sanitize: {
      class: 'marker'
    }
  },
  inlineCode: InlineCode
}

  })

  await editor.isReady
}



</script>


<style>
</style>
