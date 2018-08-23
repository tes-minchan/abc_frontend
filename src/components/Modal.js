import React, { Component } from 'react';
import PropTypes from 'prop-types'
import ReactModal from 'react-modal';

const modalStyle = (options) => {
  return {
    content : {
        top: '45%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        // marginRight: '-25%',
        width: "500px",
        height: "500px",
        minWidth:"320px",
        maxWidth:"800px",
        transform: 'translate(-50%, -45%)',
      },
      overlay: {zIndex: 999}
    }
};

class Modal extends Component {
  constructor () {   
    super(); 
    this.close = this.close.bind(this);
  }
  static propTypes = {
    onRef: PropTypes.func
  }

  state = {
    isOpen: false
  };

  componentDidMount() {
    this.props.onRef(this)
  }
  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  open() {
    this.setState({isOpen : true});
  }
  
  close(){
    this.setState({isOpen : false});
  }
  
  render() {
    // const { close } = this;
    const {
      title,
      width,
      height,
      onSubmit,
      children,
      onModify,
      onDelete,
      closeText
    } = this.props;

    const {
      isOpen
    } = this.state;

    return (
        <ReactModal
          isOpen={isOpen}
          closeTimeoutMS={5}
          ariaHideApp={false}
          shouldCloseOnOverlayClick={true}
          style={modalStyle({height: height, width:width})}
          contentLabel={title}
          onRequestClose={this.close}
        >
          <div> asuyidhiuashdiu</div>
        </ReactModal>
    )
  }
}

Modal.defaultProps = {
  width: 320,
  height: 500
};

export default Modal;