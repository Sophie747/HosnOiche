import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createAuth0 } from '@auth0/auth0-vue'

import App from './App.vue'
import router from './router'

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const hasAuth0Config = Boolean(auth0Domain && auth0ClientId)

console.log('DEBUG: VITE_AUTH0_DOMAIN =', auth0Domain)
console.log('DEBUG: VITE_AUTH0_CLIENT_ID =', auth0ClientId)
console.log('DEBUG: hasAuth0Config =', hasAuth0Config)

const app = createApp(App)

if (hasAuth0Config) {
  app.use(
    createAuth0({
      domain: auth0Domain,
      clientId: auth0ClientId,
      authorizationParams: {
        redirect_uri: window.location.origin,
      },
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
    })
  )
} else {
  console.warn(
    'Auth0 is not configured. Set VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID in your environment.'
  )
}

app.use(createPinia())
app.use(router)

app.mount('#app')
