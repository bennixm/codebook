import { ref, onMounted } from 'vue';
import api from '../api';

export function useTags() {
  const tags    = ref([]);
  const loading = ref(false);

  onMounted(async () => {
    loading.value = true;
    try {
      const { data } = await api.get('/tags/tags');
      // support [ … ], { tags: […] }, or { data: […] }
      if (Array.isArray(data)) {
        tags.value = data;
      } else if (Array.isArray(data.tags)) {
        tags.value = data.tags;
      } else if (Array.isArray(data.data)) {
        tags.value = data.data;
      } else {
        console.warn('useTags: unexpected payload shape', data);
        tags.value = [];
      }
    } catch (err) {
      console.error('useTags: failed to fetch tags', err);
      tags.value = [];
    } finally {
      loading.value = false;
    }
  });

  return { tags, loading };
}
