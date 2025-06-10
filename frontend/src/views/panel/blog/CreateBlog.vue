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
            <el-form-item label="Post title">
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

          <el-divider content-position="left">Cover image</el-divider>

          <el-form label-position="top" class="space-y-4">
            <el-form-item>
              <div class="upload-cover" v-if="coverFileList.length === 0">
                <el-upload
                  drag
                  :limit="1"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleCoverChange"
                  :on-remove="handleCoverRemove"
                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    Drop file here or <em>click to upload</em>
                  </div>
                </el-upload>
              </div>

              <div v-else class="relative image-cover-preview">
                <img
                  :src="coverFileList[0].url"
                  alt="Cover Preview"
                  class="rounded border w-full h-auto object-cover"
                />
                <el-button
                  size="large"
                  class="mt-2 remove-cover-btn"
                  @click="handleCoverRemove"
                >
                  <Trash2 />
                </el-button>
              </div>
            </el-form-item>
          </el-form>

          <el-form label-position="top" class="space-y-4">
            <el-form-item label="Tags">
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
            <el-button @click="saveDraft" round>Save as Draft</el-button>
            <el-button type="success" round @click="publish">Publish</el-button>
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
import { UploadFilled } from '@element-plus/icons-vue'
import 'element-plus/es/components/message/style/css'
import { Trash2 } from 'lucide-vue-next';

const title = ref('')
const selectedTags = ref([])
const description = ref('')
const allowComments = ref(true)
const isDraft = ref(true)

const coverFileList = ref([])

const handleCoverChange = (file) => {
  const url = URL.createObjectURL(file.raw)
  coverFileList.value = [{
    name: file.name,
    url,
    raw: file.raw
  }]
}

const handleCoverRemove = () => {
  coverFileList.value = []
}



const programmingLanguages = [
  'JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'TypeScript', 'Ruby', 'PHP', 'C#'
]

let editor = null
const uploadedFiles = []




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

onMounted(() => {
  initEditor()
})


</script>


<style>
</style>
