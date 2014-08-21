;(function () {
    "use strict";
    
    var obj, drag, stretch, leftButton = false, scrollButton = false, rightButton = false, rotating = false, zooming = false;
    
    function gscanvasBind(self) {
        if ((!(self instanceof canvas)) || (!self.sources || !self.grids)) throw new Error("gscanvasBind sole argument must be an improved GlowScript canvas object.")
        self.elements.dblclick(function() {
            obj = self.mouse.pick()
            if (obj) {
                if (obj instanceof PointCharge || obj instanceof LineCharge) {
                    drag = false;
                    obj.q = prompt("Enter charge value: ",String(obj.q))
                    //grid.update();
                    obj={}
                }
            }    
        })
        self.bind("mousedown", function() {
            obj = self.mouse.pick()
            if (obj) {
                if (obj instanceof PointCharge ) drag=true;
                else if (obj instanceof LineCharge) {
                    if (obj.pick == 3) drag=true;
                    else stretch=true;
                }
            } else {
                if (self.state.src) {
                    drag=true;
                    if (self.state.src == 1) obj = new PointCharge({ pos:self.mouse.pos })
                    else if (self.state.src == 2) obj = new LineCharge({ pos:self.mouse.pos })
                }
            }
        })
        self.bind("mousemove", function() {
            if (drag) {
                obj.pos=self.mouse.pos
                //grid.update();
            } else if (stretch) {
                var mp=self.mouse.pos
                //mp=(s2g)?nearGP(mp):mp
                var sign = obj.pick>3?1:-1
                obj.axis=(norm(mp.sub(obj.pos))).multiply(sign)
                obj.size.x=2*mag(mp.sub(obj.pos))
                //grid.update();
            }
        })
        self.bind("mouseup", function () {
            if (drag) drag = false
            if (stretch) stretch = false
            obj = {}
        })
        
        self.elements.bind("mousewheel", function() {
            //console.log(self.range, self.forward);
            for (var gid in self.grids) { self.grids[gid].update_rca(); }
        } );
        self.elements.mousedown(function (ev) {
            if (ev.which == 1) leftButton = true;
            if (ev.which == 2) scrollButton = true;
            if (ev.which == 3) rightButton = true;
            zooming = self.userzoom && (scrollButton || (leftButton && self.mouse.alt && !self.mouse.ctrl) || (leftButton && rightButton))
            rotating = self.userspin && (rightButton || (leftButton && self.mouse.ctrl && !self.mouse.alt))
        })
        self.elements.mousemove(function (ev) {
            if (zooming || rotating) {
                //console.log(self.range, self.forward);
                for (var gid in self.grids) { self.grids[gid].update_rca(); }
            }
        })
        self.elements.mouseup(function (ev) {
            if (ev.which == 1) leftButton = false;
            if (ev.which == 2) scrollButton = false;
            if (ev.which == 3) rightButton = false;
            zooming = self.userzoom && (scrollButton || (leftButton && self.mouse.alt && !self.mouse.ctrl) || (leftButton && rightButton))
            rotating = self.userspin && (rightButton || (leftButton && self.mouse.ctrl && !self.mouse.alt))
        })
    }

}) ();
