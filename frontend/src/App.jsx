import './App.css'
import {Route, Routes} from 'react-router-dom'
import Login from "./Auth/Login"
import Register from "./Auth/Register"
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
        <Route element={<VerifyUser/>}>
        <Route path='/' element={<Home />} />
        
        </Route>
      </Routes>
      <ToastContainer/>
    </>
  )
}

export default App
