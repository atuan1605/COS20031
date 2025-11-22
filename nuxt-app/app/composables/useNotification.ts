export const useNotification = () => {
  const toast = useToast()

  const showSuccess = (message: string, title: string = 'Success') => {
    toast.add({
      title,
      description: message,
      color: 'success',
      icon: 'i-lucide-check-circle'
    })
  }

  const showError = (error: any, title: string = 'Error') => {
    let message = 'An unexpected error occurred'

    if (typeof error === 'string') {
      message = error
    } else if (error?.statusMessage) {
      message = error.statusMessage
    } else if (error?.message) {
      message = error.message
    } else if (error?.data?.message) {
      message = error.data.message
    }

    toast.add({
      title,
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  }

  const showWarning = (message: string, title: string = 'Warning') => {
    toast.add({
      title,
      description: message,
      color: 'warning',
      icon: 'i-lucide-alert-triangle'
    })
  }

  const showInfo = (message: string, title: string = 'Info') => {
    toast.add({
      title,
      description: message,
      color: 'info',
      icon: 'i-lucide-info'
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
