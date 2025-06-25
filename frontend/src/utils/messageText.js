export function messageText(n) {
    switch (n.type) {
      case 'comment': return 'commented on your post';
      case 'reply': return 'replied to your comment';
      case 'like': return 'liked your post';
      case 'follow': return 'started following you';
      case 'new_blog': return 'published a new blog';
      case 'view': return 'has viewed your blog';
      default: return 'did something';
    }
  }
  