<template>
  <UContainer class="py-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Delivery Management</h1>

      <UTabs v-model="selectedTab" :items="tabs" class="mb-6" />

      <!-- Warehouse Tab -->
      <div v-if="selectedTab === 0">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Change Warehouse</h2>
          </template>

          <div v-if="loadingWarehouses" class="py-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p class="mt-4 text-gray-600">Loading warehouses...</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    No.
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse Name
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="(warehouse, index) in warehouses"
                  :key="warehouse"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ index + 1 }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {{ warehouse }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <UInput
                        v-model="warehouseInputs[warehouse].boxCode"
                        placeholder="Enter box code"
                        :disabled="activeWarehouseId && activeWarehouseId !== warehouse"
                        @focus="handleInputFocus(warehouse)"
                        @blur="handleInputBlur"
                        @keyup.enter="handleChangeWarehouse(warehouse)"
                        class="max-w-xs"
                      />
                      <UInput
                        v-model="warehouseInputs[warehouse].paymentCode"
                        placeholder="Enter payment code"
                        :disabled="activeWarehouseId && activeWarehouseId !== warehouse"
                        @focus="handleInputFocus(warehouse)"
                        @blur="handleInputBlur"
                        @keyup.enter="handleChangeWarehouse(warehouse)"
                        class="max-w-xs"
                      />
                      <UButton
                        icon="i-lucide-arrow-right"
                        color="primary"
                        size="sm"
                        :loading="processingWarehouse === warehouse"
                        :disabled="!warehouseInputs[warehouse]?.boxCode?.trim() || !warehouseInputs[warehouse]?.paymentCode?.trim() || (activeWarehouseId && activeWarehouseId !== warehouse)"
                        @click="handleChangeWarehouse(warehouse)"
                      >
                        Submit
                      </UButton>
                    </div>
                  </td>
                </tr>
                <tr v-if="warehouses.length === 0">
                  <td colspan="3" class="px-4 py-8 text-center text-gray-500">
                    No warehouses found
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </div>

      <!-- Shipment Tab -->
      <div v-if="selectedTab === 1">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Shipment Management</h2>
          </template>

          <div v-if="loadingShipment" class="py-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p class="mt-4 text-gray-600">Loading shipments...</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    No.
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Box Code
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Warehouse
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated At
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="(box, index) in changingBoxes"
                  :key="box.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ index + 1 }}
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
                    <UBadge color="warning" variant="subtle">
                      Changing Warehouse
                    </UBadge>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ formatDateTime(box.updated_at) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <UButton
                      icon="i-lucide-check"
                      color="success"
                      size="sm"
                      :loading="completingBox === box.id"
                      @click="() => handleCompleteWarehouseChange(box)"
                    >
                      Complete
                    </UButton>
                  </td>
                </tr>
                <tr v-if="changingBoxes.length === 0">
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                    No boxes in changing warehouse status
                  </td>
                </tr>
              </tbody>
            </table>
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
const { showSuccess, showError } = useNotification()

const selectedTab = ref(0)
const tabs = [
  { label: 'Warehouse', value: 0 },
  { label: 'Shipment', value: 1 }
]

const warehouses = ref<any[]>([])
const loadingWarehouses = ref(true)
const warehouseInputs = ref<Record<string, { boxCode: string; paymentCode: string }>>({})
const activeWarehouseId = ref<string | null>(null)
const processingWarehouse = ref<string | null>(null)

// Shipment data
const changingBoxes = ref<any[]>([])
const loadingShipment = ref(false)
const completingBox = ref<string | null>(null)

async function fetchWarehouses() {
  loadingWarehouses.value = true

  try {
    const warehouseIds: string[] = await apiFetch('/api/warehouses')

    warehouses.value = warehouseIds
    // Initialize inputs for each warehouse
    warehouseIds.forEach(id => {
      warehouseInputs.value[id] = { boxCode: '', paymentCode: '' }
    })
  } catch (err: any) {
    console.error('Error fetching warehouses:', err)
    showError(err, 'Failed to load warehouses')
  } finally {
    loadingWarehouses.value = false
  }
}

function handleInputFocus(warehouseId: string) {
  if (!activeWarehouseId.value) {
    activeWarehouseId.value = warehouseId
  }
}

function handleInputBlur() {
  // Check if any input has value
  const hasValue = Object.values(warehouseInputs.value).some(v => v.boxCode.trim() || v.paymentCode.trim())
  if (!hasValue) {
    activeWarehouseId.value = null
  }
}

async function handleChangeWarehouse(warehouseId: string) {
  const boxCode = warehouseInputs.value[warehouseId]?.boxCode?.trim()
  const paymentCode = warehouseInputs.value[warehouseId]?.paymentCode?.trim()

  if (!boxCode || !paymentCode) {
    showError({ statusMessage: 'Please enter both box code and payment code' }, 'Invalid Input')
    return
  }

  processingWarehouse.value = warehouseId

  try {
    const result: any = await apiFetch('/api/delivery/change-warehouse', {
      method: 'POST',
      body: {
        boxCode,
        warehouseId,
        paymentCode
      }
    })

    if (result.success) {
      showSuccess(result.message || 'Warehouse changed successfully')
      // Clear input and reset active warehouse
      warehouseInputs.value[warehouseId] = { boxCode: '', paymentCode: '' }
      activeWarehouseId.value = null
    }
  } catch (err: any) {
    console.error('Error changing warehouse:', err)
    showError(err, 'Change Warehouse Failed')
  } finally {
    processingWarehouse.value = null
  }
}

function formatDateTime(date: string) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function fetchChangingBoxes() {
  loadingShipment.value = true

  try {
    const response: any = await apiFetch('/api/delivery/changing-warehouse-boxes')
    changingBoxes.value = response.data
  } catch (err: any) {
    console.error('Error fetching changing boxes:', err)
    showError(err, 'Failed to load changing boxes')
  } finally {
    loadingShipment.value = false
  }
}

async function handleCompleteWarehouseChange(box: any) {
  completingBox.value = box.id

  try {
    const result: any = await apiFetch('/api/delivery/complete-warehouse-change', {
      method: 'POST',
      body: {
        boxId: box.id
      }
    })

    if (result.success) {
      showSuccess(result.message || 'Warehouse change completed successfully')
      await fetchChangingBoxes()
    }
  } catch (err: any) {
    console.error('Error completing warehouse change:', err)
    showError(err, 'Complete Warehouse Change Failed')
  } finally {
    completingBox.value = null
  }
}

watch(selectedTab, (newTab) => {
  if (newTab === 1 && changingBoxes.value.length === 0) {
    fetchChangingBoxes()
  }
})

onMounted(() => {
  fetchWarehouses()
  if (selectedTab.value === 1) {
    fetchChangingBoxes()
  }
})
</script>
