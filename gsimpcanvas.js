;(function() {
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
});
