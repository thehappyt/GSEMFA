;(function () {
    "use strict";
    
    var obj, drag, stretch, leftButton = false, scrollButton = false, rightButton = false, rotating = false, zooming = false;
    
    Object.defineProperty(canvas.prototype, "out",     {configurable: false, enumerable: true,  writable: true,
        value: function()  { return this.forward.multiply(-1).norm();            } })
    Object.defineProperty(canvas.prototype, "right",   {configurable: false, enumerable: true,  writable: true,
        value: function()  { return norm(this.up.cross(this.out())); } })
    Object.defineProperty(canvas.prototype, "top",     {configurable: false, enumerable: true,  writable: true,
        value: function()  { return this.out().cross(this.right());  } })
    Object.defineProperty(canvas.prototype, "inPlane", {configurable: false, enumerable: true,  writable: true,
        value: function(pos) {
            if (!(pos instanceof vec)) throw new Error ("Argument 'pos' for inPlane(pos) function must be a vector.");
            return pos.sub((pos.sub(this.center)).proj(this.out()));
        }
    })
    Object.defineProperty(canvas.prototype, "grids", {configurable: false, enumerable: true, writable: false,
        value: { N: 15, d: 1, shaftwidth: 0.075, loff: 0.0, eoff: 0.1, voff: -0.2 }
    })
    Object.defineProperty(canvas.prototype, "grid", {configurable: false, enumerable: true, writable: true, value: null })
    Object.defineProperty(canvas.prototype, "sources", {configurable: false, enumerable: true, writable: false,
        value: { chargesize: 0.75, qoff: 0.0, loff: 0.0, k0: 1.0 }
    })
    Object.defineProperty(canvas.prototype, "state", {configurable: false, enumerable: true, writable: false,
        value: { src: 0 }
    })

}) ();
