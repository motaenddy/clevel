import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import DashboardPage from '../views/DashboardPage.vue'
import ClientsPage from '../views/ClientsPage.vue'
import ClientDetailPage from '../views/ClientDetailPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardPage
  },
  {
    path: '/clients',
    name: 'Clients',
    component: ClientsPage
  },
  {
    path: '/client/:id',
    name: 'ClientDetail',
    component: ClientDetailPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
