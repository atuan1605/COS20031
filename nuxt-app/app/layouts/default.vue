<template>
  <UApp>
    <UHeader>
      <template #left>
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          @click="sidebarOpen = !sidebarOpen"
          class="lg:hidden"
        />
        <NuxtLink to="/">
          <div>COS20031</div>
        </NuxtLink>
      </template>

      <template #right>
        <UColorModeButton />

        <UButton
          to="https://github.com/atuan1605/COS20031"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UHeader>

    <AppSidebar
      :is-open="sidebarOpen"
      :username="username"
      @close="sidebarOpen = false"
    />

    <UMain :class="['transition-all duration-300', sidebarOpen ? 'lg:ml-64' : '']">
      <slot />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter :class="['transition-all duration-300', sidebarOpen ? 'lg:ml-64' : '']">
      <template #left>
        <p class="text-sm text-muted">
          Built with Nuxt UI • © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-templates/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>
    </UFooter>
  </UApp>
</template>

<script setup lang="ts">
const sidebarOpen = ref(true)
const username = ref('Admin User')

onMounted(() => {
  // TODO: Fetch username from API
})
</script>
