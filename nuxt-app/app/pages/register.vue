<template>
  <div class="min-h-screen flex items-center justify-center transition-colors duration-300 bg-[#f4f0eb] dark:bg-[#0f172a]">
    <div class="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-md px-8 py-10 border border-[#e5ded6] dark:border-gray-700 transition-colors duration-300">
      <h1 class="text-lg font-semibold mb-6 text-center text-[#3b2f2f] dark:text-white">
        Sign Up
      </h1>

      <form @submit.prevent="handleRegister" class="w-full space-y-4">
        <!-- Username -->
        <UInput
          v-model="form.username"
          placeholder="Username"
          size="lg"
          class="w-full"
          :disabled="loading"
          :ui="ui.input.slots"
          autocomplete="username"
        />

        <!-- Password -->
        <UInput
          v-model="form.password"
          placeholder="Password"
          type="password"
          size="lg"
          class="w-full"
          :disabled="loading"
          :ui="ui.input.slots"
          autocomplete="new-password"
        />

        <!-- Retype password -->
        <UInput
          v-model="form.confirmPassword"
          placeholder="Retype your password"
          type="password"
          size="lg"
          class="w-full"
          :disabled="loading"
          :ui="ui.input.slots"
          autocomplete="new-password"
        />

        <!-- Sign up button -->
        <UButton
          type="submit"
          :loading="loading"
          :disabled="loading"
          label="Sign Up"
          size="lg"
          class="w-full justify-center cursor-pointer"
        />
      </form>

      <!-- Sign in link -->
      <p class="mt-3 text-sm text-center text-[#7a6e66] dark:text-gray-300">
        Already have an account?
        <NuxtLink to="/sign-in" class="text-[#8d7f76] hover:underline font-medium dark:text-gray-100">
          Sign In
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRegisterHandle } from '~/composables/userRegisterForm'
const { loading, registerHandle } = useRegisterHandle()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

async function handleRegister () {
  await registerHandle(form)
}

// UI config passed as whole objects to :ui
const ui = {
  input: { slots: { base: 'rounded-full text-xs h-12' } },
}
</script>
