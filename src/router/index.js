import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/ChatView.vue'
import SearchView from '../views/SearchView.vue'
import SearchResult from '../views/SearchResult.vue'
import AboutPage from '../views/AboutPage.vue'
import MemberPage from '@/views/MemberPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/search',
    name: 'search',
    component: SearchView
  },
  {
    path: '/search-result',
    name: 'search-result',
    component: SearchResult
  },
  {
    path: '/about',
    name: 'about-page',
    component: AboutPage
  },
  {
    path: '/members',
    name: 'member-page',
    component: MemberPage
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
