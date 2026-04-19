import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import StatsPage from '../views/StatsPage.vue'
import FactSearchPage from '../views/FactSearchPage.vue'
import OpinionSearchPage from '../views/OpinionSearchPage.vue'
import JudgmentPage from '../views/JudgmentPage.vue'
import ChatView from '../views/ChatView.vue'
import SearchView from '../views/SearchView.vue'
import SearchResult from '../views/SearchResult.vue'
import AboutPage from '../views/AboutPage.vue'
import MemberPage from '@/views/MemberPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatsPage
  },
  {
    path: '/fact-search',
    name: 'fact-search',
    component: FactSearchPage
  },
  {
    path: '/opinion-search',
    name: 'opinion-search',
    component: OpinionSearchPage
  },
  {
    path: '/judgment',
    name: 'judgment-landing',
    component: JudgmentPage
  },
  {
    path: '/judgment/:jid',
    name: 'judgment',
    component: JudgmentPage,
    props: true
  },
  {
    path: '/discussion',
    name: 'discussion',
    component: ChatView
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
