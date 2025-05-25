<template>
  <div class="search-bar p-4 bg-white shadow flex items-center gap-4">
    <div class="container">
    <div class="search-input">
        <el-autocomplete
        v-model="searchQuery"
        :fetch-suggestions="fetchFromBackend"
        placeholder="Search..."
        clearable
        class="w-60"
        />
    <el-button type="primary" @click="onSearch">
      <Search /> Search
    </el-button>
    </div>
    <div class="search-filters">

        <el-select
        v-model="value1"
        placeholder="Select languages"
        multiple
        clearable
        filterable
        allow-create
        >
        <el-option
            v-for="lang in programmingLanguages"
            :key="lang"
            :label="lang"
            :value="lang"
        />
        </el-select>


    <el-select v-model="filters.category" placeholder="Select category" clearable class="w-40">
      <el-option label="Technology" value="tech" />
      <el-option label="Health" value="health" />
      <el-option label="Finance" value="finance" />
    </el-select>
  </div>
  </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search } from 'lucide-vue-next';

const filters = ref({
  status: '',
  category: '',
})


const value1 = ref([])

const programmingLanguages = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++',
  'Ruby', 'Go', 'Rust', 'PHP', 'Swift', 'Kotlin',
  'Scala', 'Dart', 'Elixir', 'Perl', 'Haskell'
]

const searchQuery = ref('')

const fetchFromBackend = async (queryString, cb) => {
  if (!queryString) return cb([])

  try {

    // aici trb sa luam sugestiile pe care sa le afiseze sub input din DB
    const res = await fetch(`/api/suggestions?q=${encodeURIComponent(queryString)}`)
    const data = await res.json()

    const results = data.map(item => ({ value: item }))
    cb(results)
  } catch (err) {
    console.error('Failed to fetch suggestions', err)
    cb([])
  }
}

</script>

<style scoped>
.search-bar {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
