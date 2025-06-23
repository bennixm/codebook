<template>
    <div class="panel-container space-y-6">
      <div class="blog-block-header">
        <div class="flex items-center">
          <span class="mr-3 title">Edit blog</span>
        </div>
      </div>
  
      <div class="blog-block flex gap-10">
        <div class="blog-block-left w-2/3 dash-element">
          <div>
          <el-form
            ref="blogForm"
            :model="formData"
            :rules="rules"
            label-position="top"
            class="space-y-4"
            :validate-on-rule-change="true"
          >
            <el-form-item label="Post title" prop="title">
              <el-input v-model="formData.title" placeholder="Enter blog title" />
            </el-form-item>
  
            <el-form-item label="Description" prop="description">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="Enter a brief description"
              />
            </el-form-item>

            <el-form-item label="Category" prop="selectedCategory">
            <el-select
              v-model="formData.selectedCategory"
              placeholder="Select a category"
              :loading="!categoriesOptions.length"
            >
              <el-option
                v-for="category in categoriesOptions"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </el-form-item>

  
            <el-form-item label="Tags" prop="selectedTags">
              <el-select
                v-model="formData.selectedTags"
                multiple
                filterable
                default-first-option
                placeholder="Select languages"
                
              >
                <el-option
                  v-for="tag in tagOptions"
                  :key="tag.value"
                  :label="tag.label"
                  :value="tag.value"
                />
              </el-select>
            </el-form-item>
          </el-form>
  
  
            <el-divider content-position="left">Blog content</el-divider>
            <div ref="editorHolder" id="editorjs" class="p-4 rounded bg-white" />
  
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
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
  
          <div class="mt-4 space-y-4">
            <el-form label-position="top">
              <el-form-item label="Allow Comments">
                <el-switch v-model="formData.allowComments" active-text="Yes" inactive-text="No" />
              </el-form-item>
            </el-form>
          </div>
  
          </div>
        </div>
  
        <div class="blog-block-right w-1/3 dash-element">
          <div class="blog-menu-elements">
            <div class="mt-6 flex flex-wrap gap-2 justify-center">
            <el-button @click="() => publish(true)" round>Save as Draft</el-button>
            <el-button type="success" round @click="() => publish(false)">Publish</el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  
  <script>
  import { ref, reactive, onMounted, computed,onBeforeUnmount} from 'vue';
  import { useAuth } from '../../../composables/useAuth';
  import { useCategories } from '../../../composables/useCategories';
  import { useTags } from '../../../composables/useTags';
  import EditorJS from '@editorjs/editorjs';
  import Header from '@editorjs/header';
  import CodeTool from '@editorjs/code';
  import ImageTool from '@editorjs/image';
  import InlineCode from '@editorjs/inline-code';
  import Marker from '@editorjs/marker';
  import TextColorPlugin from 'editorjs-text-color-plugin';
  import Paragraph from '@editorjs/paragraph';
  import { ElMessage } from 'element-plus';
  import { Delete } from '@element-plus/icons-vue';
  
  import {useRoute, useRouter } from 'vue-router';
  
  import { UploadFilled } from '@element-plus/icons-vue';
  import api from '../../../api';
  
  export default {
    name: 'RichTextEditor',
    components: { UploadFilled, Delete },
    setup() {
      const {editBlogPost,fetchBlogById} = useAuth();
      const { categories } = useCategories();
      const { tags } = useTags();
      const fetchedBlog = ref(null);




      const tagOptions = computed(() =>
      tags.value.map(tag => ({
        label: tag.name,
         value: tag._id,
       }))
     );

        const categoriesOptions = computed(() =>
          categories.value.map(category => ({
            label: category.name,
            value: category._id,
          }))
        );

       
      
  
    
      const isDraft = ref(true);
      const coverFileList = ref([]);
      const router = useRouter();
      const route = useRoute(); 

      
  
      const coverError = ref(false);
  
      const blogForm = ref(null);
  
      const formData = reactive({
        blogid:'',
        title: '',
        description: '',
        selectedTags: [],
        selectedCategory: '',
        allowComments: true,
        coverImage: null,
      });
  
      const rules = {
        title: [
          { required: true, message: 'Title is required', trigger: 'blur' },
          { min: 5, max: 100, message: 'Title must be 5-100 characters', trigger: 'blur' },
        ],
        description: [
          { required: true, message: 'Description is required', trigger: 'blur' },
          { min: 10, max: 300, message: 'Description must be 10-300 characters', trigger: 'blur' },
        ],
        selectedTags: [
          { type: 'array', required: true, message: 'Select at least one tag', trigger: 'change' },
        ],
        selectedCategory: [
          { required: true, message: 'Select a category', trigger: 'change' },
        ],
      };
  
  
     
  
      let editor = null;
      const editorHolder = ref(null);

      const fetchBlogData = async () => {
      try {
          console.log(route.params.id);
          const blog = await fetchBlogById(route.params.id);
        formData.blogid = blog._id;
        formData.title = blog.title;
        formData.description = blog.description;
        formData.selectedTags = blog.tags.map(tag => tag._id);
        formData.selectedCategory = blog.categories[0];
        formData.allowComments = blog.allowComments;
       

        if (blog.coverImage) {
          coverFileList.value = [{ name: 'Cover image', url: blog.coverImage, raw: null }];
        }

        const parsedContent = typeof blog.content === 'string'
          ? JSON.parse(blog.content)
          : blog.content;

        if (editor && parsedContent.blocks) {
          await editor.isReady;
          await editor.render(parsedContent);
        }

      } catch (err) {
        ElMessage.error('Failed to fetch blog data.');
        console.error(err);
      }
      };

  
      const handleCoverChange = (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const maxSize = 2 * 1024 * 1024;
  
        if (!allowedTypes.includes(file.raw.type)) {
          ElMessage.error('Only JPG, PNG, GIF, and WEBP formats are allowed.');
          return;
        }
  
        if (file.raw.size > maxSize) {
          ElMessage.error('Cover image must be smaller than 2MB.');
          return;
        }
  
        const url = URL.createObjectURL(file.raw);
        coverFileList.value = [
          {
            name: file.name,
            url,
            raw: file.raw,
          },
        ];
      };
  
  
      const handleCoverRemove = () => {
        coverFileList.value = [];
      };
  
      onMounted(async () => {
       
        editor = new EditorJS({
          holder: editorHolder.value,
          autofocus: true,
          tools: {
            header: {
              class: Header,
              inlineToolbar: ['marker', 'inlineCode'],
              config: {
                placeholder: 'Enter a header',
                levels: [1, 2, 3, 4],
                defaultLevel: 2,
              },
            },
            paragraph: {
              class: Paragraph,
              inlineToolbar: true,
            },
            code: {
              class: CodeTool,
              shortcut: 'CMD+SHIFT+C',
            },
            image: {
              class: ImageTool,
              config: {
                uploader: {
                    uploadByFile: async (file) => {
                      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                      const maxSize = 2 * 1024 * 1024;
  
                      if (!allowedTypes.includes(file.type)) {
                        return { success: 0, message: 'Invalid image type.' };
                      }
  
                      if (file.size > maxSize) {
                        return { success: 0, message: 'Image too large (max 2MB).' };
                      }
  
                      const toBase64 = (file) =>
                        new Promise((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result);
                          reader.onerror = reject;
                          reader.readAsDataURL(file);
                        });
  
                      try {
                        const base64 = await toBase64(file);
                        return {
                          success: 1,
                          file: {
                            url: base64 
                          }
                        };
                      } catch (err) {
                        return { success: 0, message: 'Failed to read image.' };
                      }
                    },
  
                  uploadByUrl: async (url) => ({
                    success: 1,
                    file: { url },
                  }),
                },
              },
            },
            marker: {
              class: Marker,
              shortcut: 'CMD+SHIFT+M',
            },
            inlineCode: {
              class: InlineCode,
              shortcut: 'CMD+SHIFT+I',
            },
            color: {
              class: TextColorPlugin,
              config: {
                colorCollections: [
                  '#FF0000',
                  '#00FF00',
                  '#0000FF',
                  '#FFFF00',
                  '#FF00FF',
                  '#00FFFF',
                  '#000000',
                  '#FFFFFF',
                ],
                defaultColor: '#FF0000',
                type: 'text',
              },
            },
          },
        });
        await fetchBlogData();
      });
  
      onBeforeUnmount(() => {
        if (editor) {
          editor.destroy();
          editor = null;
        }
      });
  
      const publish = async (draft = false) => {
        if (!blogForm.value) {
          ElMessage.error('Form is not ready yet.');
          return;
        }
  
        blogForm.value.validate(async (valid) => {
          coverError.value = coverFileList.value.length === 0;
  
          if (!valid) {
            ElMessage.error('Please fix the form errors.');
            return;
          }
  
          if (coverFileList.value.length === 0) {
            ElMessage.error('Please upload a cover image.');
            return;
          }
  
          try {
            const outputData = await editor.save();
  
            const blocks = outputData.blocks || [];
            const totalBlocks = blocks.length;
            const imageBlocks = blocks.filter(block => block.type === 'image').length;
  
            if (totalBlocks > 20) {
              ElMessage.error('You can add a maximum of 20 blocks.');
              return;
            }
  
            if (imageBlocks > 10) {
              ElMessage.error('You can add a maximum of 10 image blocks.');
              return;
            }
  
            const formDataToSend = new FormData();
            formDataToSend.append('blogid', formData.blogid);
            formDataToSend.append('content', JSON.stringify(outputData));
            formDataToSend.append('title', formData.title.trim());
            formDataToSend.append('description', formData.description.trim());
            formDataToSend.append('categories', formData.selectedCategory);
            formDataToSend.append('tags', JSON.stringify(formData.selectedTags));
            formDataToSend.append('allowComments', formData.allowComments);
            formDataToSend.append('isDraft', draft);
            formDataToSend.append('coverImage', coverFileList.value[0].raw);
  
            console.log('Sending form data:', [...formDataToSend.entries()]);
            try{
            await editBlogPost(formDataToSend);
              ElMessage.success('Blog post was edited successfully.');
              router.push('/panel/my-blogs');
            }
            catch (error) {
              console.error('Error editing blog post:', error);
              const message = err.response?.data?.error
              || JSON.stringify(err.response?.data)
              || err.message;
            console.error('Error editing blog post:', message);
            ElMessage.error(message);
              
              ElMessage.error('Failed to edit blog post.');
  
              return;
            }
           
  
          } catch (err) {
            ElMessage.error('Failed to save blog content.');
          }
        });
      };
  
      return {
        blogForm,
        formData,
        isDraft,
        coverFileList,
        tagOptions,
        categoriesOptions,
        handleCoverChange,
        handleCoverRemove,
        editorHolder,
        publish,
        rules,
        tags,
        
      };
    },
  };
  </script>
  
  
  
  <style>
  </style>
  