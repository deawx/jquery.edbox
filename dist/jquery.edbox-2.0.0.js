/*
* jQuery Edbox plugin v.2.0.0
* @author Eduardo Moreno - eduardocmoreno[at]gmail[dot]com
* Code under MIT License - http://en.wikipedia.org/wiki/MIT_License
*/

;(function($, ed) {

    function edbox(options, el) {
        ed     = this;
        ed.opt = $.extend({}, $.edbox.defaults, options);

        ed.opt.beforeOpen();

        ed.target = ed.opt.target || $(el).attr('data-box-target') || $(el).attr('href');
        ed.html   = ed.opt.html   || $(el).attr('data-box-html');
        ed.image  = ed.opt.image  || $(el).attr('data-box-image');
        ed.url    = ed.opt.url    || $(el).attr('data-box-url');
        
        var content = ed.target || ed.html || ed.image || ed.url;

        if(!content){
            console.error('undefined content. Try to set any of contents option like target: \'#element\'');
            return;
        }

        ed.box          = $('<div class="' + ed.opt.prefix + '"/>');
        ed.boxLoad      = $('<div class="' + ed.opt.prefix + '-load"/>');
        ed.boxBody      = $('<div class="' + ed.opt.prefix + '-body"/>');
        ed.boxClose     = $('<div class="' + ed.opt.prefix + '-close"/>');
        ed.boxContainer = $('<div class="' + ed.opt.prefix + '-container"/>');
        ed.boxContent   = $('<div class="' + ed.opt.prefix + '-content"/>');
        ed.boxHeader    = $('<div class="' + ed.opt.prefix + '-header"/>');
        ed.boxFooter    = $('<div class="' + ed.opt.prefix + '-footer"/>');
        ed.boxTemp      = $('<div class="' + ed.opt.prefix + '-temp"/>');

        ed.animateEvents = 'webkitAnimationEnd oanimationend msAnimationEnd animationend';

        ed.events = {
            click: function(e){
                ed.opt.close && e.target == e.currentTarget && ed.animate('close');
            },
            keydown: function(e){
                ed.opt.close && e.which == 27 && ed.animate('close');
            },
            resize: function(){
                var yScroll = ed.boxContainer.outerHeight() < ed.boxContent.outerHeight() ? true : false;
                ed.boxBody[yScroll ? 'addClass' : 'removeClass'](ed.opt.prefix + '-scroll-true');
            }
        }

        ed.init();

        return;
    }

    edbox.prototype.init = function(){
        if(ed.target){
            ed.target = $(ed.target);

            if (ed.target.length) {
                ed.target.after(ed.boxTemp);
                ed.base().insert(ed.target.addClass(ed.opt.prefix + '-helper-class'));
            }

            else {
                console.error('Unable to find element \"' + ed.target + '\"');
            }

            return;
        } 
        
        if(ed.html){
            ed.base().insert(ed.html);
            return;
        }

        if(ed.image){
            ed.base();

            ed.imageObj = new Image();
            ed.imageObj.src = ed.image;

            ed.imageObj.complete ? ed.insert(ed.imageObj) : ed.load(ed.image);

            return;
        }

        if(ed.url){
            ed.base().load(ed.url);
            return;
        }
    }

    edbox.prototype.load = function(content){
        ed.loading = true;
        ed.box.append(ed.boxLoad);
        ed.animate('open', function(){
            ed.urlLoad = $.get(content)
            .fail(function(){
                ed.animate('close', function(){
                    ed.box.remove();
                });
            })
            .done(function(data){
                ed.animate('close', function(){
                    ed.loading = false;
                    ed.boxLoad.remove();
                    ed.insert(ed.imageObj || data);
                });
            });
        });
    }

    edbox.prototype.base = function(){
        $('body').prepend(
            ed.box.addClass(ed.opt.parentClass).one('click', ed.events.click)
            );
        
        $(window).one('keydown', ed.events.keydown);

        return this;
    }

    edbox.prototype.insert = function(content){
        ed.box.append(
            ed.boxBody
            .css({
                width: ed.opt.width,
                height: ed.opt.height
            })
            .append(
                ed.opt.header && ed.boxHeader.html(ed.opt.header),
                ed.boxClose.one('click', ed.events.click),
                ed.boxContainer.append(ed.boxContent.append(content)),
                ed.opt.footer && ed.boxFooter.html(ed.opt.footer)
                )
            )

        !ed.opt.close && ed.boxClose.css('display', 'none');
        $(window).on('resize', ed.events.resize).resize();
        ed.animate('open');
    }

    edbox.prototype.animate = function(toggle, callback){
        var toggleObj = {
            open: function(){
                if(!ed.loading){
                    ed.image && ed.boxLoad.remove();
                    ed.opt.afterOpen();
                }
            },

            close: function(){
                $(window).off({
                    keydown: ed.events.keydown,
                    resize: ed.events.resize
                });

                ed.target && ed.target
                .removeClass(ed.opt.prefix + '-helper-class')
                .appendTo(ed.boxTemp)
                .unwrap();

                ed.loading ? ed.urlLoad.abort() : ed.opt.afterClose();

                ed.box.remove();
            }
        }

        if(ed.opt.animation){
            (ed.loading ? ed.boxLoad : ed.boxBody)
            .addClass(toggle == 'open' ? ed.opt.animateOpen : ed.opt.animateClose)
            .one(ed.animateEvents, function() {
                typeof callback == 'function' ? callback() : toggleObj[toggle]();
            });
        } else {
            typeof callback == 'function' ? callback() : toggleObj[toggle]();
        }
    }

    $.edbox = function (options){
        var data = $.data(window, 'edboxData');

        if(typeof options === 'string' && options === 'close' && typeof data == 'object'){
            data.animate('close');
            $.removeData(window, 'edboxData');
        }

        else if(typeof options == 'object' && !data) {
            $.data(window, 'edboxData', new edbox(options));
        }
    };

    $.fn.edbox = function(options) {
        this.on('click', function(e) {
            e.preventDefault();
            $.data(window, 'edboxData', new edbox(options, this));
        });
    }

    $.edbox.defaults = {
        target       : null,
        html         : null,
        image        : null,
        url         : null,
        width        : null,
        height       : null,
        prefix       : 'edbox',
        parentClass  : '',
        header       : '',
        footer       : '',
        close        : true,
        animation    : true,
        animateOpen  : 'edbox-animate-open',
        animateClose : 'edbox-animate-close',
        beforeOpen   : function() {},
        beforeClose  : function() {},
        afterOpen    : function() {},
        afterClose   : function() {}
    }

})(jQuery);