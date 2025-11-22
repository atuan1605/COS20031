<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold">Timeline</h3>
    </template>

    <TrackingTimeline :items="items" />
  </UCard>
</template>

<script setup lang="ts">
interface TimelineItem {
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
