;(function () { 
    "use strict";
    
    var nextCanvasId = 1;
    var high = Number(window.innerHeight) - 78              // 36 for status bar, 21 for title, 24 for menubar, 21 for iconbar
    var wide = Number(window.innerWidth) - 20               // 20 for good measure
    
    // Load necessary styling.                      
    var myStylesLocation = "https://raw.githack.com/thehappyt/GSEMFA/master/gsapp.css";
    $('<link rel="stylesheet" type="text/css" href="'+myStylesLocation+'" >').appendTo("head");

    function GSapp(options) {
        if (!(this instanceof GSapp)) return new GSapp(options);
        if (this.__activated) return this;
        options = options || {}
        this.title = $("<div/>").css("white-space","pre").insertBefore(canvas.container)
        this.title.text(options.title || '');
        this.canvases = {};
        this.caption = $("<div/>").css("white-space","pre").insertAfter(canvas.container)
        this.caption.text(options.caption || '');
        // Setut print box to side of canvas container.
        print('', {end:''})
        print_options({width:Math.max(Math.min(wide - high,400),200), height:high+48-6, position:"right"})
        delete options.title; delete options.caption;

        this.addCanvas = function(options) {       // SETUP APPLICATION CANVAS
            options = options || {};
            var cvs = this.canvas = canvas();
            if (!cvs.sources || !cvs.grids) throw new Error("GSApp requires the improved GlowScript canvas module.");
            cvs.__cid = nextCanvasId++;
            this.canvases[cvs.__cid] = cvs;
            cvs.width = options.width || high;
            cvs.height = options.height || high;
            cvs.background = options.background || vec(1,1,1);
            cvs.center = options.center || vec(0,0,0);
            cvs.fov = options.fov || pi/100;
            cvs.resizable = options.resizable || false;
            cvs.title.text(options.title || '');
            cvs.caption.text(options.caption || '');
            cvs.wrapper.css({margin: '4px'})
            $(cvs.__canvas_element).css({border: '1px solid #AAA'})
            $(cvs.__overlay_element).css({border: '1px solid #AAA'})
            delete options.width; delete options.height; delete options.resizable;
            delete options.background; delete options.title; delete options.caption; 
            delete options.center; delete options.fov;
            for (var id in options) cvs[id] = options[id];
            sphere({ canvas: cvs, visible: false });     // Activate canvas (add to doc)
            cvs.menubar = $("<div/>").css("white-space","pre").addClass("gsmenubar").insertBefore(this.canvas.wrapper)
            cvs.iconbar = $("<div/>").css("white-space","pre").addClass("gsiconbar").insertBefore(this.canvas.wrapper)
        }
        
        //this.menuitem = function(mi) { if (mi instanceof jQuery && (mi.is("li") || mi.is("ul"))) this.canvas.menubar.append(mi.gsmenubar()); }
        
        // Syntax: (GSAppobj).iconitem({title, iconclasses, text}, cb)
        this.iconitem = function(opt) {             // Attaches new icon button to iconbar of selected canvas.
            var b = $('<button>'), text=opt.text||false;
            if (opt.title) { opt.title = opt.title + ''; b.attr({ title: opt.title }); }
            //if (opt.text) { opt.text = opt.text + ''; b.text( opt.text ); } //(NOT WORKING YET  b.css("width", "50px"))
            b.button({ icons: { primary: "gsapp-icon " + opt.icon }, text: text }) // REQUIRES opt.icon for now!
            b.children("span").removeClass('ui-icon')
            b.click( function() { $(this).blur(); });
            this.canvas.iconbar.append(b);
            return b;
        }
            
        this.selectCanvas = function(cvs) {         // CHANGE APPLICATION CANVAS
            if ((!(cvs instanceof canvas)) || (!this.canvas.sources || !this.canvas.grids)) throw new Error("GSApp requires the improved GlowScript canvas module.");
            if (!cvs.__cid) { cvs.__cid = nextCanvasId++; this.canvases[cvs.__cid] = cvs; }
            this.canvas = cvs;
        }

        this.bindForGrids = function() {
            var self = this.canvas;
            var leftButton = false, scrollButton = false, rightButton = false, zooming = false, rotating = false;
            // ************** Setup Binding for Grids **************
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
        
        this.bindForCharges = function() {
            var self = this.canvas;
            var obj = null, drag = false, stretch = false; 
            // ************** Setup Binding for Charges **************
            self.elements.dblclick(function() {
                obj = self.mouse.pick()
                if (obj) {
                    if (obj instanceof PointCharge || obj instanceof LineCharge) {
                        drag = false;
                        obj.q = prompt("Enter charge value: ", String(obj.q));
                        //grid.update();
                        obj=null;
                    }
                }    
            })
            self.bind("mousedown", function() {
                obj = self.mouse.pick();
                if (obj) {
                    if (obj instanceof PointCharge ) drag=true;
                    else if (obj instanceof LineCharge) {
                        if (obj.pick == 3) drag=true;
                        else stretch=true;
                    }
                } else {
                    if (self.state.src) {
                        drag=true;
                        if (self.state.src == 1) obj = new PointCharge({ pos:self.mouse.pos });
                        else if (self.state.src == 2) obj = new LineCharge({ pos:self.mouse.pos });
                    }
                }
            })
            self.bind("mousemove", function() {
                if (drag) {
                    obj.pos=self.mouse.pos;
                    //grid.update();
                } else if (stretch) {
                    var mp=self.mouse.pos;
                    //mp=(s2g)?nearGP(mp):mp;
                    var sign = obj.pick>3?1:-1;
                    obj.axis=(norm(mp.sub(obj.pos))).multiply(sign);
                    obj.size.x=2*mag(mp.sub(obj.pos));
                    //grid.update();
                }
            })
            self.bind("mouseup", function () {
                if (drag) drag = false;
                if (stretch) stretch = false;
                obj = null;
            })
        }
            
        // Add all remaining properties of GSApp.
        for (var id in options) this[id] = options[id];

        this.__activated = true;
    }
    GSapp.prototype.constructor = GSapp

    var global = window
    function Export( exports ) {
        if (!global.gsapp) global.gsapp = {}
        for(var id in exports) {
            global[id] = exports[id]
            gsapp[id] = exports[id]
        }
    }

    var exports = { GSapp: GSapp }
    Export(exports)
}) ();
