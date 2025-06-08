<template>
  <div class="panel-container space-y-6">
    <div class="blog-block-header">
      <div class="flex items-center">
        <span class="mr-3 title">Create blog</span>
        <el-tag>Draft</el-tag>
      </div>
    </div>

    <div class="blog-block flex gap-10">
      <div class="blog-block-left w-2/3 dash-element">
        <div>
          <el-form label-position="top" class="space-y-4">
            <el-form-item label="Title">
              <el-input v-model="title" placeholder="Enter blog title" />
            </el-form-item>

            <el-form-item label="Tags (Programming Languages)">
              <el-select
                v-model="selectedTags"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="Select or create languages"
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

          <el-divider content-position="left">Blog content</el-divider>
          <div id="editorjs" class="p-4 rounded bg-white" />
        </div>

        <div>
          <h2 class="text-xl font-bold mb-2">{{ title }}</h2>
          <div class="mb-4">
            <el-tag
              v-for="tag in selectedTags"
              :key="tag"
              type="info"
              class="mr-2"
            >{{ tag }}</el-tag>
          </div>
        </div>
      </div>

      <div class="blog-block-right w-1/3 dash-element">
        <div class="blog-menu-elements">
        <div class="mt-6 flex flex-wrap gap-2 justify-center">
          <template>
            <el-button @click="saveDraft">Save as Draft</el-button>
            <el-button type="success" @click="publish">Publish</el-button>
          </template>
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
const previewContent = ref('')
const active = ref(0)
const savedEditorData = ref(null)


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


const destroyEditor = async () => {
  if (editor && typeof editor.destroy === 'function') {
    await editor.destroy()
    editor = null
  }
}



const saveDraft = () => {
  console.log('Saving as draft...')
}

const publish = async () => {
  if (!editor) return
  const output = await editor.save()

  const uploadedUrls = await Promise.all(uploadedFiles.map(async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    return data.url
  }))

  console.log('Publishing blog:', {
    title: title.value,
    tags: selectedTags.value,
    content: output,
    images: uploadedUrls
  })
}


onBeforeUnmount(() => {
  destroyEditor()
})

</script>


<style>
</style>
