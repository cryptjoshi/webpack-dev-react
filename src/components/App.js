import React,{Children} from "react";
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import withStyles from 'isomorphic-style-loader/withStyles'
import s from './common.css'
const contextType = {
  insertCss: PropTypes.any,
  store: PropTypes.object,
  client: PropTypes.object
}

class App extends React.PureComponent {

  static propTypes = {
    context: PropTypes.shape(contextType),
    children: PropTypes.element.isRequired
  }
  static childContextTypes = contextType;

  constructor(props){
    super(props)
    this.state= {
      load: false
    }
  }

  getChildContext(){
    return this.props.context
  }

  componentDidMount(){
    const store = this.props.context && this.props.context.store
    if(store){

    }
    this.setState({
      load: true
    })
  }

  render(){
    const {load} = this.state
 
    return (
      <>
      {Children.only(this.props.children)}
      </>
    )
  }
}

export default (withStyles(s)(App));