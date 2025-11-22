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
          <div v-if="loadingUser" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
            <div class="flex-1">
              <div class="h-4 bg-gray-300 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
              <div class="h-3 bg-gray-300 dark:bg-gray-700 rounded animate-pulse w-16"></div>
            </div>
          </div>
          <div v-else class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
              {{ userDetails?.username?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <div>
              <p class="font-semibold text-sm">{{ userDetails?.username || 'User' }}</p>
              <p class="text-xs text-gray-500 capitalize">{{ userDetails?.role || 'worker' }}</p>
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
            to="/changeWarehouse"
            :color="route.path.startsWith('/changeWarehouse') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/changeWarehouse') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-truck" class="w-5 h-5" />
            </template>
            Change Warehouse
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
            to="/reports"
            :color="route.path.startsWith('/reports') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/reports') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-file-text" class="w-5 h-5" />
            </template>
            Reports
          </UButton>

          <UButton
            v-if="isAdmin"
            to="/carriers"
            :color="route.path.startsWith('/carriers') ? 'primary' : 'neutral'"
            :variant="route.path.startsWith('/carriers') ? 'soft' : 'ghost'"
            block
            class="justify-start"
          >
            <template #leading>
              <UIcon name="i-lucide-ship" class="w-5 h-5" />
            </template>
            Carriers
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
const { apiFetch } = useApi()

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  close: []
}>()

interface UserDetails {
  id: string
  username: string
  role: 'admin' | 'worker'
  created_at: string
  verified_at: string | null
}

const userDetails = ref<UserDetails | null>(null)
const loadingUser = ref(true)

const isAdmin = computed(() => userDetails.value?.role === 'admin')

async function fetchUserDetails() {
  loadingUser.value = true
  try {
    const response: any = await apiFetch('/api/auth/me')
    userDetails.value = response.data
    console.log('User details:', response.data)
    console.log('Is admin:', userDetails.value?.role === 'admin')
  } catch (err) {
    console.error('Error fetching user details:', err)
  } finally {
    loadingUser.value = false
  }
}

onMounted(() => {
  fetchUserDetails()
})
</script>
