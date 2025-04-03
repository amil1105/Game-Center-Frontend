const H = /* @__PURE__ */ Object.create(null);
H.open = "0";
H.close = "1";
H.ping = "2";
H.pong = "3";
H.message = "4";
H.upgrade = "5";
H.noop = "6";
const ye = /* @__PURE__ */ Object.create(null);
Object.keys(H).forEach((t) => {
  ye[H[t]] = t;
});
const Ie = { type: "error", data: "parser error" }, Bt = typeof Blob == "function" || typeof Blob < "u" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]", Pt = typeof ArrayBuffer == "function", Lt = (t) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(t) : t && t.buffer instanceof ArrayBuffer, Ze = ({ type: t, data: e }, n, r) => Bt && e instanceof Blob ? n ? r(e) : pt(e, r) : Pt && (e instanceof ArrayBuffer || Lt(e)) ? n ? r(e) : pt(new Blob([e]), r) : r(H[t] + (e || "")), pt = (t, e) => {
  const n = new FileReader();
  return n.onload = function() {
    const r = n.result.split(",")[1];
    e("b" + (r || ""));
  }, n.readAsDataURL(t);
};
function mt(t) {
  return t instanceof Uint8Array ? t : t instanceof ArrayBuffer ? new Uint8Array(t) : new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
}
let Le;
function _n(t, e) {
  if (Bt && t.data instanceof Blob)
    return t.data.arrayBuffer().then(mt).then(e);
  if (Pt && (t.data instanceof ArrayBuffer || Lt(t.data)))
    return e(mt(t.data));
  Ze(t, !1, (n) => {
    Le || (Le = new TextEncoder()), e(Le.encode(n));
  });
}
const yt = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", ae = typeof Uint8Array > "u" ? [] : new Uint8Array(256);
for (let t = 0; t < yt.length; t++)
  ae[yt.charCodeAt(t)] = t;
const En = (t) => {
  let e = t.length * 0.75, n = t.length, r, s = 0, i, o, c, a;
  t[t.length - 1] === "=" && (e--, t[t.length - 2] === "=" && e--);
  const u = new ArrayBuffer(e), l = new Uint8Array(u);
  for (r = 0; r < n; r += 4)
    i = ae[t.charCodeAt(r)], o = ae[t.charCodeAt(r + 1)], c = ae[t.charCodeAt(r + 2)], a = ae[t.charCodeAt(r + 3)], l[s++] = i << 2 | o >> 4, l[s++] = (o & 15) << 4 | c >> 2, l[s++] = (c & 3) << 6 | a & 63;
  return u;
}, xn = typeof ArrayBuffer == "function", et = (t, e) => {
  if (typeof t != "string")
    return {
      type: "message",
      data: Dt(t, e)
    };
  const n = t.charAt(0);
  return n === "b" ? {
    type: "message",
    data: Sn(t.substring(1), e)
  } : ye[n] ? t.length > 1 ? {
    type: ye[n],
    data: t.substring(1)
  } : {
    type: ye[n]
  } : Ie;
}, Sn = (t, e) => {
  if (xn) {
    const n = En(t);
    return Dt(n, e);
  } else
    return { base64: !0, data: t };
}, Dt = (t, e) => {
  switch (e) {
    case "blob":
      return t instanceof Blob ? t : new Blob([t]);
    case "arraybuffer":
    default:
      return t instanceof ArrayBuffer ? t : t.buffer;
  }
}, qt = "", Rn = (t, e) => {
  const n = t.length, r = new Array(n);
  let s = 0;
  t.forEach((i, o) => {
    Ze(i, !1, (c) => {
      r[o] = c, ++s === n && e(r.join(qt));
    });
  });
}, An = (t, e) => {
  const n = t.split(qt), r = [];
  for (let s = 0; s < n.length; s++) {
    const i = et(n[s], e);
    if (r.push(i), i.type === "error")
      break;
  }
  return r;
};
function vn() {
  return new TransformStream({
    transform(t, e) {
      _n(t, (n) => {
        const r = n.length;
        let s;
        if (r < 126)
          s = new Uint8Array(1), new DataView(s.buffer).setUint8(0, r);
        else if (r < 65536) {
          s = new Uint8Array(3);
          const i = new DataView(s.buffer);
          i.setUint8(0, 126), i.setUint16(1, r);
        } else {
          s = new Uint8Array(9);
          const i = new DataView(s.buffer);
          i.setUint8(0, 127), i.setBigUint64(1, BigInt(r));
        }
        t.data && typeof t.data != "string" && (s[0] |= 128), e.enqueue(s), e.enqueue(n);
      });
    }
  });
}
let De;
function pe(t) {
  return t.reduce((e, n) => e + n.length, 0);
}
function me(t, e) {
  if (t[0].length === e)
    return t.shift();
  const n = new Uint8Array(e);
  let r = 0;
  for (let s = 0; s < e; s++)
    n[s] = t[0][r++], r === t[0].length && (t.shift(), r = 0);
  return t.length && r < t[0].length && (t[0] = t[0].slice(r)), n;
}
function On(t, e) {
  De || (De = new TextDecoder());
  const n = [];
  let r = 0, s = -1, i = !1;
  return new TransformStream({
    transform(o, c) {
      for (n.push(o); ; ) {
        if (r === 0) {
          if (pe(n) < 1)
            break;
          const a = me(n, 1);
          i = (a[0] & 128) === 128, s = a[0] & 127, s < 126 ? r = 3 : s === 126 ? r = 1 : r = 2;
        } else if (r === 1) {
          if (pe(n) < 2)
            break;
          const a = me(n, 2);
          s = new DataView(a.buffer, a.byteOffset, a.length).getUint16(0), r = 3;
        } else if (r === 2) {
          if (pe(n) < 8)
            break;
          const a = me(n, 8), u = new DataView(a.buffer, a.byteOffset, a.length), l = u.getUint32(0);
          if (l > Math.pow(2, 21) - 1) {
            c.enqueue(Ie);
            break;
          }
          s = l * Math.pow(2, 32) + u.getUint32(4), r = 3;
        } else {
          if (pe(n) < s)
            break;
          const a = me(n, s);
          c.enqueue(et(i ? a : De.decode(a), e)), r = 0;
        }
        if (s === 0 || s > t) {
          c.enqueue(Ie);
          break;
        }
      }
    }
  });
}
const Ft = 4;
function C(t) {
  if (t) return kn(t);
}
function kn(t) {
  for (var e in C.prototype)
    t[e] = C.prototype[e];
  return t;
}
C.prototype.on = C.prototype.addEventListener = function(t, e) {
  return this._callbacks = this._callbacks || {}, (this._callbacks["$" + t] = this._callbacks["$" + t] || []).push(e), this;
};
C.prototype.once = function(t, e) {
  function n() {
    this.off(t, n), e.apply(this, arguments);
  }
  return n.fn = e, this.on(t, n), this;
};
C.prototype.off = C.prototype.removeListener = C.prototype.removeAllListeners = C.prototype.removeEventListener = function(t, e) {
  if (this._callbacks = this._callbacks || {}, arguments.length == 0)
    return this._callbacks = {}, this;
  var n = this._callbacks["$" + t];
  if (!n) return this;
  if (arguments.length == 1)
    return delete this._callbacks["$" + t], this;
  for (var r, s = 0; s < n.length; s++)
    if (r = n[s], r === e || r.fn === e) {
      n.splice(s, 1);
      break;
    }
  return n.length === 0 && delete this._callbacks["$" + t], this;
};
C.prototype.emit = function(t) {
  this._callbacks = this._callbacks || {};
  for (var e = new Array(arguments.length - 1), n = this._callbacks["$" + t], r = 1; r < arguments.length; r++)
    e[r - 1] = arguments[r];
  if (n) {
    n = n.slice(0);
    for (var r = 0, s = n.length; r < s; ++r)
      n[r].apply(this, e);
  }
  return this;
};
C.prototype.emitReserved = C.prototype.emit;
C.prototype.listeners = function(t) {
  return this._callbacks = this._callbacks || {}, this._callbacks["$" + t] || [];
};
C.prototype.hasListeners = function(t) {
  return !!this.listeners(t).length;
};
const ve = typeof Promise == "function" && typeof Promise.resolve == "function" ? (e) => Promise.resolve().then(e) : (e, n) => n(e, 0), F = typeof self < "u" ? self : typeof window < "u" ? window : Function("return this")(), Tn = "arraybuffer";
function Ut(t, ...e) {
  return e.reduce((n, r) => (t.hasOwnProperty(r) && (n[r] = t[r]), n), {});
}
const Cn = F.setTimeout, Nn = F.clearTimeout;
function Oe(t, e) {
  e.useNativeTimers ? (t.setTimeoutFn = Cn.bind(F), t.clearTimeoutFn = Nn.bind(F)) : (t.setTimeoutFn = F.setTimeout.bind(F), t.clearTimeoutFn = F.clearTimeout.bind(F));
}
const Bn = 1.33;
function Pn(t) {
  return typeof t == "string" ? Ln(t) : Math.ceil((t.byteLength || t.size) * Bn);
}
function Ln(t) {
  let e = 0, n = 0;
  for (let r = 0, s = t.length; r < s; r++)
    e = t.charCodeAt(r), e < 128 ? n += 1 : e < 2048 ? n += 2 : e < 55296 || e >= 57344 ? n += 3 : (r++, n += 4);
  return n;
}
function Mt() {
  return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
}
function Dn(t) {
  let e = "";
  for (let n in t)
    t.hasOwnProperty(n) && (e.length && (e += "&"), e += encodeURIComponent(n) + "=" + encodeURIComponent(t[n]));
  return e;
}
function qn(t) {
  let e = {}, n = t.split("&");
  for (let r = 0, s = n.length; r < s; r++) {
    let i = n[r].split("=");
    e[decodeURIComponent(i[0])] = decodeURIComponent(i[1]);
  }
  return e;
}
class Fn extends Error {
  constructor(e, n, r) {
    super(e), this.description = n, this.context = r, this.type = "TransportError";
  }
}
class tt extends C {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(e) {
    super(), this.writable = !1, Oe(this, e), this.opts = e, this.query = e.query, this.socket = e.socket, this.supportsBinary = !e.forceBase64;
  }
  /**
   * Emits an error.
   *
   * @param {String} reason
   * @param description
   * @param context - the error context
   * @return {Transport} for chaining
   * @protected
   */
  onError(e, n, r) {
    return super.emitReserved("error", new Fn(e, n, r)), this;
  }
  /**
   * Opens the transport.
   */
  open() {
    return this.readyState = "opening", this.doOpen(), this;
  }
  /**
   * Closes the transport.
   */
  close() {
    return (this.readyState === "opening" || this.readyState === "open") && (this.doClose(), this.onClose()), this;
  }
  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   */
  send(e) {
    this.readyState === "open" && this.write(e);
  }
  /**
   * Called upon open
   *
   * @protected
   */
  onOpen() {
    this.readyState = "open", this.writable = !0, super.emitReserved("open");
  }
  /**
   * Called with data.
   *
   * @param {String} data
   * @protected
   */
  onData(e) {
    const n = et(e, this.socket.binaryType);
    this.onPacket(n);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(e) {
    super.emitReserved("packet", e);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(e) {
    this.readyState = "closed", super.emitReserved("close", e);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(e) {
  }
  createUri(e, n = {}) {
    return e + "://" + this._hostname() + this._port() + this.opts.path + this._query(n);
  }
  _hostname() {
    const e = this.opts.hostname;
    return e.indexOf(":") === -1 ? e : "[" + e + "]";
  }
  _port() {
    return this.opts.port && (this.opts.secure && +(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80) ? ":" + this.opts.port : "";
  }
  _query(e) {
    const n = Dn(e);
    return n.length ? "?" + n : "";
  }
}
class Un extends tt {
  constructor() {
    super(...arguments), this._polling = !1;
  }
  get name() {
    return "polling";
  }
  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @protected
   */
  doOpen() {
    this._poll();
  }
  /**
   * Pauses polling.
   *
   * @param {Function} onPause - callback upon buffers are flushed and transport is paused
   * @package
   */
  pause(e) {
    this.readyState = "pausing";
    const n = () => {
      this.readyState = "paused", e();
    };
    if (this._polling || !this.writable) {
      let r = 0;
      this._polling && (r++, this.once("pollComplete", function() {
        --r || n();
      })), this.writable || (r++, this.once("drain", function() {
        --r || n();
      }));
    } else
      n();
  }
  /**
   * Starts polling cycle.
   *
   * @private
   */
  _poll() {
    this._polling = !0, this.doPoll(), this.emitReserved("poll");
  }
  /**
   * Overloads onData to detect payloads.
   *
   * @protected
   */
  onData(e) {
    const n = (r) => {
      if (this.readyState === "opening" && r.type === "open" && this.onOpen(), r.type === "close")
        return this.onClose({ description: "transport closed by the server" }), !1;
      this.onPacket(r);
    };
    An(e, this.socket.binaryType).forEach(n), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll());
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const e = () => {
      this.write([{ type: "close" }]);
    };
    this.readyState === "open" ? e() : this.once("open", e);
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(e) {
    this.writable = !1, Rn(e, (n) => {
      this.doWrite(n, () => {
        this.writable = !0, this.emitReserved("drain");
      });
    });
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const e = this.opts.secure ? "https" : "http", n = this.query || {};
    return this.opts.timestampRequests !== !1 && (n[this.opts.timestampParam] = Mt()), !this.supportsBinary && !n.sid && (n.b64 = 1), this.createUri(e, n);
  }
}
let It = !1;
try {
  It = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest();
} catch {
}
const Mn = It;
function In() {
}
class $n extends Un {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(e) {
    if (super(e), typeof location < "u") {
      const n = location.protocol === "https:";
      let r = location.port;
      r || (r = n ? "443" : "80"), this.xd = typeof location < "u" && e.hostname !== location.hostname || r !== e.port;
    }
  }
  /**
   * Sends data.
   *
   * @param {String} data to send.
   * @param {Function} called upon flush.
   * @private
   */
  doWrite(e, n) {
    const r = this.request({
      method: "POST",
      data: e
    });
    r.on("success", n), r.on("error", (s, i) => {
      this.onError("xhr post error", s, i);
    });
  }
  /**
   * Starts a poll cycle.
   *
   * @private
   */
  doPoll() {
    const e = this.request();
    e.on("data", this.onData.bind(this)), e.on("error", (n, r) => {
      this.onError("xhr poll error", n, r);
    }), this.pollXhr = e;
  }
}
let ee = class ge extends C {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(e, n, r) {
    super(), this.createRequest = e, Oe(this, r), this._opts = r, this._method = r.method || "GET", this._uri = n, this._data = r.data !== void 0 ? r.data : null, this._create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  _create() {
    var e;
    const n = Ut(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    n.xdomain = !!this._opts.xd;
    const r = this._xhr = this.createRequest(n);
    try {
      r.open(this._method, this._uri, !0);
      try {
        if (this._opts.extraHeaders) {
          r.setDisableHeaderCheck && r.setDisableHeaderCheck(!0);
          for (let s in this._opts.extraHeaders)
            this._opts.extraHeaders.hasOwnProperty(s) && r.setRequestHeader(s, this._opts.extraHeaders[s]);
        }
      } catch {
      }
      if (this._method === "POST")
        try {
          r.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch {
        }
      try {
        r.setRequestHeader("Accept", "*/*");
      } catch {
      }
      (e = this._opts.cookieJar) === null || e === void 0 || e.addCookies(r), "withCredentials" in r && (r.withCredentials = this._opts.withCredentials), this._opts.requestTimeout && (r.timeout = this._opts.requestTimeout), r.onreadystatechange = () => {
        var s;
        r.readyState === 3 && ((s = this._opts.cookieJar) === null || s === void 0 || s.parseCookies(
          // @ts-ignore
          r.getResponseHeader("set-cookie")
        )), r.readyState === 4 && (r.status === 200 || r.status === 1223 ? this._onLoad() : this.setTimeoutFn(() => {
          this._onError(typeof r.status == "number" ? r.status : 0);
        }, 0));
      }, r.send(this._data);
    } catch (s) {
      this.setTimeoutFn(() => {
        this._onError(s);
      }, 0);
      return;
    }
    typeof document < "u" && (this._index = ge.requestsCount++, ge.requests[this._index] = this);
  }
  /**
   * Called upon error.
   *
   * @private
   */
  _onError(e) {
    this.emitReserved("error", e, this._xhr), this._cleanup(!0);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  _cleanup(e) {
    if (!(typeof this._xhr > "u" || this._xhr === null)) {
      if (this._xhr.onreadystatechange = In, e)
        try {
          this._xhr.abort();
        } catch {
        }
      typeof document < "u" && delete ge.requests[this._index], this._xhr = null;
    }
  }
  /**
   * Called upon load.
   *
   * @private
   */
  _onLoad() {
    const e = this._xhr.responseText;
    e !== null && (this.emitReserved("data", e), this.emitReserved("success"), this._cleanup());
  }
  /**
   * Aborts the request.
   *
   * @package
   */
  abort() {
    this._cleanup();
  }
};
ee.requestsCount = 0;
ee.requests = {};
if (typeof document < "u") {
  if (typeof attachEvent == "function")
    attachEvent("onunload", gt);
  else if (typeof addEventListener == "function") {
    const t = "onpagehide" in F ? "pagehide" : "unload";
    addEventListener(t, gt, !1);
  }
}
function gt() {
  for (let t in ee.requests)
    ee.requests.hasOwnProperty(t) && ee.requests[t].abort();
}
const jn = function() {
  const t = $t({
    xdomain: !1
  });
  return t && t.responseType !== null;
}();
class zn extends $n {
  constructor(e) {
    super(e);
    const n = e && e.forceBase64;
    this.supportsBinary = jn && !n;
  }
  request(e = {}) {
    return Object.assign(e, { xd: this.xd }, this.opts), new ee($t, this.uri(), e);
  }
}
function $t(t) {
  const e = t.xdomain;
  try {
    if (typeof XMLHttpRequest < "u" && (!e || Mn))
      return new XMLHttpRequest();
  } catch {
  }
  if (!e)
    try {
      return new F[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch {
    }
}
const jt = typeof navigator < "u" && typeof navigator.product == "string" && navigator.product.toLowerCase() === "reactnative";
class Hn extends tt {
  get name() {
    return "websocket";
  }
  doOpen() {
    const e = this.uri(), n = this.opts.protocols, r = jt ? {} : Ut(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    this.opts.extraHeaders && (r.headers = this.opts.extraHeaders);
    try {
      this.ws = this.createSocket(e, n, r);
    } catch (s) {
      return this.emitReserved("error", s);
    }
    this.ws.binaryType = this.socket.binaryType, this.addEventListeners();
  }
  /**
   * Adds event listeners to the socket
   *
   * @private
   */
  addEventListeners() {
    this.ws.onopen = () => {
      this.opts.autoUnref && this.ws._socket.unref(), this.onOpen();
    }, this.ws.onclose = (e) => this.onClose({
      description: "websocket connection closed",
      context: e
    }), this.ws.onmessage = (e) => this.onData(e.data), this.ws.onerror = (e) => this.onError("websocket error", e);
  }
  write(e) {
    this.writable = !1;
    for (let n = 0; n < e.length; n++) {
      const r = e[n], s = n === e.length - 1;
      Ze(r, this.supportsBinary, (i) => {
        try {
          this.doWrite(r, i);
        } catch {
        }
        s && ve(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    typeof this.ws < "u" && (this.ws.onerror = () => {
    }, this.ws.close(), this.ws = null);
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const e = this.opts.secure ? "wss" : "ws", n = this.query || {};
    return this.opts.timestampRequests && (n[this.opts.timestampParam] = Mt()), this.supportsBinary || (n.b64 = 1), this.createUri(e, n);
  }
}
const qe = F.WebSocket || F.MozWebSocket;
class Vn extends Hn {
  createSocket(e, n, r) {
    return jt ? new qe(e, n, r) : n ? new qe(e, n) : new qe(e);
  }
  doWrite(e, n) {
    this.ws.send(n);
  }
}
class Jn extends tt {
  get name() {
    return "webtransport";
  }
  doOpen() {
    try {
      this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    } catch (e) {
      return this.emitReserved("error", e);
    }
    this._transport.closed.then(() => {
      this.onClose();
    }).catch((e) => {
      this.onError("webtransport error", e);
    }), this._transport.ready.then(() => {
      this._transport.createBidirectionalStream().then((e) => {
        const n = On(Number.MAX_SAFE_INTEGER, this.socket.binaryType), r = e.readable.pipeThrough(n).getReader(), s = vn();
        s.readable.pipeTo(e.writable), this._writer = s.writable.getWriter();
        const i = () => {
          r.read().then(({ done: c, value: a }) => {
            c || (this.onPacket(a), i());
          }).catch((c) => {
          });
        };
        i();
        const o = { type: "open" };
        this.query.sid && (o.data = `{"sid":"${this.query.sid}"}`), this._writer.write(o).then(() => this.onOpen());
      });
    });
  }
  write(e) {
    this.writable = !1;
    for (let n = 0; n < e.length; n++) {
      const r = e[n], s = n === e.length - 1;
      this._writer.write(r).then(() => {
        s && ve(() => {
          this.writable = !0, this.emitReserved("drain");
        }, this.setTimeoutFn);
      });
    }
  }
  doClose() {
    var e;
    (e = this._transport) === null || e === void 0 || e.close();
  }
}
const Wn = {
  websocket: Vn,
  webtransport: Jn,
  polling: zn
}, Kn = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/, Xn = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
function $e(t) {
  if (t.length > 8e3)
    throw "URI too long";
  const e = t, n = t.indexOf("["), r = t.indexOf("]");
  n != -1 && r != -1 && (t = t.substring(0, n) + t.substring(n, r).replace(/:/g, ";") + t.substring(r, t.length));
  let s = Kn.exec(t || ""), i = {}, o = 14;
  for (; o--; )
    i[Xn[o]] = s[o] || "";
  return n != -1 && r != -1 && (i.source = e, i.host = i.host.substring(1, i.host.length - 1).replace(/;/g, ":"), i.authority = i.authority.replace("[", "").replace("]", "").replace(/;/g, ":"), i.ipv6uri = !0), i.pathNames = Yn(i, i.path), i.queryKey = Gn(i, i.query), i;
}
function Yn(t, e) {
  const n = /\/{2,9}/g, r = e.replace(n, "/").split("/");
  return (e.slice(0, 1) == "/" || e.length === 0) && r.splice(0, 1), e.slice(-1) == "/" && r.splice(r.length - 1, 1), r;
}
function Gn(t, e) {
  const n = {};
  return e.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function(r, s, i) {
    s && (n[s] = i);
  }), n;
}
const je = typeof addEventListener == "function" && typeof removeEventListener == "function", be = [];
je && addEventListener("offline", () => {
  be.forEach((t) => t());
}, !1);
class W extends C {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(e, n) {
    if (super(), this.binaryType = Tn, this.writeBuffer = [], this._prevBufferLen = 0, this._pingInterval = -1, this._pingTimeout = -1, this._maxPayload = -1, this._pingTimeoutTime = 1 / 0, e && typeof e == "object" && (n = e, e = null), e) {
      const r = $e(e);
      n.hostname = r.host, n.secure = r.protocol === "https" || r.protocol === "wss", n.port = r.port, r.query && (n.query = r.query);
    } else n.host && (n.hostname = $e(n.host).host);
    Oe(this, n), this.secure = n.secure != null ? n.secure : typeof location < "u" && location.protocol === "https:", n.hostname && !n.port && (n.port = this.secure ? "443" : "80"), this.hostname = n.hostname || (typeof location < "u" ? location.hostname : "localhost"), this.port = n.port || (typeof location < "u" && location.port ? location.port : this.secure ? "443" : "80"), this.transports = [], this._transportsByName = {}, n.transports.forEach((r) => {
      const s = r.prototype.name;
      this.transports.push(s), this._transportsByName[s] = r;
    }), this.opts = Object.assign({
      path: "/engine.io",
      agent: !1,
      withCredentials: !1,
      upgrade: !0,
      timestampParam: "t",
      rememberUpgrade: !1,
      addTrailingSlash: !0,
      rejectUnauthorized: !0,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: !1
    }, n), this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : ""), typeof this.opts.query == "string" && (this.opts.query = qn(this.opts.query)), je && (this.opts.closeOnBeforeunload && (this._beforeunloadEventListener = () => {
      this.transport && (this.transport.removeAllListeners(), this.transport.close());
    }, addEventListener("beforeunload", this._beforeunloadEventListener, !1)), this.hostname !== "localhost" && (this._offlineEventListener = () => {
      this._onClose("transport close", {
        description: "network connection lost"
      });
    }, be.push(this._offlineEventListener))), this.opts.withCredentials && (this._cookieJar = void 0), this._open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(e) {
    const n = Object.assign({}, this.opts.query);
    n.EIO = Ft, n.transport = e, this.id && (n.sid = this.id);
    const r = Object.assign({}, this.opts, {
      query: n,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[e]);
    return new this._transportsByName[e](r);
  }
  /**
   * Initializes transport to use and starts probe.
   *
   * @private
   */
  _open() {
    if (this.transports.length === 0) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    }
    const e = this.opts.rememberUpgrade && W.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
    this.readyState = "opening";
    const n = this.createTransport(e);
    n.open(), this.setTransport(n);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(e) {
    this.transport && this.transport.removeAllListeners(), this.transport = e, e.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (n) => this._onClose("transport close", n));
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    this.readyState = "open", W.priorWebsocketSuccess = this.transport.name === "websocket", this.emitReserved("open"), this.flush();
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  _onPacket(e) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing")
      switch (this.emitReserved("packet", e), this.emitReserved("heartbeat"), e.type) {
        case "open":
          this.onHandshake(JSON.parse(e.data));
          break;
        case "ping":
          this._sendPacket("pong"), this.emitReserved("ping"), this.emitReserved("pong"), this._resetPingTimeout();
          break;
        case "error":
          const n = new Error("server error");
          n.code = e.data, this._onError(n);
          break;
        case "message":
          this.emitReserved("data", e.data), this.emitReserved("message", e.data);
          break;
      }
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(e) {
    this.emitReserved("handshake", e), this.id = e.sid, this.transport.query.sid = e.sid, this._pingInterval = e.pingInterval, this._pingTimeout = e.pingTimeout, this._maxPayload = e.maxPayload, this.onOpen(), this.readyState !== "closed" && this._resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  _resetPingTimeout() {
    this.clearTimeoutFn(this._pingTimeoutTimer);
    const e = this._pingInterval + this._pingTimeout;
    this._pingTimeoutTime = Date.now() + e, this._pingTimeoutTimer = this.setTimeoutFn(() => {
      this._onClose("ping timeout");
    }, e), this.opts.autoUnref && this._pingTimeoutTimer.unref();
  }
  /**
   * Called on `drain` event
   *
   * @private
   */
  _onDrain() {
    this.writeBuffer.splice(0, this._prevBufferLen), this._prevBufferLen = 0, this.writeBuffer.length === 0 ? this.emitReserved("drain") : this.flush();
  }
  /**
   * Flush write buffers.
   *
   * @private
   */
  flush() {
    if (this.readyState !== "closed" && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const e = this._getWritablePackets();
      this.transport.send(e), this._prevBufferLen = e.length, this.emitReserved("flush");
    }
  }
  /**
   * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
   * long-polling)
   *
   * @private
   */
  _getWritablePackets() {
    if (!(this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1))
      return this.writeBuffer;
    let n = 1;
    for (let r = 0; r < this.writeBuffer.length; r++) {
      const s = this.writeBuffer[r].data;
      if (s && (n += Pn(s)), r > 0 && n > this._maxPayload)
        return this.writeBuffer.slice(0, r);
      n += 2;
    }
    return this.writeBuffer;
  }
  /**
   * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
   *
   * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
   * `write()` method then the message would not be buffered by the Socket.IO client.
   *
   * @return {boolean}
   * @private
   */
  /* private */
  _hasPingExpired() {
    if (!this._pingTimeoutTime)
      return !0;
    const e = Date.now() > this._pingTimeoutTime;
    return e && (this._pingTimeoutTime = 0, ve(() => {
      this._onClose("ping timeout");
    }, this.setTimeoutFn)), e;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  write(e, n, r) {
    return this._sendPacket("message", e, n, r), this;
  }
  /**
   * Sends a message. Alias of {@link Socket#write}.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @return {Socket} for chaining.
   */
  send(e, n, r) {
    return this._sendPacket("message", e, n, r), this;
  }
  /**
   * Sends a packet.
   *
   * @param {String} type: packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @private
   */
  _sendPacket(e, n, r, s) {
    if (typeof n == "function" && (s = n, n = void 0), typeof r == "function" && (s = r, r = null), this.readyState === "closing" || this.readyState === "closed")
      return;
    r = r || {}, r.compress = r.compress !== !1;
    const i = {
      type: e,
      data: n,
      options: r
    };
    this.emitReserved("packetCreate", i), this.writeBuffer.push(i), s && this.once("flush", s), this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const e = () => {
      this._onClose("forced close"), this.transport.close();
    }, n = () => {
      this.off("upgrade", n), this.off("upgradeError", n), e();
    }, r = () => {
      this.once("upgrade", n), this.once("upgradeError", n);
    };
    return (this.readyState === "opening" || this.readyState === "open") && (this.readyState = "closing", this.writeBuffer.length ? this.once("drain", () => {
      this.upgrading ? r() : e();
    }) : this.upgrading ? r() : e()), this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  _onError(e) {
    if (W.priorWebsocketSuccess = !1, this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening")
      return this.transports.shift(), this._open();
    this.emitReserved("error", e), this._onClose("transport error", e);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  _onClose(e, n) {
    if (this.readyState === "opening" || this.readyState === "open" || this.readyState === "closing") {
      if (this.clearTimeoutFn(this._pingTimeoutTimer), this.transport.removeAllListeners("close"), this.transport.close(), this.transport.removeAllListeners(), je && (this._beforeunloadEventListener && removeEventListener("beforeunload", this._beforeunloadEventListener, !1), this._offlineEventListener)) {
        const r = be.indexOf(this._offlineEventListener);
        r !== -1 && be.splice(r, 1);
      }
      this.readyState = "closed", this.id = null, this.emitReserved("close", e, n), this.writeBuffer = [], this._prevBufferLen = 0;
    }
  }
}
W.protocol = Ft;
class Qn extends W {
  constructor() {
    super(...arguments), this._upgrades = [];
  }
  onOpen() {
    if (super.onOpen(), this.readyState === "open" && this.opts.upgrade)
      for (let e = 0; e < this._upgrades.length; e++)
        this._probe(this._upgrades[e]);
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  _probe(e) {
    let n = this.createTransport(e), r = !1;
    W.priorWebsocketSuccess = !1;
    const s = () => {
      r || (n.send([{ type: "ping", data: "probe" }]), n.once("packet", (f) => {
        if (!r)
          if (f.type === "pong" && f.data === "probe") {
            if (this.upgrading = !0, this.emitReserved("upgrading", n), !n)
              return;
            W.priorWebsocketSuccess = n.name === "websocket", this.transport.pause(() => {
              r || this.readyState !== "closed" && (l(), this.setTransport(n), n.send([{ type: "upgrade" }]), this.emitReserved("upgrade", n), n = null, this.upgrading = !1, this.flush());
            });
          } else {
            const h = new Error("probe error");
            h.transport = n.name, this.emitReserved("upgradeError", h);
          }
      }));
    };
    function i() {
      r || (r = !0, l(), n.close(), n = null);
    }
    const o = (f) => {
      const h = new Error("probe error: " + f);
      h.transport = n.name, i(), this.emitReserved("upgradeError", h);
    };
    function c() {
      o("transport closed");
    }
    function a() {
      o("socket closed");
    }
    function u(f) {
      n && f.name !== n.name && i();
    }
    const l = () => {
      n.removeListener("open", s), n.removeListener("error", o), n.removeListener("close", c), this.off("close", a), this.off("upgrading", u);
    };
    n.once("open", s), n.once("error", o), n.once("close", c), this.once("close", a), this.once("upgrading", u), this._upgrades.indexOf("webtransport") !== -1 && e !== "webtransport" ? this.setTimeoutFn(() => {
      r || n.open();
    }, 200) : n.open();
  }
  onHandshake(e) {
    this._upgrades = this._filterUpgrades(e.upgrades), super.onHandshake(e);
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  _filterUpgrades(e) {
    const n = [];
    for (let r = 0; r < e.length; r++)
      ~this.transports.indexOf(e[r]) && n.push(e[r]);
    return n;
  }
}
let Zn = class extends Qn {
  constructor(e, n = {}) {
    const r = typeof e == "object" ? e : n;
    (!r.transports || r.transports && typeof r.transports[0] == "string") && (r.transports = (r.transports || ["polling", "websocket", "webtransport"]).map((s) => Wn[s]).filter((s) => !!s)), super(e, r);
  }
};
function er(t, e = "", n) {
  let r = t;
  n = n || typeof location < "u" && location, t == null && (t = n.protocol + "//" + n.host), typeof t == "string" && (t.charAt(0) === "/" && (t.charAt(1) === "/" ? t = n.protocol + t : t = n.host + t), /^(https?|wss?):\/\//.test(t) || (typeof n < "u" ? t = n.protocol + "//" + t : t = "https://" + t), r = $e(t)), r.port || (/^(http|ws)$/.test(r.protocol) ? r.port = "80" : /^(http|ws)s$/.test(r.protocol) && (r.port = "443")), r.path = r.path || "/";
  const i = r.host.indexOf(":") !== -1 ? "[" + r.host + "]" : r.host;
  return r.id = r.protocol + "://" + i + ":" + r.port + e, r.href = r.protocol + "://" + i + (n && n.port === r.port ? "" : ":" + r.port), r;
}
const tr = typeof ArrayBuffer == "function", nr = (t) => typeof ArrayBuffer.isView == "function" ? ArrayBuffer.isView(t) : t.buffer instanceof ArrayBuffer, zt = Object.prototype.toString, rr = typeof Blob == "function" || typeof Blob < "u" && zt.call(Blob) === "[object BlobConstructor]", sr = typeof File == "function" || typeof File < "u" && zt.call(File) === "[object FileConstructor]";
function nt(t) {
  return tr && (t instanceof ArrayBuffer || nr(t)) || rr && t instanceof Blob || sr && t instanceof File;
}
function we(t, e) {
  if (!t || typeof t != "object")
    return !1;
  if (Array.isArray(t)) {
    for (let n = 0, r = t.length; n < r; n++)
      if (we(t[n]))
        return !0;
    return !1;
  }
  if (nt(t))
    return !0;
  if (t.toJSON && typeof t.toJSON == "function" && arguments.length === 1)
    return we(t.toJSON(), !0);
  for (const n in t)
    if (Object.prototype.hasOwnProperty.call(t, n) && we(t[n]))
      return !0;
  return !1;
}
function ir(t) {
  const e = [], n = t.data, r = t;
  return r.data = ze(n, e), r.attachments = e.length, { packet: r, buffers: e };
}
function ze(t, e) {
  if (!t)
    return t;
  if (nt(t)) {
    const n = { _placeholder: !0, num: e.length };
    return e.push(t), n;
  } else if (Array.isArray(t)) {
    const n = new Array(t.length);
    for (let r = 0; r < t.length; r++)
      n[r] = ze(t[r], e);
    return n;
  } else if (typeof t == "object" && !(t instanceof Date)) {
    const n = {};
    for (const r in t)
      Object.prototype.hasOwnProperty.call(t, r) && (n[r] = ze(t[r], e));
    return n;
  }
  return t;
}
function or(t, e) {
  return t.data = He(t.data, e), delete t.attachments, t;
}
function He(t, e) {
  if (!t)
    return t;
  if (t && t._placeholder === !0) {
    if (typeof t.num == "number" && t.num >= 0 && t.num < e.length)
      return e[t.num];
    throw new Error("illegal attachments");
  } else if (Array.isArray(t))
    for (let n = 0; n < t.length; n++)
      t[n] = He(t[n], e);
  else if (typeof t == "object")
    for (const n in t)
      Object.prototype.hasOwnProperty.call(t, n) && (t[n] = He(t[n], e));
  return t;
}
const ar = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
], cr = 5;
var E;
(function(t) {
  t[t.CONNECT = 0] = "CONNECT", t[t.DISCONNECT = 1] = "DISCONNECT", t[t.EVENT = 2] = "EVENT", t[t.ACK = 3] = "ACK", t[t.CONNECT_ERROR = 4] = "CONNECT_ERROR", t[t.BINARY_EVENT = 5] = "BINARY_EVENT", t[t.BINARY_ACK = 6] = "BINARY_ACK";
})(E || (E = {}));
class ur {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(e) {
    this.replacer = e;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(e) {
    return (e.type === E.EVENT || e.type === E.ACK) && we(e) ? this.encodeAsBinary({
      type: e.type === E.EVENT ? E.BINARY_EVENT : E.BINARY_ACK,
      nsp: e.nsp,
      data: e.data,
      id: e.id
    }) : [this.encodeAsString(e)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(e) {
    let n = "" + e.type;
    return (e.type === E.BINARY_EVENT || e.type === E.BINARY_ACK) && (n += e.attachments + "-"), e.nsp && e.nsp !== "/" && (n += e.nsp + ","), e.id != null && (n += e.id), e.data != null && (n += JSON.stringify(e.data, this.replacer)), n;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(e) {
    const n = ir(e), r = this.encodeAsString(n.packet), s = n.buffers;
    return s.unshift(r), s;
  }
}
function bt(t) {
  return Object.prototype.toString.call(t) === "[object Object]";
}
class rt extends C {
  /**
   * Decoder constructor
   *
   * @param {function} reviver - custom reviver to pass down to JSON.stringify
   */
  constructor(e) {
    super(), this.reviver = e;
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(e) {
    let n;
    if (typeof e == "string") {
      if (this.reconstructor)
        throw new Error("got plaintext data when reconstructing a packet");
      n = this.decodeString(e);
      const r = n.type === E.BINARY_EVENT;
      r || n.type === E.BINARY_ACK ? (n.type = r ? E.EVENT : E.ACK, this.reconstructor = new lr(n), n.attachments === 0 && super.emitReserved("decoded", n)) : super.emitReserved("decoded", n);
    } else if (nt(e) || e.base64)
      if (this.reconstructor)
        n = this.reconstructor.takeBinaryData(e), n && (this.reconstructor = null, super.emitReserved("decoded", n));
      else
        throw new Error("got binary data when not reconstructing a packet");
    else
      throw new Error("Unknown type: " + e);
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(e) {
    let n = 0;
    const r = {
      type: Number(e.charAt(0))
    };
    if (E[r.type] === void 0)
      throw new Error("unknown packet type " + r.type);
    if (r.type === E.BINARY_EVENT || r.type === E.BINARY_ACK) {
      const i = n + 1;
      for (; e.charAt(++n) !== "-" && n != e.length; )
        ;
      const o = e.substring(i, n);
      if (o != Number(o) || e.charAt(n) !== "-")
        throw new Error("Illegal attachments");
      r.attachments = Number(o);
    }
    if (e.charAt(n + 1) === "/") {
      const i = n + 1;
      for (; ++n && !(e.charAt(n) === "," || n === e.length); )
        ;
      r.nsp = e.substring(i, n);
    } else
      r.nsp = "/";
    const s = e.charAt(n + 1);
    if (s !== "" && Number(s) == s) {
      const i = n + 1;
      for (; ++n; ) {
        const o = e.charAt(n);
        if (o == null || Number(o) != o) {
          --n;
          break;
        }
        if (n === e.length)
          break;
      }
      r.id = Number(e.substring(i, n + 1));
    }
    if (e.charAt(++n)) {
      const i = this.tryParse(e.substr(n));
      if (rt.isPayloadValid(r.type, i))
        r.data = i;
      else
        throw new Error("invalid payload");
    }
    return r;
  }
  tryParse(e) {
    try {
      return JSON.parse(e, this.reviver);
    } catch {
      return !1;
    }
  }
  static isPayloadValid(e, n) {
    switch (e) {
      case E.CONNECT:
        return bt(n);
      case E.DISCONNECT:
        return n === void 0;
      case E.CONNECT_ERROR:
        return typeof n == "string" || bt(n);
      case E.EVENT:
      case E.BINARY_EVENT:
        return Array.isArray(n) && (typeof n[0] == "number" || typeof n[0] == "string" && ar.indexOf(n[0]) === -1);
      case E.ACK:
      case E.BINARY_ACK:
        return Array.isArray(n);
    }
  }
  /**
   * Deallocates a parser's resources
   */
  destroy() {
    this.reconstructor && (this.reconstructor.finishedReconstruction(), this.reconstructor = null);
  }
}
class lr {
  constructor(e) {
    this.packet = e, this.buffers = [], this.reconPack = e;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(e) {
    if (this.buffers.push(e), this.buffers.length === this.reconPack.attachments) {
      const n = or(this.reconPack, this.buffers);
      return this.finishedReconstruction(), n;
    }
    return null;
  }
  /**
   * Cleans up binary packet reconstruction variables.
   */
  finishedReconstruction() {
    this.reconPack = null, this.buffers = [];
  }
}
const fr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder: rt,
  Encoder: ur,
  get PacketType() {
    return E;
  },
  protocol: cr
}, Symbol.toStringTag, { value: "Module" }));
function M(t, e, n) {
  return t.on(e, n), function() {
    t.off(e, n);
  };
}
const hr = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class Ht extends C {
  /**
   * `Socket` constructor.
   */
  constructor(e, n, r) {
    super(), this.connected = !1, this.recovered = !1, this.receiveBuffer = [], this.sendBuffer = [], this._queue = [], this._queueSeq = 0, this.ids = 0, this.acks = {}, this.flags = {}, this.io = e, this.nsp = n, r && r.auth && (this.auth = r.auth), this._opts = Object.assign({}, r), this.io._autoConnect && this.open();
  }
  /**
   * Whether the socket is currently disconnected
   *
   * @example
   * const socket = io();
   *
   * socket.on("connect", () => {
   *   console.log(socket.disconnected); // false
   * });
   *
   * socket.on("disconnect", () => {
   *   console.log(socket.disconnected); // true
   * });
   */
  get disconnected() {
    return !this.connected;
  }
  /**
   * Subscribe to open, close and packet events
   *
   * @private
   */
  subEvents() {
    if (this.subs)
      return;
    const e = this.io;
    this.subs = [
      M(e, "open", this.onopen.bind(this)),
      M(e, "packet", this.onpacket.bind(this)),
      M(e, "error", this.onerror.bind(this)),
      M(e, "close", this.onclose.bind(this))
    ];
  }
  /**
   * Whether the Socket will try to reconnect when its Manager connects or reconnects.
   *
   * @example
   * const socket = io();
   *
   * console.log(socket.active); // true
   *
   * socket.on("disconnect", (reason) => {
   *   if (reason === "io server disconnect") {
   *     // the disconnection was initiated by the server, you need to manually reconnect
   *     console.log(socket.active); // false
   *   }
   *   // else the socket will automatically try to reconnect
   *   console.log(socket.active); // true
   * });
   */
  get active() {
    return !!this.subs;
  }
  /**
   * "Opens" the socket.
   *
   * @example
   * const socket = io({
   *   autoConnect: false
   * });
   *
   * socket.connect();
   */
  connect() {
    return this.connected ? this : (this.subEvents(), this.io._reconnecting || this.io.open(), this.io._readyState === "open" && this.onopen(), this);
  }
  /**
   * Alias for {@link connect()}.
   */
  open() {
    return this.connect();
  }
  /**
   * Sends a `message` event.
   *
   * This method mimics the WebSocket.send() method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
   *
   * @example
   * socket.send("hello");
   *
   * // this is equivalent to
   * socket.emit("message", "hello");
   *
   * @return self
   */
  send(...e) {
    return e.unshift("message"), this.emit.apply(this, e), this;
  }
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @example
   * socket.emit("hello", "world");
   *
   * // all serializable datastructures are supported (no need to call JSON.stringify)
   * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
   *
   * // with an acknowledgement from the server
   * socket.emit("hello", "world", (val) => {
   *   // ...
   * });
   *
   * @return self
   */
  emit(e, ...n) {
    var r, s, i;
    if (hr.hasOwnProperty(e))
      throw new Error('"' + e.toString() + '" is a reserved event name');
    if (n.unshift(e), this._opts.retries && !this.flags.fromQueue && !this.flags.volatile)
      return this._addToQueue(n), this;
    const o = {
      type: E.EVENT,
      data: n
    };
    if (o.options = {}, o.options.compress = this.flags.compress !== !1, typeof n[n.length - 1] == "function") {
      const l = this.ids++, f = n.pop();
      this._registerAckCallback(l, f), o.id = l;
    }
    const c = (s = (r = this.io.engine) === null || r === void 0 ? void 0 : r.transport) === null || s === void 0 ? void 0 : s.writable, a = this.connected && !(!((i = this.io.engine) === null || i === void 0) && i._hasPingExpired());
    return this.flags.volatile && !c || (a ? (this.notifyOutgoingListeners(o), this.packet(o)) : this.sendBuffer.push(o)), this.flags = {}, this;
  }
  /**
   * @private
   */
  _registerAckCallback(e, n) {
    var r;
    const s = (r = this.flags.timeout) !== null && r !== void 0 ? r : this._opts.ackTimeout;
    if (s === void 0) {
      this.acks[e] = n;
      return;
    }
    const i = this.io.setTimeoutFn(() => {
      delete this.acks[e];
      for (let c = 0; c < this.sendBuffer.length; c++)
        this.sendBuffer[c].id === e && this.sendBuffer.splice(c, 1);
      n.call(this, new Error("operation has timed out"));
    }, s), o = (...c) => {
      this.io.clearTimeoutFn(i), n.apply(this, c);
    };
    o.withError = !0, this.acks[e] = o;
  }
  /**
   * Emits an event and waits for an acknowledgement
   *
   * @example
   * // without timeout
   * const response = await socket.emitWithAck("hello", "world");
   *
   * // with a specific timeout
   * try {
   *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
   * } catch (err) {
   *   // the server did not acknowledge the event in the given delay
   * }
   *
   * @return a Promise that will be fulfilled when the server acknowledges the event
   */
  emitWithAck(e, ...n) {
    return new Promise((r, s) => {
      const i = (o, c) => o ? s(o) : r(c);
      i.withError = !0, n.push(i), this.emit(e, ...n);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(e) {
    let n;
    typeof e[e.length - 1] == "function" && (n = e.pop());
    const r = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: !1,
      args: e,
      flags: Object.assign({ fromQueue: !0 }, this.flags)
    };
    e.push((s, ...i) => r !== this._queue[0] ? void 0 : (s !== null ? r.tryCount > this._opts.retries && (this._queue.shift(), n && n(s)) : (this._queue.shift(), n && n(null, ...i)), r.pending = !1, this._drainQueue())), this._queue.push(r), this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(e = !1) {
    if (!this.connected || this._queue.length === 0)
      return;
    const n = this._queue[0];
    n.pending && !e || (n.pending = !0, n.tryCount++, this.flags = n.flags, this.emit.apply(this, n.args));
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(e) {
    e.nsp = this.nsp, this.io._packet(e);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    typeof this.auth == "function" ? this.auth((e) => {
      this._sendConnectPacket(e);
    }) : this._sendConnectPacket(this.auth);
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(e) {
    this.packet({
      type: E.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, e) : e
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(e) {
    this.connected || this.emitReserved("connect_error", e);
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(e, n) {
    this.connected = !1, delete this.id, this.emitReserved("disconnect", e, n), this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((e) => {
      if (!this.sendBuffer.some((r) => String(r.id) === e)) {
        const r = this.acks[e];
        delete this.acks[e], r.withError && r.call(this, new Error("socket has been disconnected"));
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(e) {
    if (e.nsp === this.nsp)
      switch (e.type) {
        case E.CONNECT:
          e.data && e.data.sid ? this.onconnect(e.data.sid, e.data.pid) : this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          break;
        case E.EVENT:
        case E.BINARY_EVENT:
          this.onevent(e);
          break;
        case E.ACK:
        case E.BINARY_ACK:
          this.onack(e);
          break;
        case E.DISCONNECT:
          this.ondisconnect();
          break;
        case E.CONNECT_ERROR:
          this.destroy();
          const r = new Error(e.data.message);
          r.data = e.data.data, this.emitReserved("connect_error", r);
          break;
      }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(e) {
    const n = e.data || [];
    e.id != null && n.push(this.ack(e.id)), this.connected ? this.emitEvent(n) : this.receiveBuffer.push(Object.freeze(n));
  }
  emitEvent(e) {
    if (this._anyListeners && this._anyListeners.length) {
      const n = this._anyListeners.slice();
      for (const r of n)
        r.apply(this, e);
    }
    super.emit.apply(this, e), this._pid && e.length && typeof e[e.length - 1] == "string" && (this._lastOffset = e[e.length - 1]);
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(e) {
    const n = this;
    let r = !1;
    return function(...s) {
      r || (r = !0, n.packet({
        type: E.ACK,
        id: e,
        data: s
      }));
    };
  }
  /**
   * Called upon a server acknowledgement.
   *
   * @param packet
   * @private
   */
  onack(e) {
    const n = this.acks[e.id];
    typeof n == "function" && (delete this.acks[e.id], n.withError && e.data.unshift(null), n.apply(this, e.data));
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(e, n) {
    this.id = e, this.recovered = n && this._pid === n, this._pid = n, this.connected = !0, this.emitBuffered(), this.emitReserved("connect"), this._drainQueue(!0);
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((e) => this.emitEvent(e)), this.receiveBuffer = [], this.sendBuffer.forEach((e) => {
      this.notifyOutgoingListeners(e), this.packet(e);
    }), this.sendBuffer = [];
  }
  /**
   * Called upon server disconnect.
   *
   * @private
   */
  ondisconnect() {
    this.destroy(), this.onclose("io server disconnect");
  }
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @private
   */
  destroy() {
    this.subs && (this.subs.forEach((e) => e()), this.subs = void 0), this.io._destroy(this);
  }
  /**
   * Disconnects the socket manually. In that case, the socket will not try to reconnect.
   *
   * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
   *
   * @example
   * const socket = io();
   *
   * socket.on("disconnect", (reason) => {
   *   // console.log(reason); prints "io client disconnect"
   * });
   *
   * socket.disconnect();
   *
   * @return self
   */
  disconnect() {
    return this.connected && this.packet({ type: E.DISCONNECT }), this.destroy(), this.connected && this.onclose("io client disconnect"), this;
  }
  /**
   * Alias for {@link disconnect()}.
   *
   * @return self
   */
  close() {
    return this.disconnect();
  }
  /**
   * Sets the compress flag.
   *
   * @example
   * socket.compress(false).emit("hello");
   *
   * @param compress - if `true`, compresses the sending data
   * @return self
   */
  compress(e) {
    return this.flags.compress = e, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
   * ready to send messages.
   *
   * @example
   * socket.volatile.emit("hello"); // the server may or may not receive it
   *
   * @returns self
   */
  get volatile() {
    return this.flags.volatile = !0, this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
   * given number of milliseconds have elapsed without an acknowledgement from the server:
   *
   * @example
   * socket.timeout(5000).emit("my-event", (err) => {
   *   if (err) {
   *     // the server did not acknowledge the event in the given delay
   *   }
   * });
   *
   * @returns self
   */
  timeout(e) {
    return this.flags.timeout = e, this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * @example
   * socket.onAny((event, ...args) => {
   *   console.log(`got ${event}`);
   * });
   *
   * @param listener
   */
  onAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.push(e), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * @example
   * socket.prependAny((event, ...args) => {
   *   console.log(`got event ${event}`);
   * });
   *
   * @param listener
   */
  prependAny(e) {
    return this._anyListeners = this._anyListeners || [], this._anyListeners.unshift(e), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`got event ${event}`);
   * }
   *
   * socket.onAny(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAny(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAny();
   *
   * @param listener
   */
  offAny(e) {
    if (!this._anyListeners)
      return this;
    if (e) {
      const n = this._anyListeners;
      for (let r = 0; r < n.length; r++)
        if (e === n[r])
          return n.splice(r, 1), this;
    } else
      this._anyListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAny() {
    return this._anyListeners || [];
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.onAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  onAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.push(e), this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.prependAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  prependAnyOutgoing(e) {
    return this._anyOutgoingListeners = this._anyOutgoingListeners || [], this._anyOutgoingListeners.unshift(e), this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`sent event ${event}`);
   * }
   *
   * socket.onAnyOutgoing(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAnyOutgoing(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAnyOutgoing();
   *
   * @param [listener] - the catch-all listener (optional)
   */
  offAnyOutgoing(e) {
    if (!this._anyOutgoingListeners)
      return this;
    if (e) {
      const n = this._anyOutgoingListeners;
      for (let r = 0; r < n.length; r++)
        if (e === n[r])
          return n.splice(r, 1), this;
    } else
      this._anyOutgoingListeners = [];
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  /**
   * Notify the listeners for each packet sent
   *
   * @param packet
   *
   * @private
   */
  notifyOutgoingListeners(e) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const n = this._anyOutgoingListeners.slice();
      for (const r of n)
        r.apply(this, e.data);
    }
  }
}
function te(t) {
  t = t || {}, this.ms = t.min || 100, this.max = t.max || 1e4, this.factor = t.factor || 2, this.jitter = t.jitter > 0 && t.jitter <= 1 ? t.jitter : 0, this.attempts = 0;
}
te.prototype.duration = function() {
  var t = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var e = Math.random(), n = Math.floor(e * this.jitter * t);
    t = Math.floor(e * 10) & 1 ? t + n : t - n;
  }
  return Math.min(t, this.max) | 0;
};
te.prototype.reset = function() {
  this.attempts = 0;
};
te.prototype.setMin = function(t) {
  this.ms = t;
};
te.prototype.setMax = function(t) {
  this.max = t;
};
te.prototype.setJitter = function(t) {
  this.jitter = t;
};
class Ve extends C {
  constructor(e, n) {
    var r;
    super(), this.nsps = {}, this.subs = [], e && typeof e == "object" && (n = e, e = void 0), n = n || {}, n.path = n.path || "/socket.io", this.opts = n, Oe(this, n), this.reconnection(n.reconnection !== !1), this.reconnectionAttempts(n.reconnectionAttempts || 1 / 0), this.reconnectionDelay(n.reconnectionDelay || 1e3), this.reconnectionDelayMax(n.reconnectionDelayMax || 5e3), this.randomizationFactor((r = n.randomizationFactor) !== null && r !== void 0 ? r : 0.5), this.backoff = new te({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    }), this.timeout(n.timeout == null ? 2e4 : n.timeout), this._readyState = "closed", this.uri = e;
    const s = n.parser || fr;
    this.encoder = new s.Encoder(), this.decoder = new s.Decoder(), this._autoConnect = n.autoConnect !== !1, this._autoConnect && this.open();
  }
  reconnection(e) {
    return arguments.length ? (this._reconnection = !!e, e || (this.skipReconnect = !0), this) : this._reconnection;
  }
  reconnectionAttempts(e) {
    return e === void 0 ? this._reconnectionAttempts : (this._reconnectionAttempts = e, this);
  }
  reconnectionDelay(e) {
    var n;
    return e === void 0 ? this._reconnectionDelay : (this._reconnectionDelay = e, (n = this.backoff) === null || n === void 0 || n.setMin(e), this);
  }
  randomizationFactor(e) {
    var n;
    return e === void 0 ? this._randomizationFactor : (this._randomizationFactor = e, (n = this.backoff) === null || n === void 0 || n.setJitter(e), this);
  }
  reconnectionDelayMax(e) {
    var n;
    return e === void 0 ? this._reconnectionDelayMax : (this._reconnectionDelayMax = e, (n = this.backoff) === null || n === void 0 || n.setMax(e), this);
  }
  timeout(e) {
    return arguments.length ? (this._timeout = e, this) : this._timeout;
  }
  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @private
   */
  maybeReconnectOnOpen() {
    !this._reconnecting && this._reconnection && this.backoff.attempts === 0 && this.reconnect();
  }
  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} fn - optional, callback
   * @return self
   * @public
   */
  open(e) {
    if (~this._readyState.indexOf("open"))
      return this;
    this.engine = new Zn(this.uri, this.opts);
    const n = this.engine, r = this;
    this._readyState = "opening", this.skipReconnect = !1;
    const s = M(n, "open", function() {
      r.onopen(), e && e();
    }), i = (c) => {
      this.cleanup(), this._readyState = "closed", this.emitReserved("error", c), e ? e(c) : this.maybeReconnectOnOpen();
    }, o = M(n, "error", i);
    if (this._timeout !== !1) {
      const c = this._timeout, a = this.setTimeoutFn(() => {
        s(), i(new Error("timeout")), n.close();
      }, c);
      this.opts.autoUnref && a.unref(), this.subs.push(() => {
        this.clearTimeoutFn(a);
      });
    }
    return this.subs.push(s), this.subs.push(o), this;
  }
  /**
   * Alias for open()
   *
   * @return self
   * @public
   */
  connect(e) {
    return this.open(e);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    this.cleanup(), this._readyState = "open", this.emitReserved("open");
    const e = this.engine;
    this.subs.push(
      M(e, "ping", this.onping.bind(this)),
      M(e, "data", this.ondata.bind(this)),
      M(e, "error", this.onerror.bind(this)),
      M(e, "close", this.onclose.bind(this)),
      // @ts-ignore
      M(this.decoder, "decoded", this.ondecoded.bind(this))
    );
  }
  /**
   * Called upon a ping.
   *
   * @private
   */
  onping() {
    this.emitReserved("ping");
  }
  /**
   * Called with data.
   *
   * @private
   */
  ondata(e) {
    try {
      this.decoder.add(e);
    } catch (n) {
      this.onclose("parse error", n);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(e) {
    ve(() => {
      this.emitReserved("packet", e);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(e) {
    this.emitReserved("error", e);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(e, n) {
    let r = this.nsps[e];
    return r ? this._autoConnect && !r.active && r.connect() : (r = new Ht(this, e, n), this.nsps[e] = r), r;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(e) {
    const n = Object.keys(this.nsps);
    for (const r of n)
      if (this.nsps[r].active)
        return;
    this._close();
  }
  /**
   * Writes a packet.
   *
   * @param packet
   * @private
   */
  _packet(e) {
    const n = this.encoder.encode(e);
    for (let r = 0; r < n.length; r++)
      this.engine.write(n[r], e.options);
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    this.subs.forEach((e) => e()), this.subs.length = 0, this.decoder.destroy();
  }
  /**
   * Close the current socket.
   *
   * @private
   */
  _close() {
    this.skipReconnect = !0, this._reconnecting = !1, this.onclose("forced close");
  }
  /**
   * Alias for close()
   *
   * @private
   */
  disconnect() {
    return this._close();
  }
  /**
   * Called when:
   *
   * - the low-level engine is closed
   * - the parser encountered a badly formatted packet
   * - all sockets are disconnected
   *
   * @private
   */
  onclose(e, n) {
    var r;
    this.cleanup(), (r = this.engine) === null || r === void 0 || r.close(), this.backoff.reset(), this._readyState = "closed", this.emitReserved("close", e, n), this._reconnection && !this.skipReconnect && this.reconnect();
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const e = this;
    if (this.backoff.attempts >= this._reconnectionAttempts)
      this.backoff.reset(), this.emitReserved("reconnect_failed"), this._reconnecting = !1;
    else {
      const n = this.backoff.duration();
      this._reconnecting = !0;
      const r = this.setTimeoutFn(() => {
        e.skipReconnect || (this.emitReserved("reconnect_attempt", e.backoff.attempts), !e.skipReconnect && e.open((s) => {
          s ? (e._reconnecting = !1, e.reconnect(), this.emitReserved("reconnect_error", s)) : e.onreconnect();
        }));
      }, n);
      this.opts.autoUnref && r.unref(), this.subs.push(() => {
        this.clearTimeoutFn(r);
      });
    }
  }
  /**
   * Called upon successful reconnect.
   *
   * @private
   */
  onreconnect() {
    const e = this.backoff.attempts;
    this._reconnecting = !1, this.backoff.reset(), this.emitReserved("reconnect", e);
  }
}
const ie = {};
function _e(t, e) {
  typeof t == "object" && (e = t, t = void 0), e = e || {};
  const n = er(t, e.path || "/socket.io"), r = n.source, s = n.id, i = n.path, o = ie[s] && i in ie[s].nsps, c = e.forceNew || e["force new connection"] || e.multiplex === !1 || o;
  let a;
  return c ? a = new Ve(r, e) : (ie[s] || (ie[s] = new Ve(r, e)), a = ie[s]), n.query && !e.query && (e.query = n.queryKey), a.socket(n.path, e);
}
Object.assign(_e, {
  Manager: Ve,
  Socket: Ht,
  io: _e,
  connect: _e
});
function Vt(t, e) {
  return function() {
    return t.apply(e, arguments);
  };
}
const { toString: dr } = Object.prototype, { getPrototypeOf: st } = Object, ke = /* @__PURE__ */ ((t) => (e) => {
  const n = dr.call(e);
  return t[n] || (t[n] = n.slice(8, -1).toLowerCase());
})(/* @__PURE__ */ Object.create(null)), I = (t) => (t = t.toLowerCase(), (e) => ke(e) === t), Te = (t) => (e) => typeof e === t, { isArray: ne } = Array, ue = Te("undefined");
function pr(t) {
  return t !== null && !ue(t) && t.constructor !== null && !ue(t.constructor) && L(t.constructor.isBuffer) && t.constructor.isBuffer(t);
}
const Jt = I("ArrayBuffer");
function mr(t) {
  let e;
  return typeof ArrayBuffer < "u" && ArrayBuffer.isView ? e = ArrayBuffer.isView(t) : e = t && t.buffer && Jt(t.buffer), e;
}
const yr = Te("string"), L = Te("function"), Wt = Te("number"), Ce = (t) => t !== null && typeof t == "object", gr = (t) => t === !0 || t === !1, Ee = (t) => {
  if (ke(t) !== "object")
    return !1;
  const e = st(t);
  return (e === null || e === Object.prototype || Object.getPrototypeOf(e) === null) && !(Symbol.toStringTag in t) && !(Symbol.iterator in t);
}, br = I("Date"), wr = I("File"), _r = I("Blob"), Er = I("FileList"), xr = (t) => Ce(t) && L(t.pipe), Sr = (t) => {
  let e;
  return t && (typeof FormData == "function" && t instanceof FormData || L(t.append) && ((e = ke(t)) === "formdata" || // detect form-data instance
  e === "object" && L(t.toString) && t.toString() === "[object FormData]"));
}, Rr = I("URLSearchParams"), [Ar, vr, Or, kr] = ["ReadableStream", "Request", "Response", "Headers"].map(I), Tr = (t) => t.trim ? t.trim() : t.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function fe(t, e, { allOwnKeys: n = !1 } = {}) {
  if (t === null || typeof t > "u")
    return;
  let r, s;
  if (typeof t != "object" && (t = [t]), ne(t))
    for (r = 0, s = t.length; r < s; r++)
      e.call(null, t[r], r, t);
  else {
    const i = n ? Object.getOwnPropertyNames(t) : Object.keys(t), o = i.length;
    let c;
    for (r = 0; r < o; r++)
      c = i[r], e.call(null, t[c], c, t);
  }
}
function Kt(t, e) {
  e = e.toLowerCase();
  const n = Object.keys(t);
  let r = n.length, s;
  for (; r-- > 0; )
    if (s = n[r], e === s.toLowerCase())
      return s;
  return null;
}
const K = typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : global, Xt = (t) => !ue(t) && t !== K;
function Je() {
  const { caseless: t } = Xt(this) && this || {}, e = {}, n = (r, s) => {
    const i = t && Kt(e, s) || s;
    Ee(e[i]) && Ee(r) ? e[i] = Je(e[i], r) : Ee(r) ? e[i] = Je({}, r) : ne(r) ? e[i] = r.slice() : e[i] = r;
  };
  for (let r = 0, s = arguments.length; r < s; r++)
    arguments[r] && fe(arguments[r], n);
  return e;
}
const Cr = (t, e, n, { allOwnKeys: r } = {}) => (fe(e, (s, i) => {
  n && L(s) ? t[i] = Vt(s, n) : t[i] = s;
}, { allOwnKeys: r }), t), Nr = (t) => (t.charCodeAt(0) === 65279 && (t = t.slice(1)), t), Br = (t, e, n, r) => {
  t.prototype = Object.create(e.prototype, r), t.prototype.constructor = t, Object.defineProperty(t, "super", {
    value: e.prototype
  }), n && Object.assign(t.prototype, n);
}, Pr = (t, e, n, r) => {
  let s, i, o;
  const c = {};
  if (e = e || {}, t == null) return e;
  do {
    for (s = Object.getOwnPropertyNames(t), i = s.length; i-- > 0; )
      o = s[i], (!r || r(o, t, e)) && !c[o] && (e[o] = t[o], c[o] = !0);
    t = n !== !1 && st(t);
  } while (t && (!n || n(t, e)) && t !== Object.prototype);
  return e;
}, Lr = (t, e, n) => {
  t = String(t), (n === void 0 || n > t.length) && (n = t.length), n -= e.length;
  const r = t.indexOf(e, n);
  return r !== -1 && r === n;
}, Dr = (t) => {
  if (!t) return null;
  if (ne(t)) return t;
  let e = t.length;
  if (!Wt(e)) return null;
  const n = new Array(e);
  for (; e-- > 0; )
    n[e] = t[e];
  return n;
}, qr = /* @__PURE__ */ ((t) => (e) => t && e instanceof t)(typeof Uint8Array < "u" && st(Uint8Array)), Fr = (t, e) => {
  const r = (t && t[Symbol.iterator]).call(t);
  let s;
  for (; (s = r.next()) && !s.done; ) {
    const i = s.value;
    e.call(t, i[0], i[1]);
  }
}, Ur = (t, e) => {
  let n;
  const r = [];
  for (; (n = t.exec(e)) !== null; )
    r.push(n);
  return r;
}, Mr = I("HTMLFormElement"), Ir = (t) => t.toLowerCase().replace(
  /[-_\s]([a-z\d])(\w*)/g,
  function(n, r, s) {
    return r.toUpperCase() + s;
  }
), wt = (({ hasOwnProperty: t }) => (e, n) => t.call(e, n))(Object.prototype), $r = I("RegExp"), Yt = (t, e) => {
  const n = Object.getOwnPropertyDescriptors(t), r = {};
  fe(n, (s, i) => {
    let o;
    (o = e(s, i, t)) !== !1 && (r[i] = o || s);
  }), Object.defineProperties(t, r);
}, jr = (t) => {
  Yt(t, (e, n) => {
    if (L(t) && ["arguments", "caller", "callee"].indexOf(n) !== -1)
      return !1;
    const r = t[n];
    if (L(r)) {
      if (e.enumerable = !1, "writable" in e) {
        e.writable = !1;
        return;
      }
      e.set || (e.set = () => {
        throw Error("Can not rewrite read-only method '" + n + "'");
      });
    }
  });
}, zr = (t, e) => {
  const n = {}, r = (s) => {
    s.forEach((i) => {
      n[i] = !0;
    });
  };
  return ne(t) ? r(t) : r(String(t).split(e)), n;
}, Hr = () => {
}, Vr = (t, e) => t != null && Number.isFinite(t = +t) ? t : e;
function Jr(t) {
  return !!(t && L(t.append) && t[Symbol.toStringTag] === "FormData" && t[Symbol.iterator]);
}
const Wr = (t) => {
  const e = new Array(10), n = (r, s) => {
    if (Ce(r)) {
      if (e.indexOf(r) >= 0)
        return;
      if (!("toJSON" in r)) {
        e[s] = r;
        const i = ne(r) ? [] : {};
        return fe(r, (o, c) => {
          const a = n(o, s + 1);
          !ue(a) && (i[c] = a);
        }), e[s] = void 0, i;
      }
    }
    return r;
  };
  return n(t, 0);
}, Kr = I("AsyncFunction"), Xr = (t) => t && (Ce(t) || L(t)) && L(t.then) && L(t.catch), Gt = ((t, e) => t ? setImmediate : e ? ((n, r) => (K.addEventListener("message", ({ source: s, data: i }) => {
  s === K && i === n && r.length && r.shift()();
}, !1), (s) => {
  r.push(s), K.postMessage(n, "*");
}))(`axios@${Math.random()}`, []) : (n) => setTimeout(n))(
  typeof setImmediate == "function",
  L(K.postMessage)
), Yr = typeof queueMicrotask < "u" ? queueMicrotask.bind(K) : typeof process < "u" && process.nextTick || Gt, d = {
  isArray: ne,
  isArrayBuffer: Jt,
  isBuffer: pr,
  isFormData: Sr,
  isArrayBufferView: mr,
  isString: yr,
  isNumber: Wt,
  isBoolean: gr,
  isObject: Ce,
  isPlainObject: Ee,
  isReadableStream: Ar,
  isRequest: vr,
  isResponse: Or,
  isHeaders: kr,
  isUndefined: ue,
  isDate: br,
  isFile: wr,
  isBlob: _r,
  isRegExp: $r,
  isFunction: L,
  isStream: xr,
  isURLSearchParams: Rr,
  isTypedArray: qr,
  isFileList: Er,
  forEach: fe,
  merge: Je,
  extend: Cr,
  trim: Tr,
  stripBOM: Nr,
  inherits: Br,
  toFlatObject: Pr,
  kindOf: ke,
  kindOfTest: I,
  endsWith: Lr,
  toArray: Dr,
  forEachEntry: Fr,
  matchAll: Ur,
  isHTMLForm: Mr,
  hasOwnProperty: wt,
  hasOwnProp: wt,
  // an alias to avoid ESLint no-prototype-builtins detection
  reduceDescriptors: Yt,
  freezeMethods: jr,
  toObjectSet: zr,
  toCamelCase: Ir,
  noop: Hr,
  toFiniteNumber: Vr,
  findKey: Kt,
  global: K,
  isContextDefined: Xt,
  isSpecCompliantForm: Jr,
  toJSONObject: Wr,
  isAsyncFn: Kr,
  isThenable: Xr,
  setImmediate: Gt,
  asap: Yr
};
function b(t, e, n, r, s) {
  Error.call(this), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack, this.message = t, this.name = "AxiosError", e && (this.code = e), n && (this.config = n), r && (this.request = r), s && (this.response = s, this.status = s.status ? s.status : null);
}
d.inherits(b, Error, {
  toJSON: function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: d.toJSONObject(this.config),
      code: this.code,
      status: this.status
    };
  }
});
const Qt = b.prototype, Zt = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL"
  // eslint-disable-next-line func-names
].forEach((t) => {
  Zt[t] = { value: t };
});
Object.defineProperties(b, Zt);
Object.defineProperty(Qt, "isAxiosError", { value: !0 });
b.from = (t, e, n, r, s, i) => {
  const o = Object.create(Qt);
  return d.toFlatObject(t, o, function(a) {
    return a !== Error.prototype;
  }, (c) => c !== "isAxiosError"), b.call(o, t.message, e, n, r, s), o.cause = t, o.name = t.name, i && Object.assign(o, i), o;
};
const Gr = null;
function We(t) {
  return d.isPlainObject(t) || d.isArray(t);
}
function en(t) {
  return d.endsWith(t, "[]") ? t.slice(0, -2) : t;
}
function _t(t, e, n) {
  return t ? t.concat(e).map(function(s, i) {
    return s = en(s), !n && i ? "[" + s + "]" : s;
  }).join(n ? "." : "") : e;
}
function Qr(t) {
  return d.isArray(t) && !t.some(We);
}
const Zr = d.toFlatObject(d, {}, null, function(e) {
  return /^is[A-Z]/.test(e);
});
function Ne(t, e, n) {
  if (!d.isObject(t))
    throw new TypeError("target must be an object");
  e = e || new FormData(), n = d.toFlatObject(n, {
    metaTokens: !0,
    dots: !1,
    indexes: !1
  }, !1, function(g, y) {
    return !d.isUndefined(y[g]);
  });
  const r = n.metaTokens, s = n.visitor || l, i = n.dots, o = n.indexes, a = (n.Blob || typeof Blob < "u" && Blob) && d.isSpecCompliantForm(e);
  if (!d.isFunction(s))
    throw new TypeError("visitor must be a function");
  function u(p) {
    if (p === null) return "";
    if (d.isDate(p))
      return p.toISOString();
    if (!a && d.isBlob(p))
      throw new b("Blob is not supported. Use a Buffer instead.");
    return d.isArrayBuffer(p) || d.isTypedArray(p) ? a && typeof Blob == "function" ? new Blob([p]) : Buffer.from(p) : p;
  }
  function l(p, g, y) {
    let S = p;
    if (p && !y && typeof p == "object") {
      if (d.endsWith(g, "{}"))
        g = r ? g : g.slice(0, -2), p = JSON.stringify(p);
      else if (d.isArray(p) && Qr(p) || (d.isFileList(p) || d.endsWith(g, "[]")) && (S = d.toArray(p)))
        return g = en(g), S.forEach(function(O, _) {
          !(d.isUndefined(O) || O === null) && e.append(
            // eslint-disable-next-line no-nested-ternary
            o === !0 ? _t([g], _, i) : o === null ? g : g + "[]",
            u(O)
          );
        }), !1;
    }
    return We(p) ? !0 : (e.append(_t(y, g, i), u(p)), !1);
  }
  const f = [], h = Object.assign(Zr, {
    defaultVisitor: l,
    convertValue: u,
    isVisitable: We
  });
  function m(p, g) {
    if (!d.isUndefined(p)) {
      if (f.indexOf(p) !== -1)
        throw Error("Circular reference detected in " + g.join("."));
      f.push(p), d.forEach(p, function(S, v) {
        (!(d.isUndefined(S) || S === null) && s.call(
          e,
          S,
          d.isString(v) ? v.trim() : v,
          g,
          h
        )) === !0 && m(S, g ? g.concat(v) : [v]);
      }), f.pop();
    }
  }
  if (!d.isObject(t))
    throw new TypeError("data must be an object");
  return m(t), e;
}
function Et(t) {
  const e = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0"
  };
  return encodeURIComponent(t).replace(/[!'()~]|%20|%00/g, function(r) {
    return e[r];
  });
}
function it(t, e) {
  this._pairs = [], t && Ne(t, this, e);
}
const tn = it.prototype;
tn.append = function(e, n) {
  this._pairs.push([e, n]);
};
tn.toString = function(e) {
  const n = e ? function(r) {
    return e.call(this, r, Et);
  } : Et;
  return this._pairs.map(function(s) {
    return n(s[0]) + "=" + n(s[1]);
  }, "").join("&");
};
function es(t) {
  return encodeURIComponent(t).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+").replace(/%5B/gi, "[").replace(/%5D/gi, "]");
}
function nn(t, e, n) {
  if (!e)
    return t;
  const r = n && n.encode || es;
  d.isFunction(n) && (n = {
    serialize: n
  });
  const s = n && n.serialize;
  let i;
  if (s ? i = s(e, n) : i = d.isURLSearchParams(e) ? e.toString() : new it(e, n).toString(r), i) {
    const o = t.indexOf("#");
    o !== -1 && (t = t.slice(0, o)), t += (t.indexOf("?") === -1 ? "?" : "&") + i;
  }
  return t;
}
class xt {
  constructor() {
    this.handlers = [];
  }
  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  use(e, n, r) {
    return this.handlers.push({
      fulfilled: e,
      rejected: n,
      synchronous: r ? r.synchronous : !1,
      runWhen: r ? r.runWhen : null
    }), this.handlers.length - 1;
  }
  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   *
   * @returns {Boolean} `true` if the interceptor was removed, `false` otherwise
   */
  eject(e) {
    this.handlers[e] && (this.handlers[e] = null);
  }
  /**
   * Clear all interceptors from the stack
   *
   * @returns {void}
   */
  clear() {
    this.handlers && (this.handlers = []);
  }
  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   *
   * @returns {void}
   */
  forEach(e) {
    d.forEach(this.handlers, function(r) {
      r !== null && e(r);
    });
  }
}
const rn = {
  silentJSONParsing: !0,
  forcedJSONParsing: !0,
  clarifyTimeoutError: !1
}, ts = typeof URLSearchParams < "u" ? URLSearchParams : it, ns = typeof FormData < "u" ? FormData : null, rs = typeof Blob < "u" ? Blob : null, ss = {
  isBrowser: !0,
  classes: {
    URLSearchParams: ts,
    FormData: ns,
    Blob: rs
  },
  protocols: ["http", "https", "file", "blob", "url", "data"]
}, ot = typeof window < "u" && typeof document < "u", Ke = typeof navigator == "object" && navigator || void 0, is = ot && (!Ke || ["ReactNative", "NativeScript", "NS"].indexOf(Ke.product) < 0), os = typeof WorkerGlobalScope < "u" && // eslint-disable-next-line no-undef
self instanceof WorkerGlobalScope && typeof self.importScripts == "function", as = ot && window.location.href || "http://localhost", cs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  hasBrowserEnv: ot,
  hasStandardBrowserEnv: is,
  hasStandardBrowserWebWorkerEnv: os,
  navigator: Ke,
  origin: as
}, Symbol.toStringTag, { value: "Module" })), N = {
  ...cs,
  ...ss
};
function us(t, e) {
  return Ne(t, new N.classes.URLSearchParams(), Object.assign({
    visitor: function(n, r, s, i) {
      return N.isNode && d.isBuffer(n) ? (this.append(r, n.toString("base64")), !1) : i.defaultVisitor.apply(this, arguments);
    }
  }, e));
}
function ls(t) {
  return d.matchAll(/\w+|\[(\w*)]/g, t).map((e) => e[0] === "[]" ? "" : e[1] || e[0]);
}
function fs(t) {
  const e = {}, n = Object.keys(t);
  let r;
  const s = n.length;
  let i;
  for (r = 0; r < s; r++)
    i = n[r], e[i] = t[i];
  return e;
}
function sn(t) {
  function e(n, r, s, i) {
    let o = n[i++];
    if (o === "__proto__") return !0;
    const c = Number.isFinite(+o), a = i >= n.length;
    return o = !o && d.isArray(s) ? s.length : o, a ? (d.hasOwnProp(s, o) ? s[o] = [s[o], r] : s[o] = r, !c) : ((!s[o] || !d.isObject(s[o])) && (s[o] = []), e(n, r, s[o], i) && d.isArray(s[o]) && (s[o] = fs(s[o])), !c);
  }
  if (d.isFormData(t) && d.isFunction(t.entries)) {
    const n = {};
    return d.forEachEntry(t, (r, s) => {
      e(ls(r), s, n, 0);
    }), n;
  }
  return null;
}
function hs(t, e, n) {
  if (d.isString(t))
    try {
      return (e || JSON.parse)(t), d.trim(t);
    } catch (r) {
      if (r.name !== "SyntaxError")
        throw r;
    }
  return (n || JSON.stringify)(t);
}
const he = {
  transitional: rn,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [function(e, n) {
    const r = n.getContentType() || "", s = r.indexOf("application/json") > -1, i = d.isObject(e);
    if (i && d.isHTMLForm(e) && (e = new FormData(e)), d.isFormData(e))
      return s ? JSON.stringify(sn(e)) : e;
    if (d.isArrayBuffer(e) || d.isBuffer(e) || d.isStream(e) || d.isFile(e) || d.isBlob(e) || d.isReadableStream(e))
      return e;
    if (d.isArrayBufferView(e))
      return e.buffer;
    if (d.isURLSearchParams(e))
      return n.setContentType("application/x-www-form-urlencoded;charset=utf-8", !1), e.toString();
    let c;
    if (i) {
      if (r.indexOf("application/x-www-form-urlencoded") > -1)
        return us(e, this.formSerializer).toString();
      if ((c = d.isFileList(e)) || r.indexOf("multipart/form-data") > -1) {
        const a = this.env && this.env.FormData;
        return Ne(
          c ? { "files[]": e } : e,
          a && new a(),
          this.formSerializer
        );
      }
    }
    return i || s ? (n.setContentType("application/json", !1), hs(e)) : e;
  }],
  transformResponse: [function(e) {
    const n = this.transitional || he.transitional, r = n && n.forcedJSONParsing, s = this.responseType === "json";
    if (d.isResponse(e) || d.isReadableStream(e))
      return e;
    if (e && d.isString(e) && (r && !this.responseType || s)) {
      const o = !(n && n.silentJSONParsing) && s;
      try {
        return JSON.parse(e);
      } catch (c) {
        if (o)
          throw c.name === "SyntaxError" ? b.from(c, b.ERR_BAD_RESPONSE, this, null, this.response) : c;
      }
    }
    return e;
  }],
  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: {
    FormData: N.classes.FormData,
    Blob: N.classes.Blob
  },
  validateStatus: function(e) {
    return e >= 200 && e < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0
    }
  }
};
d.forEach(["delete", "get", "head", "post", "put", "patch"], (t) => {
  he.headers[t] = {};
});
const ds = d.toObjectSet([
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent"
]), ps = (t) => {
  const e = {};
  let n, r, s;
  return t && t.split(`
`).forEach(function(o) {
    s = o.indexOf(":"), n = o.substring(0, s).trim().toLowerCase(), r = o.substring(s + 1).trim(), !(!n || e[n] && ds[n]) && (n === "set-cookie" ? e[n] ? e[n].push(r) : e[n] = [r] : e[n] = e[n] ? e[n] + ", " + r : r);
  }), e;
}, St = Symbol("internals");
function oe(t) {
  return t && String(t).trim().toLowerCase();
}
function xe(t) {
  return t === !1 || t == null ? t : d.isArray(t) ? t.map(xe) : String(t);
}
function ms(t) {
  const e = /* @__PURE__ */ Object.create(null), n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; r = n.exec(t); )
    e[r[1]] = r[2];
  return e;
}
const ys = (t) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(t.trim());
function Fe(t, e, n, r, s) {
  if (d.isFunction(r))
    return r.call(this, e, n);
  if (s && (e = n), !!d.isString(e)) {
    if (d.isString(r))
      return e.indexOf(r) !== -1;
    if (d.isRegExp(r))
      return r.test(e);
  }
}
function gs(t) {
  return t.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (e, n, r) => n.toUpperCase() + r);
}
function bs(t, e) {
  const n = d.toCamelCase(" " + e);
  ["get", "set", "has"].forEach((r) => {
    Object.defineProperty(t, r + n, {
      value: function(s, i, o) {
        return this[r].call(this, e, s, i, o);
      },
      configurable: !0
    });
  });
}
let P = class {
  constructor(e) {
    e && this.set(e);
  }
  set(e, n, r) {
    const s = this;
    function i(c, a, u) {
      const l = oe(a);
      if (!l)
        throw new Error("header name must be a non-empty string");
      const f = d.findKey(s, l);
      (!f || s[f] === void 0 || u === !0 || u === void 0 && s[f] !== !1) && (s[f || a] = xe(c));
    }
    const o = (c, a) => d.forEach(c, (u, l) => i(u, l, a));
    if (d.isPlainObject(e) || e instanceof this.constructor)
      o(e, n);
    else if (d.isString(e) && (e = e.trim()) && !ys(e))
      o(ps(e), n);
    else if (d.isHeaders(e))
      for (const [c, a] of e.entries())
        i(a, c, r);
    else
      e != null && i(n, e, r);
    return this;
  }
  get(e, n) {
    if (e = oe(e), e) {
      const r = d.findKey(this, e);
      if (r) {
        const s = this[r];
        if (!n)
          return s;
        if (n === !0)
          return ms(s);
        if (d.isFunction(n))
          return n.call(this, s, r);
        if (d.isRegExp(n))
          return n.exec(s);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(e, n) {
    if (e = oe(e), e) {
      const r = d.findKey(this, e);
      return !!(r && this[r] !== void 0 && (!n || Fe(this, this[r], r, n)));
    }
    return !1;
  }
  delete(e, n) {
    const r = this;
    let s = !1;
    function i(o) {
      if (o = oe(o), o) {
        const c = d.findKey(r, o);
        c && (!n || Fe(r, r[c], c, n)) && (delete r[c], s = !0);
      }
    }
    return d.isArray(e) ? e.forEach(i) : i(e), s;
  }
  clear(e) {
    const n = Object.keys(this);
    let r = n.length, s = !1;
    for (; r--; ) {
      const i = n[r];
      (!e || Fe(this, this[i], i, e, !0)) && (delete this[i], s = !0);
    }
    return s;
  }
  normalize(e) {
    const n = this, r = {};
    return d.forEach(this, (s, i) => {
      const o = d.findKey(r, i);
      if (o) {
        n[o] = xe(s), delete n[i];
        return;
      }
      const c = e ? gs(i) : String(i).trim();
      c !== i && delete n[i], n[c] = xe(s), r[c] = !0;
    }), this;
  }
  concat(...e) {
    return this.constructor.concat(this, ...e);
  }
  toJSON(e) {
    const n = /* @__PURE__ */ Object.create(null);
    return d.forEach(this, (r, s) => {
      r != null && r !== !1 && (n[s] = e && d.isArray(r) ? r.join(", ") : r);
    }), n;
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([e, n]) => e + ": " + n).join(`
`);
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(e) {
    return e instanceof this ? e : new this(e);
  }
  static concat(e, ...n) {
    const r = new this(e);
    return n.forEach((s) => r.set(s)), r;
  }
  static accessor(e) {
    const r = (this[St] = this[St] = {
      accessors: {}
    }).accessors, s = this.prototype;
    function i(o) {
      const c = oe(o);
      r[c] || (bs(s, o), r[c] = !0);
    }
    return d.isArray(e) ? e.forEach(i) : i(e), this;
  }
};
P.accessor(["Content-Type", "Content-Length", "Accept", "Accept-Encoding", "User-Agent", "Authorization"]);
d.reduceDescriptors(P.prototype, ({ value: t }, e) => {
  let n = e[0].toUpperCase() + e.slice(1);
  return {
    get: () => t,
    set(r) {
      this[n] = r;
    }
  };
});
d.freezeMethods(P);
function Ue(t, e) {
  const n = this || he, r = e || n, s = P.from(r.headers);
  let i = r.data;
  return d.forEach(t, function(c) {
    i = c.call(n, i, s.normalize(), e ? e.status : void 0);
  }), s.normalize(), i;
}
function on(t) {
  return !!(t && t.__CANCEL__);
}
function re(t, e, n) {
  b.call(this, t ?? "canceled", b.ERR_CANCELED, e, n), this.name = "CanceledError";
}
d.inherits(re, b, {
  __CANCEL__: !0
});
function an(t, e, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status) ? t(n) : e(new b(
    "Request failed with status code " + n.status,
    [b.ERR_BAD_REQUEST, b.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4],
    n.config,
    n.request,
    n
  ));
}
function ws(t) {
  const e = /^([-+\w]{1,25})(:?\/\/|:)/.exec(t);
  return e && e[1] || "";
}
function _s(t, e) {
  t = t || 10;
  const n = new Array(t), r = new Array(t);
  let s = 0, i = 0, o;
  return e = e !== void 0 ? e : 1e3, function(a) {
    const u = Date.now(), l = r[i];
    o || (o = u), n[s] = a, r[s] = u;
    let f = i, h = 0;
    for (; f !== s; )
      h += n[f++], f = f % t;
    if (s = (s + 1) % t, s === i && (i = (i + 1) % t), u - o < e)
      return;
    const m = l && u - l;
    return m ? Math.round(h * 1e3 / m) : void 0;
  };
}
function Es(t, e) {
  let n = 0, r = 1e3 / e, s, i;
  const o = (u, l = Date.now()) => {
    n = l, s = null, i && (clearTimeout(i), i = null), t.apply(null, u);
  };
  return [(...u) => {
    const l = Date.now(), f = l - n;
    f >= r ? o(u, l) : (s = u, i || (i = setTimeout(() => {
      i = null, o(s);
    }, r - f)));
  }, () => s && o(s)];
}
const Re = (t, e, n = 3) => {
  let r = 0;
  const s = _s(50, 250);
  return Es((i) => {
    const o = i.loaded, c = i.lengthComputable ? i.total : void 0, a = o - r, u = s(a), l = o <= c;
    r = o;
    const f = {
      loaded: o,
      total: c,
      progress: c ? o / c : void 0,
      bytes: a,
      rate: u || void 0,
      estimated: u && c && l ? (c - o) / u : void 0,
      event: i,
      lengthComputable: c != null,
      [e ? "download" : "upload"]: !0
    };
    t(f);
  }, n);
}, Rt = (t, e) => {
  const n = t != null;
  return [(r) => e[0]({
    lengthComputable: n,
    total: t,
    loaded: r
  }), e[1]];
}, At = (t) => (...e) => d.asap(() => t(...e)), xs = N.hasStandardBrowserEnv ? /* @__PURE__ */ ((t, e) => (n) => (n = new URL(n, N.origin), t.protocol === n.protocol && t.host === n.host && (e || t.port === n.port)))(
  new URL(N.origin),
  N.navigator && /(msie|trident)/i.test(N.navigator.userAgent)
) : () => !0, Ss = N.hasStandardBrowserEnv ? (
  // Standard browser envs support document.cookie
  {
    write(t, e, n, r, s, i) {
      const o = [t + "=" + encodeURIComponent(e)];
      d.isNumber(n) && o.push("expires=" + new Date(n).toGMTString()), d.isString(r) && o.push("path=" + r), d.isString(s) && o.push("domain=" + s), i === !0 && o.push("secure"), document.cookie = o.join("; ");
    },
    read(t) {
      const e = document.cookie.match(new RegExp("(^|;\\s*)(" + t + ")=([^;]*)"));
      return e ? decodeURIComponent(e[3]) : null;
    },
    remove(t) {
      this.write(t, "", Date.now() - 864e5);
    }
  }
) : (
  // Non-standard browser env (web workers, react-native) lack needed support.
  {
    write() {
    },
    read() {
      return null;
    },
    remove() {
    }
  }
);
function Rs(t) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(t);
}
function As(t, e) {
  return e ? t.replace(/\/?\/$/, "") + "/" + e.replace(/^\/+/, "") : t;
}
function cn(t, e, n) {
  let r = !Rs(e);
  return t && r || n == !1 ? As(t, e) : e;
}
const vt = (t) => t instanceof P ? { ...t } : t;
function Y(t, e) {
  e = e || {};
  const n = {};
  function r(u, l, f, h) {
    return d.isPlainObject(u) && d.isPlainObject(l) ? d.merge.call({ caseless: h }, u, l) : d.isPlainObject(l) ? d.merge({}, l) : d.isArray(l) ? l.slice() : l;
  }
  function s(u, l, f, h) {
    if (d.isUndefined(l)) {
      if (!d.isUndefined(u))
        return r(void 0, u, f, h);
    } else return r(u, l, f, h);
  }
  function i(u, l) {
    if (!d.isUndefined(l))
      return r(void 0, l);
  }
  function o(u, l) {
    if (d.isUndefined(l)) {
      if (!d.isUndefined(u))
        return r(void 0, u);
    } else return r(void 0, l);
  }
  function c(u, l, f) {
    if (f in e)
      return r(u, l);
    if (f in t)
      return r(void 0, u);
  }
  const a = {
    url: i,
    method: i,
    data: i,
    baseURL: o,
    transformRequest: o,
    transformResponse: o,
    paramsSerializer: o,
    timeout: o,
    timeoutMessage: o,
    withCredentials: o,
    withXSRFToken: o,
    adapter: o,
    responseType: o,
    xsrfCookieName: o,
    xsrfHeaderName: o,
    onUploadProgress: o,
    onDownloadProgress: o,
    decompress: o,
    maxContentLength: o,
    maxBodyLength: o,
    beforeRedirect: o,
    transport: o,
    httpAgent: o,
    httpsAgent: o,
    cancelToken: o,
    socketPath: o,
    responseEncoding: o,
    validateStatus: c,
    headers: (u, l, f) => s(vt(u), vt(l), f, !0)
  };
  return d.forEach(Object.keys(Object.assign({}, t, e)), function(l) {
    const f = a[l] || s, h = f(t[l], e[l], l);
    d.isUndefined(h) && f !== c || (n[l] = h);
  }), n;
}
const un = (t) => {
  const e = Y({}, t);
  let { data: n, withXSRFToken: r, xsrfHeaderName: s, xsrfCookieName: i, headers: o, auth: c } = e;
  e.headers = o = P.from(o), e.url = nn(cn(e.baseURL, e.url), t.params, t.paramsSerializer), c && o.set(
    "Authorization",
    "Basic " + btoa((c.username || "") + ":" + (c.password ? unescape(encodeURIComponent(c.password)) : ""))
  );
  let a;
  if (d.isFormData(n)) {
    if (N.hasStandardBrowserEnv || N.hasStandardBrowserWebWorkerEnv)
      o.setContentType(void 0);
    else if ((a = o.getContentType()) !== !1) {
      const [u, ...l] = a ? a.split(";").map((f) => f.trim()).filter(Boolean) : [];
      o.setContentType([u || "multipart/form-data", ...l].join("; "));
    }
  }
  if (N.hasStandardBrowserEnv && (r && d.isFunction(r) && (r = r(e)), r || r !== !1 && xs(e.url))) {
    const u = s && i && Ss.read(i);
    u && o.set(s, u);
  }
  return e;
}, vs = typeof XMLHttpRequest < "u", Os = vs && function(t) {
  return new Promise(function(n, r) {
    const s = un(t);
    let i = s.data;
    const o = P.from(s.headers).normalize();
    let { responseType: c, onUploadProgress: a, onDownloadProgress: u } = s, l, f, h, m, p;
    function g() {
      m && m(), p && p(), s.cancelToken && s.cancelToken.unsubscribe(l), s.signal && s.signal.removeEventListener("abort", l);
    }
    let y = new XMLHttpRequest();
    y.open(s.method.toUpperCase(), s.url, !0), y.timeout = s.timeout;
    function S() {
      if (!y)
        return;
      const O = P.from(
        "getAllResponseHeaders" in y && y.getAllResponseHeaders()
      ), w = {
        data: !c || c === "text" || c === "json" ? y.responseText : y.response,
        status: y.status,
        statusText: y.statusText,
        headers: O,
        config: t,
        request: y
      };
      an(function(A) {
        n(A), g();
      }, function(A) {
        r(A), g();
      }, w), y = null;
    }
    "onloadend" in y ? y.onloadend = S : y.onreadystatechange = function() {
      !y || y.readyState !== 4 || y.status === 0 && !(y.responseURL && y.responseURL.indexOf("file:") === 0) || setTimeout(S);
    }, y.onabort = function() {
      y && (r(new b("Request aborted", b.ECONNABORTED, t, y)), y = null);
    }, y.onerror = function() {
      r(new b("Network Error", b.ERR_NETWORK, t, y)), y = null;
    }, y.ontimeout = function() {
      let _ = s.timeout ? "timeout of " + s.timeout + "ms exceeded" : "timeout exceeded";
      const w = s.transitional || rn;
      s.timeoutErrorMessage && (_ = s.timeoutErrorMessage), r(new b(
        _,
        w.clarifyTimeoutError ? b.ETIMEDOUT : b.ECONNABORTED,
        t,
        y
      )), y = null;
    }, i === void 0 && o.setContentType(null), "setRequestHeader" in y && d.forEach(o.toJSON(), function(_, w) {
      y.setRequestHeader(w, _);
    }), d.isUndefined(s.withCredentials) || (y.withCredentials = !!s.withCredentials), c && c !== "json" && (y.responseType = s.responseType), u && ([h, p] = Re(u, !0), y.addEventListener("progress", h)), a && y.upload && ([f, m] = Re(a), y.upload.addEventListener("progress", f), y.upload.addEventListener("loadend", m)), (s.cancelToken || s.signal) && (l = (O) => {
      y && (r(!O || O.type ? new re(null, t, y) : O), y.abort(), y = null);
    }, s.cancelToken && s.cancelToken.subscribe(l), s.signal && (s.signal.aborted ? l() : s.signal.addEventListener("abort", l)));
    const v = ws(s.url);
    if (v && N.protocols.indexOf(v) === -1) {
      r(new b("Unsupported protocol " + v + ":", b.ERR_BAD_REQUEST, t));
      return;
    }
    y.send(i || null);
  });
}, ks = (t, e) => {
  const { length: n } = t = t ? t.filter(Boolean) : [];
  if (e || n) {
    let r = new AbortController(), s;
    const i = function(u) {
      if (!s) {
        s = !0, c();
        const l = u instanceof Error ? u : this.reason;
        r.abort(l instanceof b ? l : new re(l instanceof Error ? l.message : l));
      }
    };
    let o = e && setTimeout(() => {
      o = null, i(new b(`timeout ${e} of ms exceeded`, b.ETIMEDOUT));
    }, e);
    const c = () => {
      t && (o && clearTimeout(o), o = null, t.forEach((u) => {
        u.unsubscribe ? u.unsubscribe(i) : u.removeEventListener("abort", i);
      }), t = null);
    };
    t.forEach((u) => u.addEventListener("abort", i));
    const { signal: a } = r;
    return a.unsubscribe = () => d.asap(c), a;
  }
}, Ts = function* (t, e) {
  let n = t.byteLength;
  if (n < e) {
    yield t;
    return;
  }
  let r = 0, s;
  for (; r < n; )
    s = r + e, yield t.slice(r, s), r = s;
}, Cs = async function* (t, e) {
  for await (const n of Ns(t))
    yield* Ts(n, e);
}, Ns = async function* (t) {
  if (t[Symbol.asyncIterator]) {
    yield* t;
    return;
  }
  const e = t.getReader();
  try {
    for (; ; ) {
      const { done: n, value: r } = await e.read();
      if (n)
        break;
      yield r;
    }
  } finally {
    await e.cancel();
  }
}, Ot = (t, e, n, r) => {
  const s = Cs(t, e);
  let i = 0, o, c = (a) => {
    o || (o = !0, r && r(a));
  };
  return new ReadableStream({
    async pull(a) {
      try {
        const { done: u, value: l } = await s.next();
        if (u) {
          c(), a.close();
          return;
        }
        let f = l.byteLength;
        if (n) {
          let h = i += f;
          n(h);
        }
        a.enqueue(new Uint8Array(l));
      } catch (u) {
        throw c(u), u;
      }
    },
    cancel(a) {
      return c(a), s.return();
    }
  }, {
    highWaterMark: 2
  });
}, Be = typeof fetch == "function" && typeof Request == "function" && typeof Response == "function", ln = Be && typeof ReadableStream == "function", Bs = Be && (typeof TextEncoder == "function" ? /* @__PURE__ */ ((t) => (e) => t.encode(e))(new TextEncoder()) : async (t) => new Uint8Array(await new Response(t).arrayBuffer())), fn = (t, ...e) => {
  try {
    return !!t(...e);
  } catch {
    return !1;
  }
}, Ps = ln && fn(() => {
  let t = !1;
  const e = new Request(N.origin, {
    body: new ReadableStream(),
    method: "POST",
    get duplex() {
      return t = !0, "half";
    }
  }).headers.has("Content-Type");
  return t && !e;
}), kt = 64 * 1024, Xe = ln && fn(() => d.isReadableStream(new Response("").body)), Ae = {
  stream: Xe && ((t) => t.body)
};
Be && ((t) => {
  ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((e) => {
    !Ae[e] && (Ae[e] = d.isFunction(t[e]) ? (n) => n[e]() : (n, r) => {
      throw new b(`Response type '${e}' is not supported`, b.ERR_NOT_SUPPORT, r);
    });
  });
})(new Response());
const Ls = async (t) => {
  if (t == null)
    return 0;
  if (d.isBlob(t))
    return t.size;
  if (d.isSpecCompliantForm(t))
    return (await new Request(N.origin, {
      method: "POST",
      body: t
    }).arrayBuffer()).byteLength;
  if (d.isArrayBufferView(t) || d.isArrayBuffer(t))
    return t.byteLength;
  if (d.isURLSearchParams(t) && (t = t + ""), d.isString(t))
    return (await Bs(t)).byteLength;
}, Ds = async (t, e) => {
  const n = d.toFiniteNumber(t.getContentLength());
  return n ?? Ls(e);
}, qs = Be && (async (t) => {
  let {
    url: e,
    method: n,
    data: r,
    signal: s,
    cancelToken: i,
    timeout: o,
    onDownloadProgress: c,
    onUploadProgress: a,
    responseType: u,
    headers: l,
    withCredentials: f = "same-origin",
    fetchOptions: h
  } = un(t);
  u = u ? (u + "").toLowerCase() : "text";
  let m = ks([s, i && i.toAbortSignal()], o), p;
  const g = m && m.unsubscribe && (() => {
    m.unsubscribe();
  });
  let y;
  try {
    if (a && Ps && n !== "get" && n !== "head" && (y = await Ds(l, r)) !== 0) {
      let w = new Request(e, {
        method: "POST",
        body: r,
        duplex: "half"
      }), T;
      if (d.isFormData(r) && (T = w.headers.get("content-type")) && l.setContentType(T), w.body) {
        const [A, k] = Rt(
          y,
          Re(At(a))
        );
        r = Ot(w.body, kt, A, k);
      }
    }
    d.isString(f) || (f = f ? "include" : "omit");
    const S = "credentials" in Request.prototype;
    p = new Request(e, {
      ...h,
      signal: m,
      method: n.toUpperCase(),
      headers: l.normalize().toJSON(),
      body: r,
      duplex: "half",
      credentials: S ? f : void 0
    });
    let v = await fetch(p);
    const O = Xe && (u === "stream" || u === "response");
    if (Xe && (c || O && g)) {
      const w = {};
      ["status", "statusText", "headers"].forEach((B) => {
        w[B] = v[B];
      });
      const T = d.toFiniteNumber(v.headers.get("content-length")), [A, k] = c && Rt(
        T,
        Re(At(c), !0)
      ) || [];
      v = new Response(
        Ot(v.body, kt, A, () => {
          k && k(), g && g();
        }),
        w
      );
    }
    u = u || "text";
    let _ = await Ae[d.findKey(Ae, u) || "text"](v, t);
    return !O && g && g(), await new Promise((w, T) => {
      an(w, T, {
        data: _,
        headers: P.from(v.headers),
        status: v.status,
        statusText: v.statusText,
        config: t,
        request: p
      });
    });
  } catch (S) {
    throw g && g(), S && S.name === "TypeError" && /fetch/i.test(S.message) ? Object.assign(
      new b("Network Error", b.ERR_NETWORK, t, p),
      {
        cause: S.cause || S
      }
    ) : b.from(S, S && S.code, t, p);
  }
}), Ye = {
  http: Gr,
  xhr: Os,
  fetch: qs
};
d.forEach(Ye, (t, e) => {
  if (t) {
    try {
      Object.defineProperty(t, "name", { value: e });
    } catch {
    }
    Object.defineProperty(t, "adapterName", { value: e });
  }
});
const Tt = (t) => `- ${t}`, Fs = (t) => d.isFunction(t) || t === null || t === !1, hn = {
  getAdapter: (t) => {
    t = d.isArray(t) ? t : [t];
    const { length: e } = t;
    let n, r;
    const s = {};
    for (let i = 0; i < e; i++) {
      n = t[i];
      let o;
      if (r = n, !Fs(n) && (r = Ye[(o = String(n)).toLowerCase()], r === void 0))
        throw new b(`Unknown adapter '${o}'`);
      if (r)
        break;
      s[o || "#" + i] = r;
    }
    if (!r) {
      const i = Object.entries(s).map(
        ([c, a]) => `adapter ${c} ` + (a === !1 ? "is not supported by the environment" : "is not available in the build")
      );
      let o = e ? i.length > 1 ? `since :
` + i.map(Tt).join(`
`) : " " + Tt(i[0]) : "as no adapter specified";
      throw new b(
        "There is no suitable adapter to dispatch the request " + o,
        "ERR_NOT_SUPPORT"
      );
    }
    return r;
  },
  adapters: Ye
};
function Me(t) {
  if (t.cancelToken && t.cancelToken.throwIfRequested(), t.signal && t.signal.aborted)
    throw new re(null, t);
}
function Ct(t) {
  return Me(t), t.headers = P.from(t.headers), t.data = Ue.call(
    t,
    t.transformRequest
  ), ["post", "put", "patch"].indexOf(t.method) !== -1 && t.headers.setContentType("application/x-www-form-urlencoded", !1), hn.getAdapter(t.adapter || he.adapter)(t).then(function(r) {
    return Me(t), r.data = Ue.call(
      t,
      t.transformResponse,
      r
    ), r.headers = P.from(r.headers), r;
  }, function(r) {
    return on(r) || (Me(t), r && r.response && (r.response.data = Ue.call(
      t,
      t.transformResponse,
      r.response
    ), r.response.headers = P.from(r.response.headers))), Promise.reject(r);
  });
}
const dn = "1.8.1", Pe = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach((t, e) => {
  Pe[t] = function(r) {
    return typeof r === t || "a" + (e < 1 ? "n " : " ") + t;
  };
});
const Nt = {};
Pe.transitional = function(e, n, r) {
  function s(i, o) {
    return "[Axios v" + dn + "] Transitional option '" + i + "'" + o + (r ? ". " + r : "");
  }
  return (i, o, c) => {
    if (e === !1)
      throw new b(
        s(o, " has been removed" + (n ? " in " + n : "")),
        b.ERR_DEPRECATED
      );
    return n && !Nt[o] && (Nt[o] = !0, console.warn(
      s(
        o,
        " has been deprecated since v" + n + " and will be removed in the near future"
      )
    )), e ? e(i, o, c) : !0;
  };
};
Pe.spelling = function(e) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${e}`), !0);
};
function Us(t, e, n) {
  if (typeof t != "object")
    throw new b("options must be an object", b.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(t);
  let s = r.length;
  for (; s-- > 0; ) {
    const i = r[s], o = e[i];
    if (o) {
      const c = t[i], a = c === void 0 || o(c, i, t);
      if (a !== !0)
        throw new b("option " + i + " must be " + a, b.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (n !== !0)
      throw new b("Unknown option " + i, b.ERR_BAD_OPTION);
  }
}
const Se = {
  assertOptions: Us,
  validators: Pe
}, j = Se.validators;
let X = class {
  constructor(e) {
    this.defaults = e, this.interceptors = {
      request: new xt(),
      response: new xt()
    };
  }
  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   *
   * @returns {Promise} The Promise to be fulfilled
   */
  async request(e, n) {
    try {
      return await this._request(e, n);
    } catch (r) {
      if (r instanceof Error) {
        let s = {};
        Error.captureStackTrace ? Error.captureStackTrace(s) : s = new Error();
        const i = s.stack ? s.stack.replace(/^.+\n/, "") : "";
        try {
          r.stack ? i && !String(r.stack).endsWith(i.replace(/^.+\n.+\n/, "")) && (r.stack += `
` + i) : r.stack = i;
        } catch {
        }
      }
      throw r;
    }
  }
  _request(e, n) {
    typeof e == "string" ? (n = n || {}, n.url = e) : n = e || {}, n = Y(this.defaults, n);
    const { transitional: r, paramsSerializer: s, headers: i } = n;
    r !== void 0 && Se.assertOptions(r, {
      silentJSONParsing: j.transitional(j.boolean),
      forcedJSONParsing: j.transitional(j.boolean),
      clarifyTimeoutError: j.transitional(j.boolean)
    }, !1), s != null && (d.isFunction(s) ? n.paramsSerializer = {
      serialize: s
    } : Se.assertOptions(s, {
      encode: j.function,
      serialize: j.function
    }, !0)), n.allowAbsoluteUrls !== void 0 || (this.defaults.allowAbsoluteUrls !== void 0 ? n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls : n.allowAbsoluteUrls = !0), Se.assertOptions(n, {
      baseUrl: j.spelling("baseURL"),
      withXsrfToken: j.spelling("withXSRFToken")
    }, !0), n.method = (n.method || this.defaults.method || "get").toLowerCase();
    let o = i && d.merge(
      i.common,
      i[n.method]
    );
    i && d.forEach(
      ["delete", "get", "head", "post", "put", "patch", "common"],
      (p) => {
        delete i[p];
      }
    ), n.headers = P.concat(o, i);
    const c = [];
    let a = !0;
    this.interceptors.request.forEach(function(g) {
      typeof g.runWhen == "function" && g.runWhen(n) === !1 || (a = a && g.synchronous, c.unshift(g.fulfilled, g.rejected));
    });
    const u = [];
    this.interceptors.response.forEach(function(g) {
      u.push(g.fulfilled, g.rejected);
    });
    let l, f = 0, h;
    if (!a) {
      const p = [Ct.bind(this), void 0];
      for (p.unshift.apply(p, c), p.push.apply(p, u), h = p.length, l = Promise.resolve(n); f < h; )
        l = l.then(p[f++], p[f++]);
      return l;
    }
    h = c.length;
    let m = n;
    for (f = 0; f < h; ) {
      const p = c[f++], g = c[f++];
      try {
        m = p(m);
      } catch (y) {
        g.call(this, y);
        break;
      }
    }
    try {
      l = Ct.call(this, m);
    } catch (p) {
      return Promise.reject(p);
    }
    for (f = 0, h = u.length; f < h; )
      l = l.then(u[f++], u[f++]);
    return l;
  }
  getUri(e) {
    e = Y(this.defaults, e);
    const n = cn(e.baseURL, e.url, e.allowAbsoluteUrls);
    return nn(n, e.params, e.paramsSerializer);
  }
};
d.forEach(["delete", "get", "head", "options"], function(e) {
  X.prototype[e] = function(n, r) {
    return this.request(Y(r || {}, {
      method: e,
      url: n,
      data: (r || {}).data
    }));
  };
});
d.forEach(["post", "put", "patch"], function(e) {
  function n(r) {
    return function(i, o, c) {
      return this.request(Y(c || {}, {
        method: e,
        headers: r ? {
          "Content-Type": "multipart/form-data"
        } : {},
        url: i,
        data: o
      }));
    };
  }
  X.prototype[e] = n(), X.prototype[e + "Form"] = n(!0);
});
let Ms = class pn {
  constructor(e) {
    if (typeof e != "function")
      throw new TypeError("executor must be a function.");
    let n;
    this.promise = new Promise(function(i) {
      n = i;
    });
    const r = this;
    this.promise.then((s) => {
      if (!r._listeners) return;
      let i = r._listeners.length;
      for (; i-- > 0; )
        r._listeners[i](s);
      r._listeners = null;
    }), this.promise.then = (s) => {
      let i;
      const o = new Promise((c) => {
        r.subscribe(c), i = c;
      }).then(s);
      return o.cancel = function() {
        r.unsubscribe(i);
      }, o;
    }, e(function(i, o, c) {
      r.reason || (r.reason = new re(i, o, c), n(r.reason));
    });
  }
  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  throwIfRequested() {
    if (this.reason)
      throw this.reason;
  }
  /**
   * Subscribe to the cancel signal
   */
  subscribe(e) {
    if (this.reason) {
      e(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(e) : this._listeners = [e];
  }
  /**
   * Unsubscribe from the cancel signal
   */
  unsubscribe(e) {
    if (!this._listeners)
      return;
    const n = this._listeners.indexOf(e);
    n !== -1 && this._listeners.splice(n, 1);
  }
  toAbortSignal() {
    const e = new AbortController(), n = (r) => {
      e.abort(r);
    };
    return this.subscribe(n), e.signal.unsubscribe = () => this.unsubscribe(n), e.signal;
  }
  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  static source() {
    let e;
    return {
      token: new pn(function(s) {
        e = s;
      }),
      cancel: e
    };
  }
};
function Is(t) {
  return function(n) {
    return t.apply(null, n);
  };
}
function $s(t) {
  return d.isObject(t) && t.isAxiosError === !0;
}
const Ge = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511
};
Object.entries(Ge).forEach(([t, e]) => {
  Ge[e] = t;
});
function mn(t) {
  const e = new X(t), n = Vt(X.prototype.request, e);
  return d.extend(n, X.prototype, e, { allOwnKeys: !0 }), d.extend(n, e, null, { allOwnKeys: !0 }), n.create = function(s) {
    return mn(Y(t, s));
  }, n;
}
const R = mn(he);
R.Axios = X;
R.CanceledError = re;
R.CancelToken = Ms;
R.isCancel = on;
R.VERSION = dn;
R.toFormData = Ne;
R.AxiosError = b;
R.Cancel = R.CanceledError;
R.all = function(e) {
  return Promise.all(e);
};
R.spread = Is;
R.isAxiosError = $s;
R.mergeConfig = Y;
R.AxiosHeaders = P;
R.formToJSON = (t) => sn(d.isHTMLForm(t) ? new FormData(t) : t);
R.getAdapter = hn.getAdapter;
R.HttpStatusCode = Ge;
R.default = R;
const {
  Axios: yi,
  AxiosError: gi,
  CanceledError: bi,
  isCancel: wi,
  CancelToken: _i,
  VERSION: Ei,
  all: xi,
  Cancel: Si,
  isAxiosError: Ri,
  spread: Ai,
  toFormData: vi,
  AxiosHeaders: Oi,
  HttpStatusCode: ki,
  formToJSON: Ti,
  getAdapter: Ci,
  mergeConfig: Ni
} = R;
class js {
  constructor() {
    this.events = {};
  }
  /**
   * Belirli bir olayı dinler
   * @param {string} event - Dinlenecek olay adı
   * @param {function} callback - Olay tetiklendiğinde çalıştırılacak fonksiyon
   * @returns {function} - Dinleyiciyi kaldırmak için kullanılabilecek fonksiyon
   */
  on(e, n) {
    return this.events[e] || (this.events[e] = []), this.events[e].push(n), () => this.off(e, n);
  }
  /**
   * Bir olayın belirli bir dinleyicisini kaldırır
   * @param {string} event - Dinleyicinin kaldırılacağı olay adı
   * @param {function} callback - Kaldırılacak dinleyici fonksiyonu
   */
  off(e, n) {
    this.events[e] && (this.events[e] = this.events[e].filter((r) => r !== n), this.events[e].length === 0 && delete this.events[e]);
  }
  /**
   * Bir olayı tetikler ve kayıtlı tüm dinleyicilere veri gönderir
   * @param {string} event - Tetiklenecek olay adı
   * @param {any} data - Dinleyicilere gönderilecek veri
   */
  emit(e, n) {
    this.events[e] && this.events[e].forEach((r) => {
      r(n);
    });
  }
  /**
   * Bir olayı bir kez dinler ve tetiklendikten sonra dinleyiciyi kaldırır
   * @param {string} event - Dinlenecek olay adı
   * @param {function} callback - Olay tetiklendiğinde çalıştırılacak fonksiyon
   */
  once(e, n) {
    const r = (s) => {
      n(s), this.off(e, r);
    };
    return this.on(e, r);
  }
}
var Q = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function zs(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t;
}
function Hs(t) {
  if (t.__esModule) return t;
  var e = t.default;
  if (typeof e == "function") {
    var n = function r() {
      return this instanceof r ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments);
    };
    n.prototype = e.prototype;
  } else n = {};
  return Object.defineProperty(n, "__esModule", { value: !0 }), Object.keys(t).forEach(function(r) {
    var s = Object.getOwnPropertyDescriptor(t, r);
    Object.defineProperty(n, r, s.get ? s : {
      enumerable: !0,
      get: function() {
        return t[r];
      }
    });
  }), n;
}
var at = { exports: {} };
at.exports;
(function(t) {
  (function(e, n, r) {
    function s(a) {
      var u = this, l = c();
      u.next = function() {
        var f = 2091639 * u.s0 + u.c * 23283064365386963e-26;
        return u.s0 = u.s1, u.s1 = u.s2, u.s2 = f - (u.c = f | 0);
      }, u.c = 1, u.s0 = l(" "), u.s1 = l(" "), u.s2 = l(" "), u.s0 -= l(a), u.s0 < 0 && (u.s0 += 1), u.s1 -= l(a), u.s1 < 0 && (u.s1 += 1), u.s2 -= l(a), u.s2 < 0 && (u.s2 += 1), l = null;
    }
    function i(a, u) {
      return u.c = a.c, u.s0 = a.s0, u.s1 = a.s1, u.s2 = a.s2, u;
    }
    function o(a, u) {
      var l = new s(a), f = u && u.state, h = l.next;
      return h.int32 = function() {
        return l.next() * 4294967296 | 0;
      }, h.double = function() {
        return h() + (h() * 2097152 | 0) * 11102230246251565e-32;
      }, h.quick = h, f && (typeof f == "object" && i(f, l), h.state = function() {
        return i(l, {});
      }), h;
    }
    function c() {
      var a = 4022871197, u = function(l) {
        l = String(l);
        for (var f = 0; f < l.length; f++) {
          a += l.charCodeAt(f);
          var h = 0.02519603282416938 * a;
          a = h >>> 0, h -= a, h *= a, a = h >>> 0, h -= a, a += h * 4294967296;
        }
        return (a >>> 0) * 23283064365386963e-26;
      };
      return u;
    }
    n && n.exports ? n.exports = o : this.alea = o;
  })(
    Q,
    t
  );
})(at);
var Vs = at.exports, ct = { exports: {} };
ct.exports;
(function(t) {
  (function(e, n, r) {
    function s(c) {
      var a = this, u = "";
      a.x = 0, a.y = 0, a.z = 0, a.w = 0, a.next = function() {
        var f = a.x ^ a.x << 11;
        return a.x = a.y, a.y = a.z, a.z = a.w, a.w ^= a.w >>> 19 ^ f ^ f >>> 8;
      }, c === (c | 0) ? a.x = c : u += c;
      for (var l = 0; l < u.length + 64; l++)
        a.x ^= u.charCodeAt(l) | 0, a.next();
    }
    function i(c, a) {
      return a.x = c.x, a.y = c.y, a.z = c.z, a.w = c.w, a;
    }
    function o(c, a) {
      var u = new s(c), l = a && a.state, f = function() {
        return (u.next() >>> 0) / 4294967296;
      };
      return f.double = function() {
        do
          var h = u.next() >>> 11, m = (u.next() >>> 0) / 4294967296, p = (h + m) / (1 << 21);
        while (p === 0);
        return p;
      }, f.int32 = u.next, f.quick = f, l && (typeof l == "object" && i(l, u), f.state = function() {
        return i(u, {});
      }), f;
    }
    n && n.exports ? n.exports = o : this.xor128 = o;
  })(
    Q,
    t
  );
})(ct);
var Js = ct.exports, ut = { exports: {} };
ut.exports;
(function(t) {
  (function(e, n, r) {
    function s(c) {
      var a = this, u = "";
      a.next = function() {
        var f = a.x ^ a.x >>> 2;
        return a.x = a.y, a.y = a.z, a.z = a.w, a.w = a.v, (a.d = a.d + 362437 | 0) + (a.v = a.v ^ a.v << 4 ^ (f ^ f << 1)) | 0;
      }, a.x = 0, a.y = 0, a.z = 0, a.w = 0, a.v = 0, c === (c | 0) ? a.x = c : u += c;
      for (var l = 0; l < u.length + 64; l++)
        a.x ^= u.charCodeAt(l) | 0, l == u.length && (a.d = a.x << 10 ^ a.x >>> 4), a.next();
    }
    function i(c, a) {
      return a.x = c.x, a.y = c.y, a.z = c.z, a.w = c.w, a.v = c.v, a.d = c.d, a;
    }
    function o(c, a) {
      var u = new s(c), l = a && a.state, f = function() {
        return (u.next() >>> 0) / 4294967296;
      };
      return f.double = function() {
        do
          var h = u.next() >>> 11, m = (u.next() >>> 0) / 4294967296, p = (h + m) / (1 << 21);
        while (p === 0);
        return p;
      }, f.int32 = u.next, f.quick = f, l && (typeof l == "object" && i(l, u), f.state = function() {
        return i(u, {});
      }), f;
    }
    n && n.exports ? n.exports = o : this.xorwow = o;
  })(
    Q,
    t
  );
})(ut);
var Ws = ut.exports, lt = { exports: {} };
lt.exports;
(function(t) {
  (function(e, n, r) {
    function s(c) {
      var a = this;
      a.next = function() {
        var l = a.x, f = a.i, h, m;
        return h = l[f], h ^= h >>> 7, m = h ^ h << 24, h = l[f + 1 & 7], m ^= h ^ h >>> 10, h = l[f + 3 & 7], m ^= h ^ h >>> 3, h = l[f + 4 & 7], m ^= h ^ h << 7, h = l[f + 7 & 7], h = h ^ h << 13, m ^= h ^ h << 9, l[f] = m, a.i = f + 1 & 7, m;
      };
      function u(l, f) {
        var h, m = [];
        if (f === (f | 0))
          m[0] = f;
        else
          for (f = "" + f, h = 0; h < f.length; ++h)
            m[h & 7] = m[h & 7] << 15 ^ f.charCodeAt(h) + m[h + 1 & 7] << 13;
        for (; m.length < 8; ) m.push(0);
        for (h = 0; h < 8 && m[h] === 0; ++h) ;
        for (h == 8 ? m[7] = -1 : m[h], l.x = m, l.i = 0, h = 256; h > 0; --h)
          l.next();
      }
      u(a, c);
    }
    function i(c, a) {
      return a.x = c.x.slice(), a.i = c.i, a;
    }
    function o(c, a) {
      c == null && (c = +/* @__PURE__ */ new Date());
      var u = new s(c), l = a && a.state, f = function() {
        return (u.next() >>> 0) / 4294967296;
      };
      return f.double = function() {
        do
          var h = u.next() >>> 11, m = (u.next() >>> 0) / 4294967296, p = (h + m) / (1 << 21);
        while (p === 0);
        return p;
      }, f.int32 = u.next, f.quick = f, l && (l.x && i(l, u), f.state = function() {
        return i(u, {});
      }), f;
    }
    n && n.exports ? n.exports = o : this.xorshift7 = o;
  })(
    Q,
    t
  );
})(lt);
var Ks = lt.exports, ft = { exports: {} };
ft.exports;
(function(t) {
  (function(e, n, r) {
    function s(c) {
      var a = this;
      a.next = function() {
        var l = a.w, f = a.X, h = a.i, m, p;
        return a.w = l = l + 1640531527 | 0, p = f[h + 34 & 127], m = f[h = h + 1 & 127], p ^= p << 13, m ^= m << 17, p ^= p >>> 15, m ^= m >>> 12, p = f[h] = p ^ m, a.i = h, p + (l ^ l >>> 16) | 0;
      };
      function u(l, f) {
        var h, m, p, g, y, S = [], v = 128;
        for (f === (f | 0) ? (m = f, f = null) : (f = f + "\0", m = 0, v = Math.max(v, f.length)), p = 0, g = -32; g < v; ++g)
          f && (m ^= f.charCodeAt((g + 32) % f.length)), g === 0 && (y = m), m ^= m << 10, m ^= m >>> 15, m ^= m << 4, m ^= m >>> 13, g >= 0 && (y = y + 1640531527 | 0, h = S[g & 127] ^= m + y, p = h == 0 ? p + 1 : 0);
        for (p >= 128 && (S[(f && f.length || 0) & 127] = -1), p = 127, g = 4 * 128; g > 0; --g)
          m = S[p + 34 & 127], h = S[p = p + 1 & 127], m ^= m << 13, h ^= h << 17, m ^= m >>> 15, h ^= h >>> 12, S[p] = m ^ h;
        l.w = y, l.X = S, l.i = p;
      }
      u(a, c);
    }
    function i(c, a) {
      return a.i = c.i, a.w = c.w, a.X = c.X.slice(), a;
    }
    function o(c, a) {
      c == null && (c = +/* @__PURE__ */ new Date());
      var u = new s(c), l = a && a.state, f = function() {
        return (u.next() >>> 0) / 4294967296;
      };
      return f.double = function() {
        do
          var h = u.next() >>> 11, m = (u.next() >>> 0) / 4294967296, p = (h + m) / (1 << 21);
        while (p === 0);
        return p;
      }, f.int32 = u.next, f.quick = f, l && (l.X && i(l, u), f.state = function() {
        return i(u, {});
      }), f;
    }
    n && n.exports ? n.exports = o : this.xor4096 = o;
  })(
    Q,
    // window object or global
    t
  );
})(ft);
var Xs = ft.exports, ht = { exports: {} };
ht.exports;
(function(t) {
  (function(e, n, r) {
    function s(c) {
      var a = this, u = "";
      a.next = function() {
        var f = a.b, h = a.c, m = a.d, p = a.a;
        return f = f << 25 ^ f >>> 7 ^ h, h = h - m | 0, m = m << 24 ^ m >>> 8 ^ p, p = p - f | 0, a.b = f = f << 20 ^ f >>> 12 ^ h, a.c = h = h - m | 0, a.d = m << 16 ^ h >>> 16 ^ p, a.a = p - f | 0;
      }, a.a = 0, a.b = 0, a.c = -1640531527, a.d = 1367130551, c === Math.floor(c) ? (a.a = c / 4294967296 | 0, a.b = c | 0) : u += c;
      for (var l = 0; l < u.length + 20; l++)
        a.b ^= u.charCodeAt(l) | 0, a.next();
    }
    function i(c, a) {
      return a.a = c.a, a.b = c.b, a.c = c.c, a.d = c.d, a;
    }
    function o(c, a) {
      var u = new s(c), l = a && a.state, f = function() {
        return (u.next() >>> 0) / 4294967296;
      };
      return f.double = function() {
        do
          var h = u.next() >>> 11, m = (u.next() >>> 0) / 4294967296, p = (h + m) / (1 << 21);
        while (p === 0);
        return p;
      }, f.int32 = u.next, f.quick = f, l && (typeof l == "object" && i(l, u), f.state = function() {
        return i(u, {});
      }), f;
    }
    n && n.exports ? n.exports = o : this.tychei = o;
  })(
    Q,
    t
  );
})(ht);
var Ys = ht.exports, yn = { exports: {} };
const Gs = {}, Qs = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Gs
}, Symbol.toStringTag, { value: "Module" })), Zs = /* @__PURE__ */ Hs(Qs);
(function(t) {
  (function(e, n, r) {
    var s = 256, i = 6, o = 52, c = "random", a = r.pow(s, i), u = r.pow(2, o), l = u * 2, f = s - 1, h;
    function m(_, w, T) {
      var A = [];
      w = w == !0 ? { entropy: !0 } : w || {};
      var k = S(y(
        w.entropy ? [_, O(n)] : _ ?? v(),
        3
      ), A), B = new p(A), U = function() {
        for (var q = B.g(i), V = a, $ = 0; q < u; )
          q = (q + $) * s, V *= s, $ = B.g(1);
        for (; q >= l; )
          q /= 2, V /= 2, $ >>>= 1;
        return (q + $) / V;
      };
      return U.int32 = function() {
        return B.g(4) | 0;
      }, U.quick = function() {
        return B.g(4) / 4294967296;
      }, U.double = U, S(O(B.S), n), (w.pass || T || function(q, V, $, J) {
        return J && (J.S && g(J, B), q.state = function() {
          return g(B, {});
        }), $ ? (r[c] = q, V) : q;
      })(
        U,
        k,
        "global" in w ? w.global : this == r,
        w.state
      );
    }
    function p(_) {
      var w, T = _.length, A = this, k = 0, B = A.i = A.j = 0, U = A.S = [];
      for (T || (_ = [T++]); k < s; )
        U[k] = k++;
      for (k = 0; k < s; k++)
        U[k] = U[B = f & B + _[k % T] + (w = U[k])], U[B] = w;
      (A.g = function(q) {
        for (var V, $ = 0, J = A.i, de = A.j, se = A.S; q--; )
          V = se[J = f & J + 1], $ = $ * s + se[f & (se[J] = se[de = f & de + V]) + (se[de] = V)];
        return A.i = J, A.j = de, $;
      })(s);
    }
    function g(_, w) {
      return w.i = _.i, w.j = _.j, w.S = _.S.slice(), w;
    }
    function y(_, w) {
      var T = [], A = typeof _, k;
      if (w && A == "object")
        for (k in _)
          try {
            T.push(y(_[k], w - 1));
          } catch {
          }
      return T.length ? T : A == "string" ? _ : _ + "\0";
    }
    function S(_, w) {
      for (var T = _ + "", A, k = 0; k < T.length; )
        w[f & k] = f & (A ^= w[f & k] * 19) + T.charCodeAt(k++);
      return O(w);
    }
    function v() {
      try {
        var _;
        return h && (_ = h.randomBytes) ? _ = _(s) : (_ = new Uint8Array(s), (e.crypto || e.msCrypto).getRandomValues(_)), O(_);
      } catch {
        var w = e.navigator, T = w && w.plugins;
        return [+/* @__PURE__ */ new Date(), e, T, e.screen, O(n)];
      }
    }
    function O(_) {
      return String.fromCharCode.apply(0, _);
    }
    if (S(r.random(), n), t.exports) {
      t.exports = m;
      try {
        h = Zs;
      } catch {
      }
    } else
      r["seed" + c] = m;
  })(
    // global: `self` in browsers (including strict mode and web workers),
    // otherwise `this` in Node and other environments
    typeof self < "u" ? self : Q,
    [],
    // pool: entropy pool starts empty
    Math
    // math: package containing random, pow, and seedrandom
  );
})(yn);
var ei = yn.exports, ti = Vs, ni = Js, ri = Ws, si = Ks, ii = Xs, oi = Ys, Z = ei;
Z.alea = ti;
Z.xor128 = ni;
Z.xorwow = ri;
Z.xorshift7 = si;
Z.xor4096 = ii;
Z.tychei = oi;
var ai = Z;
const gn = /* @__PURE__ */ zs(ai), ci = () => {
  const t = [], r = Array.from({ length: 90 }, (s, i) => i + 1);
  for (let s = 0; s < 3; s++) {
    const i = [];
    for (let o = 0; o < 9; o++) {
      const c = o * 10 + 1, a = Math.min(c + 9, 90), u = r.filter((l) => l >= c && l <= a);
      if (u.length > 0) {
        const l = Math.floor(Math.random() * u.length), f = u[l];
        i.push(f);
        const h = r.indexOf(f);
        h !== -1 && r.splice(h, 1);
      } else
        i.push(null);
    }
    t.push(i);
  }
  for (let s = 0; s < 3; s++) {
    const i = t[s], o = Array.from({ length: 9 }, (c, a) => a);
    for (let c = 0; c < 4; c++) {
      const a = Math.floor(Math.random() * o.length), u = o[a];
      i[u] = null, o.splice(a, 1);
    }
  }
  return t;
}, Bi = (t) => {
  const e = gn(t), n = [], r = 3, s = 9, i = Array.from({ length: 90 }, (o, c) => c + 1);
  for (let o = 0; o < r; o++) {
    const c = [];
    for (let a = 0; a < s; a++) {
      const u = a * 10 + 1, l = Math.min(u + 9, 90), f = i.filter((h) => h >= u && h <= l);
      if (f.length > 0) {
        const h = Math.floor(e() * f.length), m = f[h];
        c.push(m);
        const p = i.indexOf(m);
        p !== -1 && i.splice(p, 1);
      } else
        c.push(null);
    }
    n.push(c);
  }
  for (let o = 0; o < r; o++) {
    const c = n[o], a = Array.from({ length: s }, (u, l) => l);
    for (let u = 0; u < 4; u++) {
      const l = Math.floor(e() * a.length), f = a[l];
      c[f] = null, a.splice(l, 1);
    }
  }
  return n;
}, Pi = (t, e, n) => {
  if (!t || !e || e.length === 0) return !1;
  const s = t.flat().filter((o) => o !== null).every((o) => e.includes(o));
  if (n === "tombala")
    return s;
  const i = t.map((o) => o.filter((a) => a !== null).every((a) => e.includes(a)));
  return n === "cinko1" ? i.some((o) => o) : n === "cinko2" ? i.filter((o) => o).length >= 2 : !1;
}, Li = (t = []) => {
  if (t.length >= 90) return null;
  const e = Array.from({ length: 90 }, (r, s) => s + 1).filter((r) => !t.includes(r)), n = Math.floor(Math.random() * e.length);
  return e[n];
}, Di = (t = [], e) => {
  if (t.length >= 90) return null;
  const n = gn(e + t.length), r = Array.from({ length: 90 }, (i, o) => o + 1).filter((i) => !t.includes(i)), s = Math.floor(n() * r.length);
  return r[s];
}, qi = (t, e, n) => (x.connected || x.connect(), x.off("connect"), x.off("disconnect"), x.off("reconnect"), t && x.on("connect", t), e && x.on("disconnect", e), n && x.on("reconnect", n), x), Fi = (t, e, n) => (x.connected || x.connect(), x.emit("joinGame", { gameId: t, playerId: e }), x.on("gameUpdate", (r) => {
  n && n({ type: "gameUpdate", gameState: r });
}), x.on("numberDrawn", (r) => {
  n && n({ type: "numberDrawn", number: r.number });
}), x.on("playerJoined", (r) => {
  n && n({ type: "playerJoined", player: r });
}), x.on("playerLeft", (r) => {
  n && n({ type: "playerLeft", player: r });
}), x.on("gameEnded", (r) => {
  n && n({ type: "gameEnded", result: r });
}), () => {
  x.off("gameUpdate"), x.off("numberDrawn"), x.off("playerJoined"), x.off("playerLeft"), x.off("gameEnded"), x.emit("leaveGame", { gameId: t, playerId: e });
}), Ui = (t, e) => x.connected ? (x.emit("updateGameState", { gameId: t, gameState: e }), !0) : (console.warn("Socket bağlantısı yok, oyun durumu yayınlanamadı"), !1), Mi = (t, e) => x.connected ? (x.emit("drawNumber", { gameId: t, number: e }), !0) : (console.warn("Socket bağlantısı yok, yeni sayı yayınlanamadı"), !1), Qe = (t = {}) => {
  const e = t.seed || `game_${Date.now()}_${Math.floor(Math.random() * 1e4)}`;
  return {
    id: t.id || `game_${Date.now()}`,
    status: "waiting",
    drawnNumbers: [],
    currentNumber: null,
    players: t.players || [],
    winner: null,
    winType: null,
    prize: t.prize || 0,
    startTime: null,
    endTime: null,
    gameSeed: e
  };
}, Ii = (t, e) => t ? {
  ...t,
  ...e,
  players: e.players || t.players,
  // Eğer oyun bitti durumuna geçiliyorsa endTime ekle
  ...e.status === "finished" && !t.endTime ? { endTime: (/* @__PURE__ */ new Date()).toISOString() } : {},
  // Eğer oyun başladı durumuna geçiliyorsa startTime ekle
  ...e.status === "playing" && !t.startTime ? { startTime: (/* @__PURE__ */ new Date()).toISOString() } : {}
} : Qe(e), $i = (t = 1, e = 3, n = {}) => {
  const r = [], s = n.currentPlayerId || "player_1";
  for (let i = 1; i <= t; i++) {
    const o = `player_${i}`;
    r.push({
      id: o,
      name: i === 1 ? "Siz" : `Oyuncu ${i}`,
      betAmount: n.betAmount || 10,
      status: null,
      isCurrentPlayer: o === s
    });
  }
  for (let i = 1; i <= e; i++) {
    const o = `bot_${i}`, c = ["easy", "normal", "hard"][Math.floor(Math.random() * 3)];
    r.push({
      id: o,
      name: bn(),
      betAmount: n.botBetAmount || 10,
      status: null,
      isBot: !0,
      difficultyLevel: c
    });
  }
  return r;
}, bn = () => {
  const t = [
    "Ahmet",
    "Mehmet",
    "Ayşe",
    "Fatma",
    "Mustafa",
    "Ali",
    "Zeynep",
    "Hüseyin",
    "Emine",
    "İbrahim",
    "Hatice",
    "Osman",
    "Elif",
    "Hasan",
    "Meryem",
    "Can",
    "Esra",
    "Murat",
    "Deniz",
    "Ömer",
    "Sevgi",
    "Kemal",
    "Sibel",
    "Yusuf",
    "Gül",
    "Emre",
    "Aslı",
    "Burak",
    "Seda",
    "Cem"
  ];
  return t[Math.floor(Math.random() * t.length)];
}, ui = (t) => {
  switch (t) {
    case "easy":
      return 1500 + Math.random() * 1500;
    case "normal":
      return 700 + Math.random() * 800;
    case "hard":
      return 300 + Math.random() * 400;
    default:
      return 1e3 + Math.random() * 1e3;
  }
}, ji = (t = {}) => {
  const e = t.id || `bot_${Date.now()}`, n = t.difficulty || ["easy", "normal", "hard"][Math.floor(Math.random() * 3)];
  return {
    id: e,
    name: t.name || bn(),
    betAmount: t.betAmount || 10,
    status: null,
    isBot: !0,
    difficultyLevel: n,
    // Her bot için farklı bir seed üret
    seed: t.seed || `bot_${Math.random().toString(36).substring(2, 9)}`
  };
}, zi = (t, e, n, r) => {
  const s = [];
  return !t || !Array.isArray(t) || t.length === 0 || t.forEach((i) => {
    const o = e.find((u) => u.id === `${i.id}_card`) || {
      id: `${i.id}_card`,
      numbers: Array(3).fill().map(() => Array(9).fill(null)),
      marked: []
    }, c = ui(i.difficultyLevel);
    if (o.numbers.some(
      (u) => u.some((l) => l === r)
    )) {
      s.push({
        botId: i.id,
        action: "mark",
        number: r,
        delay: c
      });
      const u = [...o.marked || [], r];
      o.marked = u;
      const l = wn(o, u), f = li(i, l);
      f && s.push({
        botId: i.id,
        action: "claim",
        claim: f,
        delay: c + 500,
        // İşaretlemeden biraz sonra talep et
        winResult: l
      });
    }
  }), s;
}, wn = (t, e) => {
  if (!t || !e)
    return { cinko1: !1, cinko2: !1, tombala: !1 };
  const n = t.numbers.map((r) => r.filter((i) => i !== null).every((i) => e.includes(i)));
  return {
    cinko1: n.some((r) => r),
    cinko2: n.filter((r) => r).length >= 2,
    tombala: n.every((r) => r)
  };
}, li = (t, e) => {
  if (!t || !e) return null;
  let n;
  switch (t.difficultyLevel) {
    case "easy":
      n = 0.8;
      break;
    case "normal":
      n = 0.9;
      break;
    case "hard":
      n = 1;
      break;
    default:
      n = 0.85;
  }
  const r = Math.random();
  return e.tombala && r <= n ? { type: "tombala" } : !e.tombala && e.cinko2 && r <= n ? { type: "cinko2" } : !e.cinko2 && e.cinko1 && r <= n ? { type: "cinko1" } : null;
}, Hi = (t, e, n) => {
  if (!t || !e)
    return { processedCards: t, winners: [] };
  const r = [];
  return {
    processedCards: t.map((i) => {
      if (i.numbers.some(
        (c) => c.some((a) => a === n)
      )) {
        const c = [...i.marked || [], n], a = wn({ ...i }, c);
        return a.tombala ? r.push({ cardId: i.id, type: "tombala" }) : a.cinko2 ? r.push({ cardId: i.id, type: "cinko2" }) : a.cinko1 && r.push({ cardId: i.id, type: "cinko1" }), {
          ...i,
          marked: c
        };
      }
      return i;
    }),
    winners: r
  };
}, Vi = (t) => {
  if (!t) return null;
  const { players: e, winner: n, winType: r, prize: s, startTime: i, endTime: o, drawnNumbers: c } = t, a = e.reduce((h, m) => h + (m.betAmount || 0), 0), u = s || a;
  let l = u;
  r === "cinko1" ? l = u * 0.2 : r === "cinko2" ? l = u * 0.3 : r === "tombala" && (l = u * 0.5);
  let f = 0;
  return i && o && (f = new Date(o) - new Date(i)), {
    id: t.id,
    date: (/* @__PURE__ */ new Date()).toISOString(),
    winner: n,
    winType: r,
    totalPrize: u,
    winnerPrize: l,
    players: e.map((h) => ({
      id: h.id,
      name: h.name,
      betAmount: h.betAmount,
      status: h.status,
      isBot: h.isBot || !1
    })),
    duration: f,
    drawnNumbers: c,
    numbersCount: c.length
  };
}, z = window.location.origin, x = _e(z, {
  autoConnect: !1,
  reconnection: !0,
  reconnectionAttempts: 10,
  // Daha fazla yeniden bağlanma denemesi
  reconnectionDelay: 1e3,
  reconnectionDelayMax: 5e3,
  // Maksimum yeniden bağlanma gecikmesi
  timeout: 2e4,
  // Zaman aşımı süresini artır
  transports: ["websocket", "polling"]
  // İlk websocket, sonra polling dene
});
let G = !1, le = {
  gameState: null,
  players: []
};
const Ji = () => G, ce = (t, e) => {
  le[t] = e;
  try {
    localStorage.setItem("tombala_offline_data", JSON.stringify(le));
  } catch (n) {
    console.error("Çevrimdışı veri kaydedilemedi:", n);
  }
}, dt = () => {
  try {
    const t = localStorage.getItem("tombala_offline_data");
    t && (le = JSON.parse(t));
  } catch (t) {
    console.error("Çevrimdışı veri yüklenemedi:", t);
  }
  return le;
}, D = new js();
x.on("connect", () => {
  G = !0, D.emit("connectionChange", !0), D.emit("connection", { status: "connected" }), console.log("Socket.io bağlantısı kuruldu");
});
x.on("disconnect", (t) => {
  G = !1, D.emit("connectionChange", !1), D.emit("connection", { status: "disconnected", reason: t }), console.warn(`Socket.io bağlantısı kesildi: ${t}`);
});
x.on("reconnect_attempt", (t) => {
  D.emit("connection", { status: "reconnecting", attempt: t }), console.log(`Socket.io yeniden bağlanma denemesi: ${t}`);
});
x.on("reconnect", (t) => {
  G = !0, D.emit("connectionChange", !0), D.emit("connection", { status: "reconnected", attempt: t }), console.log(`Socket.io yeniden bağlandı. Deneme sayısı: ${t}`), fi();
});
x.on("reconnect_error", (t) => {
  D.emit("connection", { status: "reconnect_error", error: t }), console.error("Socket.io yeniden bağlanma hatası:", t);
});
x.on("reconnect_failed", () => {
  D.emit("connection", { status: "reconnect_failed" }), console.error("Socket.io yeniden bağlanma başarısız oldu, maksimum deneme sayısına ulaşıldı");
});
x.on("error", (t) => {
  D.emit("error", t), console.error("Socket.io hatası:", t);
});
const fi = async () => {
  if (!G) return;
  const t = dt();
  if (t.gameState)
    try {
      await hi.saveGameStatus(
        t.gameState.id || `game_${Date.now()}`,
        t.gameState
      ), console.log("Çevrimdışı oyun durumu senkronize edildi");
    } catch (e) {
      console.error("Oyun durumu senkronizasyonu başarısız:", e);
    }
}, Wi = {
  getPlayers: async () => {
    try {
      return (await R.get(`${z}/api/players`)).data;
    } catch (t) {
      return console.error("Oyuncular getirilemedi:", t), {
        data: le.players || [],
        success: !1,
        message: "Oyuncular getirilemedi",
        offline: !0
      };
    }
  },
  getActivePlayers: async () => {
    try {
      const t = await R.get(`${z}/api/players/active`);
      return t.data && t.data.data && ce("players", t.data.data), t.data;
    } catch (t) {
      return console.error("Aktif oyuncular getirilemedi:", t), {
        data: dt().players || [],
        success: !1,
        message: "Aktif oyuncular getirilemedi",
        offline: !0
      };
    }
  },
  updatePlayerStatus: async (t, e) => {
    try {
      return (await R.put(`${z}/api/players/${t}/status`, { status: e })).data;
    } catch (n) {
      return console.error("Oyuncu durumu güncellenemedi:", n), D.emit("playerStatusUpdated", { playerId: t, status: e, offline: !0 }), { success: !1, offline: !0 };
    }
  }
}, hi = {
  getGameState: async () => {
    try {
      const t = await R.get(`${z}/api/tombala/state`);
      return t.data && ce("gameState", t.data), t.data;
    } catch (t) {
      return console.error("Oyun durumu getirilemedi:", t), dt().gameState || Qe();
    }
  },
  claimCinko: async (t, e) => {
    try {
      return (await R.post(`${z}/api/tombala/claim`, { type: t, cardId: e })).data;
    } catch (n) {
      return console.error("Çinko talebi başarısız:", n), D.emit("cinkoStatus", { type: t, cardId: e, offline: !0 }), { success: !1, offline: !0 };
    }
  },
  startNewGame: async () => {
    try {
      return (await R.post(`${z}/api/tombala/new-game`)).data;
    } catch (t) {
      console.error("Yeni oyun başlatılamadı:", t);
      const e = Qe();
      return ce("gameState", e), D.emit("gameStarted", { offline: !0 }), { success: !0, offline: !0, data: e };
    }
  },
  getPlayerCards: async (t) => {
    try {
      return { data: (await R.get(`${z}/api/tombala/cards?gameId=${t}`)).data, success: !0 };
    } catch (e) {
      return console.error("Oyuncu kartları getirilemedi:", e), {
        data: [{ id: "player_card", numbers: ci() }],
        success: !1,
        offline: !0
      };
    }
  },
  saveGameStatus: async (t, e) => {
    try {
      return ce("gameState", e), G ? (await R.post(`${z}/api/tombala/status`, { gameId: t, ...e })).data : (console.log("Oyun durumu çevrimdışı kaydedildi, bağlantı kurulduğunda senkronize edilecek"), { success: !0, offline: !0 });
    } catch (n) {
      return console.error("Oyun durumu kaydedilemedi:", n), { success: !1, message: "Oyun durumu kaydedilemedi", offline: !0 };
    }
  },
  saveGameResult: async (t, e) => {
    try {
      return ce("gameResult", e), G ? (await R.post(`${z}/api/tombala/result`, { gameId: t, ...e })).data : (console.log("Oyun sonucu çevrimdışı kaydedildi, bağlantı kurulduğunda senkronize edilecek"), { success: !0, offline: !0 });
    } catch (n) {
      return console.error("Oyun sonucu kaydedilemedi:", n), { success: !1, message: "Oyun sonucu kaydedilemedi", offline: !0 };
    }
  }
};
export {
  Ui as broadcastGameState,
  Mi as broadcastNewNumber,
  wn as checkBotWinningCondition,
  Pi as checkWinningCondition,
  ji as createBotPlayer,
  $i as createDemoPlayers,
  Vi as createGameSummary,
  Qe as createInitialGameState,
  li as determineBotClaim,
  Li as drawNumber,
  Di as drawSeededNumber,
  D as eventEmitter,
  Bi as generateSeededTombalaCard,
  ci as generateTombalaCard,
  ui as getBotDelayByDifficulty,
  bn as getRandomBotName,
  qi as initializeSocket,
  Ji as isConnected,
  Fi as joinGameRoom,
  dt as loadOfflineData,
  Wi as playerService,
  zi as processBotPlayers,
  Hi as processCards,
  ce as saveOfflineData,
  x as socket,
  fi as syncOfflineData,
  hi as tombalaService,
  Ii as updateGameState
};
