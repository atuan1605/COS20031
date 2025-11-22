<template>
  <UContainer class="py-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Delivery Management</h1>
      <UTabs v-model="selectedTab" :items="tabs" class="mb-6" />

      <!-- Deliver to Customer Tab -->
      <div v-if="selectedTab === 0">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Deliver to Customer</h2>
          </template>
          <div v-if="loadingChanged" class="py-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p class="mt-4 text-gray-600">Loading boxes...</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">No.</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box Code</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="(box, index) in changedBoxes" :key="box.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-4 py-3 whitespace-nowrap text-sm">{{ index + 1 }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <NuxtLink :to="`/boxes/${box.id}`" class="text-blue-600 hover:underline">{{ box.code }}</NuxtLink>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">{{ box.warehouse_id || 'N/A' }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <UBadge color="primary" variant="subtle">Changed Warehouse</UBadge>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatDateTime(box.updated_at) }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <UButton icon="i-lucide-truck" color="success" size="sm" :loading="deliveringBox === box.id" @click="() => openDeliverDialog(box)">
                      Deliver to Customer
                    </UButton>
                  </td>
                </tr>
                <tr v-if="changedBoxes.length === 0">
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500">Box not found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
        <ConfirmDialog
          v-model="showDeliverDialog"
          title="Deliver to Customer"
          :message="`Enter payment code to deliver box ${selectedBox?.code}`"
          confirm-text="Deliver"
          confirm-color="success"
          :loading="deliveringBox !== null"
          require-input
          input-placeholder="Payment code"
          @confirm="handleDeliverBox"
          @cancel="closeDeliverDialog"
        />
      </div>

      <!-- Complete Box Tab -->
      <div v-if="selectedTab === 1">
        <UCard>
          <template #header>
            <h2 class="text-lg font-semibold">Complete Box</h2>
          </template>
          <div v-if="loadingDelivering" class="py-8 text-center">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p class="mt-4 text-gray-600">Loading boxes...</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">No.</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Box Code</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="(box, index) in deliveringBoxes" :key="box.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td class="px-4 py-3 whitespace-nowrap text-sm">{{ index + 1 }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <NuxtLink :to="`/boxes/${box.id}`" class="text-blue-600 hover:underline">{{ box.code }}</NuxtLink>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">{{ box.warehouse_id || 'N/A' }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <UBadge color="success" variant="subtle">Delivering</UBadge>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatDateTime(box.updated_at) }}</td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <UButton icon="i-lucide-check" color="primary" size="sm" :loading="completingBox === box.id" @click="() => handleCompleteBox(box)">
                      Complete
                    </UButton>
                  </td>
                </tr>
                <tr v-if="deliveringBoxes.length === 0">
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500">No boxes in delivering status</td>
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
  { label: 'Deliver to Customer', value: 0 },
  { label: 'Complete Box', value: 1 }
]

const changedBoxes = ref<any[]>([])
const loadingChanged = ref(false)
const deliveringBoxes = ref<any[]>([])
const loadingDelivering = ref(false)
const deliveringBox = ref<string | null>(null)
const completingBox = ref<string | null>(null)
const showDeliverDialog = ref(false)
const selectedBox = ref<any>(null)

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

async function fetchChangedBoxes() {
  loadingChanged.value = true
  try {
    const response: any = await apiFetch('/api/delivery/delivering-boxes?tab=deliver')
    changedBoxes.value = response.data
  } catch (err: any) {
    showError(err, 'Failed to load boxes')
  } finally {
    loadingChanged.value = false
  }
}

async function fetchDeliveringBoxes() {
  loadingDelivering.value = true
  try {
    const response: any = await apiFetch('/api/delivery/delivering-boxes?tab=complete')
    deliveringBoxes.value = response.data
  } catch (err: any) {
    showError(err, 'Failed to load delivering boxes')
  } finally {
    loadingDelivering.value = false
  }
}

function openDeliverDialog(box: any) {
  selectedBox.value = box
  showDeliverDialog.value = true
}

function closeDeliverDialog() {
  selectedBox.value = null
  showDeliverDialog.value = false
}

async function handleDeliverBox(paymentCode: string) {
  if (!selectedBox.value || !paymentCode?.trim()) return
  deliveringBox.value = selectedBox.value.id
  try {
    const result: any = await apiFetch('/api/delivery/deliver-box', {
      method: 'POST',
      body: {
        boxId: selectedBox.value.id,
        paymentCode: paymentCode.trim()
      }
    })
    if (result.success) {
      showSuccess(result.message || 'Box delivered to customer')
      await fetchChangedBoxes()
      await fetchDeliveringBoxes()
      closeDeliverDialog()
    }
  } catch (err: any) {
    showError(err, 'Deliver Box Failed')
  } finally {
    deliveringBox.value = null
  }
}

async function handleCompleteBox(box: any) {
  completingBox.value = box.id
  try {
    const result: any = await apiFetch('/api/delivery/complete-box', {
      method: 'POST',
      body: {
        boxId: box.id
      }
    })
    if (result.success) {
      showSuccess(result.message || 'Box completed')
      await fetchDeliveringBoxes()
      await fetchChangedBoxes()
    }
  } catch (err: any) {
    showError(err, 'Complete Box Failed')
  } finally {
    completingBox.value = null
  }
}

watch(selectedTab, (newTab) => {
  if (newTab === 0) fetchChangedBoxes()
  if (newTab === 1) fetchDeliveringBoxes()
})

onMounted(() => {
  fetchChangedBoxes()
})
</script>
