;(function () {
    "use strict";
    
    var self = this;
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
            if (self.canvas.state.src) {
                drag=true;
                if (self.canvas.state.src == 1) obj = new PointCharge({ pos:self.canvas.mouse.pos })
                else if (self.canvas.state.src == 2) obj = new LineCharge({ pos:self.canvas.mouse.pos })
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
}) ();
