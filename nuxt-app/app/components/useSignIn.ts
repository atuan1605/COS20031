// components/useSignIn.ts
import { ref, reactive } from 'vue'
import { useToast, navigateTo, useCookie } from '#imports'

export function useSignIn() {
  const toast = useToast()
  const form = reactive({
    username: '',
    password: ''
  })
  const loading = ref(false)

  // Login function
  async function login(username: string, password: string) {
    try {
      const res = await $fetch<{ token?: string }>('/api/auth/login', {
        method: 'POST',
        body: { username, password }
      })

      if (res?.token) {
        // Save token in cookie for 7 days
        const token = useCookie<string | null>('token', {
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        })
        token.value = res.token

        toast.add({
          title: 'Login successful!',
          color: 'success'
        })

        await navigateTo('/')
      } else {
        toast.add({
          title: 'Login failed',
          description: 'No token returned from the server',
          color: 'error'
        })
      }
    } catch (err) {
      console.error('Login error:', err)
      toast.add({
        title: 'Wrong account or password!',
        color: 'error'
      })
    }
  }

  // Handle sign-in form submission
  async function handleSignIn() {
    if (!form.username || !form.password) {
      toast.add({
        title: 'Please enter both username and password.',
        color: 'warning'
      })
      return
    }

    loading.value = true
    try {
      await login(form.username, form.password)
    } finally {
      loading.value = false
    }
  }

  return { form, loading, handleSignIn }
}
