;(function () {
    "use strict";
    
    function qsc(q) { return q?q>0?vec(1.0,0.5,0.5):vec(0.5,0.5,1.0):vec(0.3,0.3,0.3) }
    function qlc(q) { return q?q>0?vec(0.0,0.0,0.0):vec(0.0,0.0,0.0):vec(0.7,0.7,0.7) }
    function isNumString(v) { return (/^-?\d+[.]?\d*$/.test(v)) }
    
    var nextSourceId = 1, obj, drag, stretch;
    
    var asCharge = function() {
        //Object to which asCharge constructor is applied must be a derived GlowScript Primitive object.
        Object.defineProperty(this, "__sid",  { enumerable: false, configurable: false, writable: true,  value: null });
        Object.defineProperty(this, "lbl",    { enumerable: false, configurable: false, writable: false,
            value: label({ color: vec(0.7,0.7,0.7), __height: "bold 14px/14", font: 'Times New Roman', border: 0, box: false, line: false, opacity: 0, visible: true, text: '0' })
        });
        Object.defineProperty(this, "__q",    { enumerable: false, configurable: false, writable: true,  value: null });
        Object.defineProperty(this, "q",      { enumerable: true,  configurable: false,
            get: function() { return this.__q },
            set: function(v) {
                if (v===null) return;
                v=v.toString();
                if ( isNumString(v) ) {     // && (abs(val)<=abs(maxQ))
                    var val = Number(v);
                    if (this.__q !== val) {
                        this.__q = val;
                        this.color = qsc(val);
                        this.lbl.color = qlc(val);
                        this.lbl.text = (v.replace('.','').length>4)?val.toExponential(3):(v.indexOf('.')===-1)?v.substr(0,Math.min(v.length,4)):v.substr(0,Math.min(v.length,5))
                        //__changed[this.__sid] = this;
                    }
                }
            }
        })
        // No internal property '__pos', because inherited from charge object.
        Object.defineProperty(this, "pos", { configurable: false, enumerable: true,
            get: function() { return this.canvas.inPlane(this.__pos); },
            set: function(v) {
                if (!(v instanceof vec)) throw new Error("Charge property 'pos' must be type vec.")
                var ohat = this.canvas.out();
                v = this.canvas.inPlane(v);
                this.__pos = v;
                Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(this)),"pos").set.call(this,v.add(ohat.multiply(this.qoff)))
                this.lbl.pos = v.add(ohat.multiply(this.loff));
                //__changed[this.__sid] = this
            } 
        })
        // No internal property '__visible', because inherited property '__id' from charge object.
        Object.defineProperty(this, "visible", {configurable: false, enumerable: true,
            get: function() {return (this.__id !== null);},
            set: function(val) {
                if (val == (this.__id !== null)) return;
                val = !!val;
                //Object.getPrototypeOf(this).visible = val
                Object.getOwnPropertyDescriptor(Object.getPrototypeOf(Object.getPrototypeOf(this)),"visible").set.call(this,val);
                this.lbl.visible = val;
                /*
                if (!val) {
                    this.q = 0;
                    delete this.canvas.sources[this.__sid]
                    this.lbl.text = "";
                    this.__sid = null;
                    grid.update();
                }
                */
            }
        })
        // Connect Charge to Sources
        this.__sid = nextSourceId++;
        this.sources[this.__sid] = this;
        //__changed[this.__sid] = this;

        /*
        //this.__efl = new Array(Math.floor(abs(this.__q * eflno)))  // Setting up automatically plotted E-field lines (#/charge distributed uniformly based on symmetry)
        //Object.defineProperty(this, "eflvisible", {configurable: false, enumerable: true,
        //    get: function() {return this.__efl[0].visible},
        //    set: function(val) { if (typeof val == "boolean") { for (var n in this.__efl) this.__efl[n].visible=val } }
        //})
        //for (var ti = 0; ti<2*pi; ti+=2*pi/oeflno) {}  //Relating to E-field Lines
        
        Object.defineProperty(this, "__efvo", { configurable: false, enumerable: true, writable: true, value: new Array(grid.gps.length) })
        Object.defineProperty(this, "efvo",   { configurable: false, enumerable: true, get: function() { return this.__efvo } })
        Object.defineProperty(this, "__efv",  { configurable: false, enumerable: true, writable: true, value: new Array(grid.gps.length) })
        Object.defineProperty(this, "efv",    { configurable: false, enumerable: true,
            get: function() {
                if (__changed[this.__sid]) {
                    var __efv = new Array(grid.gps.length)
                    for (var i in grid.gps) { //Recalculate electric field on grid
                        var r = inPlane(grid.gps[i].pos - this.shp.__pos)
                        if (mag(r) === 0) __efv[i] = null;
                        else __efv[i] = k0 * this.__q * norm(r) / mag2(r)
                    }
                    this.__efvo = this.__efv
                    this.__efv = __efv
                }
                return this.__efv                
            }
        })
        */
    }
    asCharge.prototype = Object.create(null)
    
    function PointCharge(args) {
        if (!(this instanceof PointCharge)) return new PointCharge(args);
        args = args || {};
        args.canvas = args.canvas || canvas.selected;
        if (!args.canvas.grids || !args.canvas.sources) throw new Error("Sources require improved canvas.");
        args.grids = args.canvas.grids;
        args.sources = args.canvas.sources;
        args.size = (vec(1,1,1)).multiply(args.sources.chargesize);
        args.qoff = args.sources.qoff;
        args.loff = args.sources.loff;
        args.k0 = args.sources.k0;
        var args2 = {q: args.q || 0, pos: args.pos || args.canvas.center, visible: args.visible || true };
        delete args.q; delete args.pos;
        sphere.call(this, args);
        asCharge.call(this);
        for (var id in args2) this[id] = args2[id];
        this.E = function(pos) {
            var r = pos.sub(this.pos)
            if (mag(r)===0) return vec(0,0,0);  // what should return to signal ehide;
            else return norm(r).multiply(k0 * this.q / mag2(r));
        }
        this.V = function(pos) {
            var r = mag(pos.sub(this.pos))
            if (mag(r)===0) return 0; // what should return to signal vhide;
            else return (k0 * this.q / r);
        }
        this.canvas.elements.trigger("chargemove", this.__sid)
    }    
    PointCharge.prototype = sphere.prototype
    
    function LineCharge(args) {
        if (!(this instanceof LineCharge)) return new LineCharge(args);
        args = args || {};
        args.canvas = args.canvas || canvas.selected;
        if (!args.canvas.grids || !args.canvas.sources) throw new Error("Sources require improved canvas.");
        args.grids = args.canvas.grids;
        args.sources = args.canvas.sources;
        args.radius = args.sources.chargesize/2.0;
        args.qoff = args.sources.qoff;
        args.loff = args.sources.loff;
        args.k0 = args.sources.k0;
        var args2 = {q: args.q || 0, pos: args.pos || args.canvas.center, visible: args.visible || true };
        curve.call(this, args);
        this.push(vec(-0.5,0,0),vec(-0.5,0,0),vec(-0.2,0,0),vec(0.2,0,0),vec(0.5,0,0))
        asCharge.call(this);
        for (var id in args2) this[id] = args2[id];
        this.E = function(pos) {
            var rh, xp, xm, xh=this.axis, L=this.size.x, q=this.__q
            var r = pos.sub(this.pos)
            xp = (r.dot(xh)) + L/2
            xm = xp - L
            r = r.sub(xh.multiply(xh.dot(r)))
            rh = norm(r)
            r = mag(r)
            if (r===0) return xh.multiply(k0*q*(1/abs(xm)-1/abs(xp))/L)
            return (((rh.multiply(xp/r).sub(xh)).multiply(1/sqrt(pow(xp,2)+pow(r,2)))).sub((rh.multiply(xm/r).sub(xh)).multiply(1/sqrt(pow(xm,2)+pow(r,2))))).multiply(k0*q/L)
        }
        this.V = function(pos) {
            var r, xp, xm, xh=this.axis, L=this.size.x, q=this.__q
            r = pos.sub(this.pos)
            xp = (r.dot(xh)) + L/2
            xm = xp - L
            r = mag(r.sub(xh.multiply(xh.dot(r))))
            return (k0*q/L)*Math.log((xp+sqrt(pow(xp,2)+pow(r,2)))/(xm+sqrt(pow(xm,2)+pow(r,2))))
        }
        this.canvas.elements.trigger("chargemove", this.__sid)
    }
    LineCharge.prototype = curve.prototype

    var global = window
    function Export( exports ) {
        if (!global.gsapp) global.gsapp = {}
        for(var id in exports) {
            global[id] = exports[id]
            gsapp[id] = exports[id]
        }
    }

    var exports = { PointCharge: PointCharge, LineCharge: LineCharge }
    Export(exports)

}) ();
