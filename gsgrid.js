;(function () {
    "use strict";
    
    var nextGridId = 1;
    var nextVId = 1;
    
    function GridPoint(args) {
        if (!(this instanceof GridPoint)) return new GridPoint(args);
        if (this.__activated) {return this;}
        this.__activated = true;
    
        args = args || {};
        // *** INIT PRELIMINARY ARGUMENTS ***
        this.grid = args.grid || new Grid({canvas: canvas.selected}); delete args.grid;
        this.canvas = args.canvas || this.grid.canvas; delete args.canvas;
        this.__gpid = args.__gpid || 0; delete args.__gpid;
        this.d = args.d || args.grid.d; delete args.d;
        args.v0 = args.v0 || vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1), V: 0 });
        args.v1 = args.v1 || vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1), V: 0 });
        args.v2 = args.v2 || vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1), V: 0 });
        args.v3 = args.v3 || vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1), V: 0 });
        // *** INIT GRID and GRIDPOINTS (Label, Efield, VQuad) using PRELIMINARY VARIABLES ***
        this.lbl = label({ canvas: this.canvas, text: 'X', color: vec(0,1,0), height: 6, font: 'Verdana', box: false, line: false, opacity: 0, visible: false, gp: this });
        this.efv = arrow({ canvas: this.canvas,  pickable: false, color:vec(0,0,0), axis_and_length: vec(0,0,0), shaftwidth: this.grid.shaftwidth, visible: false, gp: this, E: vec(0,0,0), Es: Object.create(null) });
        this.vqd =  quad({ canvas: this.canvas, pickable: false, v0: args.v0, v1: args.v1, v2: args.v2, v3: args.v3, visible: false, gp: this });     //  visible must come after v0, v1, v2, v3 in args (bug in Primitives.js)
        // *** DELETE PRELIMINARY ARGUMENTS ***
        delete args.v0; delete args.v1; delete args.v2; delete args.v3;
        // *** SET REMAINING ARGUMENTS ***
        args.pos = args.pos || args.canvas.center;
        for(var id in args) this[id] = args[id];
        
        this.efv.Es[0] = vec(0,0,0);
    }
    GridPoint.prototype.constructor = GridPoint;
    Object.defineProperty(GridPoint.prototype, "pos", { configurable: false, enumerable: true, get: function() {return this.lbl.pos;},
        set: function(x) {
            if (!(x instanceof vec)) throw new Error("Gridpoint 'pos' attribute must be a vector.");
            var pos = this.canvas.inPlane(x);
            var ohat = this.grid.ohat, rhat = this.grid.rhat, that = this.grid.that, voff = this.grid.voff || -0.1;
            this.lbl.pos = pos.add(ohat.multiply(this.grid.loff || 0.0));
            this.efv.pos = pos.add(ohat.multiply(this.grid.eoff || 0.4));
            this.vqd.v0.pos = pos.add(ohat.multiply(voff)).add((rhat.add(that)).multiply(0.5*this.grid.d));
            this.vqd.v1.pos = pos.add(ohat.multiply(voff)).sub((rhat.sub(that)).multiply(0.5*this.grid.d));
            this.vqd.v2.pos = pos.add(ohat.multiply(voff)).sub((rhat.add(that)).multiply(0.5*this.grid.d));
            this.vqd.v3.pos = pos.add(ohat.multiply(voff)).add((rhat.sub(that)).multiply(0.5*this.grid.d));
        }
    });
    Object.defineProperty(GridPoint.prototype, "cleanUp",  { configurable: false, enumerable: true,  writable: false, 
        value: function() {
            this.__gpid = null;
            this.grid = null;
            this.lbl.visible = false; this.lbl = null;
            this.efv.visible = false; this.efv = null;
            this.vqd.visible = false; this.vqd = null;
            this.__activated = false;
        }
    })
    Object.defineProperty(GridPoint.prototype, "visible", { configurable: false, enumerable: true,
        set: function(h) {
            if (h !== (!!h)) console.log("GridPoint.visible must be boolean, i.e. true or false, but "+h+" isn't boolean.");
            this.lhide = h;
            this.ehide = h;
            this.vhide = h
        }
    });
    Object.defineProperty(GridPoint.prototype, "__lhide", { configurable: false, enumerable: false, writable: true,  value: false})
    Object.defineProperty(GridPoint.prototype, "lhide",   { configurable: false, enumerable: true,
        get: function() { return this.__lhide; },
        set: function(h) {
            if (h !== (!!h)) console.log("GridPoint.lhide must be boolean, i.e. true or false, but "+h+" isn't boolean.");
            if (h !== this.__lhide) {
                this.__lhide = h;
                this.lbl.visible = (this.grid.__visible && (!this.grid.__lhide) && (!h));
            }
        }
    });
    Object.defineProperty(GridPoint.prototype, "__ehide", { configurable: false, enumerable: false, writable: true,  value: false})
    Object.defineProperty(GridPoint.prototype, "ehide",   { configurable: false, enumerable: true,
        get: function() { return this.__ehide; },
        set: function(h) {
            if (h !== (!!h)) console.log("GridPoint.ehide must be boolean, i.e. true or false, but "+h+" isn't boolean.");
            if (h !== this.__ehide) {
                this.__ehide = h;
                this.efv.visible = (this.grid.__visible && (!this.grid.__ehide) && (!h));
            }
        }
    });
    Object.defineProperty(GridPoint.prototype, "__vhide", { configurable: false, enumerable: false, writable: true,  value: false})
    Object.defineProperty(GridPoint.prototype, "vhide",   { configurable: false, enumerable: true,
        get: function() { return this.__vhide; },
        set: function(h) {
            if (h !== (!!h)) console.log("GridPoint.vhide must be boolean, i.e. true or false, but "+h+" isn't boolean.");
            if (h !== this.__vhide) {
                this.__vhide = h;
                this.vqd.visible = (this.grid.__visible && (!this.grid.__vhide) && (!h));
            }
        }
    });
    
    function Grid(args) {
        if (!(this instanceof Grid)) return new Grid(args);
        if (this.__activated) return this;
        this.__activate(args || {});
        //args = args || {};
    }
    Grid.prototype.constuctor = Grid;
    Object.defineProperty(Grid.prototype, "__activate",  { configurable: false, enumerable: true,  writable: false,
        value: function(args) {
            if (this.__activated) for (var gid in this.gps) { this.gps[gid].cleanUp(); delete this.gps[gid]; };
            // *** REVIEW ARGUMENTS AND INSTANTIATE VARIABLES ***
            args.canvas = args.canvas || canvas.selected;                                                                           /////// this.canvas             /////// REQUIRED
            if (!args.canvas.grids || !args.canvas.sources) throw new Error("Grids require improved canvas.");
            args.grids = args.canvas.grids;
            args.sources = args.canvas.sources;
            args.N = args.N || args.grids.N;
            args.d = args.d || args.grids.d;
            args.center = args.canvas.center;
            args.shaftwidth = args.shaftwidth || args.grids.shaftwidth;
            args.loff = args.loff || args.grids.loff;
            args.eoff = args.eoff || args.grids.eoff;
            args.voff = args.voff || args.grids.voff;
            for(var id in args) this[id] = args[id];
            
            // *** INIT VARIABLES ***
            var N = this.N;
            var d = this.d;
            var center = this.center;
            this.canvas.range = d*(N+0.25);
            this.canvas.center = this.center;
            this.Nt = pow((2*this.N)+1,2);
            var gps = this.gps = {};                                                                                                 /////// *this.gps*              /////// REQUIRED
            var vvs = this.vvs = Object.create(null);
            var canvas = this.canvas;
            var sources = this.sources;
            var ohat = this.ohat = this.canvas.out();
            var rhat = this.rhat = this.canvas.right();
            var that = this.that = this.canvas.top();
            this.rcchg = false;     // Track changes to range or center of canvas.                                                   /////// this.rcchg
            
            // *** INIT ALL GRIDPOINTS (Labels, Efields, VQuads) ***
            var v0, v1, v2, v3;
            for (var n = 1, i=-N, j=-N; n<=this.Nt; n++) {
                // Need initial setup of efield vectors, HERE!
                v0 = vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1), __vid: nextVId++, V: 0, Vs: Object.create(null) });
                v1 = (i==-N)?vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1), __vid: nextVId++, V: 0, Vs: Object.create(null) }):gps[n-2*N-1].vqd.v0
                v2 = (i==-N)?(j==-N)?vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1), __vid: nextVId++, V: 0, Vs: Object.create(null) }):gps[n-1].vqd.v1:gps[n-2*N-1].vqd.v3
                v3 = (j==-N)?vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1), __vid: nextVId++, V: 0, Vs: Object.create(null) }):gps[n-1].vqd.v0
                v0.Vs[0] = 0; v1.Vs[0] = 0; v2.Vs[0] = 0; v3.Vs[0] = 0;
                gps[n] = new GridPoint({ pos: center.add((rhat.multiply(i*d)).add(that.multiply(j*d))), grid: this, __gpid: n, d: this.d, v0: v0, v1: v1, v2: v2, v3: v3 });
                if (!vvs[v0.__vid]) vvs[v0.__vid] = v0;
                if (!vvs[v1.__vid]) vvs[v1.__vid] = v1;
                if (!vvs[v2.__vid]) vvs[v2.__vid] = v2;
                if (!vvs[v3.__vid]) vvs[v3.__vid] = v3;
                if ((j == N) && (i < N)) {i++; j=-N;} else j++;
            }

            this.__gid = nextGridId++;
            this.grids[this.__gid] = this;
            this.canvas.grid = this;
            
            this.canvas.elements.on("chargemove", function(ev, __sid) {
                // Update Potential Quads
                var vqh = Object.create(null);
                for (var vid in vvs) {
                    var vv = vvs[vid], vqs = vv.canvas.__vertices.object_info[vv.__id];
                    vv.V -= vv.Vs[__sid]);
                    vv.Vs[__sid] = sources[__sid].V(vv.canvas.inPlane(vv.pos));
                    if (vv.Vs[__sid] == NaN) {
                        for (var qid in vqs) vqh[vqs[qid].gp.__gpid] = vqs[qid];
                        vv.Vs[__sid] = 0;
                    }
                    vv.V += vv.Vs[__sid];
                    // SET COLOR OF POTENTIAL
                }
                // Update Efield Arrows
                for (var gpid in gps) {
                    // Add final touches to potential quads update.
                    if (vqh[gpid]) gps[gpid].vhide = true;
                    else if (gps[gpid].vhide) gps[gpid].vhide = false;
                    // Finally get to efield arrow update.
                    var gp = gps[gpid], gpe = gp.efv;
                    gpe.E.sub(gpe.Es[__sid]);
                    gpe.Es[__sid] = sources[__sid].E(gp.pos);
                    if (gpe.Es[__sid] == NaN) {gp.ehide = true; gpe.Es[__sid] = vec(0,0,0);}
                    else if (gp.ehide) gp.ehide = false;
                    gpe.E.add(gpe.Es[__sid]);
                    gpe.axis_and_length = norm(gpe.E);
                    gpe.opacity = 1-Math.exp(-mag(gpe.E));
                }

            })
            
            this.__activated = true;
        }
    })
    Object.defineProperty( Grid.prototype, "update_rca", { configurable: false, enumerable: true,  writable: false,
        value: function() {
            var self = this;
            self.visible=false;
            clearTimeout($.data(self.canvas, 'timer'));
            $.data(self.canvas, 'timer', setTimeout(function() {
                if (!self.__activated) {return;}
                
                var gps = self.gps
                
                var N = self.N
                var d = self.d = self.canvas.range/(self.N + 0.25)
                var center = self.center = self.canvas.center;
                var ohat = self.ohat = self.canvas.out();
                var rhat = self.rhat = self.canvas.right();
                var that = self.that = self.canvas.top();
                
                for (var i = -N; i <= N; i++) { for (var j = -N; j <= N; j++){
                    gps[((i+N)*(2*N+1)+(j+N)+1)].pos = center.add((rhat.multiply(i*d)).add(that.multiply(j*d)));
                } }

                // Need to update E-fields and Potentials here!

                self.visible=true;
            }, 250));
            
        }
    })
    Object.defineProperty(Grid.prototype, "__canvas", { configurable: false, enumerable: false, writable: true, value: null})
    Object.defineProperty(Grid.prototype, "canvas",   { configurable: false, enumerable: true,
        get: function() { return this.__canvas; },
        set: function(cvs) {
            if (!(cvs instanceof canvas)) throw new Error("Grid.canvas must be a GlowScript canvas object.")
            if ( (this.__canvas !== cvs) && this.__activated ) { this.__canvas = cvs; this.__activate(); }
            else if (!this.__activated) this.__canvas = cvs;
        }
    });
    Object.defineProperty(Grid.prototype, "Nt",  { configurable: false, enumerable: false, writable: true, value: 961})
    Object.defineProperty(Grid.prototype, "__N", { configurable: false, enumerable: false, writable: true, value: 15})
    Object.defineProperty(Grid.prototype, "N",   { configurable: false, enumerable: true,
        get: function() { return this.__N; },
        set: function(N) {
            if (typeof N != "number") throw new Error("Grid.N must be an integer of type 'number'.")
            if (N > 50) throw new Error("Grid.N must be an interger of value no more than 50.")
            if (this.__activated && (this.__N !== Math.floor(N)) ) { this.__N = Math.floor(N); this.__activate(); }
            else { this.__N = Math.floor(N); }
        }
    });
    Object.defineProperty(Grid.prototype, "__lhide", { configurable: false, enumerable: false, writable: true, value: true})
    Object.defineProperty(Grid.prototype, "lhide", { configurable: false, enumerable: true,
        get: function() { return this.__lhide; },
        set: function(h) {
            if (h !== (!!h)) console.log("Grid.lhide must be boolean, i.e. true or false, but "+h+" isn't boolean.");
            if (h !== this.__lhide) {
                this.__lhide = h;
                for (var i = 1; i <= this.Nt; i++) {
                    if (this.__visible && (!this.gps[i].__lhide)) {
                        this.gps[i].lbl.visible = (!h);
                    }
                    else this.gps[i].lbl.visible = false;
                }
            }
        }
    });
    Object.defineProperty(Grid.prototype, "__ehide", { configurable: false, enumerable: false, writable: true, value: true})
    Object.defineProperty(Grid.prototype, "ehide", { configurable: false, enumerable: true,
        get: function() { return this.__ehide; },
        set: function(h) {
            if (h !== (!!h)) console.log("Grid.ehide must be boolean, i.e. true or false, but "+h+" isn't boolean.");
            if (h !== this.__ehide) {
                this.__ehide = h;
                for (var i = 1; i <= this.Nt; i++) {
                    if (this.__visible && (!this.gps[i].__ehide)) this.gps[i].efv.visible = (!h);
                    else this.gps[i].efv.visible = false;
                }
            }
        }
    });
    Object.defineProperty(Grid.prototype, "__vhide", { configurable: false, enumerable: false, writable: true, value: true})
    Object.defineProperty(Grid.prototype, "vhide", { configurable: false, enumerable: true,
        get: function() { return this.__vhide; },
        set: function(h) {
            if (h !== (!!h)) console.log("Grid.qhide must be boolean, i.e. true or false, but "+h+" isn't boolean.");
            if (h !== this.__vhide) {
                this.__vhide = h;
                for (var i = 1; i <= this.Nt; i++) {
                    if (this.__visible && (!this.gps[i].__vhide)) this.gps[i].vqd.visible = (!h);
                    else this.gps[i].vqd.visible = false;
                }
            }
        }
    });
    Object.defineProperty(Grid.prototype, "__visible", { configurable: false, enumerable: false, writable: true, value: true })
    Object.defineProperty(Grid.prototype, "visible",   { configurable: false, enumerable: true,
        get: function() { return this.__visible},
        set: function(v) {
            if (v != (!!v)) throw new Error("'visible' must be boolean, i.e. true or false.");
            if (v !== this.__visible) {
                this.__visible = v;
                for (var n = 1; n <= this.Nt; n++ ) {
                    if ((!this.__lhide) && (!this.gps[n].__lhide)) this.gps[n].lbl.visible = v;
                    else this.gps[n].lbl.visible = false;
                    if ((!this.__ehide) && (!this.gps[n].__ehide)) this.gps[n].efv.visible = v;
                    else this.gps[n].efv.visible = false;
                    if ((!this.__vhide) && (!this.gps[n].__vhide)) this.gps[n].vqd.visible = v;
                    else this.gps[n].vqd.visible = false;
                }
            } 
        }
    })
    property.declare( Grid, {
        selected: {
            get: function() { return window.__context.grid_selected || null; },
            set: function(g) { window.__context.grid_selected = g; }
        },
        all: {
            get: function() { 
                var grids = window.__context.grid_all; 
                if (grids === undefined) grids = window.__context.grid_all = []; 
                return grids;
            }
        }
    })

    var global = window
    function Export( exports ) {
        if (!global.gsapp) global.gsapp = {}
        for(var id in exports) {
            global[id] = exports[id]
            gsapp[id] = exports[id]
        }
    }

    var exports = { GridPoint: GridPoint, Grid: Grid }
    Export(exports)
}) ();
