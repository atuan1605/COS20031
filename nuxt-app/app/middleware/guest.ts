export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie<string | null>('token')

  // Nếu đã có token -> không cho vào trang sign-in hoặc sign-up
  if (token.value && (to.path === '/sign-in' || to.path === '/sign-up')) {
    return navigateTo('/')
  }
})
