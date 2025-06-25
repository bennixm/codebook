import { ElNotification } from 'element-plus'

export function useNotify() {
  function show({
    title = 'Notification',
    message,
    duration = 5000,
    type = 'info',
    position = 'bottom-right',
    icon = null,
  }) {
    ElNotification({
      title,
      message,
      duration,
      type,
      position,
      icon,
      dangerouslyUseHTMLString: true,
    });
  }

  return { show };
}
