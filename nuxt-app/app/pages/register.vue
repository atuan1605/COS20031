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
                Sign Up
            </h1>

            <form @submit.prevent="handleSignUp" class="w-full space-y-4">
                <!-- Username -->
                <UInput
                    v-model="form.username"
                    placeholder="Username"
                    size="lg"
                    class="w-full"
                    :disabled="loading"
                    :ui="ui.input.slots"
                />
                
                <!-- Password -->
                <UInput
                    v-model="form.password"
                    placeholder="Password"
                    size="lg"
                    class="w-full"
                    :disabled="loading"
                    :ui="ui.input.slots"
                />

                <!-- Retype password -->
                <UInput
                    v-model="form.retypePassword"
                    placeholder="Retype your password"
                    size="lg"
                    class="w-full"
                    :disabled="loading"
                    :ui="ui.input.slots"
                />

                <!-- Sign in button -->
                    <UButton
                    @click="goToSignUp"
                    type="submit"
                    :loading="loading"
                    :disabled="loading"
                    label="Sign Up"
                    size="lg"
                    class="w-full justify-center cursor-pointer"
                    
                />
            </form>

            <!-- Sign up link -->
            <p class="mt-3 text-sm text-center text-[#7a6e66] dark:text-gray-300">
                Already have an account?
                <NuxtLink
                    to="/sign-in"
                    class="text-[#8d7f76] hover:underline font-medium dark:text-gray-100"
                    >
                    Sign In
                </NuxtLink>
            </p>

        </div>
    </div>

</template>

<script setup lang="ts">
    const form = reactive(
        {
            username: '',
            password: '',
            retypePassword: ''
        }
    )

    const loading = ref(false)

    async function handleSignUp() {
        loading.value = true
        try {
            await new Promise((resolve) => setTimeout(resolve, 1500))
            console.log('Signed in:', form)
        } finally {
            loading.value = false
        }
    }

    const goToSignUp = () => {
        navigateTo('/index')
    }

    const ui = {
        input: { slots: { base: 'rounded-full text-xs h-12' } },

        button: {
            base: 'bg-[#00DC82] hover:bg-[#00b46a] text-white transition-colors',
        }
    }
</script>