<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        @click.self="handleCancel"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-200"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="isOpen"
            class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ isEdit ? 'Edit Carrier' : 'Create Carrier' }}
              </h3>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                @click="handleCancel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="p-4 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Enter carrier name"
                  :disabled="loading"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact
                </label>
                <input
                  v-model="form.contact"
                  type="text"
                  placeholder="Enter contact information"
                  :disabled="loading"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight Coefficient
                </label>
                <input
                  v-model="form.weight_coefficient"
                  type="number"
                  step="0.01"
                  placeholder="Enter weight coefficient"
                  :disabled="loading"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="loading"
                @click="handleCancel"
              >
                Cancel
              </button>
              <button
                type="button"
                :class="[
                  'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors bg-blue-600 hover:bg-blue-700',
                  (loading || !form.name?.trim()) && 'opacity-50 cursor-not-allowed'
                ]"
                :disabled="loading || !form.name?.trim()"
                @click="handleSubmit"
              >
                <span v-if="loading" class="inline-flex items-center gap-2">
                  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ isEdit ? 'Updating...' : 'Creating...' }}
                </span>
                <span v-else>{{ isEdit ? 'Update' : 'Create' }}</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  carrier?: any
  loading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', data: { name: string; contact: string; weight_coefficient: string }): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  carrier: null,
  loading: false
})

const emit = defineEmits<Emits>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEdit = computed(() => !!props.carrier)

const form = ref({
  name: '',
  contact: '',
  weight_coefficient: '',
})

function handleSubmit() {
  if (!form.value.name?.trim()) {
    return
  }

  emit('submit', {
    name: form.value.name.trim(),
    contact: form.value.contact.trim(),
    weight_coefficient: form.value.weight_coefficient,
  })
}

function handleCancel() {
  emit('cancel')
  isOpen.value = false
}

// Reset/populate form when carrier changes
watch(() => props.carrier, (newCarrier) => {
  if (newCarrier) {
    form.value = {
      name: newCarrier.name || '',
      contact: newCarrier.contact || '',
      weight_coefficient: newCarrier.weight_coefficient || '',
    }
  } else {
    form.value = {
      name: '',
      contact: '',
      weight_coefficient: '',
    }
  }
}, { immediate: true })

// Reset form when dialog opens/closes
watch(isOpen, (newValue) => {
  if (!newValue && !props.carrier) {
    form.value = {
      name: '',
      contact: '',
      weight_coefficient: '',
    }
  }
})

// Prevent body scroll when dialog is open
watch(isOpen, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>
