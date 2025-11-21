import React from 'react'
import { useAuth } from '../Context/AuthContext'

const Homepage = () => {

  const {authUser} = useAuth();

  return (
    <div>hii {authUser?.username}</div>
  )
}

export default Homepage