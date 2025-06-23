import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

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

    async function toggleBookmark(slug) {
        if (isBookmarked(slug)) {
            await confirmAndRemove(slug);
        } else {
            bookmarks.value.push(slug);
            saveBookmarks();
            ElMessage({
                message: 'Bookmark added!',
                type: 'success',
            });
        }
    }

    async function confirmAndRemove(slug) {
        try {
            await ElMessageBox.confirm(
                'Are you sure you want to remove this bookmark?',
                'Remove Bookmark',
                {
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'Cancel',
                    type: 'warning',
                }
            );
            doRemoveBookmark(slug);
            ElMessage({
                message: 'Bookmark removed.',
                type: 'success',
            });
        } catch {
        }
    }

    async function removeBookmark(slug) {
        if (isBookmarked(slug)) {
            await confirmAndRemove(slug);
        }
    }

    function doRemoveBookmark(slug) {
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
