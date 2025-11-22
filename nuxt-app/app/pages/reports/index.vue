<template>
  <UContainer class="py-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Reports</h1>

      <UTabs v-model="selectedTab" :items="tabs" class="mb-6" />

      <!-- Inventory Report Tab -->
      <div v-if="selectedTab === 0">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Inventory Report (Over 10 Days)</h2>
          </template>

          <div v-if="loadingInventory" class="py-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p class="mt-4 text-gray-600">Loading inventory...</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    No.
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight (kg)
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days in Warehouse
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Received At
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="(item, index) in inventoryItems"
                  :key="item.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ (inventoryPagination.page - 1) * inventoryPagination.pageSize + index + 1 }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <NuxtLink :to="`/tracking-items/${item.id}`" class="text-blue-600 hover:underline">
                      {{ item.tracking_number }}
                    </NuxtLink>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ item.warehouse_id || 'N/A' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ item.weight || 'N/A' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ item.amount || 'N/A' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <UBadge :color="getDaysColor(getDaysInWarehouse(item.received_at_warehouse_at))">
                      {{ getDaysInWarehouse(item.received_at_warehouse_at) }} days
                    </UBadge>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ formatDate(item.received_at_warehouse_at) }}
                  </td>
                </tr>
                <tr v-if="inventoryItems.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    No tracking items found
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="inventoryPagination.totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t">
              <div class="text-sm text-gray-600">
                Showing {{ ((inventoryPagination.page - 1) * inventoryPagination.pageSize) + 1 }} to
                {{ Math.min(inventoryPagination.page * inventoryPagination.pageSize, inventoryPagination.total) }}
                of {{ inventoryPagination.total }} items
              </div>
              <div class="flex gap-2">
                <UButton
                  icon="i-lucide-chevron-left"
                  size="sm"
                  color="neutral"
                  :disabled="inventoryPagination.page === 1"
                  @click="inventoryPagination.page--; fetchInventory()"
                />
                <UButton
                  icon="i-lucide-chevron-right"
                  size="sm"
                  color="neutral"
                  :disabled="inventoryPagination.page === inventoryPagination.totalPages"
                  @click="inventoryPagination.page++; fetchInventory()"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Committed Boxes Tab -->
      <div v-if="selectedTab === 1">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Committed Boxes Report</h2>
          </template>

          <div v-if="loadingBoxes" class="py-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p class="mt-4 text-gray-600">Loading boxes...</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    No.
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Box Name
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Count
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Weight (kg)
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Committed At
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="(box, index) in committedBoxes"
                  :key="box.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ (boxesPagination.page - 1) * boxesPagination.pageSize + index + 1 }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <NuxtLink :to="`/boxes/${box.id}`" class="text-blue-600 hover:underline">
                      {{ box.code }}
                    </NuxtLink>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ box.warehouse_id || 'N/A' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ box.tracking_count }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ parseFloat(box.total_weight).toFixed(2) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    ${{ parseFloat(box.total_amount).toFixed(2) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ formatDate(box.committed_at) }}
                  </td>
                </tr>
                <tr v-if="committedBoxes.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    No committed boxes found
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="boxesPagination.totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t">
              <div class="text-sm text-gray-600">
                Showing {{ ((boxesPagination.page - 1) * boxesPagination.pageSize) + 1 }} to
                {{ Math.min(boxesPagination.page * boxesPagination.pageSize, boxesPagination.total) }}
                of {{ boxesPagination.total }} boxes
              </div>
              <div class="flex gap-2">
                <UButton
                  icon="i-lucide-chevron-left"
                  size="sm"
                  color="neutral"
                  :disabled="boxesPagination.page === 1"
                  @click="boxesPagination.page--; fetchCommittedBoxes()"
                />
                <UButton
                  icon="i-lucide-chevron-right"
                  size="sm"
                  color="neutral"
                  :disabled="boxesPagination.page === boxesPagination.totalPages"
                  @click="boxesPagination.page++; fetchCommittedBoxes()"
                />
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const { apiFetch } = useApi()
const { showError } = useNotification()

const selectedTab = ref(0)
const tabs = [
  { label: 'Inventory Report', value: 0 },
  { label: 'Committed Boxes', value: 1 }
]

// Inventory data
const inventoryItems = ref<any[]>([])
const loadingInventory = ref(true)
const inventoryPagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0
})

// Committed boxes data
const committedBoxes = ref<any[]>([])
const loadingBoxes = ref(true)
const boxesPagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0
})

function formatDate(date: string) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getDaysInWarehouse(receivedAt: string) {
  if (!receivedAt) return 0
  const received = new Date(receivedAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - received.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

function getDaysColor(days: number) {
  if (days > 30) return 'error'
  if (days > 20) return 'warning'
  if (days > 10) return 'primary'
  return 'neutral'
}

async function fetchInventory() {
  loadingInventory.value = true

  try {
    const params = new URLSearchParams({
      page: inventoryPagination.value.page.toString(),
      pageSize: inventoryPagination.value.pageSize.toString()
    })

    const response: any = await apiFetch(`/api/reports/inventory?${params.toString()}`)

    inventoryItems.value = response.data
    inventoryPagination.value = {
      ...inventoryPagination.value,
      total: response.pagination.total,
      totalPages: response.pagination.totalPages
    }
  } catch (err: any) {
    console.error('Error fetching inventory report:', err)
    showError(err, 'Failed to load inventory report')
  } finally {
    loadingInventory.value = false
  }
}

async function fetchCommittedBoxes() {
  loadingBoxes.value = true

  try {
    const params = new URLSearchParams({
      page: boxesPagination.value.page.toString(),
      pageSize: boxesPagination.value.pageSize.toString()
    })

    const response: any = await apiFetch(`/api/reports/committed-boxes?${params.toString()}`)

    committedBoxes.value = response.data
    boxesPagination.value = {
      ...boxesPagination.value,
      total: response.pagination.total,
      totalPages: response.pagination.totalPages
    }
  } catch (err: any) {
    console.error('Error fetching committed boxes report:', err)
    showError(err, 'Failed to load committed boxes report')
  } finally {
    loadingBoxes.value = false
  }
}

watch(selectedTab, (newTab) => {
  if (newTab === 0 && inventoryItems.value.length === 0) {
    fetchInventory()
  } else if (newTab === 1 && committedBoxes.value.length === 0) {
    fetchCommittedBoxes()
  }
})

onMounted(() => {
  if (selectedTab.value === 0) {
    fetchInventory()
  } else {
    fetchCommittedBoxes()
  }
})
</script>
