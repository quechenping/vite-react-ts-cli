import { Button } from 'antd'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import http from '@/utils/request'
import { cancelAjax } from '@/utils/request/cancel'

const Home = () => {
  useEffect(() => {
    return () => {
      cancelAjax('removeAll', '')
    }
  }, [])

  const handleClick = async () => {
    const res = await http.getUser({ name: 'qcpd的aa', password: '123' })
    console.log(res)
  }

  return (
    <>
      <Button onClick={handleClick}>Home</Button>
      <Link to="/about">
        <Button>about</Button>
      </Link>
    </>
  )
}

export default Home
