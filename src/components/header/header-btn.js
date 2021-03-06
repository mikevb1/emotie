var React = require('react'),
    cx    = require('classnames'),
    HeaderBtn;

HeaderBtn = React.createClass({
  defaultprops: {
    tooltip: React.PropTypes.string.isRequired
  },
  
  getDefaultProps: function () {
    return {
      icon: 'gear',
      handleClick: function () { /* no-op */}
    }
  },
  
  render: function () {
    var classnames = {
          'octicon': true,
        },
        classes;
    
    classnames['octicon-' + this.props.icon] = true;
    
    classes = cx(classnames);
    
    return (
      <button className='header-btn' title={this.props.tooltip}>
        <span className={classes} onClick={this.props.handleClick}></span>
      </button>
    );
  }
});

module.exports = HeaderBtn;