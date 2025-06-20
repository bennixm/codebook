import { ref, onMounted } from 'vue';
import api from '../api';

export function useCategories() {
  const categories = ref([]);
  const loading    = ref(false);

  onMounted(async () => {
    loading.value = true;
    try {
      const { data } = await api.get('/categories/categories');
     
      if (Array.isArray(data)) {
        categories.value = data;
      } else if (Array.isArray(data.categories)) {
        categories.value = data.categories;
      } else if (Array.isArray(data.data)) {
        categories.value = data.data;
      } else {
        console.warn('useCategories: unexpected payload shape', data);
        categories.value = [];
      }
    } catch (err) {
      console.error('useCategories: failed to fetch categories', err);
      categories.value = [];
    } finally {
      loading.value = false;
    }
  });

  return { categories, loading };
}
