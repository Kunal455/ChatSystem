import React from "react"
import {Outlet, Navigate} from "react-router-dom"
import {useAuth} from "../Context/AuthContext"

export const VerifyUser = ()=>{
    const {authUser} = useAuth();
    return authUser ? <Outlet/> : <Navigate to={'/login'}/>
}