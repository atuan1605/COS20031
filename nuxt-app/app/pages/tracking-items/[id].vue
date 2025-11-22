<template>
  <UContainer class="py-8">
    <div class="max-w-6xl mx-auto">
      <div v-if="loading" class="py-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p class="mt-4 text-gray-600">Loading...</p>
      </div>

      <div v-else-if="error" class="py-12">
        <UAlert
          color="error"
          variant="soft"
          :title="error"
          icon="i-lucide-alert-circle"
        />
      </div>

      <div v-else-if="trackingItem" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Left Column - Tracking Details -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold">Tracking Details</h2>
              <UButton
                icon="i-lucide-arrow-left"
                color="neutral"
                variant="ghost"
                @click="$router.back()"
                size="sm"
              >
                Back
              </UButton>
            </div>
          </template>

          <div class="space-y-4">
            <!-- Tracking Number -->
            <div class="pb-3 border-b">
              <p class="text-xs text-gray-500 mb-1">Tracking Number:</p>
              <p class="text-lg font-bold">{{ trackingItem.tracking_number }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ getStatusBadgeText(currentStatus) }}</p>
            </div>

            <!-- Status -->
            <div class="flex items-center justify-between py-2 border-b">
              <span class="text-sm font-medium">Status:</span>
              <UBadge :color="getStatusColor(currentStatus)" size="lg">
                {{ getStatusLabel(currentStatus) }}
              </UBadge>
            </div>

            <!-- Warehouse -->
            <div class="flex items-center justify-between py-2 border-b">
              <span class="text-sm font-medium">Warehouse:</span>
              <span class="text-sm">{{ trackingItem.warehouse_id || 'N/A' }}</span>
            </div>

            <!-- Weight -->
            <div class="flex items-center justify-between py-2 border-b">
              <span class="text-sm font-medium">Weight:</span>
              <span class="text-sm">{{ trackingItem.weight || 'N/A' }}</span>
            </div>

            <!-- Fragile -->
            <div class="flex items-center justify-between py-2 border-b">
              <span class="text-sm font-medium">Fragile:</span>
              <UBadge :color="trackingItem.is_fragile_item ? 'warning' : 'neutral'">
                {{ trackingItem.is_fragile_item ? 'Yes' : 'No' }}
              </UBadge>
            </div>

            <!-- Last updated -->
            <div class="flex items-center justify-between py-2">
              <span class="text-sm font-medium">Last updated at:</span>
              <span class="text-sm">{{ formatDateTime(statusUpdatedAt) }}</span>
            </div>
          </div>
        </UCard>

        <!-- Edit Section Card -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Edit Information</h3>
          </template>

          <div class="space-y-4">
            <!-- Weight -->
            <div>
              <label class="block text-sm font-medium mb-2">Weight (kg)</label>
              <UInput
                v-model="editForm.weight"
                type="number"
                step="0.01"
                placeholder="Enter weight"
                size="lg"
                :disabled="!canEditWeight"
                @keyup.enter="handleWeightUpdate"
              />
              <p class="text-xs text-gray-500 mt-1" v-if="canEditWeight">Press Enter to save</p>
              <p class="text-xs text-gray-400 mt-1" v-else>Can only edit weight when status is Packing or Received at Warehouse</p>
            </div>

            <!-- Amount -->
            <div>
              <label class="block text-sm font-medium mb-2">Amount</label>
              <UInput
                v-model="editForm.amount"
                type="number"
                step="0.01"
                placeholder="Enter amount"
                size="lg"
                :disabled="!canEditWeight"
                @keyup.enter="handleAmountUpdate"
              />
              <p class="text-xs text-gray-500 mt-1" v-if="canEditWeight">Press Enter to save</p>
              <p class="text-xs text-gray-400 mt-1" v-else>Can only edit amount when status is Packing or Received at Warehouse</p>
            </div>

            <!-- Chain Tracking Number -->
            <div>
              <label class="block text-sm font-medium mb-2">
                Add Tracking to Chain
              </label>
              <p class="text-xs text-gray-500 mb-2">
                Enter tracking number to add to this chain. Item must be at "Received at Warehouse" status only.
              </p>
              <UInput
                v-model="editForm.chainTrackingNumber"
                placeholder="Enter tracking number"
                size="lg"
                :disabled="currentStatus !== 'receivedAtWarehouse'"
                @keyup.enter="handleChainUpdate"
              />
              <p class="text-xs text-gray-500 mt-1" v-if="currentStatus === 'receivedAtWarehouse'">Press Enter to add</p>
              <p class="text-xs text-gray-400 mt-1" v-else>Can only add to chain when status is Received at Warehouse</p>
            </div>

            <!-- Chain Items List -->
            <div v-if="chainItems.length > 0" class="p-3 bg-gray-100 dark:bg-gray-800 rounded">
              <p class="text-sm font-medium mb-2">Tracking Items in Chain:</p>
              <div class="space-y-2">
                <div
                  v-for="item in chainItems"
                  :key="item.id"
                  class="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded text-sm"
                >
                  <div class="flex items-center gap-2 flex-1">
                    <span class="font-mono">{{ item.tracking_number }}</span>
                    <span class="text-gray-600">{{ item.weight ? `${item.weight} kg` : 'N/A' }}</span>
                  </div>
                  <UButton
                    icon="i-lucide-trash-2"
                    color="error"
                    variant="ghost"
                    size="xs"
                    @click="confirmRemoveFromChain(item)"
                  />
                </div>
              </div>
            </div>
            <div v-else-if="trackingItem.chain" class="p-3 bg-gray-100 dark:bg-gray-800 rounded">
              <p class="text-sm text-gray-600">This tracking is in a chain but has no other items yet</p>
            </div>

            <!-- Save Status -->
            <div v-if="saveStatus" class="text-sm" :class="saveStatus === 'saving' ? 'text-gray-500' : saveStatus === 'saved' ? 'text-green-600' : 'text-red-600'">
              {{ saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved successfully' : 'Tracking item not found' }}
            </div>
          </div>
        </UCard>

        <!-- Action History Card -->
        <TrackingItemActionHistory :actions="actionHistory" />

        <!-- Right Column - Timeline -->
        <div class="space-y-6">
          <!-- Timeline Card -->
          <TrackingItemTimeline :items="timelineItems" />
        </div>
      </div>
    </div>
  </UContainer>

  <!-- Confirm Remove Dialog -->
  <ConfirmDialog
    v-model="showRemoveDialog"
    title="Remove from Chain"
    :message="`Are you sure you want to remove ${itemToRemove?.tracking_number} from the chain? The item will be reverted to 'Received at Warehouse' status.`"
    confirm-text="Remove"
    cancel-text="Cancel"
    confirm-color="error"
    :loading="removeLoading"
    @confirm="handleRemoveFromChain"
    @cancel="cancelRemoveFromChain"
  />
</template>

<script setup lang="ts">
import { formatDateTime, formatTime } from '~/utils/dateFormatter'
import { getStatusLabel, getStatusColor, getStatusBadgeText, getCurrentStatus, getStatusUpdatedAt } from '~/utils/trackingItemStatus'

definePageMeta({
  middleware: ['auth']
})

const { apiFetch } = useApi()

const route = useRoute()
const trackingItem = ref<any>({})
const loading = ref(true)
const error = ref('')
const saveStatus = ref<'saving' | 'saved' | 'error' | null>(null)
const chainItems = ref<any[]>([])
const showRemoveDialog = ref(false)
const itemToRemove = ref<any>(null)
const removeLoading = ref(false)
const editForm = reactive({
  weight: '',
  amount: '',
  chainTrackingNumber: ''
})

const { showSuccess, showError } = useNotification()

const id = computed(() => route.params.id)

const currentStatus = computed(() => getCurrentStatus(trackingItem.value))

const canEditWeight = computed(() => {
  return currentStatus.value === 'packing' || currentStatus.value === 'receivedAtWarehouse'
})

const statusUpdatedAt = computed(() =>
  getStatusUpdatedAt(trackingItem.value, currentStatus.value)
)

const timelineItems = computed(() => {
  const item = trackingItem.value
  if (!item) return []

  return [
    {
      label: 'Received at Warehouse',
      date: formatDateTime(item.received_at_warehouse_at) || 'N/A',
      completed: !!item.received_at_warehouse_at,
      colorClasses: {
        bg: 'bg-blue-500',
        border: 'border-blue-500',
        line: 'bg-blue-400',
        text: 'text-blue-700 dark:text-blue-400'
      }
    },
    {
      label: 'Packing',
      date: formatDateTime(item.packing_at) || 'N/A',
      completed: !!item.packing_at,
      colorClasses: {
        bg: 'bg-amber-500',
        border: 'border-amber-500',
        line: 'bg-amber-400',
        text: 'text-amber-700 dark:text-amber-400'
      }
    },
    {
      label: 'Boxed',
      date: formatDateTime(item.boxed_at) || 'N/A',
      completed: !!item.boxed_at,
      colorClasses: {
        bg: 'bg-purple-500',
        border: 'border-purple-500',
        line: 'bg-purple-400',
        text: 'text-purple-700 dark:text-purple-400'
      }
    },
    {
      label: 'Changing Warehouse',
      date: formatDateTime(item.changing_warehouse_at) || 'N/A',
      completed: !!item.changing_warehouse_at,
      colorClasses: {
        bg: 'bg-orange-500',
        border: 'border-orange-500',
        line: 'bg-orange-400',
        text: 'text-orange-700 dark:text-orange-400'
      }
    },
    {
      label: 'Changed Warehouse',
      date: formatDateTime(item.changed_warehouse_at) || 'N/A',
      completed: !!item.changed_warehouse_at,
      colorClasses: {
        bg: 'bg-cyan-500',
        border: 'border-cyan-500',
        line: 'bg-cyan-400',
        text: 'text-cyan-700 dark:text-cyan-400'
      }
    },
    {
      label: 'Delivering',
      date: formatDateTime(item.delivering_at) || 'N/A',
      completed: !!item.delivering_at,
      colorClasses: {
        bg: 'bg-indigo-500',
        border: 'border-indigo-500',
        line: 'bg-indigo-400',
        text: 'text-indigo-700 dark:text-indigo-400'
      }
    },
    {
      label: 'Delivered',
      date: formatDateTime(item.delivered_at) || 'N/A',
      completed: !!item.delivered_at,
      colorClasses: {
        bg: 'bg-green-500',
        border: 'border-green-500',
        line: 'bg-green-400',
        text: 'text-green-700 dark:text-green-400'
      }
    }
  ]
})

const actionHistory = computed(() => {
  const item = trackingItem.value
  if (!item || !item.actionLogs) return []

  // Group by action and relevant identifier (boxId for box actions)
  const groupedLogs = new Map<string, any>()

  item.actionLogs.forEach((log: any) => {
    const type = log.type
    let groupKey = type.action

    // For box-related actions, group by boxId to avoid duplicates
    if (type.action === 'boxed' || type.action === 'removeFromBox') {
      groupKey = `${type.action}_${type.boxId}`
    }

    // Keep only the most recent log for each group
    const existing = groupedLogs.get(groupKey)
    if (!existing || new Date(log.created_at) > new Date(existing.created_at)) {
      groupedLogs.set(groupKey, log)
    }
  })

  // Convert grouped logs to action history format
  return Array.from(groupedLogs.values()).map((log: any) => {
    const type = log.type
    const username = log.username || 'Unknown'
    const carrierName = log.carrier_name || log.carrierName || ''
    const time = formatDateTime(log.created_at)
    const createdAt = log.created_at

    let title = ''
    let description = ''

    switch (type.action) {
      case 'statusChange':
        title = `Status updated to ${getStatusLabel(type.toStatus)}`
        description = `By ${username}`
        break

      case 'updateWeight':
        title = 'Weight updated'
        description = `${type.oldWeight || 'N/A'} kg → ${type.newWeight} kg by ${username}`
        break

      case 'updateTrackingItem':
        if (type.updates?.weight !== undefined) {
          title = 'Weight updated'
          description = `Updated to ${type.updates.weight} kg by ${username}`
        } else {
          title = 'Tracking item updated'
          description = `By ${username}`
        }
        break

      case 'addToChain':
        title = 'Added to chain'
        description = `Tracking ${type.trackingNumber} added to chain by ${username}`
        break

      case 'removeFromChain':
        title = 'Removed from chain'
        description = `By ${username}`
        break

      case 'boxed':
        title = 'Added to box'
        description = `Box ${type.boxCode || type.boxId} by ${username}`
        break

      case 'removeFromBox':
        title = 'Removed from box'
        description = `Box ${type.boxCode || type.boxId} by ${username}`
        break

      case 'changingWarehouse':
        title = 'Changing warehouse'
        description = `From ${type.oldWarehouseId || 'N/A'} to ${type.newWarehouseId || 'N/A'} by ${username}${carrierName ? `, Carrier: ${carrierName}` : ''}`
        break

      case 'delivering':
        title = 'Delivering to customer'
        description = `By ${username}${carrierName ? `, Carrier: ${carrierName}` : ''}`
        break

      case 'changedWarehouse':
        title = 'Changed warehouse'
        description = `By ${username}${carrierName ? `, Carrier: ${carrierName}` : ''}`
        break

      default:
        title = type.action
        description = `By ${username}${carrierName ? `, Carrier: ${carrierName}` : ''}`
    }

    return {
      title,
      description,
      time,
      createdAt,
      isError: false
    }
  }).sort((a, b) => {
    // Sort by createdAt descending (most recent first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})

async function fetchTrackingItem() {
  loading.value = true
  error.value = ''

  try {
    const result: any = await apiFetch(`/api/tracking-items/id/${id.value}`)

    if (result.success && result.data) {
      trackingItem.value = result.data
      editForm.weight = result.data.weight || ''
      editForm.amount = result.data.amount || ''
      editForm.chainTrackingNumber = ''

      // Fetch chain items if this item has a chain
      if (result.data.chain) {
        await fetchChainItems(result.data.chain)
      } else {
        chainItems.value = []
      }
    } else {
      error.value = 'Tracking item not found'
    }
  } catch (err: any) {
    console.error('Error fetching tracking item:', err)
    error.value = err.statusMessage || 'Failed to load tracking item'
  } finally {
    loading.value = false
  }
}

async function fetchChainItems(chainId: string) {
  try {
    const result: any = await apiFetch(`/api/tracking-items/chain/${chainId}`)
    if (result.success && result.data) {
      chainItems.value = result.data
    }
  } catch (err: any) {
    console.error('Error fetching chain items:', err)
  }
}

async function saveChanges(updates: { weight?: number; amount?: number }) {
  saveStatus.value = 'saving'

  try {
    const payload: any = {
      id: trackingItem.value.id,
      ...updates
    }

    await apiFetch('/api/tracking-items/update', {
      method: 'PATCH',
      body: payload
    })

    saveStatus.value = 'saved'

    // Reload tracking item data
    await fetchTrackingItem()

    // Clear saved status after 2 seconds
    setTimeout(() => {
      saveStatus.value = null
    }, 2000)
  } catch (err: any) {
    console.error('Error saving changes:', err)
    saveStatus.value = 'error'

    // Clear error status after 3 seconds
    setTimeout(() => {
      saveStatus.value = null
    }, 3000)
  }
}

onMounted(async () => {
  await fetchTrackingItem()
})

async function handleWeightUpdate() {
  if (!trackingItem.value.id) return
  if (!canEditWeight.value) return

  const numWeight = parseFloat(editForm.weight)
  if (isNaN(numWeight) || numWeight === trackingItem.value.weight) return

  await saveChanges({ weight: numWeight })
}

async function handleAmountUpdate() {
  if (!trackingItem.value.id) return
  if (!canEditWeight.value) return

  const numAmount = parseFloat(editForm.amount)
  if (isNaN(numAmount) || numAmount === trackingItem.value.amount) return

  await saveChanges({ amount: numAmount })
}

async function handleChainUpdate() {
  if (!trackingItem.value.id || !editForm.chainTrackingNumber.trim()) return
  if (currentStatus.value !== 'receivedAtWarehouse') return

  saveStatus.value = 'saving'

  try {
    await apiFetch('/api/tracking-items/add-chain', {
      method: 'POST',
      body: {
        trackingNumbers: [trackingItem.value.tracking_number, editForm.chainTrackingNumber.trim()],
        chainId: trackingItem.value.chain || undefined
      }
    })

    saveStatus.value = 'saved'
    editForm.chainTrackingNumber = '' // Clear after save

    // Reload tracking item data
    await fetchTrackingItem()

    setTimeout(() => {
      saveStatus.value = null
    }, 2000)
  } catch (err: any) {
    console.error('Error adding to chain:', err)
    saveStatus.value = 'error'
    showError(err, 'Add to Chain Failed')

    setTimeout(() => {
      saveStatus.value = null
    }, 3000)
  }
}

function confirmRemoveFromChain(item: any) {
  itemToRemove.value = item
  showRemoveDialog.value = true
}

function cancelRemoveFromChain() {
  itemToRemove.value = null
  showRemoveDialog.value = false
}

async function handleRemoveFromChain() {
  if (!itemToRemove.value) return

  removeLoading.value = true

  try {
    await apiFetch('/api/tracking-items/remove-from-chain', {
      method: 'PATCH',
      body: { id: itemToRemove.value.id }
    })

    showSuccess('Item removed from chain successfully')

    // Reload tracking item data
    await fetchTrackingItem()

    // Close dialog
    showRemoveDialog.value = false
    itemToRemove.value = null
  } catch (err: any) {
    console.error('Error removing from chain:', err)
    showError(err, 'Remove Failed')
  } finally {
    removeLoading.value = false
  }
}
</script>
