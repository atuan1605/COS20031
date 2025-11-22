<template>
  <UContainer class="py-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Reports</h1>

      <UTabs v-model="selectedTab" :items="tabs" class="mb-6" />

      <!-- Inventory Report Tab -->
      <div v-if="selectedTab === 0">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Inventory Report (Over 10 Days)</h2>
              <UInput
                v-model="inventorySearch"
                placeholder="Search tracking number or warehouse..."
                icon="i-lucide-search"
                size="sm"
                class="w-64"
                @keyup.enter="searchInventory"
              />
            </div>
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

      <!-- Completed Payments Tab -->
      <div v-if="selectedTab === 1">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold">Completed Payments Report</h2>
              <UInput
                v-model="paymentsSearch"
                placeholder="Search payment code or address..."
                icon="i-lucide-search"
                size="sm"
                class="w-64"
                @keyup.enter="searchPayments"
              />
            </div>
          </template>

          <div v-if="loadingPayments" class="py-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p class="mt-4 text-gray-600">Loading payments...</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    No.
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Boxes
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivered At
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Completed At
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="(payment, index) in completedPayments"
                  :key="payment.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ (paymentsPagination.page - 1) * paymentsPagination.pageSize + index + 1 }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {{ payment.code }}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    <div v-if="payment.boxes.length > 0" class="flex flex-wrap gap-1">
                      <NuxtLink
                        v-for="box in payment.boxes"
                        :key="box.id"
                        :to="`/boxes/${box.id}`"
                        class="text-blue-600 hover:underline"
                      >
                        {{ box.code }}
                      </NuxtLink>
                      <span v-if="payment.boxes.length > 1" class="text-gray-500">({{ payment.box_count }} boxes)</span>
                    </div>
                    <span v-else class="text-gray-400">No boxes</span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    ${{ parseFloat(payment.total_amount || 0).toFixed(2) }}
                  </td>
                  <td class="px-4 py-3 text-sm">
                    {{ payment.received_address || 'N/A' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ formatDate(payment.delivering_at) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ formatDate(payment.success_at) }}
                  </td>
                </tr>
                <tr v-if="completedPayments.length === 0">
                  <td colspan="7" class="px-4 py-8 text-center text-gray-500">
                    No completed payments found
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Pagination -->
            <div v-if="paymentsPagination.totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t">
              <div class="text-sm text-gray-600">
                Showing {{ ((paymentsPagination.page - 1) * paymentsPagination.pageSize) + 1 }} to
                {{ Math.min(paymentsPagination.page * paymentsPagination.pageSize, paymentsPagination.total) }}
                of {{ paymentsPagination.total }} payments
              </div>
              <div class="flex gap-2">
                <UButton
                  icon="i-lucide-chevron-left"
                  size="sm"
                  color="neutral"
                  :disabled="paymentsPagination.page === 1"
                  @click="paymentsPagination.page--; fetchCommittedBoxes()"
                />
                <UButton
                  icon="i-lucide-chevron-right"
                  size="sm"
                  color="neutral"
                  :disabled="paymentsPagination.page === paymentsPagination.totalPages"
                  @click="paymentsPagination.page++; fetchCommittedBoxes()"
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
  { label: 'Completed Payments', value: 1 }
]

// Inventory data
const inventoryItems = ref<any[]>([])
const loadingInventory = ref(true)
const inventorySearch = ref('')
const inventoryPagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0
})

// Completed payments data
const completedPayments = ref<any[]>([])
const loadingPayments = ref(true)
const paymentsSearch = ref('')
const paymentsPagination = ref({
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

    if (inventorySearch.value) {
      params.append('search', inventorySearch.value)
    }

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

function searchInventory() {
  inventoryPagination.value.page = 1
  fetchInventory()
}

async function fetchCommittedBoxes() {
  loadingPayments.value = true

  try {
    const params = new URLSearchParams({
      page: paymentsPagination.value.page.toString(),
      pageSize: paymentsPagination.value.pageSize.toString()
    })

    if (paymentsSearch.value) {
      params.append('search', paymentsSearch.value)
    }

    const response: any = await apiFetch(`/api/reports/completed-payments?${params.toString()}`)

    completedPayments.value = response.data
    paymentsPagination.value = {
      ...paymentsPagination.value,
      total: response.pagination.total,
      totalPages: response.pagination.totalPages
    }
  } catch (err: any) {
    console.error('Error fetching completed payments report:', err)
    showError(err, 'Failed to load completed payments report')
  } finally {
    loadingPayments.value = false
  }
}

function searchPayments() {
  paymentsPagination.value.page = 1
  fetchCommittedBoxes()
}

watch(selectedTab, (newTab) => {
  if (newTab === 0 && inventoryItems.value.length === 0) {
    fetchInventory()
  } else if (newTab === 1 && completedPayments.value.length === 0) {
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
