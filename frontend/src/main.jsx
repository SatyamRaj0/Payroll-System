import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="bottom-right"
        toastOptions={{ style: { background: '#1e2535', color: '#e8edf8', border: '1px solid #2a3450' } }} />
    </QueryClientProvider>
  </BrowserRouter>
)