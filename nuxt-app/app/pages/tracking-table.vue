<template>
  <div class="transition-colors duration-300 bg-white dark:bg-neutral-950 min-h-screen">
    <UPageSection class="pt-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <!-- LEFT COLUMN -->
        <div class="flex flex-col space-y-6">
          <!-- IMAGE BOX -->
          <UCard
            class="p-0 w-full flex justify-center items-center rounded-2xl overflow-hidden
                   bg-gray-100 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 transition-colors duration-300"
          >
            <img
              src="https://tclfreight.com.vn/wp-content/uploads/2023/07/word-image-4741-2.jpeg"
              alt="Package"
              class="max-w-full h-auto object-contain rounded-2xl"
            />
          </UCard>

          <!-- TRACKING DETAILS BOX -->
          <UCard
            class="flex flex-col space-y-4 p-6 w-full text-center
                   bg-gray-100 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 transition-colors duration-300"
          >
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Tracking Code Details</h2>
            <div class="flex justify-center">
              <UBadge color="success" variant="soft">Boxed</UBadge>
            </div>

            <div class="space-y-1 text-sm text-left text-gray-700 dark:text-gray-300">
              <p><strong>Tracking Number:</strong> 1ZW934R51332731608</p>
              <p><strong>Status:</strong> Closed</p>
              <p><strong>Agent Code:</strong> DC</p>
              <p><strong>Warehouse:</strong> 620</p>
              <p><strong>Last Updated:</strong> Oct 22, 2025 4:33 AM</p>
              <p><strong>Box:</strong> 32</p>
              <p><strong>Batch:</strong> H178(10/24)</p>
            </div>

            <UButton color="neutral" size="lg" class="cursor-pointer font-semibold" block>Edit</UButton>
          </UCard>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="flex flex-col space-y-6">
          <!-- PRODUCT BOX -->
          <UCard
            class="p-6 text-left
                   bg-gray-100 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 transition-colors duration-300"
          >
            <h3 class="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">
              List of items attach to tracking
            </h3>

            <div
              v-for="(product, index) in products"
              :key="index"
              class="rounded-lg p-4 mb-4 border border-gray-300 dark:border-neutral-700 transition-colors duration-300
                     bg-gray-50 dark:bg-neutral-800"
            >
              <!-- Product Fields -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <USelect
                  placeholder="Fill or select"
                  v-model="product.name"
                  :options="[]"
                  color="neutral" 
                />
                <div class="flex justify-center">
                  <input
                    type="number"
                    v-model="product.quantity"
                    min="1"
                    class="bg-gray-100 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600
                           rounded px-3 py-2 text-sm w-20 text-center text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <!-- Upload Section -->
              <div class="mt-4 flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <UButton
                    color="neutral"
                    class="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 
                    font-semibold cursor-pointer"
                    size="sm"
                    @click="() => fileInputs[index]?.click()"
                  >
                    Upload Image
                  </UButton>
                  <input
                    type="file"
                    accept="image/*"
                    ref="fileInputs"
                    class="hidden"
                    @change="(e) => handleFileUpload(e, index)"
                  />
                </div>

                <div v-if="product.image" class="relative w-16 h-16">
                  <img
                    :src="product.image"
                    alt="Preview"
                    class="w-full h-full object-contain rounded-md border border-gray-300 dark:border-neutral-700"
                  />
                  <button
                    @click="removeImage(index)"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>

              <!-- Delete Button -->
              <div class="mt-4 text-right">
                <UButton
                    color="neutral"
                    class="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors
                    font-semibold cursor-pointer"
                    size="sm"
                  icon="i-lucide-trash"
                  @click="removeProduct(index)"
                >
                  Remove
                </UButton>
              </div>
            </div>

            <UButton
              color="neutral"
              class="bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200 transition-colors
              font-semibold cursor-pointer"
              size="sm"
              icon="i-lucide-plus"
              @click="addProduct"
            >
              Add Product
            </UButton>
          </UCard>

          <!-- TIMELINE BOX -->
          <UCard
            class="p-6 text-left
                   bg-gray-100 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 transition-colors duration-300"
          >
            <h3 class="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">Timeline</h3>
            <ul class="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <li
                v-for="(event, i) in timeline"
                :key="i"
                class="flex items-center justify-between"
              >
                <div class="flex items-center space-x-2">
                  <div
                    :class="[ 'w-3 h-3 rounded-full',
                      event.color === 'green'
                        ? 'bg-green-500'
                        : event.color === 'red'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                    ]"
                  ></div>
                  <span>{{ event.title }}</span>
                </div>
                <span class="text-muted-foreground">{{ event.date }}</span>
              </li>
            </ul>
          </UCard>

          <!-- HISTORY BOX -->
          <UCard
            class="p-6 text-left
                   bg-gray-100 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 transition-colors duration-300"
          >
            <h3 class="text-lg font-semibold mb-4 text-center text-gray-900 dark:text-gray-100">
              Tracking Item History
            </h3>
            <div class="space-y-4">
              <div
                v-for="(log, index) in history"
                :key="index"
                class="border-l-2 border-primary pl-4"
              >
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ log.date }}</p>
                <p class="font-medium text-gray-900 dark:text-gray-100">{{ log.action }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">{{ log.details }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Move Button to Bottom -->
      <div class="flex justify-center mt-12">
        <UButton
          to="/tracking-items"
          icon="i-lucide-arrow-left"
          color="success"
          variant="solid"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md
                 cursor-pointer transition-colors duration-200 justify-center items-center"
        >
          Back to Tracking Items
        </UButton>
      </div>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const products = ref([{ name: '', quantity: 1, image: '' }])
const fileInputs = ref<HTMLInputElement[]>([])

function addProduct() {
  products.value.push({ name: '', quantity: 1, image: '' })
}
function removeProduct(index: number) {
  products.value.splice(index, 1)
}
function handleFileUpload(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    if (reader.result && products.value[index]) {
      products.value[index].image = reader.result as string
    }
  }
  reader.readAsDataURL(file)
}
function removeImage(index: number) {
  if (products.value[index]) {
    products.value[index].image = ''
  }
}

const timeline = [
  { title: 'Received at US Warehouse (Delivery)', date: 'Oct 21, 2025 2:34 AM', color: 'gray' },
  { title: 'Being Repacked', date: 'Oct 21, 2025 2:34 AM', color: 'red' },
  { title: 'Boxed', date: 'Oct 22, 2025 4:33 AM', color: 'green' },
  { title: 'In Transit', date: 'N/A', color: 'gray' }
]

const history = [
  { date: 'Oct 22, 2025 4:33 AM', action: '620 - Status Updated', details: 'New Status: Boxed' },
  { date: 'Oct 21, 2025 3:04 AM', action: '620 - Chain Updated', details: 'New Chain: D3A5...48930' },
  { date: 'Oct 21, 2025 2:34 AM', action: '620 - Agent Code Updated', details: 'New Agent Code: DC' }
]
</script>

<style scoped>
:root {
  color-scheme: light dark;
}
</style>
