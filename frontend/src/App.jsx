import './App.css'
import { Route, Routes } from 'react-router-dom'
import Login from "./Auth/Login"
import Register from "./Auth/Register"
import Verification from "./Auth/Verification"
import ForgotPassword from "./Auth/ForgotPassword"
import ResetPassword from "./Auth/ResetPassword"
import Home from "./home/Home"
import { ToastContainer } from 'react-toastify'
import './index.css'
import { VerifyUser } from './Utils/VerifyUser'



function App() {


  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/verify' element={<Verification />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route element={<VerifyUser />}>
          <Route path='/' element={<Home />} />

        </Route>
      </Routes>
      <ToastContainer />
    </>
  )
}

export default App
