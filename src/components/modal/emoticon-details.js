var React            = require('react'),
    cx               = require('classnames'),
    $                = require('jquery'),
    Dao              = require('../../database'),
    ModalActions     = require('../../actions/modal'),
    SettingsStore    = require('../../stores/settings'),
    PaginaterActions = require('../../actions/paginater'),
    ModalCtrls       = require('./modal-ctrls'),
    ToastActions     = require('../../actions/toast'),
    EmoticonDetails;

EmoticonDetails = React.createClass({
  propTypes: {
    title: React.PropTypes.string.isRequired,
    initialName: React.PropTypes.string,
    initialEmoticonText: React.PropTypes.string,
    newEmotie: React.PropTypes.bool
  },
  
  getDefaultProps: function () {
    return {
      title: 'Emotie Details',
      initialName: '',
      initialEmoticonText: '',
      newEmotie: true
    }
  },
  
  getInitialState: function () {
    return {
      name: this.props.initialName,
      emoticonText: this.props.initialEmoticonText,
      showUniqueWarning: false
    };
  },
  
  componentDidMount: function () {
    SettingsStore.addChangeListener(this.handleModalChange);
  },

  componentWillUnmount: function () {
    SettingsStore.removeChangeListener(this.handleModalChange);
  },
  
  handleModalChange: function () {
    this.setState({
      isVisible: SettingsStore.getIsEmoticonDetailsVisible(),
      animating: SettingsStore.getIsEmoticonDetailsAnimated()
    });
  },
  
  remove: function () {
    this.setState({
      showUniqueWarning: false,
      name: '',
      emoticonText: ''
    });
    
    $('.emoticon-details-input').val('');
    
    $('.modal-outer').removeClass('fade-in-down').addClass('fade-out-up');
    
    setTimeout(function () {
      React.unmountComponentAtNode(document.getElementById('emoticonDetailsModalContainer'));
    }, 400);
  },
  
  handleCancel: function () {
    this.remove();
  },
  
  shake: function () {
    $('.modal').addClass('shake');
    setTimeout(function () {
      $('.modal').removeClass('shake');
    }, 1000);
  },
  
  saveNew: function () {
    var self = this;
    
    if (this.state.name.length > 0 && this.state.emoticonText.length > 0) {
      Dao.addEmoticon({ name: this.state.name, text: this.state.emoticonText }).then(function () {
        PaginaterActions.updateEmoticons();
        self.remove();
      }).catch(function () {
        self.setState({
          showUniqueWarning: true
        });
        this.shake();
      });
    } else {
      this.shake();
    }
  },
  
  saveUpdate: function () {
    var self = this;
    
    if (this.state.name.length > 0 && this.state.emoticonText.length > 0) {
      Dao.updateEmoticon(this.props.initialName, { name: this.state.name, text: this.state.emoticonText }).then(function () {
        PaginaterActions.updateEmoticons();
        self.remove();
      }).catch(function (err) {
        self.setState({
          showUniqueWarning: true
        });
        self.shake();
      });
    } else {
      self.shake();
    }
  },
  
  handleNameChange: function (evt) {
    this.setState({
      name: evt.target.value
    });
  },
  
  handleEmoticonTextChange: function (evt) {
    this.setState({
      emoticonText: evt.target.value
    });
  },
  
  handleDelete: function () {
    var deleteVal = $('.delete-input').val(),
        self      = this;
    
    if (deleteVal.toLowerCase() === self.props.initialName.toLowerCase()) {
      $('.delete-input').val('');
      Dao.deleteEmoticon(self.props.initialName).then(function () {
        PaginaterActions.updateEmoticons();
        self.remove();
        PaginaterActions.goToPage(0);
      }).catch(function (err) {
        console.log('Error:');
        console.log(err);
      });
      self.remove();
    } else {
      self.shake();
    }
  },
  
  render: function () {
    var dangerZoneClasses = cx({
          'danger-zone': true,
          'show': !this.props.newEmotie
        }),
        dangerMsgClasses = cx({
          'danger-msg': true,
          'show': this.state.showUniqueWarning
        }),
        handleSave = (this.props.newEmotie) ? this.saveNew : this.saveUpdate;
    
    return (
      <div className='modal-wrapper'>
        <div className='modal-outer fade-in-down animated'>
          <div className='modal-middle'>
            <div className='emoticon-detail-modal modal animated-long'>
              
              <div className='modal-inner'>
                <h1>{ this.props.title }</h1>
                
                <div className='modal-body'>
                  <div className='modal-body-row'>
                    <div className={dangerMsgClasses}>Emoticon name must be unique</div>
                    <input type='text' className='emoticon-details-input' value={ this.state.name }
                      onChange={ this.handleNameChange } placeholder='Emoticon Name' />
                  </div>
                  <div className='modal-body-row'>
                    <input type='text' className='emoticon-details-input' value={ this.state.emoticonText }
                      onChange={ this.handleEmoticonTextChange } placeholder='Emoticon Text' />
                  </div>
                </div>
                
                <ModalCtrls handleClickLeftBtn={ this.handleCancel } handleClickRightBtn={ handleSave } />
              </div>
              
              <div className='modal-inner'>
                <div className={ dangerZoneClasses }>
                  <h1>Danger Zone</h1>
                  <div className='modal-body'>
                    <div className='modal-body-row'>
                      <div className='modal-body-desc'>
                        Delete the emoticon. This <em>cannot</em> be undone.
                      </div>
                      <div className='danger-input-wrapper'>
                        <input type='text' className='danger-input delete-input' placeholder='Type emoticon name' />
                      </div>
                      <button className='danger-btn delete-btn' onClick={ this.handleDelete }>delete</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = EmoticonDetails;