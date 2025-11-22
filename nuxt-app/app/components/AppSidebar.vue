<template>
  <div>
    <!-- Mobile overlay -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="$emit('close')"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <nav class="h-full flex flex-col p-4">
        <!-- User Info -->
        <div class="mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
              {{ username.charAt(0).toUpperCase() }}
            </div>
            <div>
              <p class="font-semibold text-sm">{{ username }}</p>
              <p class="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="flex-1 space-y-1">
          <UButton
            to="/"
            :color="route.path === '/' ? 'primary' : 'neutral'"
            :variant="route.path === '/' ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-layout-dashboard" class="w-5 h-5" />
            </template>
            Scanner
          </UButton>

          <UButton
            to="/boxes"
            :color="route.path.startsWith('/boxes') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/boxes') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-box" class="w-5 h-5" />
            </template>
            Box
          </UButton>

          <UButton
            to="/delivery"
            :color="route.path.startsWith('/delivery') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/delivery') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-truck" class="w-5 h-5" />
            </template>
            Delivery
          </UButton>

          <UButton
            to="/warehouse"
            :color="route.path.startsWith('/warehouse') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/warehouse') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-warehouse" class="w-5 h-5" />
            </template>
            Warehouse
          </UButton>

          <UButton
            to="/agents"
            :color="route.path.startsWith('/agents') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/agents') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-store" class="w-5 h-5" />
            </template>
            Agents
          </UButton>

          <UButton
            to="/statistics"
            :color="route.path.startsWith('/statistics') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/statistics') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-bar-chart" class="w-5 h-5" />
            </template>
            Statistics
          </UButton>

          <UButton
            to="/products"
            :color="route.path.startsWith('/products') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/products') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-package" class="w-5 h-5" />
            </template>
            Products
          </UButton>

          <UButton
            to="/cameras"
            :color="route.path.startsWith('/cameras') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/cameras') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-camera" class="w-5 h-5" />
            </template>
            Cameras
          </UButton>

          <UButton
            to="/search"
            :color="route.path.startsWith('/search') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/search') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-search" class="w-5 h-5" />
            </template>
            Search
          </UButton>

          <UButton
            to="/label"
            :color="route.path.startsWith('/label') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/label') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-tag" class="w-5 h-5" />
            </template>
            Label
          </UButton>
        </div>
      </nav>
    </aside>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

defineProps<{
  isOpen: boolean
  username: string
}>()

defineEmits<{
  close: []
}>()
</script>
