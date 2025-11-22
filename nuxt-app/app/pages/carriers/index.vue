<template>
  <UContainer class="py-8">
    <div class="max-w-7xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Carriers Management</h1>
        <UButton icon="i-lucide-plus" @click="openCreateDialog">
          Create Carrier
        </UButton>
      </div>

      <UCard>
        <div v-if="loading" class="py-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p class="mt-4 text-gray-600">Loading carriers...</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Weight Coefficient
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="carrier in carriers"
                :key="carrier.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  {{ carrier.name }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ carrier.contact || '-' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ carrier.weight_coefficient || '-' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ formatDate(carrier.created_at) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <div class="flex items-center gap-2">
                    <UButton
                      icon="i-lucide-pencil"
                      size="xs"
                      color="primary"
                      variant="ghost"
                      @click="openEditDialog(carrier)"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      size="xs"
                      color="red"
                      variant="ghost"
                      @click="openDeleteDialog(carrier)"
                    />
                  </div>
                </td>
              </tr>
              <tr v-if="carriers.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                  No carriers found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </UCard>
    </div>

    <!-- Create/Edit Dialog -->
    <CarriersCreateCarrierDialog
      v-model="dialogOpen"
      :carrier="editingCarrier"
      :loading="submitting"
      @submit="handleSubmit"
      @cancel="closeDialog"
    />

    <!-- Delete Confirmation Dialog -->
    <CarriersDeleteCarrierDialog
      v-model="deleteDialogOpen"
      :carrier="deletingCarrier"
      :loading="deleting"
      @delete="handleDelete"
      @cancel="deleteDialogOpen = false"
    />
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const { apiFetch } = useApi()
const { showSuccess, showError } = useNotification()

interface Carrier {
  id: string
  name: string
  contact: string | null
  weight_coefficient: string | null
  created_at: string
  updated_at: string
}

const carriers = ref<Carrier[]>([])
const loading = ref(true)
const dialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const submitting = ref(false)
const deleting = ref(false)
const editingCarrier = ref<Carrier | null>(null)
const deletingCarrier = ref<Carrier | null>(null)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

async function fetchCarriers() {
  loading.value = true

  try {
    const response: any = await apiFetch('/api/carriers')
    carriers.value = response.data
  } catch (err: any) {
    console.error('Error fetching carriers:', err)
    showError(err, 'Failed to load carriers')
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  editingCarrier.value = null
  dialogOpen.value = true
}

function openEditDialog(carrier: Carrier) {
  editingCarrier.value = carrier
  dialogOpen.value = true
}

function openDeleteDialog(carrier: Carrier) {
  deletingCarrier.value = carrier
  deleteDialogOpen.value = true
}

function closeDialog() {
  dialogOpen.value = false
  editingCarrier.value = null
}

async function handleSubmit(data: { name: string; contact: string; weight_coefficient: string }) {
  if (!data.name?.trim()) {
    showError({ statusMessage: 'Please enter carrier name' }, 'Invalid Input')
    return
  }

  submitting.value = true

  try {
    const body = {
      name: data.name,
      contact: data.contact || null,
      weight_coefficient: data.weight_coefficient ? parseFloat(data.weight_coefficient) : null,
    }

    if (editingCarrier.value) {
      // Update
      await apiFetch(`/api/carriers/${editingCarrier.value.id}`, {
        method: 'PATCH',
        body,
      })
      showSuccess('Carrier updated successfully')
    } else {
      // Create
      await apiFetch('/api/carriers', {
        method: 'POST',
        body,
      })
      showSuccess('Carrier created successfully')
    }

    closeDialog()
    await fetchCarriers()
  } catch (err: any) {
    console.error('Error saving carrier:', err)
    showError(err, 'Failed to save carrier')
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!deletingCarrier.value) return

  deleting.value = true

  try {
    await apiFetch(`/api/carriers/${deletingCarrier.value.id}`, {
      method: 'DELETE',
    })

    showSuccess('Carrier deleted successfully')
    deleteDialogOpen.value = false
    deletingCarrier.value = null
    await fetchCarriers()
  } catch (err: any) {
    console.error('Error deleting carrier:', err)
    showError(err, 'Failed to delete carrier')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchCarriers()
})
</script>
