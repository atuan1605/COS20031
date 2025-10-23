<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-[#f4f0eb] dark:bg-[#0f172a] transition-colors duration-300"
  >
    <div
      class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-md p-8
             border border-[#e5ded6] dark:border-gray-700 transition-colors duration-300"
    >
      <h1 class="text-2xl font-semibold text-center mb-6 text-[#3b2f2f] dark:text-white">
        Search for Tracking Items
      </h1>

      <form @submit.prevent="handleSearch" class="space-y-4">
        <UInput
          v-model="trackingNumber"
          placeholder="Enter tracking number"
          size="lg"
          class="w-full rounded-md border border-[#d3c7b9] dark:border-gray-600
                 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
        />

        <UButton
          type="submit"
          label="Submit"
          size="lg"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md
                 cursor-pointer transition-colors duration-200 flex justify-center items-center"
        />
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '#imports'

const toast = useToast()
const trackingNumber = ref('')

function handleSearch() {
  if (!trackingNumber.value) {
    toast.add({
      title: 'Please enter a tracking number.',
      color: 'warning'
    })
    return
  }

  toast.add({
    title: 'Tracking submitted!',
    description: `Tracking number: ${trackingNumber.value}`,
    color: 'success'
  })
}
</script>
