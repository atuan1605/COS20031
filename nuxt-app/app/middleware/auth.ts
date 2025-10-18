export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie<string | null>('token')

  // Nếu không có token -> chỉ cho phép truy cập trang sign-in
  if (!token.value && to.path !== '/sign-in') {
    return navigateTo('/sign-in')
  }
})
