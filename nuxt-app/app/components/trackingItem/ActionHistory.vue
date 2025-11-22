<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">Action History</h3>
    </template>

    <div class="space-y-3 max-h-[500px] overflow-y-auto">
      <div
        v-for="(action, index) in actions"
        :key="index"
        class="flex items-start gap-3 pb-3 border-b last:border-b-0"
      >
        <div
          class="w-2 h-2 rounded-full mt-1.5"
          :class="action.isError ? 'bg-red-500' : 'bg-gray-800'"
        ></div>
        <div class="flex-1">
          <div class="flex items-center justify-between mb-1">
            <p class="text-sm font-medium">{{ action.title }}</p>
            <span class="text-xs text-gray-500">{{ action.time }}</span>
          </div>
          <p class="text-xs text-gray-600">{{ action.description }}</p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
interface Action {
  title: string
  description: string
  time: string
  isError: boolean
}

interface Props {
  actions: Action[]
}

defineProps<Props>()
</script>
