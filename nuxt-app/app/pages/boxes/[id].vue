<template>
  <UContainer class="py-8">
    <div class="max-w-7xl mx-auto">
      <!-- Loading State -->
      <div v-if="loading" class="py-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p class="mt-4 text-gray-600">Loading...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="py-12">
        <UAlert
          color="error"
          variant="soft"
          :title="error"
          icon="i-lucide-alert-circle"
        />
      </div>

      <!-- Box Details -->
      <div v-else-if="box">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              @click="$router.back()"
            />
            <div>
              <h1 class="text-2xl font-bold">Box: {{ box.code }}</h1>
              <p class="text-sm text-gray-500">Created {{ formatDateTime(box.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Add Tracking Item -->
        <UCard class="mb-6">
          <template #header>
            <h3 class="text-lg font-semibold">Add Tracking Item</h3>
          </template>

          <div class="flex gap-4">
            <UInput
              v-model="trackingNumberInput"
              placeholder="Enter tracking number"
              icon="i-lucide-search"
              class="flex-1"
              @keyup.enter="handleAddTracking"
            />
            <UButton
              icon="i-lucide-plus"
              color="primary"
              :loading="adding"
              :disabled="!trackingNumberInput.trim()"
              @click="handleAddTracking"
            >
              Add to Box
            </UButton>
          </div>
          <p class="text-xs text-gray-500 mt-2">
            Note: Only tracking items with status 'Packing' or 'Received at Warehouse' can be added. If the tracking is in a chain, all items in that chain will be added.
          </p>
        </UCard>

        <!-- Tracking Items Table -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                Tracking Items ({{ box.trackingItems?.length || 0 }})
              </h3>
              <div class="text-sm text-gray-600">
                Total Weight: <span class="font-semibold">{{ totalWeight }} kg</span>
              </div>
            </div>
          </template>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chain
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                <tr
                  v-for="item in box.trackingItems"
                  :key="item.id"
                  class="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ formatDateTime(item.created_at) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap">
                    <NuxtLink
                      :to="`/tracking-items/${item.id}`"
                      class="text-sm font-medium text-primary-500 hover:text-primary-600"
                    >
                      {{ item.tracking_number }}
                    </NuxtLink>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    {{ item.weight ? `${item.weight} kg` : 'N/A' }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <UBadge v-if="item.chain" color="primary" size="sm">
                      {{ item.chain.substring(0, 8) }}...
                    </UBadge>
                    <span v-else class="text-gray-400">-</span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm">
                    <UButton
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="ghost"
                      size="xs"
                      @click="confirmRemoveTracking(item)"
                    />
                  </td>
                </tr>
                <tr v-if="!box.trackingItems || box.trackingItems.length === 0">
                  <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                    No tracking items in this box yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>

  <!-- Confirm Remove Dialog -->
  <ConfirmDialog
    v-model="showRemoveDialog"
    title="Remove Tracking from Box"
    :message="`Are you sure you want to remove ${itemToRemove?.tracking_number} from this box? The item will be reverted to its previous status.`"
    confirm-text="Remove"
    cancel-text="Cancel"
    confirm-color="error"
    :loading="removing"
    @confirm="handleRemoveTracking"
    @cancel="cancelRemoveTracking"
  />
</template>

<script setup lang="ts">
import { formatDateTime } from '~/utils/dateFormatter'

definePageMeta({
  middleware: ['auth']
})

const { apiFetch } = useApi()
const { showSuccess, showError } = useNotification()
const route = useRoute()

const box = ref<any>(null)
const loading = ref(true)
const error = ref('')
const trackingNumberInput = ref('')
const adding = ref(false)
const showRemoveDialog = ref(false)
const itemToRemove = ref<any>(null)
const removing = ref(false)

const id = computed(() => route.params.id as string)

const totalWeight = computed(() => {
  if (!box.value?.trackingItems) return '0.00'

  const total = box.value.trackingItems.reduce((sum: number, item: any) => {
    const weight = parseFloat(item.weight) || 0
    return sum + weight
  }, 0)

  return total.toFixed(2)
})

async function fetchBox() {
  loading.value = true
  error.value = ''

  try {
    const result: any = await apiFetch(`/api/boxes/${id.value}`)

    if (result.success) {
      box.value = result.data
    } else {
      error.value = 'Failed to load box details'
    }
  } catch (err: any) {
    console.error('Error fetching box:', err)
    error.value = err.statusMessage || 'Failed to load box details'
  } finally {
    loading.value = false
  }
}

async function handleAddTracking() {
  if (!trackingNumberInput.value.trim()) return

  adding.value = true

  try {
    const result: any = await apiFetch(`/api/boxes/${id.value}/add-tracking`, {
      method: 'POST',
      body: {
        trackingNumber: trackingNumberInput.value.trim()
      }
    })

    if (result.success) {
      showSuccess(result.message || 'Tracking item added successfully')
      trackingNumberInput.value = ''
      await fetchBox()
    }
  } catch (err: any) {
    console.error('Error adding tracking item:', err)
    showError(err, 'Add Failed')
  } finally {
    adding.value = false
  }
}

function confirmRemoveTracking(item: any) {
  itemToRemove.value = item
  showRemoveDialog.value = true
}

function cancelRemoveTracking() {
  itemToRemove.value = null
  showRemoveDialog.value = false
}

async function handleRemoveTracking() {
  if (!itemToRemove.value) return

  removing.value = true

  try {
    const result: any = await apiFetch(`/api/boxes/${id.value}/remove-tracking`, {
      method: 'POST',
      body: {
        trackingItemId: itemToRemove.value.id
      }
    })

    if (result.success) {
      showSuccess(result.message || 'Tracking item removed successfully')
      await fetchBox()
      showRemoveDialog.value = false
      itemToRemove.value = null
    }
  } catch (err: any) {
    console.error('Error removing tracking item:', err)
    showError(err, 'Remove Failed')
  } finally {
    removing.value = false
  }
}

onMounted(() => {
  fetchBox()
})
</script>
