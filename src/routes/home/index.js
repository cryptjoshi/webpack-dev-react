import React from "react"
import Home from './Home'
import HomeComponent from './../../components/home/home'
export default {
    path: '/',
    async action({store}){
        
        const title = "Home Page Index"
        const description = "Home Page Index from Routes"
        return {
            title,
            description,
            chunk: 'home',
            component: <Home />
        }
    }
}