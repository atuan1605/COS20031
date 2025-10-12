<template>
  <div
    class="min-h-screen flex items-center justify-center transition-colors duration-300
           bg-[#f4f0eb] dark:bg-[#0f172a]"
  >
    <div
      class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-md px-8 py-10
             border border-[#e5ded6] dark:border-gray-700 transition-colors duration-300"
    >
      <h1 class="text-lg font-semibold mb-6 text-center text-[#3b2f2f] dark:text-white">
        Join or log in
      </h1>

      <form @submit.prevent="handleSignIn" class="w-full space-y-4">
        <!-- Username -->
        <UInput
          v-model="form.username"
          placeholder="Username"
          size="lg"
          class="w-full rounded-md border border-[#d3c7b9] dark:border-gray-600
                 focus:ring-[#a4978e] focus:border-[#a4978e] dark:bg-gray-700 dark:text-white"
          :disabled="loading"
        />

        <!-- Password -->
        <UInput
          v-model="form.password"
          type="password"
          placeholder="Password"
          size="lg"
          class="w-full rounded-md border border-[#d3c7b9] dark:border-gray-600
                 focus:ring-[#a4978e] focus:border-[#a4978e] dark:bg-gray-700 dark:text-white"
          :disabled="loading"
        />

        <!-- Sign in button -->
        <UButton
          type="submit"
          :loading="loading"
          :disabled="loading"
          label="Sign in"
          size="lg"
          class="w-full mt-2 bg-[#a4978e] hover:bg-[#8d7f76] text-white font-medium rounded-md
                 cursor-pointer transition-colors duration-200 disabled:opacity-70
                 dark:bg-gray-600 dark:hover:bg-gray-500"
        />
      </form>

      <!-- Forgot password -->
      <p class="mt-6 text-sm text-center">
        <a href="#" class="text-[#8d7f76] hover:underline dark:text-gray-300">
          Forgot password?
        </a>
      </p>

      <!-- Sign up link -->
      <p class="mt-3 text-sm text-center text-[#7a6e66] dark:text-gray-300">
        Don’t have an account?
        <NuxtLink
          to="/sign-up"
          class="text-[#8d7f76] hover:underline font-medium dark:text-gray-100"
        >
          Sign up
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  username: '',
  password: ''
})

const loading = ref(false)

async function handleSignIn() {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    console.log('Signed in:', form)
  } finally {
    loading.value = false
  }
}
</script>
