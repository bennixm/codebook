import { ref, computed } from 'vue';

const STORAGE_KEY = 'bookmarkedBlogsBySlug';

export function useBookmarks() {
    const bookmarks = ref(getBookmarks());

    function getBookmarks() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveBookmarks() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks.value));
    }

    function isBookmarked(slug) {
        return bookmarks.value.includes(slug);
    }

    function toggleBookmark(slug) {
        if (isBookmarked(slug)) {
            removeBookmark(slug);
        } else {
            bookmarks.value.push(slug);
            saveBookmarks();
        }
    }

    function removeBookmark(slug) {
        bookmarks.value = bookmarks.value.filter(s => s !== slug);
        saveBookmarks();
    }

    return {
        bookmarks: computed(() => bookmarks.value),
        isBookmarked,
        toggleBookmark,
        removeBookmark,
    };
}
