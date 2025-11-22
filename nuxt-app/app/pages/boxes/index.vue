<template>
  <UContainer class="py-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Box Management</h1>
        <UButton
          icon="i-lucide-plus"
          color="primary"
          size="lg"
          @click="showCreateDialog = true"
        >
          Create Box
        </UButton>
      </div>

      <!-- Filters -->
      <UCard class="mb-6">
        <div class="flex gap-4">
          <UInput
            v-model="searchQuery"
            placeholder="Search box name..."
            icon="i-lucide-search"
            class="flex-1"
          />
          <UButton
            icon="i-lucide-rotate-cw"
            color="neutral"
            variant="outline"
            @click="resetFilters"
          >
            Reset
          </UButton>
          <UButton
            icon="i-lucide-filter"
            color="neutral"
            variant="solid"
            @click="applyFilters"
          >
            Search
          </UButton>
        </div>
      </UCard>

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

      <!-- Boxes Table -->
      <UCard v-else>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Box Name
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warehouse
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tracking Count
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Weight
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="box in boxes"
                :key="box.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ formatDateTime(box.created_at) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="text-sm font-medium">{{ box.code }}</span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ box.warehouse_id || 'N/A' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ box.tracking_count || 0 }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  {{ box.total_weight ? `${box.total_weight} kg` : 'N/A' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <UBadge
                    v-if="getBoxStatus(box) === 'empty'"
                    color="neutral"
                    variant="subtle"
                  >
                    Empty
                  </UBadge>
                  <UBadge
                    v-else-if="getBoxStatus(box) === 'ready'"
                    color="primary"
                    variant="subtle"
                  >
                    Ready to Delivery
                  </UBadge>
                  <UBadge
                    v-else-if="getBoxStatus(box) === 'delivery'"
                    color="success"
                    variant="subtle"
                  >
                    Delivery
                  </UBadge>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <div class="flex gap-2">
                    <UButton
                      icon="i-lucide-pencil"
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      @click="$router.push(`/boxes/${box.id}`)"
                    />
                    <UButton
                      icon="i-lucide-trash-2"
                      color="error"
                      variant="ghost"
                      size="sm"
                      @click="confirmDeleteBox(box)"
                    />
                  </div>
                </td>
              </tr>
              <tr v-if="boxes.length === 0">
                <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                  No boxes found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 pt-4 border-t">
          <div class="text-sm text-gray-500">
            Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} boxes
          </div>
          <UPagination
            v-model:page="currentPage"
            :total="totalCount"
            :page-count="pageSize"
          />
        </div>
      </UCard>
    </div>
  </UContainer>

  <!-- Create Box Dialog -->
  <CreateBoxDialog
    v-model="showCreateDialog"
    @confirm="handleCreateBox"
  />

  <!-- Delete Confirmation Dialog -->
  <ConfirmDialog
    v-model="showDeleteDialog"
    title="Delete Box"
    :message="`Are you sure you want to delete box '${boxToDelete?.code}'? This action cannot be undone.`"
    confirm-text="Delete"
    cancel-text="Cancel"
    confirm-color="error"
    :loading="deleting"
    @confirm="handleDeleteBox"
    @cancel="cancelDeleteBox"
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
const router = useRouter()

const boxes = ref<any[]>([])
const loading = ref(true)
const error = ref('')
const searchQuery = ref((route.query.search as string) || '')
const currentPage = ref(parseInt(route.query.page as string) || 1)
const pageSize = ref(10)
const totalCount = ref(0)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const boxToDelete = ref<any>(null)
const saving = ref(false)
const deleting = ref(false)

const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))

function getBoxStatus(box: any): 'empty' | 'ready' | 'delivery' | null {
  const trackingCount = box.tracking_count || 0

  // Case 1: No tracking items
  if (trackingCount === 0) {
    return 'empty'
  }

  // Case 2: Has tracking items but not committed
  if (trackingCount > 0 && !box.committed_at) {
    return 'ready'
  }

  // Case 3: Has tracking items and committed
  if (trackingCount > 0 && box.committed_at) {
    return 'delivery'
  }

  return null
}

// Watch currentPage changes to fetch data
watch(currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage) {
    fetchBoxes()
  }
})

async function fetchBoxes() {
  loading.value = true
  error.value = ''

  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: pageSize.value.toString()
    })

    if (searchQuery.value) {
      params.append('search', searchQuery.value)
    }

    // Update URL with query params
    const query: any = {
      page: currentPage.value.toString()
    }
    if (searchQuery.value) {
      query.search = searchQuery.value
    }
    router.replace({ query })

    const result: any = await apiFetch(`/api/boxes?${params.toString()}`)

    if (result.success) {
      boxes.value = result.data || []
      totalCount.value = result.total || 0
    } else {
      error.value = 'Failed to load boxes'
    }
  } catch (err: any) {
    console.error('Error fetching boxes:', err)
    error.value = err.statusMessage || 'Failed to load boxes'
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  searchQuery.value = ''
  currentPage.value = 1
  router.replace({ query: {} })
  fetchBoxes()
}

function applyFilters() {
  currentPage.value = 1
  fetchBoxes()
}

async function handleCreateBox(data: { code: string; warehouseId: string }) {
  saving.value = true

  try {
    await apiFetch('/api/boxes', {
      method: 'POST',
      body: data
    })
    showSuccess('Box created successfully')
    fetchBoxes()
  } catch (err: any) {
    console.error('Error creating box:', err)
    showError(err, 'Create Failed')
    throw err // Re-throw to keep dialog open
  } finally {
    saving.value = false
  }
}

function confirmDeleteBox(box: any) {
  boxToDelete.value = box
  showDeleteDialog.value = true
}

function cancelDeleteBox() {
  boxToDelete.value = null
  showDeleteDialog.value = false
}

async function handleDeleteBox() {
  if (!boxToDelete.value) return

  deleting.value = true

  try {
    await apiFetch(`/api/boxes/${boxToDelete.value.id}`, {
      method: 'DELETE'
    })

    showSuccess('Box deleted successfully')
    showDeleteDialog.value = false
    boxToDelete.value = null
    fetchBoxes()
  } catch (err: any) {
    console.error('Error deleting box:', err)
    showError(err, 'Delete Failed')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchBoxes()
})
</script>
