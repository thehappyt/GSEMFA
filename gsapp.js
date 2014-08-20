;(function () { 
    "use strict";
    
    function GSapp(options) {
        if (!(this instanceof GSapp)) return new GSapp(options);
        options = options || {}
        this.canvas = canvas({ resizable:false })
        this.appst = function(ttl, cptn) {       // SETUP APPLICATION STRUCTURE
            var high = Number(window.innerHeight) - 78              // 36 for status bar, 21 for title, 24 for menubar, 21 for iconbar
            var wide = Number(window.innerWidth) - 20               // 20 for good measure

            this.canvas.width=high
            this.canvas.height=high
            if (!this.canvas.__activated) sphere({ canvas: this.canvas, visible: false })
            this.canvas.title.text(ttl);
            this.canvas.caption.text(cptn);
            this.canvas.menubar = $("<div/>").css("white-space","pre").insertBefore(this.canvas.wrapper)
            this.canvas.iconbar = $("<div/>").css("white-space","pre").insertBefore(this.canvas.wrapper)
            this.canvas.wrapper.css({margin: '4px'})
            $(this.canvas.__canvas_element).css({border: '1px solid #AAA'})
            $(this.canvas.__overlay_element).css({border: '1px solid #AAA'})
            
            print('', {end:''})
            print_options({width:Math.max(Math.min(wide - high,400),200), height:high+48-6, position:"right"})
            
            this.canvas.menubar.addClass("gsmenubar")
            this.canvas.iconbar.addClass("gsiconbar")
        }
        
        this.menuitem = function(mi) { if (mi instanceof jQuery && (mi.is("li") || mi.is("ul"))) this.canvas.menubar.append(mi.gsmenubar()); }
        
        // Syntax: (GSAppobj).iconitem({title, iconclasses, text}, cb)
        this.iconitem = function(opt) {
            var b = $('<button>'), text=opt.text||false;
            if (opt.title) { opt.title = opt.title + ''; b.attr({ title: opt.title }); }
            //if (opt.text) { opt.text = opt.text + ''; b.text( opt.text ); } //(NOT WORKING YET  b.css("width", "50px"))
            b.button({ icons: { primary: "gsapp-icon " + opt.icon }, text: text })
            b.click( function() { $(this).blur(); });
            this.canvas.iconbar.append(b);
            return b;
        }

        var myStylesLocation = "https://raw.githack.com/thehappyt/PHY-GSInit/master/gsapp.css";
        $('<link rel="stylesheet" type="text/css" href="'+myStylesLocation+'" >') .appendTo("head");

        if (!options.title) options.title = '';
        if (!options.caption) options.caption = '';
        this.appst(options.title, options.caption);
        delete options.title;
        delete options.caption;
        for (var id in options) this.canvas[id] = options[id];
        
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
