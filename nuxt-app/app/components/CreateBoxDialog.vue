<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="close" />

        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Box
            </h3>
            <button
              @click="close"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Box Code
                </label>
                <input
                  v-model="formData.code"
                  type="text"
                  placeholder="Enter box code"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  :disabled="loading"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Warehouse
                </label>
                <select
                  v-model="formData.warehouseId"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  :disabled="loading || loadingWarehouses"
                >
                  <option value="">Select warehouse</option>
                  <option v-for="warehouse in warehouses" :key="warehouse" :value="warehouse">
                    {{ warehouse }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
            <button
              @click="close"
              :disabled="loading"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              @click="handleConfirm"
              :disabled="loading || !formData.code.trim() || !formData.warehouseId"
              class="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg v-if="loading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {{ loading ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [data: { code: string; warehouseId: string }]
}>()

const { apiFetch } = useApi()

const loading = ref(false)
const loadingWarehouses = ref(false)
const warehouses = ref<string[]>([])
const formData = reactive({
  code: '',
  warehouseId: ''
})

async function fetchWarehouses() {
  loadingWarehouses.value = true
  try {
    const warehouseIds: string[] = await apiFetch('/api/warehouses')
    warehouses.value = warehouseIds
  } catch (error) {
    console.error('Error fetching warehouses:', error)
  } finally {
    loadingWarehouses.value = false
  }
}

function close() {
  if (loading.value) return
  emit('update:modelValue', false)
  // Reset form after animation
  setTimeout(() => {
    formData.code = ''
    formData.warehouseId = ''
  }, 300)
}

async function handleConfirm() {
  if (!formData.code.trim() || !formData.warehouseId || loading.value) return

  loading.value = true
  try {
    await emit('confirm', {
      code: formData.code.trim(),
      warehouseId: formData.warehouseId
    })
    close()
  } catch (error) {
    // Error handled by parent
  } finally {
    loading.value = false
  }
}

// Fetch warehouses when dialog opens
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && warehouses.value.length === 0) {
    fetchWarehouses()
  }
})

// Handle Escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.modelValue) {
      close()
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
  opacity: 0;
}
</style>
