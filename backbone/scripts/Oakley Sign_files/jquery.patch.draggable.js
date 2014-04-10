function monkeyPatch_mouseStart() {
  
  var num = function(v) {
		return parseInt(v, 10) || 0;
	};
  
  $.ui.resizable.prototype._mouseStart = function(event){
		var o = this.options, iniPos = this.element.position(), el = this.element;
		
		// PATCH CODE this modifies the position of the element by the scale of the container
		if(el.is('.das_resizable')){
			iniPos.left *= 1/($('.das_container').css('scale'));
			iniPos.top *= 1/($('.das_container').css('scale'));
		}
		// END
		
		this.resizing = true;
		this.documentScroll = { top: $(document).scrollTop(), left: $(document).scrollLeft() };

		// bugfix for http://dev.jquery.com/ticket/1749
		if (el.is('.ui-draggable') || (/absolute/).test(el.css('position'))) {
			el.css({ position: 'absolute', top: iniPos.top, left: iniPos.left });
		}

		this._renderProxy();

		var curleft = num(this.helper.css('left')), curtop = num(this.helper.css('top'));

		if (o.containment) {
			curleft += $(o.containment).scrollLeft() || 0;
			curtop += $(o.containment).scrollTop() || 0;
		}

		//Store needed variables
		this.offset = this.helper.offset();
		this.position = { left: curleft, top: curtop };
		this.size = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalSize = this._helper ? { width: el.outerWidth(), height: el.outerHeight() } : { width: el.width(), height: el.height() };
		this.originalPosition = { left: curleft, top: curtop };
		this.sizeDiff = { width: el.outerWidth() - el.width(), height: el.outerHeight() - el.height() };
		this.originalMousePosition = { left: event.pageX, top: event.pageY };

		//Aspect Ratio
		this.aspectRatio = (typeof o.aspectRatio == 'number') ? o.aspectRatio : ((this.originalSize.width / this.originalSize.height) || 1);

	    var cursor = $('.ui-resizable-' + this.axis).css('cursor');
	    $('body').css('cursor', cursor == 'auto' ? this.axis + '-resize' : cursor);

		el.addClass("ui-resizable-resizing");
		this._propagate("start", event);
		return true;
	}
  
  $.ui.draggable.prototype._mouseStart = function(event) {
	  
    var o = this.options;

    //Create and append the visible helper
    this.helper = this._createHelper(event);

    //Cache the helper size
    this._cacheHelperProportions();

    //If ddmanager is used for droppables, set the global draggable
    if($.ui.ddmanager)
      $.ui.ddmanager.current = this;

    /*
     * - Position generation -
     * This block generates everything position related - it's the core of draggables.
     */

    //Cache the margins of the original element
    this._cacheMargins();

    //Store the helper's css position
    this.cssPosition = this.helper.css("position");
    this.scrollParent = this.helper.scrollParent();

    //The element's absolute position on the page minus margins

    //PATCH CODE
    this.offset = this.positionAbs = getViewOffset(this.element[0]);
    //END

    this.offset = {
      top: this.offset.top - this.margins.top,
      left: this.offset.left - this.margins.left
    };
    
    $.extend(this.offset, {
      click: { //Where the click happened, relative to the element
        left: event.pageX - this.offset.left,
        top: event.pageY - this.offset.top
      },
      parent: this._getParentOffset(),
      relative: this._getRelativeOffset() //This is a relative to absolute position minus the actual position calculation - only used for relative positioned helper
    });
    
    //Generate the original position
    this.originalPosition = this.position = this._generatePosition(event);
    this.originalPageX = event.pageX;
    this.originalPageY = event.pageY;

    //Adjust the mouse offset relative to the helper if 'cursorAt' is supplied
    if(o.cursorAt && this._adjustOffsetFromHelper(o.cursorAt)){
    }

    //Set a containment if given in the options
    if(o.containment)
      this._setContainment();

    //Trigger event + callbacks
    if(this._trigger("start", event) === false) {
      this._clear();
      return false;
    }

    //Recache the helper size
    this._cacheHelperProportions();

    //Prepare the droppable offsets
    if ($.ui.ddmanager && !o.dropBehaviour)
      $.ui.ddmanager.prepareOffsets(this, event);

    this.helper.addClass("ui-draggable-dragging");
    this._mouseDrag(event, true); //Execute the drag once - this causes the helper not to be visible before getting its correct position

    //If the ddmanager is used for droppables, inform the manager that dragging has started (see #5003)
    if ( $.ui.ddmanager && $.ui.ddmanager.dragStart) $.ui.ddmanager.dragStart(this, event);

    return true;
  }
  
  $.ui.resizable.prototype._mouseDrag = function(event){

		//Increase performance, avoid regex
		var el = this.helper, o = this.options, props = {},
			self = this, smp = this.originalMousePosition, a = this.axis;

		var dx = (event.pageX-smp.left)||0, dy = (event.pageY-smp.top)||0;
		
		// PATCH CODE
		if(el.is('.das_draggable')){
			dx *= 1/$('.das_container').css('scale');
			dy *= 1/$('.das_container').css('scale');
		}
		// END
		
		var trigger = this._change[a];
		if (!trigger) return false;

		// Calculate the attrs that will be change
		var data = trigger.apply(this, [event, dx, dy]), ie6 = $.browser.msie && $.browser.version < 7, csdif = this.sizeDiff;

		// Put this in the mouseDrag handler since the user can start pressing shift while resizing
		this._updateVirtualBoundaries(event.shiftKey);
		if (this._aspectRatio || event.shiftKey)
			data = this._updateRatio(data, event);

		data = this._respectSize(data, event);

		// plugins callbacks need to be called first
		this._propagate("resize", event);

		el.css({
			top: this.position.top + "px", left: this.position.left + "px",
			width: this.size.width + "px", height: this.size.height + "px"
		});

		if (!this._helper && this._proportionallyResizeElements.length)
			this._proportionallyResize();

		this._updateCache(data);

		// calling the user callback at the end
		this._trigger('resize', event, this.ui());

		return false;
	}
    
  $.ui.draggable.prototype._generatePosition = function(event){
    var o = this.options, scroll = this.cssPosition == 'absolute' && !(this.scrollParent[0] != document && $.ui.contains(this.scrollParent[0], this.offsetParent[0])) ? this.offsetParent : this.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
    var pageX = event.pageX;
    var pageY = event.pageY;
    //PATCH CODE
    if($(this.element[0]).hasClass('das_draggable')){
        pageY = this.originalPageY + ((pageY - this.originalPageY)*(1/$('.das_container').css('scale')));
        pageX = this.originalPageX + ((pageX - this.originalPageX)*(1/$('.das_container').css('scale')));
    }
    //END
    /*
     * - Position constraining -
     * Constrain the position to a mix of grid, containment.
     */

    if(this.originalPosition) { //If we are not dragging yet, we won't check for options

      if(this.containment) {
        if(event.pageX - this.offset.click.left < this.containment[0]) pageX = this.containment[0] + this.offset.click.left;
        if(event.pageY - this.offset.click.top < this.containment[1]) pageY = this.containment[1] + this.offset.click.top;
        if(event.pageX - this.offset.click.left > this.containment[2]) pageX = this.containment[2] + this.offset.click.left;
        if(event.pageY - this.offset.click.top > this.containment[3]) pageY = this.containment[3] + this.offset.click.top;
      }

      if(o.grid) {
        var top = this.originalPageY + Math.round((pageY - this.originalPageY) / o.grid[1]) * o.grid[1];
        pageY = this.containment ? (!(top - this.offset.click.top < this.containment[1] || top - this.offset.click.top > this.containment[3]) ? top : (!(top - this.offset.click.top < this.containment[1]) ? top - o.grid[1] : top + o.grid[1])) : top;

        var left = this.originalPageX + Math.round((pageX - this.originalPageX) / o.grid[0]) * o.grid[0];
        pageX = this.containment ? (!(left - this.offset.click.left < this.containment[0] || left - this.offset.click.left > this.containment[2]) ? left : (!(left - this.offset.click.left < this.containment[0]) ? left - o.grid[0] : left + o.grid[0])) : left;
      }
    }
        
    return {
      top: (
        pageY                               // The absolute mouse position
        - this.offset.click.top                         // Click offset (relative to the element)
        - this.offset.relative.top                        // Only for relative positioned nodes: Relative offset from element to offset parent
        - this.offset.parent.top                        // The offsetParent's offset without borders (offset + border)
        + ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
      ),
      left: (
        pageX                               // The absolute mouse position
        - this.offset.click.left                        // Click offset (relative to the element)
        - this.offset.relative.left                       // Only for relative positioned nodes: Relative offset from element to offset parent
        - this.offset.parent.left                       // The offsetParent's offset without borders (offset + border)
        + ($.browser.safari && $.browser.version < 526 && this.cssPosition == 'fixed' ? 0 : ( this.cssPosition == 'fixed' ? -this.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
      )
    };

  }
 };

function getViewOffset(node) {
  var x = 0, y = 0, win = node.ownerDocument.defaultView || window;
  if (node) addOffset(node);
  return { left: x, top: y };

  function getStyle(node) {
    return node.currentStyle || // IE
           win.getComputedStyle(node, '');
  }

  function addOffset(node) {
    var p = node.offsetParent, style, X, Y;
    x += parseInt(node.offsetLeft, 10) || 0;
    y += parseInt(node.offsetTop, 10) || 0;

    if (p) {
      x -= parseInt(p.scrollLeft, 10) || 0;
      y -= parseInt(p.scrollTop, 10) || 0;

      if (p.nodeType == 1) {
        var parentStyle = getStyle(p)
          , localName   = p.localName
          , parent      = node.parentNode;
        if (parentStyle.position != 'static') {
          x += parseInt(parentStyle.borderLeftWidth, 10) || 0;
          y += parseInt(parentStyle.borderTopWidth, 10) || 0;

          if (localName == 'TABLE') {
            x += parseInt(parentStyle.paddingLeft, 10) || 0;
            y += parseInt(parentStyle.paddingTop, 10) || 0;
          }
          else if (localName == 'BODY') {
            style = getStyle(node);
            x += parseInt(style.marginLeft, 10) || 0;
            y += parseInt(style.marginTop, 10) || 0;
          }
        }
        else if (localName == 'BODY') {
          x += parseInt(parentStyle.borderLeftWidth, 10) || 0;
          y += parseInt(parentStyle.borderTopWidth, 10) || 0;
        }

        while (p != parent) {
          x -= parseInt(parent.scrollLeft, 10) || 0;
          y -= parseInt(parent.scrollTop, 10) || 0;
          parent = parent.parentNode;
        }
        addOffset(p);
      }
    }
    else {
      if (node.localName == 'BODY') {
        style = getStyle(node);
        x += parseInt(style.borderLeftWidth, 10) || 0;
        y += parseInt(style.borderTopWidth, 10) || 0;

        var htmlStyle = getStyle(node.parentNode);
        x -= parseInt(htmlStyle.paddingLeft, 10) || 0;
        y -= parseInt(htmlStyle.paddingTop, 10) || 0;
      }

      if ((X = node.scrollLeft)) x += parseInt(X, 10) || 0;
      if ((Y = node.scrollTop))  y += parseInt(Y, 10) || 0;
    }
  }
};

var isNumber = function(value) {
  return !isNaN(parseInt(value, 10));
};

monkeyPatch_mouseStart();