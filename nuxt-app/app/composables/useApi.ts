export const useApi = () => {
  const apiFetch = async <T = any>(url: string, options: any = {}): Promise<T> => {
    const token = useCookie('token')

    const headers = {
      ...options.headers,
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
    }

    return $fetch<T>(url, {
      ...options,
      headers
    })
  }

  return {
    apiFetch
  }
}
