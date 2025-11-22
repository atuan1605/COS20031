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
                  :key="warehouse.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ index + 1 }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    {{ warehouse.address }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <UInput
                        v-model="warehouseInputs[warehouse.id]"
                        placeholder="Enter box code"
                        :disabled="activeWarehouseId && activeWarehouseId !== warehouse.id"
                        @focus="handleInputFocus(warehouse.id)"
                        @blur="handleInputBlur"
                        @keyup.enter="handleChangeWarehouse(warehouse.id)"
                        class="max-w-xs"
                      />
                      <UButton
                        icon="i-lucide-arrow-right"
                        color="primary"
                        size="sm"
                        :loading="processingWarehouse === warehouse.id"
                        :disabled="!warehouseInputs[warehouse.id]?.trim() || (activeWarehouseId && activeWarehouseId !== warehouse.id)"
                        @click="handleChangeWarehouse(warehouse.id)"
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

          <div class="py-8 text-center text-gray-500">
            Coming soon...
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
const warehouseInputs = ref<Record<string, string>>({})
const activeWarehouseId = ref<string | null>(null)
const processingWarehouse = ref<string | null>(null)

async function fetchWarehouses() {
  loadingWarehouses.value = true

  try {
    const result: any = await apiFetch('/api/warehouses?listAll=true')

    if (result.success) {
      warehouses.value = result.data
      // Initialize inputs for each warehouse
      warehouses.value.forEach(w => {
        warehouseInputs.value[w.id] = ''
      })
    }
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
  const hasValue = Object.values(warehouseInputs.value).some(v => v.trim())
  if (!hasValue) {
    activeWarehouseId.value = null
  }
}

async function handleChangeWarehouse(warehouseId: string) {
  const boxCode = warehouseInputs.value[warehouseId]?.trim()
  
  if (!boxCode) {
    showError({ statusMessage: 'Please enter a box code' }, 'Invalid Input')
    return
  }

  processingWarehouse.value = warehouseId

  try {
    const result: any = await apiFetch('/api/delivery/change-warehouse', {
      method: 'POST',
      body: {
        boxCode,
        warehouseId
      }
    })

    if (result.success) {
      showSuccess(result.message || 'Warehouse changed successfully')
      // Clear input and reset active warehouse
      warehouseInputs.value[warehouseId] = ''
      activeWarehouseId.value = null
    }
  } catch (err: any) {
    console.error('Error changing warehouse:', err)
    showError(err, 'Change Warehouse Failed')
  } finally {
    processingWarehouse.value = null
  }
}

onMounted(() => {
  fetchWarehouses()
})
</script>
