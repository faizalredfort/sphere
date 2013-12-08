(function() {
  var Offline, checkXHR, defaultOptions, extendNative, grab, handlers, init;

  extendNative = function(to, from) {
    var e, key, val, _results;
    _results = [];
    for (key in from.prototype) {
      try {
        val = from.prototype[key];
        if ((to[key] == null) && typeof val !== 'function') {
          _results.push(to[key] = val);
        } else {
          _results.push(void 0);
        }
      } catch (_error) {
        e = _error;
      }
    }
    return _results;
  };

  Offline = {};

  if (Offline.options == null) {
    Offline.options = {};
  }

  defaultOptions = {
    checks: {
      xhr: {
        url: function() {
          return "/offline-test-request/" + (Math.floor(Math.random() * 1000000000));
        }
      },
      image: {
        url: function() {
          return "http://dqakt69vkj09v.cloudfront.net/are-we-online.gif?_=" + (Math.floor(Math.random() * 1000000000));
        }
      },
      active: 'image'
    },
    checkOnLoad: false,
    interceptRequests: true,
    reconnect: true
  };

  grab = function(obj, key) {
    var cur, i, part, parts, _i, _len;
    cur = obj;
    parts = key.split('.');
    for (i = _i = 0, _len = parts.length; _i < _len; i = ++_i) {
      part = parts[i];
      cur = cur[part];
      if (typeof cur !== 'object') {
        break;
      }
    }
    if (i === parts.length - 1) {
      return cur;
    } else {
      return void 0;
    }
  };

  Offline.getOption = function(key) {
    var val, _ref;
    val = (_ref = grab(Offline.options, key)) != null ? _ref : grab(defaultOptions, key);
    if (typeof val === 'function') {
      return val();
    } else {
      return val;
    }
  };

  if (typeof window.addEventListener === "function") {
    window.addEventListener('online', function() {
      return setTimeout(Offline.confirmUp, 100);
    }, false);
  }

  if (typeof window.addEventListener === "function") {
    window.addEventListener('offline', function() {
      return Offline.confirmDown();
    }, false);
  }

  Offline.state = 'up';

  Offline.markUp = function() {
    Offline.trigger('confirmed-up');
    if (Offline.state === 'up') {
      return;
    }
    Offline.state = 'up';
    return Offline.trigger('up');
  };

  Offline.markDown = function() {
    Offline.trigger('confirmed-down');
    if (Offline.state === 'down') {
      return;
    }
    Offline.state = 'down';
    return Offline.trigger('down');
  };

  handlers = {};

  Offline.on = function(event, handler, ctx) {
    var e, events, _i, _len, _results;
    events = event.split(' ');
    if (events.length > 1) {
      _results = [];
      for (_i = 0, _len = events.length; _i < _len; _i++) {
        e = events[_i];
        _results.push(Offline.on(e, handler, ctx));
      }
      return _results;
    } else {
      if (handlers[event] == null) {
        handlers[event] = [];
      }
      return handlers[event].push([ctx, handler]);
    }
  };

  Offline.off = function(event, handler) {
    var ctx, i, _handler, _ref, _results;
    if (handlers[event] == null) {
      return;
    }
    if (!handler) {
      return handlers[event] = [];
    } else {
      i = 0;
      _results = [];
      while (i < handlers[event].length) {
        _ref = handlers[event][i], ctx = _ref[0], _handler = _ref[1];
        if (_handler === handler) {
          _results.push(handlers[event].splice(i, 1));
        } else {
          _results.push(i++);
        }
      }
      return _results;
    }
  };

  Offline.trigger = function(event) {
    var ctx, handler, _i, _len, _ref, _ref1, _results;
    if (handlers[event] != null) {
      _ref = handlers[event];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref1 = _ref[_i], ctx = _ref1[0], handler = _ref1[1];
        _results.push(handler.call(ctx));
      }
      return _results;
    }
  };

  checkXHR = function(xhr, onUp, onDown) {
    var checkStatus, _onreadystatechange;
    checkStatus = function() {
      if (xhr.status && xhr.status < 12000) {
        return onUp();
      } else {
        return onDown();
      }
    };
    if (xhr.onprogress === null) {
      xhr.addEventListener('error', onDown, false);
      xhr.addEventListener('timeout', onDown, false);
      return xhr.addEventListener('load', checkStatus, false);
    } else {
      _onreadystatechange = xhr.onreadystatechange;
      return xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          checkStatus();
        } else if (xhr.readyState === 0) {
          onDown();
        }
        return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
      };
    }
  };

  Offline.checks = {};

  Offline.checks.xhr = function() {
    var e, xhr;
    xhr = new XMLHttpRequest;
    xhr.offline = false;
    xhr.open('HEAD', Offline.getOption('checks.xhr.url'), true);
    checkXHR(xhr, Offline.markUp, Offline.markDown);
    try {
      xhr.send();
    } catch (_error) {
      e = _error;
      Offline.markDown();
    }
    return xhr;
  };

  Offline.checks.image = function() {
    var img;
    img = document.createElement('img');
    img.onerror = Offline.markDown;
    img.onload = Offline.markUp;
    img.src = Offline.getOption('checks.image.url');
    return void 0;
  };

  Offline.check = function() {
    Offline.trigger('checking');
    return Offline.checks[Offline.getOption('checks.active')]();
  };

  Offline.confirmUp = Offline.confirmDown = Offline.check;

  Offline.onXHR = function(cb) {
    var monitorXHR, _XDomainRequest, _XMLHttpRequest;
    monitorXHR = function(req, flags) {
      var _open;
      _open = req.open;
      return req.open = function(type, url, async, user, password) {
        cb({
          type: type,
          url: url,
          async: async,
          flags: flags,
          user: user,
          password: password,
          xhr: req
        });
        return _open.apply(req, arguments);
      };
    };
    _XMLHttpRequest = window.XMLHttpRequest;
    window.XMLHttpRequest = function(flags) {
      var req, _overrideMimeType, _setRequestHeader;
      req = new _XMLHttpRequest(flags);
      monitorXHR(req, flags);
      _setRequestHeader = req.setRequestHeader;
      req.headers = {};
      req.setRequestHeader = function(name, value) {
        req.headers[name] = value;
        return _setRequestHeader.call(req, name, value);
      };
      _overrideMimeType = req.overrideMimeType;
      req.overrideMimeType = function(type) {
        req.mimeType = type;
        return _overrideMimeType.call(req, type);
      };
      return req;
    };
    extendNative(window.XMLHttpRequest, _XMLHttpRequest);
    if (window.XDomainRequest != null) {
      _XDomainRequest = window.XDomainRequest;
      window.XDomainRequest = function() {
        var req;
        req = new _XDomainRequest;
        monitorXHR(req);
        return req;
      };
      return extendNative(window.XDomainRequest, _XDomainRequest);
    }
  };

  init = function() {
    if (Offline.getOption('interceptRequests')) {
      Offline.onXHR(function(_arg) {
        var xhr;
        xhr = _arg.xhr;
        if (xhr.offline !== false) {
          return checkXHR(xhr, Offline.confirmUp, Offline.confirmDown);
        }
      });
    }
    if (Offline.getOption('checkOnLoad')) {
      return Offline.check();
    }
  };

  setTimeout(init, 0);

  window.Offline = Offline;

}).call(this);

(function() {
  var down, next, nope, rc, reset, retryIntv, tick, tryNow, up;

  if (!window.Offline) {
    throw new Error("Offline Reconnect brought in without offline.js");
  }

  rc = Offline.reconnect = {};

  retryIntv = null;

  reset = function() {
    var _ref;
    if ((rc.state != null) && rc.state !== 'inactive') {
      Offline.trigger('reconnect:stopped');
    }
    rc.state = 'inactive';
    return rc.remaining = rc.delay = (_ref = Offline.getOption('reconnect.initialDelay')) != null ? _ref : 3;
  };

  next = function() {
    var delay, _ref;
    delay = (_ref = Offline.getOption('reconnect.delay')) != null ? _ref : Math.min(Math.ceil(rc.delay * 1.5), 3600);
    return rc.remaining = rc.delay = delay;
  };

  tick = function() {
    if (rc.state === 'connecting') {
      return;
    }
    rc.remaining -= 1;
    Offline.trigger('reconnect:tick');
    if (rc.remaining === 0) {
      return tryNow();
    }
  };

  tryNow = function() {
    if (rc.state !== 'waiting') {
      return;
    }
    Offline.trigger('reconnect:connecting');
    rc.state = 'connecting';
    return Offline.check();
  };

  down = function() {
    if (!Offline.getOption('reconnect')) {
      return;
    }
    reset();
    rc.state = 'waiting';
    Offline.trigger('reconnect:started');
    return retryIntv = setInterval(tick, 1000);
  };

  up = function() {
    if (retryIntv != null) {
      clearInterval(retryIntv);
    }
    return reset();
  };

  nope = function() {
    if (!Offline.getOption('reconnect')) {
      return;
    }
    if (rc.state === 'connecting') {
      Offline.trigger('reconnect:failure');
      rc.state = 'waiting';
      return next();
    }
  };

  rc.tryNow = tryNow;

  reset();

  Offline.on('down', down);

  Offline.on('confirmed-down', nope);

  Offline.on('up', up);

}).call(this);


(function() {
  var clear, flush, held, holdRequest, makeRequest, waitingOnConfirm;

  if (!window.Offline) {
    throw new Error("Requests module brought in without offline.js");
  }

  held = [];

  waitingOnConfirm = false;

  holdRequest = function(req) {
    Offline.trigger('requests:capture');
    if (Offline.state !== 'down') {
      waitingOnConfirm = true;
    }
    return held.push(req);
  };

  makeRequest = function(_arg) {
    var body, name, password, type, url, user, val, xhr, _ref;
    xhr = _arg.xhr, url = _arg.url, type = _arg.type, user = _arg.user, password = _arg.password, body = _arg.body;
    xhr.abort();
    xhr.open(type, url, true, user, password);
    _ref = xhr.headers;
    for (name in _ref) {
      val = _ref[name];
      xhr.setRequestHeader(name, val);
    }
    if (xhr.mimeType) {
      xhr.overrideMimeType(xhr.mimeType);
    }
    return xhr.send(body);
  };

  clear = function() {
    return held = [];
  };

  flush = function() {
    var key, request, requests, url, _i, _len;
    Offline.trigger('requests:flush');
    requests = {};
    for (_i = 0, _len = held.length; _i < _len; _i++) {
      request = held[_i];
      url = request.url.replace(/(\?|&)_=[0-9]+/, function(match, char) {
        if (char === '?') {
          return char;
        } else {
          return '';
        }
      });
      requests["" + (request.type.toUpperCase()) + " - " + url] = request;
    }
    for (key in requests) {
      request = requests[key];
      makeRequest(request);
    }
    return clear();
  };

  setTimeout(function() {
    if (Offline.getOption('requests') !== false) {
      Offline.on('confirmed-up', function() {
        if (waitingOnConfirm) {
          waitingOnConfirm = false;
          return clear();
        }
      });
      Offline.on('up', flush);
      Offline.on('down', function() {
        return waitingOnConfirm = false;
      });
      Offline.onXHR(function(request) {
        var async, hold, xhr, _onreadystatechange, _send;
        xhr = request.xhr, async = request.async;
        if (xhr.offline === false) {
          return;
        }
        hold = function() {
          return holdRequest(request);
        };
        _send = xhr.send;
        xhr.send = function(body) {
          request.body = body;
          return _send.apply(xhr, arguments);
        };
        if (!async) {
          return;
        }
        if (xhr.onprogress === null) {
          xhr.addEventListener('error', hold, false);
          return xhr.addEventListener('timeout', hold, false);
        } else {
          _onreadystatechange = xhr.onreadystatechange;
          return xhr.onreadystatechange = function() {
            if (xhr.readyState === 0) {
              hold();
            } else if (xhr.readyState === 4 && (xhr.status === 0 || xhr.status >= 12000)) {
              hold();
            }
            return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
          };
        }
      });
      return Offline.requests = {
        flush: flush,
        clear: clear
      };
    }
  }, 0);

}).call(this);


(function() {
  var RETRY_TEMPLATE, TEMPLATE, addClass, content, createFromHTML, el, flashClass, flashTimeouts, formatTime, init, removeClass, render, _onreadystatechange, _ref;

  if (!window.Offline) {
    throw new Error("Offline UI brought in without offline.js");
  }

  TEMPLATE = '<div class="offline-ui"><div class="offline-ui-content"></div></div>';

  RETRY_TEMPLATE = '<a href class="offline-ui-retry"></a>';

  createFromHTML = function(html) {
    var el;
    el = document.createElement('div');
    el.innerHTML = html;
    return el.children[0];
  };

  el = content = null;

  addClass = function(name) {
    removeClass(name);
    return el.className += " " + name;
  };

  removeClass = function(name) {
    return el.className = el.className.replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)", 'gi'), ' ');
  };

  flashTimeouts = {};

  flashClass = function(name, time) {
    addClass(name);
    if (flashTimeouts[name] != null) {
      clearTimeout(flashTimeouts[name]);
    }
    return flashTimeouts[name] = setTimeout(function() {
      removeClass(name);
      return delete flashTimeouts[name];
    }, time * 1000);
  };

  formatTime = function(sec, long) {
    var formatters, longUnits, mult, out, unit, val;
    if (long == null) {
      long = false;
    }
    if (sec === 0) {
      return 'now';
    }
    formatters = {
      'd': 86400,
      'h': 3600,
      'm': 60,
      's': 1
    };
    longUnits = {
      's': 'second',
      'm': 'minute',
      'h': 'hour',
      'd': 'day'
    };
    out = '';
    for (unit in formatters) {
      mult = formatters[unit];
      if (sec >= mult) {
        val = Math.floor(sec / mult);
        if (long) {
          unit = " " + longUnits[unit];
          if (val !== 1) {
            unit += 's';
          }
        }
        return "" + val + unit;
      }
    }
  };

  render = function() {
    var button, handler;
    el = createFromHTML(TEMPLATE);
    document.body.appendChild(el);
    if ((Offline.reconnect != null) && Offline.getOption('reconnect')) {
      el.appendChild(createFromHTML(RETRY_TEMPLATE));
      button = el.querySelector('.offline-ui-retry');
      handler = function(e) {
        e.preventDefault();
        return Offline.reconnect.tryNow();
      };
      if (button.addEventListener != null) {
        button.addEventListener('click', handler, false);
      } else {
        button.attachEvent('click', handler);
      }
    }
    addClass("offline-ui-" + Offline.state);
    return content = el.querySelector('.offline-ui-content');
  };

  init = function() {
    render();
    Offline.on('up', function() {
      removeClass('offline-ui-down');
      addClass('offline-ui-up');
      flashClass('offline-ui-up-2s', 2);
      return flashClass('offline-ui-up-5s', 5);
    });
    Offline.on('down', function() {
      removeClass('offline-ui-up');
      addClass('offline-ui-down');
      flashClass('offline-ui-down-2s', 2);
      return flashClass('offline-ui-down-5s', 5);
    });
    Offline.on('reconnect:connecting', function() {
      addClass('offline-ui-connecting');
      return removeClass('offline-ui-waiting');
    });
    Offline.on('reconnect:tick', function() {
      addClass('offline-ui-waiting');
      removeClass('offline-ui-connecting');
      content.setAttribute('data-retry-in-seconds', Offline.reconnect.remaining);
      content.setAttribute('data-retry-in-abbr', formatTime(Offline.reconnect.remaining));
      return content.setAttribute('data-retry-in', formatTime(Offline.reconnect.remaining, true));
    });
    Offline.on('reconnect:stopped', function() {
      removeClass('offline-ui-connecting offline-ui-waiting');
      content.setAttribute('data-retry-in-seconds', null);
      content.setAttribute('data-retry-in-abbr', null);
      return content.setAttribute('data-retry-in', null);
    });
    Offline.on('reconnect:failure', function() {
      flashClass('offline-ui-reconnect-failed-2s', 2);
      return flashClass('offline-ui-reconnect-failed-5s', 5);
    });
    return Offline.on('reconnect:success', function() {
      flashClass('offline-ui-reconnect-succeeded-2s', 2);
      return flashClass('offline-ui-reconnect-succeeded-5s', 5);
    });
  };

  if ((_ref = document.readyState) === 'interactive' || _ref === 'complete') {
    init();
  } else if (document.addEventListener != null) {
    document.addEventListener('DOMContentLoaded', init, false);
  } else {
    _onreadystatechange = document.onreadystatechange;
    document.onreadystatechange = function() {
      if (document.readyState === 'complete') {
        init();
      }
      return typeof _onreadystatechange === "function" ? _onreadystatechange.apply(null, arguments) : void 0;
    };
  }

}).call(this);
