<template>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">Edit Tracking Item</h3>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="close"
          />
        </div>
      </template>

      <div class="space-y-4">
        <!-- Weight -->
        <div>
          <label class="block text-sm font-medium mb-2">Weight (kg)</label>
          <UInput
            v-model="form.weight"
            type="number"
            step="0.01"
            placeholder="Enter weight"
            size="lg"
          />
        </div>

        <!-- Chain Tracking Number -->
        <div>
          <label class="block text-sm font-medium mb-2">
            Add Tracking Item to Chain
          </label>
          <p class="text-xs text-gray-500 mb-2">
            Enter tracking number to add to this chain. Item must be at "Received at Warehouse" status.
          </p>
          <UInput
            v-model="form.chainTrackingNumber"
            placeholder="Enter tracking number"
            size="lg"
          />
        </div>

        <!-- Current Chain Info -->
        <div v-if="trackingItem.chain" class="p-3 bg-gray-100 dark:bg-gray-800 rounded">
          <p class="text-xs text-gray-600 dark:text-gray-400">Current Chain ID:</p>
          <p class="text-sm font-mono">{{ trackingItem.chain }}</p>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            @click="close"
          />
          <UButton
            label="Save"
            color="primary"
            :loading="loading"
            :disabled="loading"
            @click="handleSave"
          />
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
interface Props {
  trackingItem: any
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { apiFetch } = useApi()
const { showSuccess, showError } = useNotification()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = reactive({
  weight: props.trackingItem.weight || '',
  chainTrackingNumber: ''
})

const loading = ref(false)

function close() {
  isOpen.value = false
}

async function handleSave() {
  loading.value = true

  try {
    const payload: any = {
      id: props.trackingItem.id
    }

    // Only include weight if changed
    if (form.weight && form.weight !== props.trackingItem.weight) {
      payload.weight = parseFloat(form.weight)
    }

    // Only include chain tracking number if provided
    if (form.chainTrackingNumber.trim()) {
      payload.chainTrackingNumber = form.chainTrackingNumber.trim()
    }

    await apiFetch('/api/tracking-items/update', {
      method: 'POST',
      body: payload
    })

    showSuccess('Tracking item updated successfully')
    emit('saved')
    close()
  } catch (error: any) {
    showError(error, 'Update Failed')
  } finally {
    loading.value = false
  }
}

// Reset form when modal opens
watch(isOpen, (newValue) => {
  if (newValue) {
    form.weight = props.trackingItem.weight || ''
    form.chainTrackingNumber = ''
  }
})
</script>
