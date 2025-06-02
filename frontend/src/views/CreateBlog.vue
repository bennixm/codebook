<template>
  <div class="container">
    <div id="editorjs" class="border p-4 rounded shadow-md"></div>
    <button @click="saveContent" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Salvează</button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import Paragraph from '@editorjs/paragraph'
import Code from '@editorjs/code'
import ImageTool from '@editorjs/image'
import TextColor from 'editorjs-text-color-plugin'
import Marker from '@editorjs/marker'
import InlineCode from '@editorjs/inline-code'

let editor
const uploadedFiles = []

onMounted(() => {
  requestAnimationFrame(() => {
    editor = new EditorJS({
      holder: 'editorjs',
      tools: {
        header: {
          class: Header,
          inlineToolbar: true,
          config: {
            levels: [1, 2, 3],
            defaultLevel: 2
          }
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
                uploadedFiles.push(file) // Salvăm local
                return {
                  success: 1,
                  file: {
                    url: URL.createObjectURL(file) // previzualizare temporară
                  }
                }
              }
            }
          }
        },
        textColor: {
          class: TextColor,
          config: {
            colorCollections: ['#FF1300', '#EC7878', '#9C27B0', '#673AB7', '#3F51B5', '#0070FF', '#03A9F4', '#00BCD4', '#4CAF50', '#8BC34A', '#CDDC39', '#FFF'],
            defaultColor: '#FF1300',
            type: 'text'
          }
        },
        marker: Marker,
        inlineCode: InlineCode
      }
    })
  })
})

const saveContent = async () => {
  if (!editor) return

  const output = await editor.save()
  console.log('Continut brut:', output)

  // Upload real al fișierelor
  const uploadedUrls = await Promise.all(uploadedFiles.map(async (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    return data.url
  }))

  // Poți înlocui URL-urile temporare în `output.blocks` dacă vrei

  console.log('Continut salvat cu imagini reale:', output)
  console.log('Imagini urcate:', uploadedUrls)
}
</script>

<style scoped>
#editorjs {
  min-height: 500px;
  padding: 2rem;
  border-radius: 1rem;
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.06);
  font-family: 'Merriweather', serif;
  color: #333;
  line-height: 1.6;
}

.ce-block {
  margin-bottom: 1.5rem;
}

.ce-paragraph {
  font-size: 1.125rem;
}

.ce-header {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.ce-code {
  background: #f5f5f5;
  font-family: 'Courier New', monospace;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.95rem;
}
</style>
