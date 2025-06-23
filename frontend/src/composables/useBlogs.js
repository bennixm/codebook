import { ref } from 'vue';
import api from '../api';

export function useBlogFilter() {
  const blogs      = ref([]);
  const page       = ref(1);
  const perPage    = ref(10);
  const totalPages = ref(1);
  const total      = ref(0);
  const error      = ref(null);

  async function filterBlogs({ tags = [], search = '', slugs = [], newPage = 1 } = {}) {
    try {
      const params = {
        page: newPage,
        limit: perPage.value
      };

      if (tags.length)  params.tags = tags.join(',');
      if (search)       params.search = search;
      if (slugs.length) params.slugs = slugs.join(',');

      const { data } = await api.get('/blog/filter-blogs', { params });

      blogs.value      = data.data;
      page.value       = data.page;
      perPage.value    = data.perPage;
      totalPages.value = data.totalPages;
      total.value      = data.total;
    } catch (err) {
      error.value = err;
    }
  }

  return {
    blogs,
    page,
    perPage,
    totalPages,
    total,
    error,
    filterBlogs
  };
}
