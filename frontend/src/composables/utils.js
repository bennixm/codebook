
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime'; 
dayjs.extend(relativeTime);

export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const defaultAvatar = 'https://firebasestorage.googleapis.com/v0/b/codebook-61371.firebasestorage.app/o/user.png?alt=media&token=6cdb89f7-73b1-40b0-9307-78ae1a06f29f';


export const formattedDate = (date) => {
  return dayjs(date).fromNow(); 
};
