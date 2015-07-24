'use strict';

var assign                     = require('object-assign'),
    EventEmitter               = require('events').EventEmitter,
    Dispatcher                 = require('../dispatcher'),
    ModalConstants             = require('../constants/modal'),
    Dao                        = require('../database'),
    _settings                  = { stats: {}, resultsPerPage: 6 },
    _isSettingsModalVisible    = false,
    _isSettingsModalAnimated   = false,
    _isEmoticonDetailsVisible  = false,
    _isEmoticonDetailsAnimated = false,
    ModalStore;

function _showSettingsModal() {
  _isSettingsModalVisible = true;
  _isSettingsModalAnimated = true;
  
  setTimeout(function () {
    _isSettingsModalAnimated = false;
    ModalStore.emitChange();
  }, 400);
}

function _hideSettingsModal() {
  _isSettingsModalVisible = false;
  _isSettingsModalAnimated = true;
  
  setTimeout(function () {
    _isSettingsModalAnimated = false;
    ModalStore.emitChange();
  }, 400);
}

function _setSettings(settings) {
  _settings = settings;
  Dao.setSettings(settings);
}

function _hideEmoticonDetailsModal() {
  _isEmoticonDetailsVisible = false;
  _isEmoticonDetailsAnimated = true;
  
  setTimeout(function () {
    _isEmoticonDetailsAnimated = false;
    ModalStore.emitChange();
  }, 400);
}

function _setStats(settings) {
  _settings.stats = {};
  
   Dao.getSyncBytesInUse().then(function (bytes) {
    _settings.stats.syncBytesInUse = bytes;
    _settings.stats.syncQuota = Dao.getSyncQuota();
    ModalStore.emitChange();
  });
}

ModalStore = assign({}, EventEmitter.prototype, {
  emitChange: function () {
    this.emit('change');
  },

  addChangeListener: function (callback) {
    this.on('change', callback);
  },

  removeChangeListener: function (callback) {
    this.removeListener('change', callback);
  },
  
  getSettings: function () {
    return _settings;
  },
  
  initSettings: function () {
    Dao.getSettings().then(function (settings) {
      _settings = settings;
      
      if (!_settings) {
        Dao.resetSettings().then(function (settings) {
          _settings = settings;
          _setStats(_settings);
        });
      } else {
        _setStats(_settings);
      }
    });
  }
});

ModalStore.dispatchToken = Dispatcher.register(function(action) {
  switch(action.type) {
    case ModalConstants.ActionTypes.SET_SETTINGS:
      _setSettings(action.settings);
      ModalStore.emitChange();
      break;
    default:
      // no-op
      break;
  }
});

ModalStore.initSettings();

module.exports = ModalStore;