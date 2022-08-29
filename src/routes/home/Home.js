import React from "react"
import s from './home.css'
import {flowRight as compose} from 'lodash';
import useStyles from 'isomorphic-style-loader/useStyles'
import withStyles from 'isomorphic-style-loader/withStyles'
import cx from 'classnames'
const HomeRoute = () => {
     
    return (
     <div className={s.title}>
     <h1>Hello Home Index Routes</h1>

     <p>Hello BrowserSync</p>
     <p>-----------------</p>
     <p>Hello BrowserSync</p>
     <p>-----------------</p>
     <p>Hello BrowserSync</p>
     <p>-----------------</p>
     <p>Hello BrowserSync</p>
     </div>   
    )
}
export default  (withStyles(s)(HomeRoute));