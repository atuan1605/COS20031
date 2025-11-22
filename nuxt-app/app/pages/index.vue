<template>
  <UContainer class="py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Search Card -->
      <UCard>
        <template #default>
          <div class="space-y-4">
            <!-- Tabs -->
            <UTabs
              v-model="selectedTab"
              :items="tabs"
            />

            <div v-if="selectedTab === 0" class="space-y-4">
              <!-- Search by Tracking Number -->
              <UInput
                v-model="trackingNumber"
                placeholder="Enter tracking number"
                size="xl"
                class="w-full"
                @keyup.enter="handleSearch"
              />

              <UButton
                @click="handleSearch"
                :loading="loading"
                :disabled="loading || !trackingNumber"
                block
                size="xl"
                color="neutral"
                class="justify-center"
              >
                SEARCH
              </UButton>
            </div>

            <div v-else class="space-y-4">
              <!-- Search by Camera (placeholder) -->
              <p class="text-gray-500 text-center py-8">
                Camera search feature coming soon...
              </p>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const { showError } = useNotification()
const { apiFetch } = useApi()

const selectedTab = ref(0)
const trackingNumber = ref('')
const loading = ref(false)

const tabs = [
  {
    label: 'SEARCH BY TRACKING NUMBER',
    value: 0
  },
  {
    label: 'SEARCH BY CAMERA',
    value: 1
  }
]

async function handleSearch() {
  if (!trackingNumber.value.trim()) {
    return
  }

  loading.value = true

  try {
    const result: any = await apiFetch(`/api/tracking-items/${trackingNumber.value}`)

    if (result.success && result.data) {
      // Navigate to tracking item detail page
      await navigateTo(`/tracking-items/${result.data.id}`)
    }
  } catch (error: any) {
    showError(error, 'Search Failed')
  } finally {
    loading.value = false
  }
}
</script>
