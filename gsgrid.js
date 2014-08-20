;(function () {
    "use strict";
    
    function GridPoint(args) {
        if (!(this instanceof GridPoint)) return new GridPoint(args);
        if (this.__activated) {return this;}
        this.__activated = true;
    
        args = args || {};
        // *** INIT PRELIMINARY ARGUMENTS ***
        this.canvas = args.canvas || canvas.selected; if (args.canvas) delete args.canvas;
        this.__gid = args.__gid || 0; if (args.__gid) delete args.__gid;
        this.grid = args.grid || new Grid({canvas: this.canvas}); if (args.grid) delete args.grid;
        this.d = args.d || args.grid.d || 1; if (args.d) delete args.d;
        args.shaftwidth = args.shaftwidth || this.grid.shaftwidth || 0.075;
        args.v0 = args.v0 || vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1) });
        args.v1 = args.v1 || vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1) });
        args.v2 = args.v2 || vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1) });
        args.v3 = args.v3 || vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1) });
        // *** INIT GRID and GRIDPOINTS (Label, Efield, VQuad) using PRELIMINARY VARIABLES ***
        this.lbl = label({ canvas: this.canvas, text: 'X', color: vec(0,1,0), height: 6, font: 'Verdana', box: false, line: false, opacity: 0, visible: false });
        this.efv = arrow({ canvas: this.canvas,  pickable: false, color:vec(0,0,0), axis_and_length: vec(0.5,0,0), shaftwidth: args.shaftwidth, visible: false });
        this.vqd =  quad({ canvas: this.canvas, pickable: false, v0: args.v0, v1: args.v1, v2: args.v2, v3: args.v3, visible: false });     //  visible must come after v0, v1, v2, v3 in args (bug in Primitives.js)
        // *** DELETE PRELIMINARY ARGUMENTS ***
        delete args.shaftwidth; delete args.v0; delete args.v1; delete args.v2; delete args.v3;
        // *** SET REMAINING ARGUMENTS ***
        args.pos = args.pos || args.canvas.center;
        for(var id in args) this[id] = args[id];
        
        var E = this.E = {};
        var V0 = this.V0 = {};
        var V0 = this.V1 = {};
        var V0 = this.V2 = {};
        var V0 = this.V3 = {};
    }
    GridPoint.prototype.constructor = GridPoint;
    Object.defineProperty(GridPoint.prototype, "pos", { configurable: false, enumerable: true, get: function() {return this.lbl.pos;},
        set: function(x) {
            if (!(x instanceof vec)) throw new Error("Gridpoint 'pos' attribute must be a vector.");
            var pos = this.canvas.inPlane(x);
            var ohat = this.grid.ohat, rhat = this.grid.rhat, that = this.grid.that, voff = this.grid.voff || -0.1;
            this.lbl.pos = pos.add(ohat.multiply(this.grid.loff || 0.0));
            this.efv.pos = pos.add(ohat.multiply(this.grid.eoff || 0.4));
            this.vqd.v0.pos = pos.add((ohat.multiply(voff)).add((this.grid.rhat.add(this.grid.that)).multiply(0.5*this.grid.d)));
            this.vqd.v1.pos = pos.add((ohat.multiply(voff)).sub((this.grid.rhat.sub(this.grid.that)).multiply(0.5*this.grid.d)));
            this.vqd.v2.pos = pos.add((ohat.multiply(voff)).sub((this.grid.rhat.add(this.grid.that)).multiply(0.5*this.grid.d)));
            this.vqd.v3.pos = pos.add((ohat.multiply(voff)).add((this.grid.rhat.sub(this.grid.that)).multiply(0.5*this.grid.d)));
        }
    });
    Object.defineProperty(GridPoint.prototype, "cleanUp",  { configurable: false, enumerable: true,  writable: false, 
        value: function() {
            this.__gid = null;
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
            args.N = args.N || 15;
            args.d = args.d || 1;
            args.center = args.center || args.canvas.center;
            args.shaftwidth = args.shaftwidth || 0.075;
            args.loff = args.loff || 0.0;
            args.eoff = args.eoff || 0.4;
            args.voff = args.voff || -0.1;
            args.sources = args.sources || {};
            for(var id in args) this[id] = args[id];

            // *** INIT VARIABLES ***
            var N = this.N;
            var d = this.d;
            var center = this.center;
            this.canvas.range = d*(N+0.25);
            this.canvas.center = this.center;
            this.Nt = pow((2*this.N)+1,2);
            var gps = this.gps = {}                                                                                                 /////// *this.gps*              /////// REQUIRED
            var ohat = this.ohat = this.canvas.out();
            var rhat = this.rhat = this.canvas.right();
            var that = this.that = this.canvas.top();
            this.rcchg = false;     // Track changes to range or center of canvas.                                                   /////// this.rcchg
            
            // *** INIT ALL GRIDPOINTS (Labels, Efields, VQuads) ***
            var v0, v1, v2, v3;
            for (var n = 1, i=-N, j=-N; n<=this.Nt; n++) {
                // Need initial setup of efield vectors, HERE!
                v0 = vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1) });
                v1 = (i==-N)?vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1) }):gps[n-2*N-1].vqd.v0
                v2 = (i==-N)?(j==-N)?vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1) }):gps[n-1].vqd.v1:gps[n-2*N-1].vqd.v3
                v3 = (j==-N)?vertex({ canvas: this.canvas, opacity: 0.5, color: vec(1,1,1) }):gps[n-1].vqd.v0
                gps[n] = new GridPoint({ canvas: this.canvas, pos: center.add((rhat.multiply(i*d)).add(that.multiply(j*d))), grid: this, __gid: n, d: this.d, v0: v0, v1: v1, v2: v2, v3: v3 });        // , shaftwidth: this.shaftwidth
                if ((j == N) && (i < N)) {i++; j=-N;} else j++;
            }
            
            var self = this;
            this.canvas.elements.bind("mousewheel", function() {
                print(self.canvas.range);
                self.update_rca();
            } );

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
                var ohat = this.ohat = self.canvas.out();
                var rhat = this.rhat = self.canvas.right();
                var that = this.that = self.canvas.top();

                for (var i = -N; i <= N; i++) { for (var j = -N; j <= N; j++){
                    console.log(i,j);
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
