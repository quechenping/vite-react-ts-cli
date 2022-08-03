import { lazy } from 'react'

const About = lazy(() => import('@/pages/About'))
const Home = lazy(() => import('@/pages/Home'))

const routers = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/about',
    element: <About />
  }
]
export default routers
