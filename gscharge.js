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
        
        var self = this;
        if (nextSourceId===1) {
            this.canvas.elements.dblclick(function() {
                obj = self.canvas.mouse.pick()
                if (obj) {
                    if (obj instanceof PointCharge || obj instanceof LineCharge) {
                        drag = false;
                        obj.q = prompt("Enter charge value: ",String(obj.q))
                        //grid.update();
                        obj={}
                    }
                }    
            })
            this.canvas.bind("mousedown", function() {
                obj = self.canvas.mouse.pick()
                if (obj) {
                    if (obj instanceof PointCharge ) drag=true;
                    else if (obj instanceof LineCharge) {
                        if (obj.pick == 3) drag=true;
                        else stretch=true;
                    }
                } else {
                    if (__state.src) {
                        drag=true;
                        if (__state.src == 1) obj = new PointCharge({ pos:self.canvas.mouse.pos })
                        else if (__state.src == 2) obj = new LineCharge({ pos:self.canvas.mouse.pos })
                    }
                }
            })
            
            this.canvas.bind("mousemove", function() {
                if (drag) {
                    obj.pos=self.canvas.mouse.pos
                    //grid.update();
                } else if (stretch) {
                    var mp=self.canvas.mouse.pos
                    //mp=(s2g)?nearGP(mp):mp
                    var sign = obj.pick>3?1:-1
                    obj.axis=(norm(mp.sub(obj.pos))).multiply(sign)
                    obj.size.x=2*mag(mp.sub(obj.pos))
                    //grid.update();
                }
            })
            
            this.canvas.bind("mouseup", function () {
                if (drag) drag = false
                if (stretch) stretch = false
                obj = {}
            })
        }
        
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
        this.E = function(GP) {
            var r = GP.pos.sub(this.pos)
            if (mag(r)===0) { GP.ehide = true; return vec(0,0,0); }
            else { GP.ehide = false; return norm(r).multiply(k0 * this.q / mag2(r)); }
        }
        this.V = function(GP) {
            var r = mag(GP.pos - this.pos)
            if (mag(r)===0) { GP.vhide = true; return 0; }
            else { GP.vhide = false; return (k0 * this.q / r); }
        }
        //this.efv; // Initialize E-field vectors.
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
        this.E = function(GP) {
            var rh, xp, xm, xh=this.axis, L=this.size.x, q=this.__q
            var r = GP.pos.sub(this.pos)
            xp = (r.dot(xh)) + L/2
            xm = xp - L
            r = r.sub(xh.multiply(xh.dot(r)))
            rh = norm(r)
            r = mag(r)
            if (r===0) return xh.multiply(k0*q*(1/abs(xm)-1/abs(xp))/L)
            return (k0*q/L)*(( (rh*xp/r - xh) / sqrt( pow(xp,2) + pow(r,2) ) ) - ( (rh*xm/r - xh) / sqrt( pow(xm,2) + pow(r,2) ) ))
        }
        this.V = function(GP) {
            var r, xp, xm, xh=this.axis, L=this.size.x, q=this.__q
            r = GP.pos.sub(this.pos)
            xp = (r.dot(xh)) + L/2
            xm = xp - L
            r = mag(r.sub(xh.multiply(xh.dot(r))))
            return (k0*q/L)*Math.log((xp+sqrt(pow(xp,2)+pow(r,2)))/(xm+sqrt(pow(xm,2)+pow(r,2))))
        }
        //this.efv; // Initialize E-field vectors.
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
