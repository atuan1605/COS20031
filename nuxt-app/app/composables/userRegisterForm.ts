// Types
export interface AuthForm {
    username: string
    password: string
    confirmPassword: string
}

export type FieldError = {
    path: keyof AuthForm | string
    message: string
}

// Validation
export const validateSignUp = (f: AuthForm): FieldError[] => {
    const errors: FieldError[] = []
    if (!f.username?.trim()) errors.push({ path: 'username', message: 'Username is required' })
    if (!f.password) errors.push({ path: 'password', message: 'Password is required' })
    if (f.password !== f.confirmPassword) errors.push({ path: 'confirmPassword', message: 'Passwords do not match' })
    return errors
}

// Register handle
export const useRegisterHandle = () => {
const loading = ref(false)
const toast = useToast()

const registerHandle = async (form: AuthForm) => {
loading.value = true

const errors = validateSignUp(form)
    if (errors.length) {
        toast.add({ title: 'Please fix the errors', color: 'error' })
        loading.value = false
    return { ok: false, errors }
}

try {
    const response = await $fetch('/api/auth/register', {
    method: 'POST',
    body: { username: form.username, password: form.password }
    })
    toast.add({ title: 'Registration successful!', color: 'success' })
    await navigateTo('/sign-in')
    return { ok: true, data: response }
} catch (error: any) {
    console.error('Registration error:', error)
    toast.add({
        title: 'Registration failed',
        description: error?.data?.message || 'Please try again',
        color: 'error'
    })
return { ok: false, error }
} finally {
    loading.value = false
}
}

return { loading, registerHandle }
}