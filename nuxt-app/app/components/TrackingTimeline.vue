<template>
  <div class="space-y-4">
    <div
      v-for="(timeline, index) in items"
      :key="index"
      class="flex items-start gap-3"
    >
      <div class="flex flex-col items-center">
        <div
          class="w-4 h-4 rounded-full border-2"
          :class="timeline.completed ? `${timeline.colorClasses.bg} ${timeline.colorClasses.border}` : 'bg-gray-300 border-gray-300'"
        ></div>
        <div
          v-if="index < items.length - 1"
          class="w-0.5 h-12"
          :class="timeline.completed ? timeline.colorClasses.line : 'bg-gray-300'"
        ></div>
      </div>
      <div class="flex-1 pb-4">
        <p
          class="font-medium text-sm"
          :class="timeline.completed ? timeline.colorClasses.text : 'text-gray-500'"
        >
          {{ timeline.label }}
        </p>
        <p class="text-xs text-gray-500">{{ timeline.date }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface TimelineItem {
  label: string
  date: string
  completed: boolean
  colorClasses: {
    bg: string
    border: string
    line: string
    text: string
  }
}

interface Props {
  items: TimelineItem[]
}

defineProps<Props>()
</script>
