export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie<string | null>('token')

  if (!token.value && to.path !== '/sign-in') {
    return navigateTo('/sign-in')
  }
})
