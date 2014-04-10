var g_DasSavedCallBackList = g_DasSavedCallBackList || [];
var save_interval_id;
var border_toggle;
var g_DaS_imgDocMouseUp = false;
var g_DaS_txtDocMouseUp = false;
var g_DaS_browser;
var g_DaS_subMaskStrict = true;
var das_modify_design = false;
var das_check_design_mandatory_elements = false;
var das_activate_first_mandatory = false;
var g_DaS_text_masks = [
	{id: 0, text: 'Select a Mask...'},
	{id: 1, text: '999', test: /^\(?([0-9]{3})\)/, replace: '$1', min: 3, max: 3, type: 'area_code'},
	{id: 2, text: '(999)', test: /^\(?([0-9]{3})\)/, replace: '($1)', min: 3, max: 3, type: 'area_code'},
	{id: 3, text: '(999) 999-9999', test: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, replace: '($1) $2-$3', min: 7, max: 7, type: 'phone'},
	{id: 4, text: '999-999-9999', test: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, replace: '$1-$2-$3', min: 7, max: 7, type: 'phone'},
	{id: 5, text: '999.999.9999', test: /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, replace: '$1.$2.$3', min: 7, max: 7, type: 'phone'},
];

(function( $ ) {
	var das_version = (g_DaS_version ? g_DaS_version : '0.0.0');

	function isTextSelected(input){
	   var startPos = input.selectionStart;
	   var endPos = input.selectionEnd;
	   var doc = document.selection;
	
	   if(doc && doc.createRange().text.length != 0){
	      return true;
	   }else if (!doc && input.value.substring(startPos,endPos).length != 0){
	      return true;
	   }
	   return false;
	};
	
	function das_clickHandler(e){
		if(!e || typeof e.stopPropagation == 'undefined'){
			if (window.event) {
				window.event.cancelBubble = true;
			}
		} else {
			e.stopPropagation();
		}
	};
	
	$.fn.setBackgroundImage = function(bgimg){
		$('#' + this.attr('das_id')).css('background-image', 'url("' + bgimg + '")'); 
	};
	
	$.fn.text_functions = function (dasID, toolkit){
		
		var myID = $(this).attr('myID');
		
		var myTextIDs = text_elements(dasID, myID);
		
		var designer = $('#'+dasID).hasClass('design_mode');
		
		var mouseOver = false;
		var clicked = false;
		var resizing = false;
		var timer;
		
		$('#'+myTextIDs.myTextSpan).keyup(function(e){
			var DaSIDs = das_elements(myTextIDs.myODASID);
			$('#'+DaSIDs.ElementMenuTitle).html($(this).val());
			if(!$('#'+myTextIDs.myTextContainer).hasClass('das_tag_resizable')){
				$('#'+myTextIDs.myTextSpan).attr('stretchx', $('#'+myTextIDs.myTextContainer).attr('stretchx')).attr('stretchy', $('#'+myTextIDs.myTextContainer).attr('stretchy'));
				$('#'+myTextIDs.myTextSpan).autoTextSize(false);
			}
			if(e && e.which >= 37 && e.which <= 40){
				// Arrow key is pressed
				$('#'+myTextIDs.myDASID).scrollTop(0).scrollLeft(0);
			}
			if($('#'+myTextIDs.myTextContainer).hasClass('das_tag_uppercase')){
				$(this).val($(this).val().toUpperCase());
			}
			if($('#'+myTextIDs.myTextContainer).hasClass('das_tag_first_char_upper')){
				var myText = $(this).val();
				myText = myText.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
				$(this).val(myText);
			}
			das_modify_design(true);
			text_background(myTextIDs.myTextSpan);
		});
		
		$('#'+myTextIDs.myTextSpan).keypress(function(e){
			if(e.which == 13){
				return false;
			}
		});
				
		if(!$('#'+myTextIDs.myTextContainer).hasClass('das_tag_resizable')){
			// call function for text Resizable
			makeResizable(dasID, myID, false);
		} else {
			// call function for text Resizable
			makeResizable(dasID, myID, true);
		}
		
		$('.ui-resizable-handle', $('#'+myTextIDs.myTextContainer)).mousedown(function(){
			resizing = true;
			//$('#'+myTextIDs.myTextHandle).css('border', 'dashed black 1px');
		});
		
//TODO: doing this for each text element causes a ton of events to fire... it may be better to do this with a single mouseup handler which find all of these objects and does what it needs to do
		if (false == g_DaS_txtDocMouseUp) {
			$(document).mouseup(function(){
				resizing = false;
				resizeHandles();
			});
			g_DaS_txtDocMouseUp = true;
		}
		
		$('#'+myTextIDs.myTextContainer).draggable({drag: function(){
			showMenuBar();
			updateDesignerControls(myTextIDs.myTextContainer, myTextIDs.myDASID);
		}, stop: function(){
			$(this).css('z-index', $(this).attr('das_layer'));
			updateDesignerControls(myTextIDs.myTextContainer, myTextIDs.myDASID);
		}});
		
		$('#'+myTextIDs.myTextSpan).blur(function(){
		  if($('#'+myTextIDs.myDASID).has('#'+myTextIDs.myTextContainer).length == 0){
				$('#'+myTextIDs.myDASID).append($('#'+myTextIDs.myTextContainer));
			  var das_scale = $('#'+myTextIDs.myDASID).attr('size') || 1;
			  var containerTop = (parseFloat($('#'+myTextIDs.myTextContainer).css('top')) - ($('#'+myTextIDs.myODASID).position().top + 1)) / das_scale;
				var containerLeft = (parseFloat($('#'+myTextIDs.myTextContainer).css('left')) - ($('#'+myTextIDs.myODASID).position().left + 1)) / das_scale;
				$('#'+myTextIDs.myTextContainer).css('top', containerTop).css('left', containerLeft);
				$('#'+myTextIDs.myTextContainer).transition({scale: 1}, 0).css('z-index', $('#'+myTextIDs.myTextContainer).attr('das_layer'));
			}
			
		  if($('#'+myTextIDs.myTextContainer).hasClass('das_tag_resizable')){ //!das_tag_text_not_fill
				FitToContent($('#'+myTextIDs.myTextSpan).attr('id'));
				$('#'+myTextIDs.myTextContainer).resizeContainer(myTextIDs.myTextSpan);
			}
			
			$('#'+myTextIDs.myTextSpan).autoTextSize($('#'+myTextIDs.myTextContainer).hasClass('das_tag_resizable')); //!das_tag_text_not_fill
		  $('#'+myTextIDs.myTextSpan).html($('#'+myTextIDs.myTextSpan).val());
		  
		  $('#'+myTextIDs.myTextDiv).css('z-index', 8050);
		  $('#'+myTextIDs.myTextHandle).css('z-index', 8051);	
		  
		  clicked = false;
		  $('#'+myTextIDs.myTextContainer).attr('clicked', false);
		  
		  if($('#'+myTextIDs.myTextContainer).hasClass('das_text_mask')){
			  $('#'+myTextIDs.myTextSpan).val(test_text_mask($('#'+myTextIDs.myTextSpan).val(), $('#'+myTextIDs.myTextContainer).attr('das_mask_id')));
		  }
		  
		}).focus(function(event) {
			if (!isTextSelected($('#'+myTextIDs.myTextSpan)[0])) {
				setTimeout(function() {
					$('#'+myTextIDs.myTextHandle).mousedown();
					setTimeout(function() {
						$('#'+myTextIDs.myTextHandle).mouseup();
					}, 10);
				}, 10);
			}
		});

		$('#'+myTextIDs.myTextContainer).click(function(event){
			das_clickHandler(event);
		});
		
		$('#'+myTextIDs.myTextHandle).mousedown(function(e){
			das_modify_design(true);
			$('#'+myTextIDs.myTextHandle).unbind('mouseup');

			$('#'+myTextIDs.myTextHandle).mouseup(function(f){
				if(e.pageX == f.pageX && e.pageY == f.pageY){
					if($('#'+myTextIDs.myTextContainer).hasClass('das_tag_editable')){
						$('#'+myTextIDs.myTextHandle).css('z-index', 8050);
						$('#'+myTextIDs.myTextContainer).css('z-index', $('#'+myTextIDs.myTextContainer).attr('das_layer'));
						$('#'+myTextIDs.myTextDiv).css('z-index', 8051);
						
						if($('#'+myTextIDs.myDASID).attr('size') == 1){
							$('.das_content_window').append($('#'+myTextIDs.myTextContainer));
							var dasContainer = $('#'+myTextIDs.myODASID);
							if(dasContainer.length == 0){
								dasContainer = $('#'+myTextIDs.myDASID);
							}
							// multiply the 'top' and 'left' value of the element inside the DaS by the scale to get the proper positioning
							var das_scale = $('#'+myTextIDs.myDASID).attr('size') || 1;
							var containerTop = (parseFloat($('#'+myTextIDs.myTextContainer).css('top')) * das_scale) + (dasContainer.position().top + 1);
							var containerLeft = (parseFloat($('#'+myTextIDs.myTextContainer).css('left')) * das_scale) + (dasContainer.position().left + 1);
							$('#'+myTextIDs.myTextContainer).css('top', containerTop).css('left', containerLeft).css('opacity', 1).css('z-index', 10000);
							$('#'+myTextIDs.myTextContainer).css({ transformOrigin: '0px 0px' }).transition({scale: das_scale}, 0);
						}

						setTimeout(function() {
							if (f.hasOwnProperty('originalEvent')) {
								$('#'+myTextIDs.myTextSpan).focus();
							}

							$('#'+myTextIDs.myTextSpan).select();
						}, 0);
					}
					showMenuBar();
					$('.ui-resizable-handle', $('.das_container')).css('visibility', 'hidden');
					$('.ui-resizable-handle', $('#'+myTextIDs.myTextContainer)).css('visibility', 'visible');
					
					$('#'+myTextIDs.myDASID).scrollTop(0).scrollLeft(0);
				}
			});
			
			clicked = true;
			$('.das_clicked').each(function(){
				$(this).css('z-index', $(this).attr('das_layer'));
				$(this).removeClass('das_clicked');
			});
			$('#'+myTextIDs.myTextContainer).addClass('das_clicked').css('z-index', 10000);
			
			// Update Designer Controls
			updateDesignerControls(myTextIDs.myTextContainer, myTextIDs.myDASID);
			
			$('.das_main_menu_text_menu', $('#'+myTextIDs.myDASID+'_menu_container')).css('display', '').attr('das_element_link', myTextIDs.myID);
				
			var DaSIDs = das_elements(myTextIDs.myODASID);
			$('#'+DaSIDs.ElementMenuTitle).html($('#'+myTextIDs.myTextSpan).html());
		});

		$('#'+myTextIDs.myTextContainer).mouseover(function(e){
			var anyResizing = false;
			$('.das_resizable').each(function(){
				if($(this).attr('resizing') == 'true'){
					anyResizing = true;
				}
			});
			if(!anyResizing){
				showMenuBar();
				$('.ui-resizable-handle', $('.das_container')).css('visibility', 'hidden');
				$('.ui-resizable-handle', $('#'+myTextIDs.myTextContainer)).css('visibility', 'visible');
				mouseOver = true;
			}
			clearTimeout(timer);
		});
		
		$('#'+myTextIDs.myTextContainer).mouseout(function(e){
			mouseOver = false;
			timer = setTimeout(function(){
				if(mouseOver == false && $('#'+myTextIDs.myTextContainer).hasClass('das_clicked') == 'false' && resizing == false){
					$('#'+myTextIDs.myTextMoveHandle).css('display', 'none').css('z-index', '');
					$('#'+myTextIDs.myMenuStart).css('display', '');
					$('#'+myTextIDs.myMenuEnd).css('display', 'none');
				}
				if(resizing == false){
					$('.ui-resizable-handle', $('#'+myTextIDs.myTextContainer)).css('visibility', 'hidden');
				}
			}, 250);
		});
		
		function showMenuBar(){
			var textPos = $('#'+myTextIDs.myTextContainer).position();
			var textHeight = $('#'+myTextIDs.myTextContainer).height();
			var DaSHeight = $('#'+myTextIDs.myDASID).height();
			if((textPos.top + textHeight) <= (DaSHeight - 20)){
				$('#'+myTextIDs.myTextMoveHandle).css('top', '').css('bottom', -18);
				var bottom = $('#'+myTextIDs.myDASID).height() - (textPos.top + $('#'+myTextIDs.myTextContainer).height());
				var offset = Math.min(bottom - 720, 0);
				$('#'+myTextIDs.myTextMenu).css('top', 0).css('bottom', '');
			} else{
				$('#'+myTextIDs.myTextMoveHandle).css('top', -18).css('bottom', '');
				$('#'+myTextIDs.myTextMenu).css('top', '').css('bottom', 0);
			}
			$('#'+myTextIDs.myMenuEnd).css('position', 'absolute').css('top', textPos.top + $('#'+myTextIDs.myTextContainer).height()).css('left', textPos.left).css('z-index', 10000);
			var menuEnd = $('#'+myTextIDs.myMenuEnd).css('display');
			var menuStart = $('#'+myTextIDs.myMenuStart).css('display');
			$('.das_move_handle').css('display', 'none').css('z-index', '');
			$('.das_menu_start').each(showMenuButton);
			$('#'+myTextIDs.myMenuEnd).css('display', menuEnd);
			$('#'+myTextIDs.myMenuStart).css('display', menuStart);
			$('.ui-resizable-handle').css('z-index', 10000);
		};
		
		if(!designer){
			$('#'+myTextIDs.myMenuStart).css('display', 'none');
			$('#'+myTextIDs.myTextContainer).mousedown(function(){
				$('#'+myTextIDs.myTextHandle).text_border($('#'+myTextIDs.myTextSpan).css('color'));
				$('#das_main_menu').initializeMainMenu(myTextIDs.myID, 'text', myTextIDs.myDASID, toolkit);
			});
		} else {
			// show menu on designer page
			$('#'+myTextIDs.myMenuStart).css('display', 'none');
			$('#'+myTextIDs.myTextContainer).mousedown(function(){
				$('#'+myTextIDs.myTextHandle).text_border($('#'+myTextIDs.myTextSpan).css('color'));
				$('#das_element_menu').initializeDesignMainMenu(myTextIDs.myID, 'text', myTextIDs.myDASID, toolkit);
			});
		}
		
		resizeHandles();
	};
	
	function makeResizable(dasID, elementID, scale){
		var myTextIDs = text_elements(dasID, elementID);
		var resizeFunction;
		var stopFunction;
		var options;
		
		if(scale==true){
			resizeFunction = function(){
				if($('#'+myTextIDs.myTextContainer).hasClass('das_tag_resizable')){ //!das_tag_text_not_fill
					$('#'+myTextIDs.myTextSpan).autoTextSize($('#'+myTextIDs.myTextContainer).hasClass('das_tag_resizable'), 0, 350); //!das_tag_text_not_fill
					FitToContent($('#'+myTextIDs.myTextSpan).attr('id'));
				}
				resizing = true;
				$('#'+myTextIDs.myTextContainer).attr('resizing', resizing);
				
				updateDesignerControls(myTextIDs.myTextContainer, myTextIDs.myDASID);
				text_background(myTextIDs.myTextSpan);
			};
			
			stopFunction = function(){
				if($('#'+myTextIDs.myTextContainer).hasClass('das_tag_resizable')){ //!das_tag_text_not_fill
					
					var newWidth = $('#'+myTextIDs.myTextDiv).width() * $('#'+myTextIDs.myTextContainer).attr('stretchX');
					var newHeight = $('#'+myTextIDs.myTextDiv).height() * $('#'+myTextIDs.myTextContainer).attr('stretchY');
					
					$('#'+myTextIDs.myTextContainer).resizeContainer(myTextIDs.myTextSpan);
				}
				resizing = false;
				$('#'+myTextIDs.myTextContainer).attr('resizing', resizing);
				$('#'+myTextIDs.myTextContainer).mouseout();
				
				var DaSIDs = das_elements(myTextIDs.myODASID);
				var textSize = parseFloat($('#'+myTextIDs.myTextSpan).css('font-size'));
				$('#'+myTextIDs.myTextSlider).slider('value', textSize);
				$('#'+DaSIDs.myTextIDs.myTextSlider).slider('value', textSize);
				
				updateDesignerControls(myTextIDs.myTextContainer, myTextIDs.myDASID);
				text_background(myTextIDs.myTextSpan);
			};
			
			options = {alsoResize:'#'+myTextIDs.myTextDiv, alsoResize:'#'+myTextIDs.myTextSpan, aspectRatio: scale, handles:'nw, sw, ne, se, n, s, e, w', resize: resizeFunction, stop: stopFunction};
		} else {
			resizeFunction = function(){
				if($('#'+myTextIDs.myTextContainer).hasClass('das_tag_resizable')){ //!das_tag_text_not_fill
					var stretchX = $('#'+myTextIDs.myTextContainer).width() / $('#'+myTextIDs.myTextSpan).width();
					var stretchY = $('#'+myTextIDs.myTextContainer).height() / $('#'+myTextIDs.myTextSpan).height();
					
					$('#'+myTextIDs.myTextSpan).css({transformOrigin: '0px 0px'});
					$('#'+myTextIDs.myTextSpan).css('transform', 'matrix('+stretchX+', 0, 0, '+stretchY+', 0, 0)');
					
					$('#'+myTextIDs.myTextContainer).attr('stretchX', stretchX).attr('stretchY', stretchY);
				} else {
					// make textarea fill inside of container
					var stretchX = parseFloat($('#'+myTextIDs.myTextContainer).attr('stretchx') || 1);
					var stretchY = parseFloat($('#'+myTextIDs.myTextContainer).attr('stretchy') || 1);
					
					$('#'+myTextIDs.myTextSpan).css('width', (parseFloat($('#'+myTextIDs.myTextContainer).css('width')) / stretchX));
					$('#'+myTextIDs.myTextSpan).css('height', (parseFloat($('#'+myTextIDs.myTextContainer).css('height')) / stretchY));
				}
				
				updateDesignerControls(myTextIDs.myTextContainer, myTextIDs.myDASID);
				text_background(myTextIDs.myTextSpan);
			};
			
			stopFunction = function(){				
				$('#'+myTextIDs.myTextDiv).css('width', '').css('height', '');
				var textScaleX = $('#'+myTextIDs.myTextContainer).attr('stretchx');
				var textScaleY = $('#'+myTextIDs.myTextContainer).attr('stretchy');
				
				$('#'+myTextIDs.myTextDiv).css('width', $('#'+myTextIDs.myTextSpan).width() * textScaleX).css('height', $('#'+myTextIDs.myTextSpan).height() * textScaleY);
				
				$('#'+myTextIDs.myTextSpan).attr('stretchx', textScaleX).attr('stretchy', textScaleY);
				$('#'+myTextIDs.myTextSpan).autoTextSize(false);
				
				updateDesignerControls(myTextIDs.myTextContainer, myTextIDs.myDASID);
				text_background(myTextIDs.myTextSpan);
			};
			
			options = {alsoResize:'#'+myTextIDs.myTextDiv, aspectRatio: scale, handles:'nw, sw, ne, se, n, s, e, w', resize: resizeFunction, stop: stopFunction};
		}
		
		try {
			$('#'+myTextIDs.myTextContainer).resizable('destroy');
		} catch(e) {
			// for some reason after duplicating an element this cycle has to be completed before the element is really resizable
			$('#'+myTextIDs.myTextContainer).removeClass('ui-resizable');
			$('#'+myTextIDs.myTextContainer).resizable();
			$('#'+myTextIDs.myTextContainer).resizable('destroy');
		}
		
		$('#'+myTextIDs.myTextContainer).resizable(options);
		
		$('.ui-resizable-sw').addClass('ui-icon-gripsmall-diagonal-sw').addClass('ui-resizable-corner');
		$('.ui-resizable-nw').addClass('ui-icon-gripsmall-diagonal-nw').addClass('ui-resizable-corner');
		$('.ui-resizable-ne').addClass('ui-icon-gripsmall-diagonal-ne').addClass('ui-resizable-corner');
		$('.ui-resizable-se').addClass('ui-icon-gripsmall-diagonal-se').addClass('ui-resizable-corner').removeClass('ui-icon');
		$('.ui-resizable-n').addClass('ui-icon-gripsmall-diagonal-n').addClass('ui-resizable-side');
		$('.ui-resizable-s').addClass('ui-icon-gripsmall-diagonal-s').addClass('ui-resizable-side');
		$('.ui-resizable-e').addClass('ui-icon-gripsmall-diagonal-e').addClass('ui-resizable-side');
		$('.ui-resizable-w').addClass('ui-icon-gripsmall-diagonal-w').addClass('ui-resizable-side');
		
		resizeHandles();
		
		$('.ui-resizable-handle', $('#'+myTextIDs.myTextContainer)).mouseover(function(){
			var corner = $(this).hasClass('ui-resizable-corner');
			var currRatio = $('#'+myTextIDs.myTextContainer).resizable("option", "aspectRatio");
			if(currRatio != corner){
				// re-initialize resizable
				makeResizable(dasID, elementID, corner);
			}
		});
	};
	
	$.fn.resizeContainer = function(div){
		var stretchX = $(this).attr('stretchX') || 1;
		var stretchY = $(this).attr('stretchY') || 1;
		$(this).css('width', $('#'+div).width() * stretchX).css('height', $('#'+div).height() * stretchY);
	};
	
	function showMenuButton(){
		var start = $(this).attr('id');
		var end = start.replace('start', 'end');
		end = end.replace('_menu', '');
		if($('#'+end).css('display') != 'none' && $('#'+end).length > 0){
			$('#'+end).css('display', 'none');
			$('#'+start).css('display', '');
		}
	};

	text_elements = function (dasID, myID){
		var myTextIDs = {};
		myTextIDs.myODASID = dasID.substring(18);
		myTextIDs.myDASID = dasID;
		myTextIDs.myID = myID;
		
		myTextIDs.myTextContainer = myTextIDs.myDASID+'_das_text_'+myID;
		myTextIDs.myTextDiv = myTextIDs.myDASID+'_das_textDiv_'+myID;
		myTextIDs.myTextSpan = myTextIDs.myDASID+'_das_textSpan_'+myID;
		myTextIDs.myTextMenu = myTextIDs.myDASID+'_das_textMenu_'+myID;
		myTextIDs.myMenuStart = myTextIDs.myDASID+'_start_'+myID;
		myTextIDs.myMenuEnd = myTextIDs.myDASID+'_end_'+myID;
		myTextIDs.myCloseMenu = myTextIDs.myDASID+'_close_button_'+myID;
		myTextIDs.myCustomWidget1 = myTextIDs.myDASID+'_das_customWidget1_'+myID;
		myTextIDs.myColorSelector1 = myTextIDs.myDASID+'_das_colorSelector1_'+myID;
		myTextIDs.myColorpickerHolder1 = myTextIDs.myDASID+'_das_colorpickerHolder1_'+myID;
		myTextIDs.myCustomWidget2 = myTextIDs.myDASID+'_das_customWidget2_'+myID;
		myTextIDs.myColorSelector2 = myTextIDs.myDASID+'_das_colorSelector2_'+myID;
		myTextIDs.myColorpickerHolder2 = myTextIDs.myDASID+'_das_colorpickerHolder2_'+myID;
		myTextIDs.myAlignDiv = myTextIDs.myDASID+'_das_align_div_'+myID;
		myTextIDs.myAlignLeft = myTextIDs.myDASID+'_das_align_left_'+myID;
		myTextIDs.myAlignCenter = myTextIDs.myDASID+'_das_align_center_'+myID;
		myTextIDs.myAlignRight = myTextIDs.myDASID+'_das_align_right_'+myID;
		myTextIDs.myTagDiv = myTextIDs.myDASID+'_das_tags_'+myID;
		myTextIDs.myTextSize = myTextIDs.myDASID+'_das_textSize_'+myID;
		myTextIDs.myTextSlider = myTextIDs.myDASID+'_das_textSlider_'+myID;
		myTextIDs.myTextControl = myTextIDs.myDASID+'_das_textControl_'+myID;
		myTextIDs.myRotateBtn = myTextIDs.myDASID+'_das_rotate_btn_'+myID;
		myTextIDs.myMoveToFront = myTextIDs.myDASID+'_das_move_to_front_'+myID;
		myTextIDs.myMoveToBack = myTextIDs.myDASID+'_das_move_to_back_'+myID;
		myTextIDs.myFontFace = myTextIDs.myDASID+'_das_font-face_'+myID;
		myTextIDs.myRemoveBtn = myTextIDs.myDASID+'_das_remove_'+myID;
		myTextIDs.myTextHandle = myTextIDs.myDASID+'_das_textHandle_'+myID;
		myTextIDs.myTextMoveHandle = myTextIDs.myDASID+'_das_textMoveHandle_'+myID;
		myTextIDs.myTextMenuButton = myTextIDs.myDASID+'_das_textMenuButton_'+myID;
		myTextIDs.myTextBGColor = myTextIDs.myDASID+'_das_text_bg_color_'+myID;
		return myTextIDs;
	};

	$.fn.addText = function(text, font, textColor, toolkit, manuallyAdded){
		das_modify_design(true);
		font = font || 'BlackOps'; textColor = textColor || ''; toolkit = toolkit || -1; designer = $('.das_container').hasClass('design_mode');
		
		var myID = Math.floor(Math.random()*1000);
		
		var Editing = false;
		var das_id = this.attr('das_id') || this.attr('id');
		var myTextIDs = text_elements(das_id, myID);
		var myScope = $('#' + myTextIDs.myDASID);
		
		myScope.append($('<div>').attr('id', myTextIDs.myTextContainer).attr('class', 'text_container das_draggable das_resizable das_content').attr('myID', myID).attr('das_toolkit', toolkit).css('position', 'absolute').css('top', 0).css('left', 0).css('width', 435).css('height', 45));
		
		if(designer){
			$('#'+myTextIDs.myTextContainer).addClass('das_tag_visible das_tag_editable das_tag_stretch');
			//$('#'+myTextIDs.myTextContainer).addClass('das_tag_visible das_tag_editable das_tag_overflow_none');
		} else {
			$('#'+myTextIDs.myTextContainer).addClass('das_tag_visible das_tag_moveable das_tag_resizable das_tag_removable das_tag_editable das_tag_alignment das_tag_text_alignment das_tag_chngColor das_tag_stretch das_tag_scale');
		}
		
		$('#'+myTextIDs.myTextContainer).append($('<div>').attr('id',myTextIDs.myTextHandle).attr('class', 'das_text_handle das_content das_alsoResize das_textSpan').attr('myID', myID).css('height', '100%').css('width', '100%').css('font-size', 40).css('z-index', 8052).css('position', 'absolute'));
		$('#'+myTextIDs.myTextContainer).append($('<div>').attr('id', myTextIDs.myTextDiv).attr('class', 'das_text_container das_content das_proportionate').attr('myID', myID).css('z-index', 8050).css('position', 'absolute'));
		$('#'+myTextIDs.myTextDiv).append($('<textarea>').attr('id',myTextIDs.myTextSpan).attr('class','das_text_element das_content das_alsoResize das_textSpan').attr('myID', myID).attr('rows',1).css('width', 435).css('height', 45).css('color', textColor));
		
		$('#'+myTextIDs.myTextMoveHandle).append($('<div>').css('float', 'right').addClass('moveHandle das_no_rotate').append('+Move+').css('background-color', 'black').css('color', 'white'));
		
		$('#'+myTextIDs.myTextContainer).append($('<div>').attr('id',myTextIDs.myTextBGColor).attr('class', 'das_text_bg_color'));
		
		var numLayers = GetLayers().length;
		$('#'+myTextIDs.myTextContainer).attr('das_layer', numLayers + 1).css('z-index', numLayers + 1);
		
		updateText(myTextIDs, text, font);
		
		$('#'+myTextIDs.myTextContainer).css('visibility', 'hidden');
		
		var cff = function() {
			if($('html').hasClass('wf-'+ font.toLowerCase().replace(/_/g, '') +'-n4-active')){
				clearTimeout(checkFonts);
				$('#'+myTextIDs.myTextContainer).text_functions(myTextIDs.myDASID, toolkit);
	
				$('#'+myTextIDs.myTextSpan).autoTextSize(true);
				$('#'+myTextIDs.myTextSpan).attr('das_max_font', parseFloat($('#'+myTextIDs.myTextSpan).css('font-size')));
				$('#'+myTextIDs.myTextContainer).fit_to_content();
				$('#'+myTextIDs.myTextContainer).css('visibility', '');
				if (manuallyAdded) {
					setTimeout(function() { $('#'+myTextIDs.myTextContainer).click(); }, 1);
				}
				return true;
			}
			return false;
		}
		if (false == cff()) {
			var checkFonts = setInterval(cff, 80);
		}
	};

	$.fn.cloneText = function(dasID){
		var newID = Math.floor(Math.random()*1000);
		var oldID = $(this).attr('myid');
		// todo: move file location to php script
		var loading = $('<img>').attr('id', 'das_duplicate_img').attr('src', '/das/img_files/loading.gif').css({width: $('.das_original_element').width()+2, position: "absolute", backgroundColor: '#000000', opacity: .5, zindex: 2000});
		
		$('.das_content_window').prepend(loading);
		
		// clone element and replace ids
		var newElement = $(this).clone().attr('id', $(this).attr('id').replace(oldID, newID)).attr('myid', newID).appendTo('#'+dasID);
		$('.das_content', newElement).each(function(){
			$(this).attr('id', $(this).attr('id').replace(oldID, newID));
			$(this).attr('myid', newID);
		});
		
		newElement.css('top', '+=21').css('left', '+=21');
		
		// add text functions to new element
		setTimeout(function(){newElement.text_functions(dasID, $(this).attr('das_toolkit'));}, 1000);
		
		$('#das_duplicate_img').remove();
	};

	function updateText(myTextIDs, myText, myFont){
		var element = myTextIDs.myTextSpan;
		var link = document.createElement('link');
		link.id = 'cssLink' + myFont + element;
		link.elementID = element;
		link.elementFont = myFont;
		link.elementText = myText;
		link.rel = 'stylesheet';
		link.type = 'text/css';
		// todo: move file location to php script
		link.href = '/das/fonts/'+myFont+'/stylesheet.css';
		document.getElementsByTagName('head')[0].appendChild(link);
		
		_cssIsLoaded(myFont, myTextIDs);
	};

	function _cssIsLoaded(font, myTextIDs) {
		var cssLink = 'cssLink' + font + myTextIDs.myTextSpan;
    var cssStylesheet = document.getElementById(cssLink);
    var cssLoaded = 0;
			
		if ( cssStylesheet.sheet && cssStylesheet.sheet.cssRules.length > 0 )
				cssLoaded = 1;
		else if ( cssStylesheet.styleSheet && cssStylesheet.styleSheet.cssText.length > 0 )
				cssLoaded = 1;
		else if ( cssStylesheet.innerHTML && cssStylesheet.innerHTML.length > 0 )
				cssLoaded = 1;

		if(cssLoaded == 1) {
			var sameSize = false;
			
			if(typeof fontSize != 'undefined'){
				sameSize = true;
			}
			
			writeText(cssStylesheet.elementID, cssStylesheet.elementText, cssStylesheet.elementFont, myTextIDs.myTextContainer, myTextIDs.myTextDiv);
			// todo: make text box resize if font-size is given
		} else {
			setTimeout(function(){_cssIsLoaded(font, myTextIDs)}, 500);
		}
	};
	
	function textMenu(IDSet, AppendTo){
		$('#'+AppendTo).css('background-color', 'black').addClass('das_menu_end');
		$('#'+AppendTo).append($('<div></div>').attr('id',IDSet.myCloseMenu).attr('class', 'das_content_menu'));
		$('#'+AppendTo).append($('<div>Background:</div>').css('color', 'white')).append($('<div></div>').attr('id',IDSet.myCustomWidget1).attr('class', 'customWidget das_content_menu').css('color', 'white'));
		$('#'+IDSet.myCustomWidget1).append($('<div></div>').attr('id',IDSet.myColorSelector1).attr('class','colorSelector background das_content_menu'));
		$('#'+AppendTo).append($('<div>Text Color:</div>').css('color', 'white')).append($('<div></div>').attr('id',IDSet.myCustomWidget2).attr('class', 'customWidget das_content_menu').css('color', 'white'));
		$('#'+IDSet.myCustomWidget2).append($('<div></div>').attr('id',IDSet.myColorSelector2).attr('class','colorSelector textColor das_content_menu'));
		$('#'+AppendTo).append($('<div>').attr('id', IDSet.myAlignDiv).addClass('das_content_menu'));
		$('#'+IDSet.myAlignDiv).append($('<input>').attr('type', 'radio').attr('id', IDSet.myAlignLeft).attr('name', IDSet.myAlignDiv).attr('value', 'left').addClass('das_align_select')).append($('<label>').attr('for', IDSet.myAlignLeft).css('font-size', 10).append('Left'));
		$('#'+IDSet.myAlignDiv).append($('<input>').attr('type', 'radio').attr('id', IDSet.myAlignCenter).attr('name', IDSet.myAlignDiv).attr('value', 'center').addClass('das_align_select')).append($('<label>').attr('for', IDSet.myAlignCenter).css('font-size', 10).append('Center'));
		$('#'+IDSet.myAlignDiv).append($('<input>').attr('type', 'radio').attr('id', IDSet.myAlignRight).attr('name', IDSet.myAlignDiv).attr('value', 'right').addClass('das_align_select')).append($('<label>').attr('for', IDSet.myAlignRight).css('font-size', 10).append('Right'));
		$('#'+AppendTo).append($('<div>').attr('id', IDSet.myTagDiv).addClass('das_content_menu').css('color', 'white')).append('<br/>');
		$('#'+AppendTo).append($('<div>Font Size:</div>').css('color', 'white')).append($('<input>').attr('type', 'text').attr('name', IDSet.myTextSize).attr('id', IDSet.myTextSize).addClass('textSize').addClass('das_content_menu')).append('<br/>').append($('<div>').attr('id', IDSet.myTextSlider)).append('<br/>');
		$('#'+AppendTo).append($('<div>Change Font</div>').attr('id',IDSet.myFontFace).attr('class', 'das_content_menu').css('font-size', 10)).append('<br/>');
		$('#'+AppendTo).append($('<div>').attr('id', IDSet.myMoveToFront).append('Bring to Front').addClass('das_content_menu').css('font-size', 10));
		$('#'+AppendTo).append($('<div>').attr('id', IDSet.myMoveToBack).append('Send to Back').addClass('das_content_menu').css('font-size', 10)).append('<br/>');
		$('#'+AppendTo).append($('<div>Remove Text</div>').attr('id',IDSet.myRemoveBtn).attr('class', 'das_content_menu').css('font-size', 10));
	};
	
	function das_elements(dasID){
		var myDASIDs = {};
		myDASIDs.myDASID = dasID;
		
		myDASIDs.myID = 'das_container_for_'+myDASIDs.myDASID;
		
		myDASIDs.MenuContainer = myDASIDs.myID+'_menu_container';
		myDASIDs.Menu = myDASIDs.myID+'_menu';
		myDASIDs.CustomWidget1 = myDASIDs.myID+'_customWidget1';
		myDASIDs.ColorSelector1 = myDASIDs.myID+'_colorSelector1';
		myDASIDs.Buttons = myDASIDs.myID+'_buttons';
		myDASIDs.AddText = myDASIDs.myID+'_addText';
		myDASIDs.AddImg = myDASIDs.myID+'_addImg';
		myDASIDs.Designer = myDASIDs.myID+'_designer';
		myDASIDs.LayersContainer = myDASIDs.myID+'_layer_container';
		myDASIDs.layers = myDASIDs.myID+'_layers';
		myDASIDs.TextElementMenu = myDASIDs.myID+'_text_element_menu';
		myDASIDs.ElementMenuTitle = myDASIDs.myID+'_menu_title';
		myDASIDs.Save = myDASIDs.myID+'_save';
		myDASIDs.Cancel = myDASIDs.myID+'_cancel';
		myDASIDs.Tipsy = myDASIDs.myID+'_tipsy';
		myDASIDs.ImgPicker = myDASIDs.myID+'_imgPicker';
		myDASIDs.ImgUpload = myDASIDs.myID+'_upload';
		myDASIDs.ImgChoice = myDASIDs.myID+'_imgChoice';
		myDASIDs.TemplateChoice = myDASIDs.myID+'_templateChoice';
		myDASIDs.ImgFranchise = myDASIDs.myID+'_franchiseImg';
		
		myDASIDs.myTextIDs = {};
		myDASIDs.myTextIDs = text_elements(myDASIDs.myID, 'das_main');
		
		myDASIDs.myImgIDs = {};
		myDASIDs.myImgIDs = Img_Elements(myDASIDs.myID, 'das_main');
		
		return myDASIDs;
	};
	
	$.fn.das = function(design_mode, hide_menu, bgColor, bgImg){		
		var design = design_mode || false;
		var hide_menu = hide_menu || false;
		var myScope = this;
		var myIDs = das_elements(this.attr('id'));
		var myTextIDs = {};
		
		this.addClass('das_original_element');
		this.attr('das_id', myIDs.myID);
		
		var Hovering = false;
		var MousePos;
		
		var top = $(this).position().top;
		var left = $(this).position().left + $(this).width() + 5;
		
		var width = this.width();
		var height = this.height();
		
		var menuHeight =  $(window).height() - 10;
		var menuTop = 5;
		var menuRight = 5;
		
		if(design_mode){
			$(this).initializeDesignPermMenu();
		}
		
		this.append($('<div></div>').attr('id', myIDs.myID).attr('class', 'das_container das_content').attr('content_id', this.attr('id')));
		$('#'+myIDs.MenuContainer).append($('<div></div>').attr('id', myIDs.Menu).attr('class', 'das_container_menu das_menu'));
		$('#'+myIDs.Menu).append($('<label></label>').append('Background:')).append($('<div></div>').attr('id', myIDs.CustomWidget1).attr('class', 'customWidget das_menu'));
		$('#'+myIDs.CustomWidget1).append($('<div></div>').attr('id', myIDs.ColorSelector1).attr('class', 'colorSelector das_menu'));
		$('#'+myIDs.Menu).append($('<div>').attr('id', myIDs.Buttons).css('height', 50));
		$('#'+myIDs.Buttons).append($('<div></div>').attr('id', myIDs.AddText).attr('class', 'add_text_btn das_menu').append('Add Text').css('float', 'left').css('margin-left', 5).css('margin-right', 5).css('font-size', 10));
		$('#'+myIDs.Buttons).append($('<div></div>').attr('id', myIDs.AddImg).attr('class', 'das_menu').append('Image Library').css('float', 'left').css('margin-left', 5).css('margin-right', 5).css('font-size', 10));
		$('#'+myIDs.Buttons).append($('<div></div>').attr('id', myIDs.ImgUpload).attr('class', 'das_menu').append('Upload Image').css('float', 'left').css('margin-left', 5).css('margin-right', 5).css('font-size', 10));
		$('#'+myIDs.Menu).append($('<div>').attr('id', myIDs.Designer));
		$('#'+myIDs.Menu).append($('<div>').attr('id', myIDs.LayersContainer).append($('<ul>').addClass('das_layers').attr('id', myIDs.Layers)));
		$('#'+myIDs.Menu).append($('<div>').attr('id', myIDs.myTextIDs.myMenuEnd).addClass('das_main_menu_text_menu'));
		
		$('#'+myIDs.myTextIDs.myMenuEnd).append($('<div>').attr('id', myIDs.ElementMenuTitle).addClass('das_main_menu_title').css('color', 'white'));
		
		textMenu(myIDs.myTextIDs, myIDs.myTextIDs.myMenuEnd);
		$('#'+myIDs.Menu).append($('<div></div>').attr('id', myIDs.Cancel).append('Cancel').css('float', 'right').css('font-size', 10));
		$('#'+myIDs.myID).css('width', this.css('width'));
		$('#'+myIDs.myID).css('height', this.css('height'));
		
		if(hide_menu){
			$('#'+myIDs.Menu).css('display', 'none');
		}
		
		if (bgColor) {
			dasO.css("background-color", bgColor);
			$('#'+myIDs.ColorSelector1).css("background-color", bgColor);
		}
		if (bgImg){
			$('#'+myIDs.myID).setBackgroundImage(bgImg);
		}
				
		if(design === true){
			var design_mode_menu = $('<table>');
			design_mode_menu.append($('<tr>').addClass('das_dimension').append($('<td>').append('X: ').addClass('das_design_labels')).append($('<td>').append($('<input>').attr('type', 'text').attr('id', 'x').attr('value', 0).addClass('das_design_controls'))));
			design_mode_menu.append($('<tr>').addClass('das_dimension').append($('<td>').append('Y: ').addClass('das_design_labels')).append($('<td>').append($('<input>').attr('type', 'text').attr('id', 'y').attr('value', 0).addClass('das_design_controls'))));
			design_mode_menu.append($('<tr>').addClass('das_dimension').append($('<td>').append('Width: ').addClass('das_design_labels')).append($('<td>').append($('<input>').attr('type', 'text').attr('id', 'width').attr('value', 0).addClass('das_design_controls'))));
			design_mode_menu.append($('<tr>').addClass('das_dimension').append($('<td>').append('Height: ').addClass('das_design_labels')).append($('<td>').append($('<input>').attr('type', 'text').attr('id', 'height').attr('value', 0).addClass('das_design_controls'))));
			design_mode_menu.append($('<tr>').addClass('das_dimension').append($('<td>').attr('colspan', 2).append('Design Dimensions')));
			design_mode_menu.append($('<tr>').addClass('das_dimension').append($('<td>').append('Width: ').addClass('das_design_labels')).append($('<td>').append($('<input>').attr('type', 'text').attr('id', 'design_width').attr('value', 0).addClass('das_design_controls'))));
			design_mode_menu.append($('<tr>').addClass('das_dimension').append($('<td>').append('Height: ').addClass('das_design_labels')).append($('<td>').append($('<input>').attr('type', 'text').attr('id', 'design_height').attr('value', 0).addClass('das_design_controls'))));
			
			$('#'+myIDs.Designer).append(design_mode_menu);
			
			$('#'+myIDs.myID).addClass('design_mode');
			
			$('.das_dimension').each(function(){
			  var bigWidth = $(this).width();
			  var txtWidth = $('span', $(this)).width();
			});

			$('#design_width').val($('#'+myIDs.myID).width());
			$('#design_height').val($('#'+myIDs.myID).height());
		}
		
		$(window).click(function(event){
			$('#'+myIDs.myTextIDs.myMenuEnd).empty();
			$('#'+myIDs.myID).scrollTop(0).scrollLeft(0);
			$('.das_clicked').each(function(){
				$(this).css('z-index', $(this).attr('das_layer'));
				$(this).removeClass('das_clicked');
			});
			
			$('.das_menu_start').each(showMenuButton);
			$('.das_move_handle').css('display', 'none');
		});
		
		$('#'+myIDs.myTextIDs.myMenuEnd).css('display', 'none');
		
		var myFonts = new Array('BlackOps', 'Hobbiton', 'Trebucbd', 'Impact', 'Arial_Black');
		
		loadFonts(myFonts);
		
		$('#'+myIDs.MenuContainer).mousewheel(function(e, d) {
			var menuDiv = $('#'+myIDs.MenuContainer);
	    var height = menuDiv.height();
	    var scrollHeight = menuDiv.get(0).scrollHeight;

		  if((this.scrollTop === (scrollHeight - height) && d < 0) || (this.scrollTop === 0 && d > 0)) {
	      e.preventDefault();
	    }
		});
		
		$(window).resize(function(){
			$('#'+myIDs.MenuContainer).css('height', $(window).height()-10);
			
			if($(window).width() < 633){
				$('#'+myIDs.MenuContainer).css('top', 30);
			} else {
				$('#'+myIDs.MenuContainer).css('top', '');
			}
		});
		
		$(window).bind('beforeunload', function(){
			if($('.das_original_element').hasClass('das_modified')){
				return('All unsaved work will be lost');
			}
		});
		
		function InitializeTipsy(){
			$('#'+myIDs.MenuContainer).click(function(event){
				das_clickHandler(event);
			});
			
			if($('#'+myIDs.MenuContainer).html() != null){
				$('.'+myIDs.Tipsy).css('z-index', 8050);
				
				initLayout = createColorPicker(myIDs.ColorSelector1, myIDs.ColorpickerHolder1, bgColor, myIDs.myID, 'background-color');
				
				$('#'+myIDs.AddText).button();
				$('#'+myIDs.AddText).click(function(event){
					$('#' + myScope.attr('id')).addText('Type Your Text Here');
				});
				
				$('#'+myIDs.AddImg).button();
				$('#'+myIDs.AddImg).click(function(event){
					// Show dialog with image choices
					var myDialog = $('#'+myIDs.ImgPicker);
					
					myDialogHTML = $('<div>').attr('id', myIDs.ImgPicker);
					myImages = $('<div>').attr('id', myIDs.ImgChoice);
					
					$.ajax({
						type:"GET",
						// todo: move file location to php script
						url: "/das/code/list_files.php",
						dataType: 'json',
						data: { dir: '../images' },
						async: false,
						success: function(data){
							for(var i=(data.length-1); i>=0; i--){
								
								if(data[i].indexOf('.')==0){
									data.splice(i, 1);
								} else {
									// todo: move file location to php script
									myImages.append($('<img>').attr('id', data[i]).attr('class', 'imgPicker_thumb').css('width', 100).attr('src', '/das/images/'+data[i]));	
								}
							}
						}
					});
					
					myDialogHTML.append(myImages);
					var maxWidth = Math.min(1056, $(window).width() - 25);
					myDialogHTML.dialog({stack:true, zIndex:200000, modal: true, width: maxWidth, title: 'Select An Image', buttons:[{
						text: 'Done',
						click: function(){
							$(this).dialog('close');
						}
					}, {
						text: 'Cancel',
						click: function(){
							$('.das_new_img').remove();
							$(this).dialog('close');
						}
					}], close: function(){
						$('.das_new_img').removeClass('das_new_img');
					}});
					
					$('.imgPicker_thumb').click(function(event){
						
						var img = $('<img src="'+$(this).attr('src')+'" />');
						// todo: move file location to php script
						$('#'+myIDs.myDASID).prepend($('<img>').attr('src', '/das/img_files/loading.gif').attr('id', 'load_gif_for_'+myIDs.myDASID).css('width', 900).css('height', 900).css('z-index', 3000).css('position', 'absolute'));
						$(img).load(function() {
							$('#load_gif_for_'+myIDs.myDASID).remove();
						});
						
						myScope.addImg($(this).attr('src'), true);
					});
				});
				
				$('#'+myIDs.ImgUpload).button();
				$('#'+myIDs.ImgUpload).click(function(event){
							// todo: move file location to php script
							var uploader = $('<div>').append($('<form>').attr('id', 'imageform').attr('method', 'post').attr('enctype', 'multipart/form-data').attr('action', '/das/code/ajaximage.php').append('Upload your image').append($('<input>').attr('type', 'file').attr('name', 'photoimg').attr('id', 'photoimg').css('width', 250))).append($('<div>').attr('id', 'preview'));
							uploader.dialog({ modal: true, stack:true, zIndex:200000, close: function(){
								$('#photoimg').die('change');
								$(this).dialog("destroy");
								uploader.remove();
							}});
							$('#photoimg').live('change', function(){ 
								$("#preview").html('');
								// todo: move file location to php script
								$("#preview").html('<img src="/das/img_files/loader.gif" alt="Uploading...."/>');
								$("#imageform").ajaxForm({async: false, success: function(data){
									if(data.indexOf('<img')!=-1){
										$('#preview').html('Done!');
										$('#'+myIDs.ImgChoice).append(data);
										$('#'+$(data).attr('id')).click(function(event){
											myScope.addImg($(this).attr('src'), true);
										});
									} else {
										$('#preview').html(data);
									}
								}}).submit();
							});
						});
				
				InitializeDASTextMenu(myIDs.myDASID);
				
				$('#'+myIDs.Cancel).button().click(function(event){
					$.fancybox.close();
				});
				
				if(design === true){
					$('#x', $('#'+myIDs.Menu)).change(function(){
						$('#'+$(this).attr('das_bound_element')).css('left', $(this).val());
					});
					
					$('#y', $('#'+myIDs.Menu)).change(function(){
						$('#'+$(this).attr('das_bound_element')).css('top', $(this).val());
					});
					
					$('#design_width', $('#'+myIDs.Menu)).change(function(){
						var diff = $(this).val() - $('#'+myIDs.myDASID).width();
						var left = parseFloat($('#'+myIDs.MenuContainer).css('left'));
						$('#'+myIDs.myID).css('width', $(this).val());
						$('#'+myIDs.myDASID).css('width', $(this).val());
						$('#'+myIDs.MenuContainer).css('left', left + diff);
					});
					
					$('#design_height', $('#'+myIDs.Menu)).change(function(){
						$('#'+myIDs.myID).css('height', $(this).val());
						$('#'+myIDs.myDASID).css('height', $(this).val());
					});
				}
			}
		}
		
		$('#'+myIDs.myID).mousemove(function(e){
			MousePos = e;
		});	
		
		this.ready(function(){
			InitializeTipsy();
		});
		
		//init_autosave();
	};
	
	InitializeDASTextMenu = function(dasID){
		var myIDs = das_elements(dasID);
		var myTextElementIDs = text_elements(myIDs.myID, $('#'+myIDs.myTextIDs.myMenuEnd).attr('das_element_link'));
				
		$('#'+myIDs.myTextIDs.myColorSelector1).empty();
		createColorPicker(myIDs.myTextIDs.myColorSelector1, myIDs.myTextIDs.myColorpickerHolder1, myTextElementIDs.bgColor, myTextElementIDs.myTextSpan, 'background', $('#'+myTextElementIDs.myDASID).attr('id'));
		
		$('#'+myIDs.myTextIDs.myColorSelector2).empty();
		createColorPicker(myIDs.myTextIDs.myColorSelector2, myIDs.myTextIDs.myColorpickerHolder2, myTextElementIDs.textColor, myTextElementIDs.myTextSpan, 'color', $('#'+myTextElementIDs.myDASID).attr('id'));
		
		$('#'+myIDs.myTextIDs.myTagDiv).empty();
		
		if($('#'+myIDs.myID).hasClass('design_mode')){
			var tags = new Array(['Visible', 'das_tag_visible'], ['Moveable', 'das_tag_moveable'], ['Resizable', 'das_tag_resizable'], ['Editable', 'das_tag_editable'], ['Realtor Logo', 'das_tag_realtor_logo'], ['MLS Logo', 'das_tag_mls_logo'], ['Equal Housing Logo', 'das_tag_equal_opportunity']);
			for(var i=0; i<tags.length; i++){
				$('#'+myIDs.myTextIDs.myTagDiv).append($('<input>').attr('type', 'checkbox').attr('name', 'das_tags_for_main').attr('id', 'das_tags_for_main_'+tags[i][1]).addClass('das_tags_for_main').attr('value', tags[i][1])).append(tags[i][0]).append('<br/>');
				if($('#'+myTextElementIDs.myTextContainer).hasClass(tags[i][1])){
					$('#das_tags_for_main_'+tags[i][1], $('#'+myIDs.myTextIDs.myMenuEnd)).attr('checked', true);
				}
			}
		}
		
		$('.das_tags_for_main').change(function(){
			if($(this).is(':checked')){
				$('#'+myTextElementIDs.myTextContainer).addClass($(this).attr('value'));
			} else {
				$('#'+myTextElementIDs.myTextContainer).removeClass($(this).attr('value'));
			}
			
		});
		
		$('#'+myIDs.myTextIDs.myTextSize).val(parseFloat($('#'+myTextElementIDs.myTextSpan).css('font-size')));
		
		$('#'+myIDs.myTextIDs.myTextSize).unbind('change');
		$('#'+myIDs.myTextIDs.myTextSize).change(function(){
			// change text size
			$('#'+myTextElementIDs.myTextSpan).css('font-size', parseFloat($('#'+myIDs.myTextIDs.myTextSize).val()));
			
			// change size of container to fit
			FitToContent($('#'+myTextElementIDs.myTextSpan).attr('id'));
		  $('#'+myTextElementIDs.myTextContainer).resizeContainer(myTextElementIDs.myTextSpan);
		  $('#'+myTextElementIDs.myTextSpan).autoTextSize($('#'+myTextElementIDs.myTextContainer).hasClass('das_tag_resizable'));
		  $('#'+myTextElementIDs.myTextSpan).html($('#'+myTextElementIDs.myTextSpan).val());
		});
		
		$('#'+myIDs.myTextIDs.myFontFace).unbind('click');
		$('#'+myIDs.myTextIDs.myFontFace).button();
		$('#'+myIDs.myTextIDs.myFontFace).click(function(event){
			// show dialog with font faces
			var myFonts = new Array('BlackOps', 'Hobbiton', 'Trebucbd', 'Impact');
			var myDialog = $('<div></div>').attr('id', myTextElementIDs.myTextContainer+'_fontSelect');
			
			for (var i=0; i<myFonts.length; i++){
				myFont = $('<div>'+$('#'+myTextElementIDs.myTextSpan).val()+'</div>').attr('id', myTextElementIDs.myTextControl+myFonts[i]).css('font-family', myFonts[i]);
				myFont.click(function(event){
					writeText(myTextElementIDs.myTextSpan, $('#'+myTextElementIDs.myTextSpan).val(), $('#'+this.id).css('font-family'), myTextElementIDs.myTextContainer, myTextElementIDs.myTextDiv);
				});
				
				myFont.hover(function(){
					writeText(myTextElementIDs.myTextSpan, $('#'+myTextElementIDs.myTextSpan).val(), $('#'+this.id).css('font-family'), myTextElementIDs.myTextContainer, myTextElementIDs.myTextDiv, true);
				});
				
				myFont.mouseleave(function(){
					writeText(myTextElementIDs.myTextSpan, $('#'+myTextElementIDs.myTextSpan).val(), $('#'+myTextElementIDs.myTextSpan).attr('font'), myTextElementIDs.myTextContainer, myTextElementIDs.myTextDiv);
				});
				myDialog.append(myFont);	
			}
			
			myDialog.dialog({ modal: true, zIndex: 200000});
		});
		
		$('#'+myIDs.myTextIDs.myMoveToFront).unbind('click').button().click(function(event){
			MoveElement($('#'+myTextElementIDs.myTextContainer).attr('das_layer'), 1);
		});

		$('#'+myIDs.myTextIDs.myMoveToBack).unbind('click').button().click(function(event){
			MoveElement($('#'+myTextElementIDs.myTextContainer).attr('das_layer'), -1);
		});
		
		$('#'+myIDs.myTextIDs.myRemoveBtn).unbind('click').button().click(function(event){
			$('#'+myTextElementIDs.myTextContainer).remove();
		});

	};
	
	$.fn.img_resizable = function(myImgIDs, ratioLock){
		if(typeof ratioLock == 'undefined'){
			ratioLock = true;
		}
		
		$('#'+myImgIDs.myDivID).resizable({alsoResize:'#'+myImgIDs.myImgID, aspectRatio: ratioLock, handles: 'nw, sw, ne, se', resize: function(){
			$('#'+myImgIDs.myDivID).attr('resizing', true);
			updateDesignerControls(myImgIDs.myDivID, myImgIDs.myDASID);
			mask_drag(myImgIDs);
		}, stop: function(){
			$('#'+myImgIDs.myDivID).attr('resizing', false);
			$('#'+myImgIDs.myDivID).mouseout();
			updateDesignerControls(myImgIDs.myDivID, myImgIDs.myDASID);
			mask_drag(myImgIDs);
		}});
		
		$('.ui-resizable-sw').addClass('ui-icon-gripsmall-diagonal-sw').addClass('ui-resizable-corner');
		$('.ui-resizable-nw').addClass('ui-icon-gripsmall-diagonal-nw').addClass('ui-resizable-corner');
		$('.ui-resizable-ne').addClass('ui-icon-gripsmall-diagonal-ne').addClass('ui-resizable-corner');
		$('.ui-resizable-se').addClass('ui-icon-gripsmall-diagonal-se').addClass('ui-resizable-corner').removeClass('ui-icon');
	}
	
	$.fn.img_functions = function(dasID, newImg, background){
		
		newImg = newImg || false;
		background = background || false;
		
		var dasID = dasID;
		var myID = $(this).attr('myID');
		
		var myImgIDs = Img_Elements(dasID, myID);
				
		var clicked = false;
		var mouseOver = false;
		var resizing = false;
		
		var designer = $('#'+dasID).hasClass('design_mode');
		
		$('#'+myImgIDs.myODASID).append($('<div></div>').attr('id',myImgIDs.myMenuEnd).css('background-color', 'black').css('width', 210).attr('class', 'das_content_menu').css('display', 'none').css('position', 'absolute'));
		
		$('#'+myImgIDs.myMenuEnd, $('#'+myImgIDs.myDivID)).remove();
		
		if(newImg){
			$('#'+myImgIDs.myImgID).css('top', 0).css('left',0);	
		}
		
		$('#'+myImgIDs.myDivID).img_resizable(myImgIDs, true);
		
		$('.ui-resizable-handle').mousedown(function(){
			resizing = true;
		});
		
		if (false == g_DaS_imgDocMouseUp) {
		$(document).mouseup(function(){
			resizing = false;
		});
			g_DaS_imgDocMouseUp = true;
		}
		
		$('#'+myImgIDs.myDivID).click(function(event){
			das_clickHandler(event);
			$('.das_text_element').blur();
		});
		
		$('#'+myImgIDs.myDivID).mousedown(function(e){
			das_modify_design(true);
			
			var DaSIDs = das_elements(myImgIDs.myODASID);
			$('#'+DaSIDs.myTextIDs.myMenuEnd).empty();
			
			updateDesignerControls(myImgIDs.myDivID, myImgIDs.myDASID);
			
			$('.das_main_menu_text_menu', $('#'+myImgIDs.myDASID+'_menu_container')).css('display', '').attr('das_element_link', myImgIDs.myID);
										
			var DaSIDs = das_elements(myImgIDs.myODASID);
			
			$('#'+myImgIDs.myDASID).scrollTop(0).scrollLeft(0);
			
			$('.das_clicked').each(function(){
				$(this).css('z-index', $(this).attr('das_layer'));
				$(this).removeClass('das_clicked');
			});
			$('#'+myImgIDs.myDivID).addClass('das_clicked');
		});
		
		$('#'+myImgIDs.myDivID).draggable({drag: function(){
			$(this).css('z-index', 10000);
			showMenuBar();
			updateDesignerControls(myImgIDs.myDivID, myImgIDs.myDASID);
		}, stop: function(){
			$(this).css('z-index', $(this).attr('das_layer'));
			updateDesignerControls(myImgIDs.myDivID, myImgIDs.myDASID);
		}});
		
		if(newImg && !background){
			var newWidth = $('#'+ dasID).width();
			$('#'+myImgIDs.myDivID).css("width", 250);
			$('#'+myImgIDs.myImgID).css("width", 250);
			setImgHeight(myImgIDs.myImgID, myImgIDs.myDivID);
		}
		
		$('#'+myImgIDs.myDivID).mouseover(function(){
			var anyResizing = false;
			$('.das_resizable').each(function(){
				if($(this).attr('resizing') == 'true'){
					anyResizing = true;
				}
			});
			if(!anyResizing){
				showMenuBar();
				$('.ui-resizable-handle', $('#'+myImgIDs.myDivID)).css('visibility', 'visible');
				mouseOver = true;
				$(this).attr('das_mouse_over', true);
			}
		});
		
		$('#'+myImgIDs.myDivID).mouseout(function(){
			mouseOver = false;
			$(this).attr('das_mouse_over', false);
			
			setTimeout(function(){
				if(!mouseOver && !clicked && ! resizing){
					if($('#'+myImgIDs.myMenuEnd).css('display') != 'none' && $('#'+myImgIDs.myMenuEnd).length > 0){
						$('#'+myImgIDs.myMenuEnd).css('display', 'none');
						$('#'+myImgIDs.myMenuStart).css('display', '');
					}
					if($('#'+myImgIDs.myMenuEnd).attr('das_mouse_over') == 'false'){
						$('#'+myImgIDs.myMenuEnd).css('display', 'none');
					}
					$('.ui-resizable-handle', $('#'+myImgIDs.myDivID)).css('visibility', 'hidden');
				}
			}, 100);
		});
		
		function showMenuBar(){
			var elementPos = $('#'+myImgIDs.myDivID).position();
			var elementHeight = $('#'+myImgIDs.myDivID).height();
		
			if($('#'+myImgIDs.myDivID).hasClass('inBackground')){
				$('#'+myImgIDs.myDivID).css('z-index', $('#'+myImgIDs.myDivID).attr('das_layer'));
				$('#'+myImgIDs.myMoveHandle).css('z-index', 10000);
			}
			
			if($('#'+myImgIDs.myDASID).height() - elementPos.top <= 235){
				$('#'+myImgIDs.myMoveHandle).css('top', '').css('bottom', 0);
				$('#'+myImgIDs.myMenuID).css('top', '').css('bottom', 0);
			} else {
				$('#'+myImgIDs.myMoveHandle).css('top', 0).css('bottom', '');
				$('#'+myImgIDs.myMenuID).css('top', 0).css('bottom', '');
			}
			
			$('#'+myImgIDs.myMenuEnd).css('top', elementPos.top).css('left', elementPos.left).css('z-index', 10001);
			
			var menuEnd = $('#'+myImgIDs.myMenuEnd).css('display');
			var menuStart = $('#'+myImgIDs.myMenuStart).css('display');
			var mainMenuEnd = $('#'+myImgIDs.myDASID+'_end_das_main').css('display');
			
			if(!$('#'+myImgIDs.myDivID).hasClass('inBackground')){			
				$('.das_move_handle').css('display', 'none').css('z-index', '');
				
				$('.das_menu_start').each(showMenuButton);
			}
			
			$('#'+myImgIDs.myMenuEnd).css('display', menuEnd);
			$('#'+myImgIDs.myMenuStart).css('display', menuStart);
			$('#'+myImgIDs.myDASID+'_end_das_main').css('display', mainMenuEnd);
			$('#'+myImgIDs.myMoveHandle).css('display', '');
		};
		
		if(!designer){
			$('#'+myImgIDs.myMenuStart).css('display', 'none');
			$('#'+myImgIDs.myDivID).click(function(event){
				$(window).text_border();
				$('#das_main_menu').initializeMainMenu(myImgIDs.myID, 'image', myImgIDs.myDASID);
			});
		} else {
			// show menu on designer page
			$('#'+myImgIDs.myMenuStart).css('display', 'none');
			$('#'+myImgIDs.myDivID).mousedown(function(){
				$(window).text_border();
				$('#das_element_menu').initializeDesignMainMenu(myImgIDs.myID, 'img', myImgIDs.myDASID);
			});
		}
		
		resizeHandles();
		
		$('#'+myImgIDs.myImgID).load(function(){
			if(background){
				MoveElement($('#'+myImgIDs.myDivID).attr('das_layer'), -1, true);
				$('#'+myImgIDs.myDivID).alignElement('center');
				$('#'+myImgIDs.myDivID).alignElement('middle');
			}
		});
	};
	
	function setImgHeight(img, div){
		var imgHeight = $('#'+img).height();
		if(imgHeight != 0){
			$('#'+div).css('height', imgHeight);
			$('#'+img).css('height', imgHeight);
		} else {
			setTimeout(function(){ setImgHeight(img, div) }, 500);
		}
	};
	
	function Img_Elements(dasID, myID){
		var myImgIDs = {};
		myImgIDs.myDASID = dasID;
		myImgIDs.myODASID = dasID.substring(18);
		myImgIDs.myID = myID;
		myImgIDs.myDivID = myImgIDs.myDASID+'_div_'+myID;
		myImgIDs.myImgMask = myImgIDs.myDASID+'_img_mask_'+myID;
		myImgIDs.myImgID = myImgIDs.myDASID+'_img_'+myID;
		myImgIDs.myMoveHandle = myImgIDs.myDASID+'_move_handle_'+myID;
		myImgIDs.myMenuID = myImgIDs.myDASID+'_menu_'+myID;
		myImgIDs.myMenuStart = myImgIDs.myDASID+'_menu_start_'+myID;
		myImgIDs.myMenuEnd = myImgIDs.myDASID+'_end_'+myID;
		myImgIDs.myCloseMenu = myImgIDs.myDASID+'_menu_close_'+myID;
		myImgIDs.myMakeBkgrnd = myImgIDs.myDASID+'_menu_mkbkgrnd_'+myID;
		myImgIDs.myTagDiv = myImgIDs.myDASID+'_menu_tags_'+myID;
		myImgIDs.myRotateBtn = myImgIDs.myDASID+'_menu_rotate_'+myID;
		myImgIDs.myCropBtn = myImgIDs.myDASID+'_menu_crop_'+myID;
		myImgIDs.myMoveToFront = myImgIDs.myDASID+'_move_to_front_'+myID;
		myImgIDs.myMoveToBack = myImgIDs.myDASID+'_move_to_back_'+myID;
		myImgIDs.myRemoveBtn = myImgIDs.myDASID+'_menu_remove'+myID;
		myImgIDs.myResize = myImgIDs.myDASID+'_resize_'+myID;
		
		return myImgIDs;
	};
	
	$.fn.addImg = function(imgPath, newImg, position, size, imgName, background){
		das_modify_design(true);
		
		var dasID = this.attr('das_id') || this.attr('id');
		var myScope = $('#' + dasID);
		var myID = Math.floor(Math.random()*1000);
		var myImgIDs = Img_Elements(dasID, myID);
		var imgName = imgName || '';
		var background = background || false;
		var designer = $('.das_container').hasClass('design_mode');
		
		myScope.append($('<div>').attr('id', myImgIDs.myDivID).addClass('das_img_container das_draggable das_resizable das_proportionate das_content das_new_img').css('z-index', 1).css('top', 0).css('left', 0).attr('myID', myID).css('position', 'absolute').append($('<div>').attr('id', myImgIDs.myImgMask).css('overflow', 'hidden').addClass('das_content_menu').append($('<img>').attr('id', myImgIDs.myImgID).attr('imgName', imgName).attr('src', imgPath).addClass('das_content das_alsoResize das_img').attr('myID', myID))));
		
		if(designer){
			$('#'+myImgIDs.myDivID).addClass('das_tag_visible');
		} else {
			$('#'+myImgIDs.myDivID).addClass('das_tag_visible das_tag_moveable das_tag_resizable das_tag_editable das_tag_alignment');
		}
		
		$('#'+myImgIDs.myDivID).css('height', $('#'+myImgIDs.myImgID).css('height'));
		
		$('#'+myImgIDs.myDivID).append($('<div>').attr('id', myImgIDs.myMoveHandle).addClass('das_move_handle').addClass('das_content_menu').css('position', 'absolute').css('height', 30).css('display', 'none'));
		$('#'+myImgIDs.myMoveHandle).append($('<div></div>').attr('id', myImgIDs.myMenuID).attr('class', 'das_content_menu').css('position', 'absolute').css('background-color', 'black'));
		
		$('#'+myImgIDs.myMenuID).append($('<div>Edit</div>').attr('id', myImgIDs.myMenuStart).attr('class', 'das_content_menu das_menu_start').css('color', 'white'));
		$('#'+myImgIDs.myMenuID).append($('<div></div>').attr('id', myImgIDs.myMenuEnd).attr('class', 'das_content_menu').css('display', 'none').css('width', 210).css('font-size', 10));
		
		if(typeof position != 'undefined'){
			$('#'+myImgIDs.myDivID).css('top', position.top).css('left', position.left);
		}
		
		if(typeof size != 'undefined' && size != null){
			$('#'+myImgIDs.myDivID).css('width', size.width).css('height', size.height);
			$('#'+myImgIDs.myImgID).css('width', size.width).css('height', size.height);
		}
		
		imgMenu(myImgIDs, myImgIDs.myMenuEnd);
		
		var numLayers = GetLayers().length;
		
		$('#'+myImgIDs.myDivID).attr('das_layer', numLayers + 1).css('z-index', numLayers + 1);
		
		$('#'+myImgIDs.myDivID).img_functions(myImgIDs.myDASID, newImg, background);
	};
	
	function imgMenu(IDSet, AppendTo){
		$('#'+AppendTo).addClass('das_menu_end');
		$('#'+AppendTo).append($('<div>').attr('id',IDSet.myCloseMenu).attr('class', 'das_content_menu')).append('<br/>');
		$('#'+AppendTo).append($('<div>').append('Make Background').attr('id', IDSet.myMakeBkgrnd).attr('class', 'das_content_menu').css('font-size', 10));
		$('#'+AppendTo).append($('<div>').attr('id', IDSet.myTagDiv).css('color', 'white'));
		$('#'+AppendTo).append($('<div>').append('Rotate').attr('id', IDSet.myRotateBtn).addClass('das_content_menu').css('font-size', 10)).append('<br/>');
		$('#'+AppendTo).append($('<div>').append('Bring to Front').attr('id', IDSet.myMoveToFront).addClass('das_content_menu').css('font-size', 10));
		$('#'+AppendTo).append($('<div>').append('Send to Back').attr('id', IDSet.myMoveToBack).addClass('das_content_menu').css('font-size', 10));
		$('#'+AppendTo).append($('<div>').append('Remove Image').attr('id', IDSet.myRemoveBtn).attr('class', 'das_content_menu').css('font-size', 10));
	};

	writeText = function(element, myText, myFont, myTextContainer, myTextDiv, temp, resizable, sameSize){
			
			// optional values
			myTextContainer = myTextContainer || element.replace('textSpan', 'text');
			myTextDiv = myTextDiv || element.replace('textSpan', 'textDiv');
			myFont = myFont || $('#'+element).css('font-family');
			temp = temp || false;
			resizable = resizable || $('#'+myTextContainer).hasClass('das_tag_resizable');
			sameSize = sameSize || false;
					
			element = '#' + element;
			
			$(element).css('font-family', myFont);
			if (!temp){
				$(element).attr('font', myFont);
			}
			$(element).val(myText);
			$('#das_font_preload' + myFont).hide();
			
			if(!sameSize){
				$(element).autoTextSize($('#'+myTextContainer).hasClass('das_tag_resizable'));
			}
			
			if(resizable){
				FitToContent($(element).attr('id'));
				$('#'+myTextContainer).resizeContainer($(element));
			}
		};
	
	function InitializeDASTipsy(Container){
		$('.'+Container+'_das_tipsy').css('z-index', 8050);
		
		initLayout = createColorPicker('das_container_for_'+Container+'_colorSelector1', "", "", 'das_container_for_'+Container, 'background-color');
		
		$('.add_text_btn', $('#'+Container)).button().click(function(event){
			AddTextClick();
		});
	};
		
	function createColorPicker(eSelector, eHolder, color, eControlls, property, Container, franchise){
		var cs = $('#' + eSelector);
		cs.addClass('colorSelector').attr('for_property', property).attr('for_control', '#' + eControlls);
		var curColor;
		if(typeof eControlls != 'undefined'){
			curColor = $('#'+eControlls).css(property);
		}
		
		myColors = franchise_palette(franchise);
				
		$.each(myColors, function(i, o) {
			var cel = $('<div></div>').addClass('colorSelectorCell');
			cel.attr('id', cs.attr('id') + '_' + i).css('background-color', o[0]);
			cel.attr('for_property', cs.attr('for_property'));
			cel.attr('for_control', cs.attr('for_control'));
			cel.attr('for_selector', '#' + cs.attr('id'));
			cel.appendTo(cs)
			
			if(rgb2hex(curColor) == o){
				cel.html('&#x2714;').removeClass('colorSelectorCell').addClass('colorSelectorCellSelected');
			}
			
			function rgb2hex(rgb) {
				if(!rgb && typeof rgb != 'undefined' && rgb != 'transparent'){
					rgb = rgb.substr(0, rgb.indexOf(')') + 1);
					rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);
					function hex(num) {
						return ("0" + parseInt(num).toString(16)).slice(-2);
					}
					return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
				}
	    }
			
			if ('none' == o)
				cel.html('&#x2715;').css('border-style', 'dotted').attr('reset','reset');
			cel.click(function(event) {
				var s = $($(this).attr('for_selector'));
				$('.colorSelectorCellSelected', s).removeClass('colorSelectorCellSelected').addClass('colorSelectorCell').html('');
				var c = $($(this).attr('for_control'));
				var p = $(this).attr('for_property');
				if ($(this).attr('reset') == 'reset') {
					c.css(p, '');
				} else {
					c.css(p, $(this).css('background-color'));
					if(p == 'color'){
						// make the border color the same as the text
						var text_container = $($(this).attr('for_control')).parents('.text_container');
						$('.das_text_handle', $(text_container)).css('border-color', $(this).css('background-color'));
					}
					$(this).html('&#x2714;');
					$(this).removeClass('colorSelectorCell').addClass('colorSelectorCellSelected');
				}
			});
		});
	};
	
	function Background(){
		var Image;
		var Color;
	};
	
	function TextElement(){
		var ID;
		var Text;
		var FontSize;
		var Top;
		var Left;
		var TextColor;
		var FontStyle;
		var BackgroundColor;
	};
	
	function ImgElement(){
		var ID;
		var Src;
		var Width;
		var Height;
		var Top;
		var Left;
	};
	
	$.fn.fit_to_content = function(alsoResize, maxHeight, maxWidth){
		FitToContent($(this).attr('id'), alsoResize, maxHeight, maxWidth);
	};
	
	function text_background(element_id){
		var dasID = $('.das_container').attr('id');
		var myID = $('#'+element_id).attr('myid');
		var elementIDs = text_elements(dasID, myID);
		var cont_width = $('#'+elementIDs.myTextContainer).width();
		var cont_height = $('#'+elementIDs.myTextContainer).height();
		
		if($('#'+elementIDs.myTextContainer).hasClass('das_tag_bg_text_only')){
			var text_width = parseFloat($('#'+elementIDs.myTextSpan).getTextWidth());
			var text_height = parseFloat($('#'+elementIDs.myTextSpan).getTextHeight(text_width));
			$('#'+elementIDs.myTextBGColor).css('width', text_width);
			$('#'+elementIDs.myTextBGColor).css('height', text_height);
			$('#'+elementIDs.myTextBGColor).css('left', '');
			
			if($('#'+elementIDs.myTextSpan).css('text-align') == 'center'){
				var left = (cont_width - text_width) / 2;
				$('#'+elementIDs.myTextBGColor).css('left', left);
			} else if($('#'+elementIDs.myTextSpan).css('text-align') == 'right'){
				var left = (cont_width - text_width);
				$('#'+elementIDs.myTextBGColor).css('left', left);
			}
		} else {
			$('#'+elementIDs.myTextBGColor).css('width', cont_width);
			$('#'+elementIDs.myTextBGColor).css('height', cont_height);
			$('#'+elementIDs.myTextBGColor).css('left', '');
		}
	};
	
	function FitToContent(id, alsoResize, maxHeight, maxWidth){
		var text = id && id.style ? id : document.getElementById(id);
		if ( !text ){
	  	return;
	  }
	  
	  if ( text.value != "" ){
		  // Accounts for rows being deleted, pixel value may need adjusting 
	  	if (text.clientHeight == text.scrollHeight) {
	    	text.style.height = "1px";
	    }       
	    
	    if (text.clientWidth == text.scrollWidth) {
		    text.style.width = "1px";
	    }

			var adjustedWidth = text.clientWidth;
	    if (!maxWidth || maxWidth > adjustedWidth ){
		    /*var scrollWidth;
		    if(getBrowser() == "Firefox"){
			    scrollWidth = $('#spanCalculateTextWidth').width() + 2;
		    } else {
			    scrollWidth = text.scrollWidth; 
		    }*/
		    adjustedWidth = Math.max(text.scrollWidth, adjustedWidth);
		    if($(text).css('font-style') == 'italic'){
			    //todo: float the width by using - adjustedWidth += 5;
		    }
		    if ( maxWidth )
			    adjustedWidth = math.min(maxWidth, adjustedWidth);
			  if ( adjustedWidth > text.clientWidth )
			  	text.style.width = adjustedWidth + "px";
	    }
	    
	    var adjustedHeight = text.clientHeight;
	    if ( !maxHeight || maxHeight > adjustedHeight )
	    {
	    	adjustedHeight = Math.max(text.scrollHeight, adjustedHeight);
	      if ( maxHeight )
	      	adjustedHeight = Math.min(maxHeight, adjustedHeight);
	      if ( adjustedHeight > text.clientHeight )
	      	text.style.height = adjustedHeight + "px";
	    }
	  }
	  
	  if(alsoResize){
	  	var stretchX = parseFloat($('#'+id).attr('stretchx')) || 1;
	  	var stretchY = parseFloat($('#'+id).attr('stretchy')) || 1;
	  	var width = $('#'+id).width() * stretchX;
	  	var height = $('#'+id).height() * stretchY;
			$('#'+alsoResize).css('width', width).css('height', height);
		}
		
		text_background(id);
	};
	
	$.fn.TransferContent = function(fromDiv, toDiv){
		var deserializer = {decoded: false, noData: false};
		Serialize(fromDiv);
		
		while (!deserializer.decoded){
			deserializer = Deserialize(toDiv);
			if (!deserializer.decoded){
				Serialize(fromDiv);
			}
		}
	};
	
	$.fn.Save = function(fileName, contextID, background){
		var myDAS = this.attr('id');
		var background = background || false;
		var myDialog;
		var myTextbox;
		var myButton;
		
		if($('.design_mode').length > 0){
			$('.das_tag_can_substitute').each(function(){
				var thumbWidth = $('.das_img_thumb', $('#das_element_menu_'+$(this).attr('myid'))).width();
				var thumbHeight = $('.das_img_thumb', $('#das_element_menu_'+$(this).attr('myid'))).height();
				$(this).attr('das_thumb_width', thumbWidth).attr('das_thumb_height', thumbHeight);
			});
			$('.das_tag_mandatory').each(function(){
				if($(this).hasClass('text_container')){
					$(this).attr('das_default_value', $('.das_text_element', $(this)).val());
				} else if($(this).hasClass('das_img_container')){
					$(this).attr('das_default_value', $('.das_content', $(this)).attr('src'));
				}
			});
		} else {
			$('.das_tag_can_substitute').each(function(){
				var maskWidth = $('.das_img_thumb_mask', $('#das_element_menu_'+$(this).attr('myid'))).width();
				var maskHeight = $('.das_img_thumb_mask', $('#das_element_menu_'+$(this).attr('myid'))).height();
				var maskTop = $('.das_img_thumb_mask', $('#das_element_menu_'+$(this).attr('myid'))).css('top');
				var maskLeft = $('.das_img_thumb_mask', $('#das_element_menu_'+$(this).attr('myid'))).css('left');
				$(this).attr('das_mask_top', maskTop).attr('das_mask_left', maskLeft).attr('das_mask_width', maskWidth).attr('das_mask_height', maskHeight);
			});
		}

		if(fileName==null){
			
			myDialog = $('<div>').attr('id', 'save_div');
			myDialog.append($('<p>').append('What would you like to name your file'));
			myTextbox = $('<input>').attr('type', 'text').attr('id', 'save_text');
			myButton = $('<div>').attr('id', 'save_btn').append('Save');
			myButton.button().click(function(event){
				// check if file already exists
				var code;
				var overwrite = true;
				if(contextID){
					code = "user_designs";
				} else {
					code = "main_templates";
				}
				$.ajax({
					type: "GET",
					// todo: move file location to php script
					url: "/das/code/list_files.php",
					async: false,
					dataType: 'json',
					data: {code: code, user_id: contextID},
					success: function(data){
						// if myTextbox.val() is found in data then send a message
						var myFiles = data[0];
						
						for(var i=0; i < myFiles.length; i++){
							if(myTextbox.val() == myFiles[i]){
								overwrite = confirm('A design already exists with this name. Do you wish to overwrite?');
							}
						}
					}
				});
				
				if((myTextbox.val().indexOf(':') != -1) || (myTextbox.val().indexOf('.'))){
					if(overwrite){
						var dasContainer = $('#'+myDAS).clone(true);
						$('#das_container_for_'+myDAS, dasContainer).css({scale: [1, 1]}).attr('size', 1);
						setTimeout(function(){
							runSerialize(myTextbox.val(), myDialog, contextID, dasContainer, background);
						}, 100);
						myDialog.empty();
						myDialog.append('Please wait, your design is being saved');
						das_modify_design(false);
					}
				} else {
					alert('Periods(.) and Colons(:) are not allowed in filenames');
				}
				
			});
			myDialog.append(myTextbox)
			myDialog.append('<br/><br/>');
			myDialog.append(myButton);
			myDialog.dialog({ modal: true, zIndex: 200000});
			myDialog.keypress(function(e){
				if (e.keyCode == $.ui.keyCode.ENTER) {
					myButton.click();
				}
			});
		} else {
			myDialog = $('<div>').attr('id', 'save_div');
			myDialog.append($('<p>').append('Please wait, your design is being saved'));
			if(!background){
				myDialog.dialog({ modal: true, zIndex: 200000});
			}
			//var currResize = $('#das_container_for_'+myDAS).attr('size');
			$('textarea', $('#das_container_for_'+myDAS)).each(function(iTO, oTO) {
				var oT = $(oTO);
				if (oT.text() != oT.val()) {
					oT.text(oT.val());
				}
			});
			var dasContainer = $('#'+myDAS).clone(true);
			$('#das_container_for_'+myDAS, dasContainer).css({scale: [1, 1]}).attr('size', 1);
			
			$('.text_container', dasContainer).each(function(){
				var orig_width = $('.das_text_element', $(this)).attr('orig_width');
				$(this).css('width', orig_width);
				$('.das_text_element', $(this)).css('width', orig_width);
			});
			
			setTimeout(function(){
				runSerialize(fileName, myDialog, contextID, dasContainer, background);
				//$('#das_container_for_'+myDAS).transition({scale: currResize}).attr('size', currResize);
				das_modify_design(false);
			}, 100);
		}
		
		function runSerialize(fileName, myDialog, contextID, container, background){
			
			var filePath;
			var file;
			file = 'DAS.txt';
			
			if($('#das_franchise').val() != 0){
				$('#das_container_for_' + myDAS, $(container)).attr('das_toolkit', $('#das_franchise').val());
				//$(container).attr('das_toolkit', $('#das_franchise').val());
			}
			
			if($('#das_size').val() != 0){
				var size_id = $('#das_size').val();
				var design_height = $('#'+size_id, $('#das_size')).attr('das_height');
				var design_width = $('#'+size_id, $('#das_size')).attr('das_width');
				$('#das_container_for_' + myDAS, $(container)).attr('das_sizeID', size_id).attr('design_height', design_height).attr('design_width', design_width);
				//$(container).attr('das_sizeID', size_id).attr('design_height', design_height).attr('design_width', design_width);
			}
			
			$('#das_container_for_'+myDAS, $(container)).attr('das_dpi', $('#das_dpi').val());
			
			$('#das_container_for_'+myDAS, $(container)).attr('das_saved_browser', getBrowser());
			$('#das_container_for_'+myDAS, $(container)).attr('das_saved_UA', navigator.userAgent);
			
			if(contextID){
				var encoded = calcMD5(contextID);
				// todo: move file location to php script
				filePath = '../users/'+encoded+'/designs/'+fileName+'/';
			} else {
				// todo: move file location to php script
				filePath = '../templates/'+fileName+'/';
			}
			
			$.ajax({
				type: "POST",
				// todo: move file location to php script
				url: "/das/code/create_template.php",
				async: false,
				data: {dir:filePath},
				success: function(data){
					Serialize(myDAS, filePath, file, fileName, myDialog, container, background);
				}
			});
		}
	};
	
	function Serialize(fromDiv, filePath, file, fileName, saveDialog, container, background){
		filePath = filePath || "";
		file = file || "serialized.txt";
		$('#das_container_for_'+fromDiv, container).attr('das_template_name', fileName);
		$('#das_container_for_'+fromDiv).attr('das_template_name', fileName);
		var serializedData = $('#das_container_for_'+fromDiv, container).clone().wrap('<p>').parent().html();
		serializedData = $(serializedData).attr('das_version', das_version).removeClass('design_mode').clone().wrap('<p>').parent().html();
		
		// detect for Webkit only or IE only css syntax
		var myDesignHTML = $(serializedData);
		
		$('.das_text_container', myDesignHTML).each(function(){
			$(this).css('padding-top', '');
		});
		
		$('.das_text_element', myDesignHTML).each(function(){
			var oThis = $(this);
			var stretchX = oThis.attr('stretchx');
			var stretchY = oThis.attr('stretchy');
			var newStyle = oThis.attr('style') + ' transform-origin: 0px 0px; transform: scale('+stretchX+', '+stretchY+'); -webkit-transform-origin: 0px 0px; -webkit-transform: scale('+stretchX+', '+stretchY+');';
			oThis.attr('style', newStyle);

		});
		
		$('.das_temp_vars', myDesignHTML).each(function(){
			$(this).removeAttr('das_temp_max_font_height').removeAttr('das_temp_max_container_height').removeClass('das_temp_vars');
		});
		
		var currentBrowser = getBrowser();
		if ('IE' == currentBrowser) {
			//SEE OTHER IE_MUST COMMENT
			$('.text_container', myDesignHTML).each(function() {
				$(this).css('top', parseFloat($(this).css('top') - 20) + 'px').removeAttr('das_ie_adjusted');
			});
		}
		
		var encodedData = Base64.encode(myDesignHTML.wrap('<p>').parent().html());
		
		$.ajax({
			type: "POST",
			// todo: move file location to php script
		  url: "/das/code/DAS_Serialization.php",
		  data: { method: 'set', path: filePath, file: file, string: encodedData },
		  success: function(data){
				setTimeout(function(){
					if(saveDialog.hasClass('ui-dialog-content')){
						saveDialog.dialog('close');
					}
					g_DasSavedCallBackList.forEach(function(cbf) {
						setTimeout(function() { cbf(fileName); }, 100);
					});
				}, 1000);
		  }
		});
	};
	
	$.fn.Load = function(toDiv, designer, fileName){
		if(typeof fileName == 'undefined'){
			var myIDs = das_elements($('.das_container').attr('content_id'));
			
			var myWrapper = $('<div>').attr('id', 'saveFiles');
			
			var mySearch = $('<div>').attr('id', 'das_template_search');
			mySearch.append($('<input>').attr('id', 'das_template_searchbox').attr('type', 'text'));
			mySearch.append($('<div>').attr('id', 'das_template_searchbtn').html('search'));
			mySearch.append($('<div>').attr('id', 'das_template_clearsearch').html('clear'));
			
			var myList = $('<div>').attr('id', myIDs.TemplateChoice).addClass('das_templatePicker_container');
			
			var mySubmit = $('<div>').attr('id', 'submitBtn').append('open');
			// todo: move file location to php script
			var myDirList = new Array('../templates/');
			
			function templatePicker_onClick(){
				$('.templatePicker_thumb').click(function(event){
					$('#'+toDiv).empty();
					var selected = $(this).attr('id');
					myWrapper.empty();
					myWrapper.append('Please wait, your design is being loaded');
					setTimeout(function(){runLoad(selected, myWrapper);}, 100);
				});
			}
			
			$.ajax({
				type:"GET",
				// todo: move file location to php script
				url: "/das/code/list_files.php",
				dataType: 'json',
				data: { dir: myDirList },
				async: false,
				success: function(data){
					function search(){
						var strSearch = $('#das_template_searchbox').val();
						
						var arrFound = new Array();
						var mySrc = new Array();
						
						for(var c=0; c<data.length; c++){
							var secImgs = new Array();
							for(var d=0; d<data[c].length; d++){
								if(data[c][d].match(strSearch)){
									secImgs.push(data[c][d]);
								}
							}
							arrFound.push(secImgs);
							mySrc.push($('#das_img_section_'+c).attr('das_src'));
						}
						
						$('.das_templatePicker_container').empty();
						for(var i=0; i<mySrc.length; i++){
							$('.das_templatePicker_container').append($('<div>').attr('id', 'das_template_section_'+i).attr('das_src', mySrc[i]));
							if(i!=(mySrc.length - 1)){
								$('#das_template_section_'+i).css({'border-bottom': 'solid black 1px', 'margin-bottom': 5, 'padding-bottm': 5});
							}
							loadTemplates($('#das_template_section_'+i), arrFound[i], mySrc[i]);
						}
						
						$('.templatePicker_thumb').lazyload({
							effect: "fadeIn",
							container:".das_templatePicker_container"
						});
						
						$('.das_templatePicker_container').trigger('scroll');
						
						templatePicker_onClick();
					};
					
					$('#das_template_searchbox', mySearch).keyup($.throttle(100, search));
					
					$('#das_template_searchbtn', mySearch).button().click(function(event){
						search();
					});
					
					$('#das_template_clearsearch', mySearch).button().click(function(event){
						$('#das_template_searchbox').val('');
						search();
					});
					
					$('.ui-button-text', mySearch).css('line-height', '.8em');
					
					for(var j=0; j<data.length; j++){
						if(data[j][0] != 'no data'){
							var templates = $('<div>').attr('id', 'das_template_section_'+j).attr('das_src', myDirList[j]);
							if(j!=(data.length - 1)){
								templates.css({'border-bottom': 'solid black 1px', 'margin-bottom': 5, 'padding-bottom': 5});
							}
							for(var i=(data[j].length-1); i>=0; i--){
								if(data[j][i].indexOf('.')>=0){
									data[j].splice(i, 1);
								}
							}
							
							loadTemplates(templates, data[j], myDirList[j]);
							
							myList.append(templates);
						}
					}
					
					function loadTemplates(jqObj, arrImgs, srcDir){
						// todo: move file location to php script
						srcDir = '../img_files/';
						var myGeneric = srcDir+'/oakley_signs_and_graphics.png';
						for(var i=0; i<arrImgs.length; i++){
							var filename = arrImgs[i];
							// todo: move file location to php script
							var myData = '/das/render/render.php?quality=36&format=png&watermark=false&width=175&prod_id=' + filename;
							if(filename){
								$(jqObj).append($('<div>').addClass('templatePicker_thumb_holder').append($('<img>').attr('id', filename).addClass('templatePicker_thumb').attr('data-original', myData).attr('src', myGeneric).attr('filename', filename).css('display', 'inline')).append($('<div>').addClass('imgPicker_thumb_descr').append(filename)));
							}
						}
					}

					//todo: fix this so that it can be done properly the first time the form is loaded and not via a forced & delayer trigger of the search function
					setTimeout(search, 150);
				},
				error: function(jqXHR, status, err){
					alert(status);
				}
			});
			
			myWrapper.append(mySearch);
			myWrapper.append(myList);
			var maxWidth = Math.min(971, $(window).width() - 25);
			var maxHeight = $(window).height() - 25;
			myWrapper.dialog({ 
				stack: true, 
				zIndex: 200000, 
				modal: true, 
				width: maxWidth, 
				height: maxHeight, 
				title: 'Select a Design', 
				close: function(){
					$('.das_new_img').removeClass('das_new_img');
					$(this).dialog('destroy').remove();
				}
			});
			
			myWrapper.keypress(function(e){
				if (e.keyCode == $.ui.keyCode.ENTER) {
					mySubmit.click();
				}
			});
			
			mySubmit.button().click(function(event){				
				$('#'+toDiv).empty();
				var selected = myList.val();
				myWrapper.empty(); 
				myWrapper.append('Please wait, your design is being loaded');
				setTimeout(function(){runLoad(selected, myWrapper);}, 100);
			});
			
			$('.templatePicker_thumb').lazyload({
				effect: "fadeIn",
				container: ".das_imgPicker_container"
			});
			
			$('.das_templatePicker_container').css('height', $('#saveFiles').height()-45).trigger("scroll");
			
			templatePicker_onClick();
						
			function runLoad(selected, myDialog){
				var deserializer;
				var fitWidth;
				var fitHeight;
				
				fitWidth = $('#'+toDiv).width();
				fitHeight = $('#'+toDiv).height();
				// todo: move file location to php script
				var serializedData = Base64_to_HTML('../templates/' + selected + '/DAS.txt');
				
				deserializer = {decoded: false, noData: false};
				deserializer = Deserialize(toDiv, serializedData, true, selected, fitWidth, fitHeight, designer);
				if (deserializer.noData){
					alert("no Data received");
				}
				
				if(designer){
					// switch franchise selector the loaded design's franchise
					var franchise = $('#das_container_for_'+toDiv).attr('das_toolkit');
					var sizeID = $('#das_container_for_'+toDiv).attr('das_sizeID');
					$('option[value='+ franchise +']', $('#das_franchise')).attr('selected', 'selected');
					// change option size to correct
					$('#das_franchise').change();
					// update size
					$('option[value='+ sizeID + ']', $('#das_size')).attr('selected', 'selected');
					// design attributes

					$('.das_design_tag').each(function(){
						if($('#das_container_for_'+toDiv).hasClass($(this).val())){
							$(this).attr('checked', 'checked');
						} else {
							$(this).attr('checked', false);
						}
					});

				}
				
				myDialog.dialog('destroy').remove();
				
				fitWindow();
			};
		} else {
			var selected;
			selected = fileName;
			
			var deserializer;
			var fitWidth;
			var fitHeight;
			fitWidth = $('#'+toDiv).width();
			fitHeight = $('#'+toDiv).height();
			// todo: move file location to php script
			var serializedData = Base64_to_HTML('../templates/' + selected + '/DAS.txt');
			
			deserializer = {decoded: false, noData: false};
			deserializer = Deserialize(toDiv, serializedData, true, selected, fitWidth, fitHeight, designer);
			if (deserializer.noData){
				alert("no Data received");
			}
			
			fitWindow();
		}
	};
		
	Deserialize = function(toDiv, serializedData, edit, prodID, fitWidth, fitHeight, designer, hideMenu, encodedID){		
		prodID = prodID || toDiv;
		designer = designer || false;
		
		g_DaS_browser = getBrowser();
				
		var returnVal = false;
		var noData = false;
		
		$('#'+toDiv).css('width', fitWidth).css('height', fitHeight);
				
		// initialize div as DAS
		$('.das_container_for_'+toDiv+'_tipsy').remove();
		
		$('#product_thumbnail', $('#'+toDiv)).css('z-index', 100).css('position', 'absolute');
		
		$('#'+toDiv).append($('<div>').attr('id', 'das_temp_for_'+toDiv).css('z-index', '-1'));
		
		var myDesignHTML = $(serializedData);

		if(g_DaS_browser == 'IE'){
			//SEE OTHER IE_MUST COMMENT
			$('.text_container', myDesignHTML).each(function() {
				$(this).css('top', parseFloat($(this).css('top') + 20) + 'px').attr('das_ie_adjusted', 'true');
			});
		}
		
		// detect for Webkit only or IE only css syntax
		$('.das_text_element', myDesignHTML).each(function(){

			var hasWebkit = $(this).attr('style').indexOf('-webkit-transform') != -1;
			var hasDefault = $(this).attr('style').indexOf(' transform') != -1;
			
			if(hasWebkit && !hasDefault){
				var stretchX = $(this).attr('stretchx');
				var stretchY = $(this).attr('stretchy');
				var newStyle = $(this).attr('style')+' transform-origin: 0px 0px; transform: matrix('+stretchX+', 0, 0, '+stretchY+', 0, 0);';
				$(this).attr('style', newStyle);
			} else if(!hasWebkit && hasDefault){
				var stretchX = $(this).attr('stretchx');
				var stretchY = $(this).attr('stretchy');
				var newStyle = $(this).attr('style')+'-webkit-transform-origin: 0px 0px; -webkit-transform: scale('+stretchX+', '+stretchY+');';
				$(this).attr('style', newStyle);
			} else if(hasWebkit && hasDefault){
				//alert('has both');
			} else {
				//alert('has neither');
			}
		});
		
		var selected = $('.text_container', myDesignHTML).attr('das_toolkit');
		$('body').append($('<div>').attr('id', 'das_franchise_data').attr('franchise', selected));
		var fonts = franchise_fonts(selected);
		
		if(g_DaS_browser == 'IE'){
			$('.das_text_container', myDesignHTML).each(function(){
				var font_name = $('.das_text_element', $(this)).attr('font');
				var font_size = parseFloat($('.das_text_element', $(this)).css('font-size'));
				var font_mod = parseFloat($('.font_data_'+font_name, $('#franchise_fonts')).attr('ie_padding'));
				$(this).css('padding-top', font_size * font_mod).attr('das_ie_padding', font_size * font_mod);
			});
		}
		
		if(g_DaS_browser == 'Firefox'){			
			$('.das_text_element', myDesignHTML).each(function(){
				$(this).attr('wrap', 'off');
			});
		}
		
		$('#das_temp_for_'+toDiv).html(myDesignHTML);
		var currContentID = $('.das_container', $('#'+toDiv)).attr('content_id');
		$('.das_container_menu_wrapper').remove();
		$('.das_container', $('#'+toDiv)).css('z-index', '-1');
		
		// change all IDs to new Div
		var oldID = $('.das_container', $('#'+toDiv)).attr('id');
		var newID = 'das_container_for_'+toDiv;
		
		$('.das_container', $('#'+toDiv)).attr('id', newID).attr('content_id', toDiv);
		$('.das_content, .das_menu, .das_content_menu', $('#'+toDiv)).each(function(){
			var id = this.id;
			this.id = id.replace(oldID, newID);
		});
		
		// Get size data
		var containerSize = {};
		containerSize.width = $('#das_container_for_'+toDiv).css('width');
		containerSize.height = $('#das_container_for_'+toDiv).css('height');
		var sameSize = false;
		if (fitWidth == parseFloat(containerSize.width) && fitHeight == parseFloat(containerSize.height)){
			sameSize = true;
		}
		var elements = new Array();
		
		$('.das_resizable', $('#das_container_for_'+toDiv)).each(function(){
			var myElement = {}
			myElement.id = this.id;
			myElement.width = $('#'+this.id).css('width');
			myElement.height = $('#'+this.id).css('height');
			myElement.top = $('#'+this.id).position().top;
			myElement.left = $('#'+this.id).position().left;
			if($('#'+this.id).hasClass('text_container')){
				myElement.width = parseFloat(myElement.width) - 20;
				myElement.height = parseFloat(myElement.height) - 20;
			}
			elements.push(myElement);
		});
		
		var myHTML = $('#das_temp_for_'+toDiv).html();
		$('#das_temp_for_'+toDiv).remove();
		$('#'+toDiv).das(designer, hideMenu);
		$('#das_container_for_'+toDiv).remove();
		$('#'+toDiv).append($('<div>').attr('id', 'das_module').append(myHTML));
		$('#das_container_for_'+toDiv).css('z-index', 1);
		
		$('#das_container_for_'+toDiv).click(function(event){
			$('#das_container_for_'+toDiv+'_end_das_main').empty();
			$('#das_container_for_'+toDiv).scrollTop(0).scrollLeft(0);
		});
				
		if(edit == false){
			$('.template-change-design').prepend($('<a>').addClass('various').attr('href', '#').attr('id', 'das_edit_button').append('EDIT'));
			$('#das_edit_button').button().click(function(event){
				setTimeout(function(){
					var myHTML = $('#das_module').html();
					Deserialize('newDAS', myHTML, true, prodID, parseFloat(containerSize.width), parseFloat(containerSize.height));
					$('#das_container_for_newDAS').css({ transform: 'scale(1,1)'});
					$('#das_container_for_'+toDiv+'_menu_container', $('#das_container_for_newDAS')).show().css('left', containerSize.width).css('right', containerSize.height);
					$('#das_container_for_'+toDiv).css('visibility', 'hidden');
					$('.template-details-main').css('visibility', '');
				}, 500);
			});
		}
		$('#das_edit_button').fancybox({
			content:'<div id="newDAS" style="width:'+(parseFloat(containerSize.width)+200)+'px; height:'+containerSize.height+'"></div>'
			, onClosed: function(){
				var myHTML = $('#das_module', $('#newDAS')).html();
				$('.das_container').css('visibility', 'visible');
			}
		});
		// remove resizable handles from old div (these don't have events tied to them)
		$('.ui-resizable-handle', $('#'+toDiv)).remove();
		
		if(designer == true){
			$('#das_container_for_'+toDiv).addClass('design_mode');
			
			document.title = $('#das_container_for_'+toDiv).attr('das_template_name') || 'Oakley Sign';
		}
		
		// Only continue if edit is true
		if (edit){			
			// give the correct events to all elements
			$('.text_container', $('#'+toDiv)).each(function(){
				var textIDs = text_elements('das_container_for_'+toDiv, $(this).attr('myID'));
				var toolkit = $(this).attr('das_toolkit');
				$(this).text_functions('das_container_for_'+toDiv, toolkit);
				load_franchise_fonts(toolkit);
				$('.das_text_element', $(this)).removeAttr('readonly');
				$('.das_text_element', $(this)).attr('stretchx', $(this).attr('stretchx')).attr('stretchy', $(this).attr('stretchy'));
			});
			
			$('.das_img_container', $('#'+toDiv)).each(function(){
				$(this).img_functions('das_container_for_'+toDiv);
			});

			returnVal = true;
		} else {
			$('#das_container_for_'+toDiv+'_menu_container').hide();
			
			$('.das_text_element', $('#'+toDiv)).each(function(){
				$('#'+this.id).attr('readonly', 'readonly');
			});
			
			$('.das_container_for_'+toDiv+'_tipsy').remove();
			
			$('.das_draggable', $('#'+toDiv)).removeClass('ui-draggable');
			
			$('.das_resizable', $('#'+toDiv)).removeClass('ui-resizable');
			
			$('.ui-resizable-handle', $('#'+toDiv)).remove();
		}
				
		if(sameSize != true && (!$('#'+toDiv).hasClass('das_render'))){
			var myDivID = '#das_container_for_'+toDiv;
			if(designer !== true){
				var perWidth = fitWidth / parseFloat(containerSize.width);
				var perHeight = fitHeight / parseFloat(containerSize.height);
				var scale = Math.min(perWidth, perHeight);
				$(myDivID).attr('original_width', $(myDivID).css('width')).attr('original_height', $(myDivID).css('height'));
				$(myDivID).css({ transformOrigin: '0px 0px' });
				$(myDivID).css({ transform: 'scale('+scale+', '+scale+')' });
				$(myDivID).css('position', 'absolute');
			} else {
				// resize container to fit div
				$('#'+toDiv).css('width', parseFloat(containerSize.width)).css('height', parseFloat(containerSize.height));
				
				var menuHeight = Math.min($(window).height()-$('#'+toDiv).position().top - 10, $('#'+toDiv).height());
				
				$('#design_width').val(parseFloat(containerSize.width));
				$('#design_height').val(parseFloat(containerSize.height));
			}
		}
		
		if($('#'+toDiv).hasClass('das_render')){
			$('textarea').each(function(){
			  $(this).replaceWith($('<div>').append($(this).html()).attr('style', $(this).attr('style')));
			})
		}
		
		if(designer !== true){
			$('.text_container, .das_img_container', $('#'+toDiv)).each(function(){
				if(!$(this).hasClass('das_tag_visible')){
					$(this).css('visibility', 'hidden');
				}
				
				if(!$(this).hasClass('das_tag_moveable')){
					if($(this).hasClass('ui-draggable')){
						$(this).draggable('destroy');
					}
					$('.moveHandle', $(this)).css('visibility', 'hidden');
				}
				
				if(!$(this).hasClass('das_tag_editable')){
					$('input[type="text"], textarea', $(this)).attr('readonly','readonly');
				}
				
				if(!$(this).hasClass('das_tag_resizable') && $(this).hasClass('ui-resizable')){
					$(this).resizable('destroy');
				}
			});
			
			var DAS_checkboxes = $('input[type="checkbox"]', $('#addons-options'));
			var showTags = ['das_tag_realtor_logo', 'das_tag_mls_logo', 'das_tag_equal_opportunity'];
						
			for(var i=0; i < DAS_checkboxes.length; i++){
				$(DAS_checkboxes[i]).attr('das_chk_num', i).change(function(){
					if($(this).is(':checked')){
						$('.'+showTags[$(this).attr('das_chk_num')]).addClass('das_tag_visible').css('visibility', '');
					} else {
						$('.'+showTags[$(this).attr('das_chk_num')]).removeClass('das_tag_visible').css('visibility', 'hidden');
					}
				});
			}
			
			$('#das_main_menu').initializePermMenu(encodedID);
			
			var elementID = $($('.das_content .text_container')[0]).attr('myID');
			var dasID = $('.das_container').attr('id');
			$('#das_main_menu').initializeMainMenu(elementID, 'text', dasID);
		}
		
		$('.text_container').each(function(){
			if(typeof $(this).attr('stretchx') == 'undefined'){
				$(this).attr('stretchx', $('.das_text_element', $(this)).attr('stretchx'));
				$(this).attr('stretchy', $('.das_text_element', $(this)).attr('stretchy'));
			}
			
			if(typeof $('.das_text_element', $(this)).attr('das_max_font') == 'undefined'){
				$('.das_text_element', $(this)).attr('das_max_font', parseFloat($('.das_text_element', $(this)).css('font-size')));
			}
		});
		
		$('.das_text_element').each(function(){
			if(typeof $(this).attr('das_vert_align') == 'undefined'){
				$(this).attr('das_vert_align', $(this).css('vertical-align'));
			}
		});
		
		$('.das_text_container').each(function(){
			var textWidth = $('.das_text_element', $(this)).width();
			var textHeight = $('.das_text_element', $(this)).height();
			var scaleX = $('.das_text_element', $(this)).attr('stretchx');
			var scaleY = $('.das_text_element', $(this)).attr('stretchy');
			$(this).css('width', textWidth * scaleX).css('height', textHeight * scaleY);
		});
		
		$('.das_tag_can_substitute').each(function(){
			if(typeof $(this).attr('das_thumb_width') == 'undefined'){
				var imgWidth = $('.das_img', $(this)).width();
				var imgHeight = $('.das_img', $(this)).height();
				var thumbWidth;
				var thumbHeight;
				
				if(imgWidth >= imgHeight){
					thumbWidth = 200;
					thumbHeight = (200/imgWidth) * imgHeight;
				} else {
					thumbWidth = (200/imgHeight) * imgWidth;
					thumbHeight = 200;
				}
				
				$(this).attr('das_thumb_width', thumbWidth).attr('das_thumb_height', thumbHeight);
			}
		});
		
		return {decoded: returnVal, noData: noData};
	 };
	
	$.fn.loadTemplate = function(DivID, prodID, edit, width, height, designer, hideMenu, contextID){
		var prodID = prodID || this.attr('id');
		var designer = designer || false;
		var contextID = contextID || false;
		var serializedData;
		
		if (edit == "false"){
			edit = false;
		} else {
			edit = true;
		}
		
		if (hideMenu == "true"){
			hideMenu = true;
		} else {
			hideMenu = false;
		}
		
		if(contextID){
			var encoded = calcMD5(contextID);
			// todo: move file location to php script
			var myDir = '../users/'+encoded+'/designs/'+prodID;
			$.ajax({
				type:"GET",
				url: "/das/code/userfiles.php",
				data: { dir: myDir },
				async: false,
				/*url: "/das/code/load_template.php",
				data: { context: encoded, product: prodID },
				async: true,*/
				success: function(data){
					if(data){
						serializedData = Base64_to_HTML(myDir+'/DAS.txt');
					} else {
						serializedData = mkTemplateDir(encoded, prodID);
					}
				}
			});
		} else {
			serializedData = Base64_to_HTML('../templates/'+prodID+'/DAS.txt');
		}
		
		Deserialize(DivID, serializedData, edit, prodID, width, height, designer, hideMenu, encoded);
		
		function mkTemplateDir(contextID, prodID){
			var serializedData;
			
			$.ajax({
				type: "GET",
				url: "/das/code/userfiles.php",
				data: { makedir: '../users/'+contextID+'/'+prodID },
				async: false,
				/*url: "/das/code/load_template.php",
				data: { context: contextID, prod: prodID },
				async: true,*/
				success: function(data){
					$.ajax({
						type: "GET",
						url: "/das/code/userfiles.php",
						data: { src_dir: '../templates/'+prodID, dest: '../users/'+contextID},
						async: false,
						success: function(data){
							serializedData = Base64_to_HTML('../users/'+contextID+'/'+prodID+'/DAS.txt');
						},
						error: function(jqXHR, status, err){
							alert(status);
						}
					});
				},
				error: function(jqXHR, status, err){
					alert(status);
				}
			});
			
			return serializedData;
		}
	};
	
	function Base64_to_HTML(file){
		var returnVal = false;
		var noData = false;
		var myHTML;
		var myAjax = $.ajax({
			type: "POST",
			url: "/das/code/DAS_Serialization.php",
			data: { method: 'get', file: file, date: Date() },
			async: false,
			success: function(data){
				
				if (data.length==0){
					noData = true;
					return;
				}
				
				try{
					var warning = "<b>Warning</b>:  fopen() [<a href='function.fopen'>function.fopen</a>]: Filename cannot be empty in <b>";
					if (data.indexOf(warning) == -1){
						var serializedData = Base64.decode(data);
						myHTML = serializedData;
					} else {
						return;
					}
					
				} catch(err) {
					returnVal = false;
					return;
				}
			}
		});
		return myHTML;
	};
	
	$.fn.toolTip = function(control, container, menu, DAS, initialize, params){
		var myControl = control;
		var myContainer = container;
		var myMenu = menu;
		var myDAS = DAS;
		var myInitialize = initialize;
		var myParams = params;
			
		$('#'+myContainer).mouseenter(function(){
			if(!$('.'+myContainer).hasClass('menu_open')){
				myInitialize(myParams);
			}
		});
		
		$('#'+myContainer).mousedown(function(e){
			$('.'+myContainer).hide();
		});
		
		$('#'+myContainer).mouseleave(function(){
			if(!$('.'+myContainer).hasClass('menu_open')){
				var myTimer = setTimeout(function(){
					$('.'+myContainer).hide();
				}, 100);
				$('.tipsy').mouseenter(function(){
					clearTimeout(myTimer);
				});
			}
		});
				
		$('#'+myContainer).mouseup(function(){
			myInitialize(myParams);
		});
	};

	$.fn.getTextWidth = function(){
    var spanText = $("BODY #spanCalculateTextWidth");

    if (spanText.size() <= 0) {
      spanText = $("<span id='spanCalculateTextWidth' wrap='off' style='filter: alpha(0); white-space: nowrap;'></span>");
      spanText.appendTo("BODY");
    }

    var valu = this.val();
    if (!valu) valu = this.text();

    spanText.text(valu);

    spanText.css({
      "fontSize": this.css('fontSize'),
      "fontWeight": this.css('fontWeight'),
      "fontFamily": this.css('fontFamily'),
      "fontStyle": this.css('fontStyle'),
      "letter-spacing": this.css('letter-spacing'),
      "position": "absolute",
      "top": 0,
      "opacity": 0,
      "left": -2000,
      "z-index": -1
    });

		//console.log((spanText.outerWidth() + parseInt(this.css('paddingLeft'))) + 'px');
    return (spanText.outerWidth() + parseInt(this.css('paddingLeft'))) + 'px';
  };

  $.fn.getTextHeight = function(width){
    var spanText = $("BODY #spanCalculateTextHeight");

    if (spanText.size() <= 0) {
      spanText = $("<span id='spanCalculateTextHeight' wrap='off' style='filter: alpha(0); white-space: nowrap;'></span>");
      spanText.appendTo("BODY");
    }

    var valu = this.val();
    if (!valu) valu = this.text();

    spanText.text(valu);
    
    spanText.css({
      "fontSize": this.css('fontSize'),
      "fontWeight": this.css('fontWeight'),
      "fontFamily": this.css('fontFamily'),
      "fontStyle": this.css('fontStyle'),
      "letter-spacing": this.css('letter-spacing'),
      "top": 0,
      "left": -1 * parseInt(width) + 'px',
      "position": 'absolute',
      "display": "inline-block",
      "width": width,
      "z-index": -1
    });

		//console.log('Height: '+spanText.innerHeight() + 'px');
		//console.log('Font Size: '+this.css('fontSize'));
		
    return spanText.innerHeight() + 'px';
  };

  $.fn.autoTextSize = function(resizable, minSize, maxSize, truncate){
		var _self = this;
		var _containerWidth = _self.parents('.text_container').width();
		var _containerHeight = _self.parents('.text_container').height();
		var _width = _self.innerWidth();
		var _height = _self.innerHeight();
		var _textWidth = parseInt(_self.getTextWidth());
		var _textHeight = parseInt(_self.getTextHeight(_textWidth));
		var _fontSize = parseInt(_self.css('font-size'));
		var originalFontSize = _fontSize;
		var minSize = minSize || 0;
		var maxStretchX = 1;
		var maxStretchY = 1;		
		
		if(! _self.parents('.text_container').hasClass('das_tag_max_scale')){
			var maxSize = maxSize || 350;
			
			var maxStretchX = _self.attr('stretchx') || 1;
			var maxStretchY = _self.attr('stretchy') || 1;			
		} else {
			var maxSize = maxSize || $(this).attr('das_max_font') || 350;
		}
		
		function verticalAlign(){
			var vAlign = _self.attr('das_vert_align');
			
			switch(vAlign){
				case 'middle':
					var vOffset = (_self.height() - _textHeight)/2;
					_self.css('padding-top', vOffset);
					break;
				case 'bottom':
					var vOffset = (_self.height() - _textHeight);
					_self.css('padding-top', vOffset);
					break;
			}
		}
		
		function resize_font(font_offset){
			_maxFontHeight = _self.attr('das_temp_max_font_height') || 350;
			_fontSize += font_offset;
			_self.css('font-size', Math.min(_fontSize, _maxFontHeight) + 'px');
			_textWidth = parseInt(_self.getTextWidth());
			_textHeight = parseInt(_self.getTextHeight(_textWidth));
			
			verticalAlign();
			
			if (_fontSize >= _maxFontHeight){
				return false;
			} else {
				return true;
			}
		}
		
		if(resizable){
			if(_width > _textWidth){
				while (_width > _textWidth && (_fontSize < parseInt(maxSize))) {
					if (minSize && _fontSize >= parseInt(minSize)) break;
					
					_fontSize++;
					_self.css('font-size', _fontSize + 'px');
					
					_textWidth = parseInt(_self.getTextWidth());
				}
			} else if(_width < _textWidth){
				while (_width < _textWidth && (_fontSize > parseInt(minSize))) {
					if (minSize && _fontSize <= parseInt(minSize)) break;
					
					_fontSize--;
					_self.css('font-size', _fontSize + 'px');
					
					_textWidth = parseInt(_self.getTextWidth());
				}
			}
		} else {
			if(_self.attr('das_temp_max_font_height')){
				if(_self.attr('das_temp_max_container_height') != _containerHeight){
					_self.attr('das_temp_max_font_height', '');
					var curr_font_size = parseInt(_self.css('font-size'));
				
					while(_textHeight * maxStretchY < _containerHeight){
						resize_font(1);
					}
					
					while(_textHeight * maxStretchY > _containerHeight){
						resize_font(-1);
					}
					
					_self.addClass('das_temp_vars');
					_self.attr('das_temp_max_font_height', parseInt(_self.css('font-size')));
					_self.attr('das_temp_max_container_height', _containerHeight);
					_self.css('font-size', curr_font_size);
					_textWidth = parseInt(_self.getTextWidth());
					_textHeight = parseInt(_self.getTextHeight(_textWidth));
				}
			} else {
				var curr_font_size = parseInt(_self.css('font-size'));
				
				while(_textHeight * maxStretchY < _containerHeight){
					resize_font(1);
				}
				
				while(_textHeight * maxStretchY > _containerHeight){
					resize_font(-1);
				}
				
				_self.addClass('das_temp_vars');
				_self.attr('das_temp_max_font_height', parseInt(_self.css('font-size')));
				_self.attr('das_temp_max_container_height', _containerHeight);
				_self.css('font-size', curr_font_size);
				_textWidth = parseInt(_self.getTextWidth());
				_textHeight = parseInt(_self.getTextHeight(_textWidth));
			}
			
			if(_textWidth * maxStretchX > _containerWidth){
				// todo: check class of element before stretching
				if(_self.parents('.text_container').hasClass('das_tag_scale')){
					while (_textWidth * maxStretchX > _containerWidth){
						if(minSize && _fontSize <= parseInt(minSize)){
							break;
						}
						
						resize_font(-1);
					}					
					
					if(minSize && _fontSize <= parseInt(minSize)){
						if( typeof _self.attr('das_ie_padding') != 'undefined'){
							_self.css('padding-top', _self.attr('das_id_padding'));
						} else {
							_self.css('padding-top', '');
						}
					}
					
					while(_textHeight > _containerHeight){
						if(minSize && _fontSize <= parseInt(minSize)){
							if(_fontSize < parseInt(minSize)){
								resize_font(1);
							}
							break;
						}
						
						resize_font(-1);
					}
				} else if(_self.parents('.text_container').hasClass('das_tag_overflow_none')){
					_self.addClass('das_text_is_overflow').parents('.text_container').addClass('das_text_is_overflow');
					$('.das_text_val', $('#das_element_menu_'+_self.attr('myid'))).addClass('das_text_is_overflow');
				} else {
					var scaleX = _containerWidth / _textWidth;
					var scaleY = _height / _textHeight;
					
					// make self squish to fit in container
					if(g_DaS_browser == 'IE'){
						_self.css('width', _textWidth + 1);
					} else {
						_self.css('width', _textWidth);	
					}
					
					_self.css({transformOrigin: '0px 0px'});
					if(g_DaS_browser != 'Chrome'){
						_self.css('transform', 'matrix('+scaleX+', 0, 0, '+scaleY+', 0, 0)');
					} else {
						_self.css({scale: [scaleX, scaleY]});
					}
					
					_self.attr('stretchx', scaleX).attr('stretchy', scaleY);
					
					setTimeout(function(){
						_self.css('width', width);
					}, 0);

				}
			} else {
				if(g_DaS_browser == 'IE'){
					_self.css('width', _width + 1);
					setTimeout(function(){
						_self.css('width', _width);
					}, 0);
				}
				if(_self.parents('.text_container').hasClass('das_tag_scale')){
					while (_textWidth * maxStretchX < _containerWidth){
						if(maxSize && _fontSize >= parseInt(maxSize)){
							break;
						}
						
						if(! resize_font(1)){
							break;
						}
					}
					
					if(_textWidth * maxStretchX > _containerWidth){
						resize_font(-1);	
					}
					
					while(_textHeight > _containerHeight){
						resize_font(-1);
					}
					
					if(maxSize && _fontSize >= parseInt(maxSize)){
						if( typeof _self.attr('das_ie_padding') != 'undefined'){
							_self.css('padding-top', _self.attr('das_id_padding'));
						} else {
							_self.css('padding-top', '');
						}
					}
				} else if(_self.parents('.text_container').hasClass('das_tag_overflow_none')){
					_self.removeClass('das_text_is_overflow').parents('.text_container').removeClass('das_text_is_overflow');
					$('.das_text_val', $('#das_element_menu_'+_self.attr('myid'))).removeClass('das_text_is_overflow');
				} else {
					var width = _containerWidth / maxStretchX;
					if(g_DaS_browser == 'IE'){
						_self.css('width', (width + 1));
					} else {
						_self.css('width', width);
					}
					
					if(g_DaS_browser != 'Chrome'){
						_self.css('transform', 'matrix('+maxStretchX+', 0, 0, '+maxStretchY+', 0, 0)');
					} else {
						_self.css({scale: [maxStretchX, maxStretchY]});
					}
					
					_self.attr('stretchx', maxStretchX).attr('stretchy', maxStretchY);
					
					setTimeout(function(){
						_self.css('width', _self.parents('.text_container').width() / maxStretchX);
					}, 0);
				}
			}
						
			// send text size back to menu control
			if(originalFontSize != _fontSize){
				var myDaSID = $(this).attr('id').replace('_das_textSpan_'+$(this).attr('myID'), '');
				var myODaSID = myDaSID.replace('das_container_for_', '');
				var textIDs = text_elements(myDaSID, $(this).attr('myID'));
				var menuIDs = das_elements(myODaSID);
				$('#'+textIDs.myTextSize).val(_fontSize);
				$('#'+menuIDs.myTextIDs.myTextSize).val(_fontSize);
			}
		}
		
		if (truncate) _self.autoTruncateText();
		if (resizable) FitToContent(this.attr('id'));
  };

  $.fn.autoTruncateText = function(){
    var _self = this,
        _width = _self.outerWidth(),
        _textHeight = parseInt(_self.getTextHeight(_width)),
        _text = _self.text();

    // As long as the height of the text is higher than that
    // of the container, we'll keep removing a character.
    while (_textHeight > _self.outerHeight()) {
      _text = _text.slice(0,-1);
      _self.text(_text);
      _textHeight = parseInt(_self.getTextHeight(_width));
      _truncated = true;
    }

    // When we actually truncated the text, we'll remove the last
    // 3 characters and replace it with '...'.
    if (!_truncated) return;
    _text = _text.slice(0, -3);

    // Make sure there is no dot or space right in front of '...'.
    var lastChar = _text[_text.length - 1];
    if (lastChar == ' ' || lastChar == '.') _text = _text.slice(0, -1);
    _self.text(_text + '...');
  };
  
  var Base64 = {
 
		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	 
		// public method for encoding
		encode : function (input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
	 
			input = Base64._utf8_encode(input);
	 
			while (i < input.length) {
	 
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
	 
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
	 
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}
	 
				output = output +
				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
	 
			}
	 
			return output;
		},
	 
		// public method for decoding
		decode : function (input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
	 
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	 
			while (i < input.length) {
	 
				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));
	 
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
	 
				output = output + String.fromCharCode(chr1);
	 
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}
	 
			}
	 
			output = Base64._utf8_decode(output);
	 
			return output;
	 
		},
	 
		// private method for UTF-8 encoding
		_utf8_encode : function (string) {
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
	 
			for (var n = 0; n < string.length; n++) {
	 
				var c = string.charCodeAt(n);
	 
				if (c < 128) {
					utftext += String.fromCharCode(c);
				}
				else if((c > 127) && (c < 2048)) {
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				}
				else {
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
	 
			}
	 
			return utftext;
		},
	 
		// private method for UTF-8 decoding
		_utf8_decode : function (utftext) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;
	 
			while ( i < utftext.length ) {
	 
				c = utftext.charCodeAt(i);
	 
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
	 
			}
	 
			return string;
		}
	};
  
  var g_DaS_loadedFonts = new Array();
  
  function loadFonts(FontArr){
	  try {
		  var Fonts = FontArr;
			
			function loadWebFont(font){
				if(g_DaS_loadedFonts.indexOf(font) != -1){
					return false;
				}
				
				g_DaS_loadedFonts.push(font);
				
				WebFont.load({
					custom: { 
						families: [font],
						urls: [ '/das/fonts/'+font+'/stylesheet.css?'+das_version ] 
					},
					fontactive: function(fontFamily, fontDescription){
						$('.das_text_element').each(function(){
							var elementID = this.id;
							var end = elementID.lastIndexOf('_das');
							var dasID = elementID.substr(0, end);
							var textIDs = text_elements(dasID, $('#'+this.id).attr('myid'));
							if($(this).css('font-family') == fontFamily){
								$('#'+this.id).autoTextSize($('#'+textIDs.myTextContainer).hasClass('das_tag_resizable'));
							}
						});
						
						if(allFontsActive()){
							$('#product_thumbnail', $('.das')).css('z-index', -1000).css('display', 'none');
							$('.load_notifier').css('display', 'none');
						}
					},
					fontinactive: function(fontFamily, fontDescription) {
						setTimeout(function(){loadWebFont(font);}, 200);
					}
				});
			}
			
			for(var i=0; i<Fonts.length; i++){
				loadWebFont(Fonts[i]);
			}
		} catch(err) {
			//console.debug(err.message);
			$('.load_notifier').css('display', 'none');
		}
  };
  
  function allFontsActive(toDiv){
	  var FontArray = new Array();
	  $('.das_text_element').each(function(){
		  if($.inArray($(this).css('font-family'), FontArray) == -1){
			  FontArray.push($(this).css('font-family'));
		  }
	  });
	  
	  for(var i=0; i<FontArray.length; i++){
		  var myFont = FontArray[i].toLowerCase();
		  myFont = myFont.replace(/_/g, '');
		  if($('.wf-'+myFont+'-n4-active').length==0){
				return false;
		  }
	  }
	  
	  return true;
  };
  
  dGetLayers = function(){
  	return GetLayers();
  };
  
  dMoveElement = function(param, dir){
  	return MoveElement(param, dir);
	};
  
  function GetLayers(){
	  var layers = $('.das_img_container:not(.inBackground), .text_container');
	  var arrLayers = new Array();
	  layers.each(function(){
		  arrLayers[$(this).attr('das_layer')-1] = this.id;
	  });
	  
	  return arrLayers;
  };
  
  function MoveElement(layer, dir, bg){
	  if(bg){
			$('.inBackground', $('.das_container')).each(function(){
				// bump all elements up a layer
				$('.das_img_container:not(.inBackground), .text_container').each(function(){
					var currentLayer = $(this).attr('das_layer');
					$(this).attr('das_layer', currentLayer+1);
				});
				// change current background to layer 1
				$(this).attr('das_layer', 1).removeClass('inBackground');
			});
			
			// bump all elements above this layer down 1
			var myLayers = GetLayers();
			var myElement = myLayers[layer-1];
			
			for(var i=layer-1; i < myLayers.length; i++){
				myLayers[i] = myLayers[i+1];
			}
			
			myLayers.splice(myLayers.length-1, 1);
			
			for(var i=0; i<myLayers.length; i++){
				$('#'+myLayers[i]).attr('das_layer', i+1);
			}
			
			$('#'+myElement).addClass('inBackground').attr('das_layer', 0).css('z-index', 0);
		} else {	  
			dir = dir / Math.abs(dir) || 1;
			var myLayers = GetLayers();
			var myElement = myLayers[layer-1];
			
			for(var i=(layer-1); i>=0 && i<myLayers.length; i+=dir){
				myLayers[i] = myLayers[i + dir];
			}
			
			if(dir > 0){
				myLayers[myLayers.length-1] = myElement;
			} else {
				myLayers[0] = myElement;
			}
			
			for(var i=0; i<myLayers.length; i++){
				$('#'+myLayers[i]).attr('das_layer', i+1).css('z-index', i+1);
			}
		}
  };
  
  mainMenu_elements = function(){
	  var elements = {};
	  elements.textVal = "das_text_val";
	  elements.textSizeContainer = "das_text_size_container";
	  elements.textSize = "das_text_size";
	  elements.textSizeInput = "das_text_size_input";
	  elements.textSizeInputbox = "das_text_size_inputbox";
	  elements.textSizeList = "das_text_size_list";
	  elements.textSizeListItem = "das_text_size_list_item";
	  elements.textFont = "das_text_font";
	  elements.textSelectedFont = "das_text_font_selected";
	  elements.textFontOptions = "das_text_font_options";
	  elements.moveUp = "das_move_up";
	  elements.moveRight = "das_move_right";
	  elements.moveDown = "das_move_down";
	  elements.moveLeft = "das_move_left";
	  elements.alignLeft = "das_align_left";
	  elements.alignCenter = "das_align_center";
	  elements.alignRight = "das_align_right";
	  elements.alignTop = "das_align_top";
	  elements.alignMiddle = "das_align_middle";
	  elements.alignBottom = "das_align_bottom";
	  elements.mkBkgrnd = "das_background_img";
	  elements.textColorHolder = "das_text_color_holder";
	  elements.textColorSelector = "das_text_color_selector";
	  elements.textBgColorSelector = "das_text_background_color_selector";
	  elements.dasBGColorSelector = "das_change_background_color_selector_txt";
	  elements.dasBGColorSelectorImg = "das_change_background_color_selector_img";
	  elements.imgFullSize = "das_img_full_size";
	  elements.remove = "das_text_remove";
	  elements.chngBkgndColor = "das_chng_bknd_color";
	  elements.bringFront = "das_btf";
	  elements.sendBack = "das_stb";
	  elements.rotatecw = "das_rotate_cw";
	  elements.rotateccw = "das_rotate_ccw";
	  elements.imgReplace = "das_img_replace";
	  elements.imgThumb = "das_img_thumb";
	  elements.imgThumbContainer = "das_img_thumb_container";
	  elements.imgThumbMask = "das_img_thumb_mask";
	  elements.imgName = "das_img_name";
	  return elements;
  };
  
  permMenu_elements = function(){
	  var elements = {};
	  elements.addText = "das_add_text";
	  elements.addImg = "das_add_img";
	  elements.uploadImg = "das_upload_img";
	  elements.save = "das_save";
	  elements.preview = "das_preview";
	  elements.chngBkgrnd = "das_change_background";
	  elements.chkRealtor = "das_checkbox_realtor";
	  elements.chkMLS = "das_checkbox_mls";
	  elements.chkEq = "das_checkbox_equal";
	  return elements;
  };
  
  $.fn.initializeMainMenu = function(elementID, elementType, dasContainerID, toolkit, designer){
		var designer = designer || false;
		var menuIDs = mainMenu_elements();
		var scope = $(this);
		
		var perm_menuIDs = designPermMenu_elements();
		var myFranchise = toolkit || $('#'+perm_menuIDs.franchise).find(":selected").val();
		
		$(this).attr('linked_element_ID', elementID);
		
		if(elementType == "text"){
			var elementIDs = text_elements(dasContainerID, elementID);
			var menuTemplate = $('<div>').append($('#das_text_menu').html());
			
			$('.das_text_color_holder', menuTemplate).attr('id', 'das_text_color_holder_' + elementIDs.myID);
			$('.das_text_color_selector', menuTemplate).attr('id', 'das_text_color_selector_' + elementIDs.myID);
			$('.das_text_background_color_selector', menuTemplate).attr('id', 'das_text_background_color_selector_' + elementIDs.myID);
			$('.das_change_background_color_selector_txt', menuTemplate).attr('id', 'das_change_background_color_selector_txt_' + elementIDs.myID);
			$('.das_text_scale', menuTemplate).attr('id', 'das_text_scale_'+elementIDs.myID);
			$('input', $('.das_text_scale', menuTemplate)).each(function(){
				$(this).attr('name', 'das_text_scale_'+elementIDs.myID);
				$(this).attr('id', 'das_text_scale_'+elementIDs.myID+$(this).attr('myNum'));
			});
			$('label', $('.das_text_scale', menuTemplate)).each(function(){
				$(this).attr('for', 'das_text_scale_'+elementIDs.myID+$(this).attr('myNum'));
			});
			
			$('#das_menu_type').html("TEXT FIELD");
		} else if(elementType == "image"){
			var elementIDs = Img_Elements(dasContainerID, elementID);
			var menuTemplate = $('<div>').append($('#das_img_menu').html());
			
			$('.das_img_full_size', menuTemplate).attr('id', 'das_img_full_size_'+elementIDs.myID);
			$('.das_img_width', menuTemplate).attr('id', 'das_img_width_'+elementIDs.myID);
			$('.das_img_height', menuTemplate).attr('id', 'das_img_height_'+elementIDs.myID);
			
			$('#das_menu_type').html("IMAGE");
		}
		
		$('.das_element_menu').css('display', 'none');
		
		if($('#das_element_menu_'+elementIDs.myID).length == 0){			
			var element_menu = $('<div>').attr('id', 'das_element_menu_'+elementIDs.myID).addClass('das_element_menu').append(menuTemplate.html());
			$(scope).append(element_menu);
			
			var menu_scope = $('#das_element_menu_'+elementIDs.myID);
			if ($('#'+elementIDs.myDivID).hasClass('inBackground')) {
				menu_scope.css('display', 'none');
			}
			
			if($('#'+elementIDs.myTextContainer).hasClass('das_tag_removable') && $('.das_container').hasClass('das_tag_removable')){
		  	$('.'+menuIDs.remove, $(menu_scope)).css('display', '');
	  	} else {
	  		$('.'+menuIDs.remove, $(menu_scope)).css('display', 'none');	
	  	}
			
			$('.'+menuIDs.remove, $(menu_scope)).click(function(event){
				$('#'+elementIDs.myMenuEnd).css('display', 'none');
				$('#'+elementIDs.myTextContainer).remove();
				$('#'+elementIDs.myDivID).remove();
				$('#das_element_menu_'+elementIDs.myID).remove();
			});
			
			if(elementType == "text"){
				$('.das_side_menu').scroll(function(){
					var myTop = $('.'+menuIDs.textSelectedFont, menu_scope).offset().top - ($('.das_menu').offset().top - 18);
					$('.'+menuIDs.textFontOptions, menu_scope).css('top', myTop);
				});
				
				// Text Value Setup
				var oTxtVal = $('.'+menuIDs.textVal, menu_scope);
				oTxtVal.val($('#'+elementIDs.myTextSpan).val());
				oTxtVal.focus(function() { setTimeout(function() { if ($('#'+elementIDs.myTextContainer).hasClass('das_tag_editable')) { oTxtVal.select(); } $('#'+elementIDs.myTextContainer).text_border();}, 0); });

				oTxtVal.keyup($.debounce(80, function(){
					if($('#'+elementIDs.myTextContainer).hasClass('das_tag_uppercase')){
						$(this).val($(this).val().toUpperCase());
					}
					writeText(elementIDs.myTextSpan, this.value, undefined, undefined, undefined, undefined, undefined, true);
				  $('#'+elementIDs.myTextSpan).keyup();
					das_modify_design(true);
				}));
				
				$('#'+elementIDs.myTextSpan).keyup(function(){
					if (oTxtVal.val() != $(this).val()) {
						oTxtVal.val($(this).val());
					}
				});
				
				function initializeFontSize(){
					// Text Size Setup
					var options = new Array(8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 54, 60, 72, 84, 96, 108, 126, 144, 162, 175, 200, 225, 250, 275, 300, 325, 350);
					
					var font_size = Math.round(parseFloat($('#'+elementIDs.myTextSpan).css('font-size')), 0);
					
					$('.'+menuIDs.textSizeList, $(menu_scope)).empty();
					
					for (var i=0; i<options.length; i++){
						$('.'+menuIDs.textSizeList, $(menu_scope)).append($('<div>').attr('value', options[i]).addClass('das_text_size_list_item').append(options[i]));
					}
					
					$('.'+menuIDs.textSize, $(menu_scope)).empty().button({icons: {secondary: "ui-icon-triangle-1-s"}, label: font_size});
					
					$('.'+menuIDs.textSizeInputbox, menu_scope).val(font_size);
					
					$('.'+menuIDs.textSize, $(menu_scope)).click(function(event){
						font_size = parseFloat($('#'+elementIDs.myTextSpan).css('font-size'));
						
						das_clickHandler(event);
						
						$('.'+menuIDs.textSizeList, menu_scope).css('display', '');
						
						$('.'+menuIDs.textSizeInputbox, menu_scope).val(font_size);
					});
					
					$('.'+menuIDs.textSizeInput, menu_scope).click(function(event){
						das_clickHandler(event);
					});
					
					$('.'+menuIDs.textSizeInputbox, menu_scope).keyup(function(e){
						changeFontSize(parseFloat($(this).val()));
						$('.'+menuIDs.textSizeList, menu_scope).css('display', 'none');
					});
					
					$('.'+menuIDs.textSizeListItem, $(menu_scope)).click(function(event){
						changeFontSize($(this).attr('value'));
					});
				};
				
				function changeFontSize(size){
					$('#'+elementIDs.myTextSpan).css('font-size', size);
					if($('#'+elementIDs.myTextContainer).hasClass('das_tag_resizable')){
						$('#'+elementIDs.myTextSpan).fit_to_content(elementIDs.myTextContainer);
					}
					$('.'+menuIDs.textSize, menu_scope).button('option', 'label', size);
					$('.'+menuIDs.textSizeInputbox, menu_scope).val(size);
				};
				
				initializeFontSize();
				
				$('#'+elementIDs.myTextContainer).on("resizestop", function(){
					initializeFontSize();
				});
				
				// todo: on resize if the element is tagged as center, right, middle and/or bottom then the element needs to be adjusted
				
				// Text Font Setup
				var fonts = franchise_fonts(myFranchise);
				var curr_font = $('#'+elementIDs.myTextSpan).css('font-family');
				var myText = $('#'+elementIDs.myTextSpan).val();
				
				$('.'+menuIDs.textSelectedFont, menu_scope).html(myText).css('font-family', curr_font);
				$('.'+menuIDs.textFontOptions, menu_scope).empty();
				for(var i=0; i<fonts.length; i++){
					$('.'+menuIDs.textFontOptions, menu_scope).append($('<div>').attr('value', fonts[i][0]).attr('id', fonts[i][0] + '_' + elementIDs.myID).attr('original-title', fonts[i][1]).addClass("das_menu_font_select das_menu_font_option").css('font-family',fonts[i][0]).html(myText).attr('das_bold_avail', fonts[i][3]).attr('das_italic_avail', fonts[i][4]).html(fonts[i][1]));
					
					if(curr_font == fonts[i][0]){
						if(fonts[i][3]){
							$('.das_text_bold', menu_scope).css('display', '');
						} else {
							$('.das_text_bold', menu_scope).css('display', 'none');
						}
						
						if(fonts[i][4]){
							$('.das_text_italic', menu_scope).css('display', '');
						} else {
							$('.das_text_italic', menu_scope).css('display', 'none');
						}
					}
				}
				
				$('.'+menuIDs.textSelectedFont, menu_scope).html($('#'+elementIDs.myTextSpan).attr('font'));
				
				$('.'+menuIDs.textSelectedFont, menu_scope).click(function(event){
					das_clickHandler(event);
					var myTop = $(this).offset().top;
					$('.'+menuIDs.textFontOptions, menu_scope).css('top', myTop).show(100);
				});
				
				$('.das_menu_font_option', menu_scope).hover(function(){
					$('#'+elementIDs.myTextSpan).attr('das_bold', $('#'+elementIDs.myTextSpan).css('font-weight'));
					$('#'+elementIDs.myTextSpan).attr('das_italic', $('#'+elementIDs.myTextSpan).css('font-style'));
					$('#'+elementIDs.myTextSpan).css('font-family', $(this).attr('value')).css('font-weight', '').css('font-style', '');
					if($('#'+elementIDs.myTextContainer).hasClass('das_tag_resizable')){
						FitToContent(elementIDs.myTextSpan);
					}
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				}, function(){
					var elementBold = $('#'+elementIDs.myTextSpan).attr('das_bold');
					var elementItalic = $('#'+elementIDs.myTextSpan).attr('das_italic');
					$('#'+elementIDs.myTextSpan).css('font-family', curr_font).css('font-weight', elementBold).css('font-style', elementItalic);
					if($('#'+elementIDs.myTextContainer).hasClass('das_tag_resizable')){
						FitToContent(elementIDs.myTextSpan);
					}
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('.das_menu_font_option', menu_scope).click(function(event){
					das_clickHandler(event);
					$('#'+elementIDs.myTextSpan).css('font-family', $(this).attr('value')).css('font-weight', '').css('font-style', '').attr('das_bold', '').attr('das_italic', '').attr('font', $(this).attr('original-title'));
					$('.das_text_font_selected', menu_scope).html($(this).attr('original-title'));
					if($('#'+elementIDs.myTextContainer).hasClass('das_tag_resizable')){
						FitToContent(elementIDs.myTextSpan);
					}
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
					curr_font = $(this).attr('value');
					$('.'+menuIDs.textSelectedFont, menu_scope).css('font-family', $(this).attr('value'));
					$('.'+menuIDs.textFontOptions, menu_scope).hide(100);
					
					if($(this).attr('das_bold_avail') == 'false'){
						$('#das_text_bold_'+elementIDs.myID+'_button').css('display', 'none');
					} else {
						$('#das_text_bold_'+elementIDs.myID+'_button').css('display', '');
					}
					
					if($(this).attr('das_italic_avail') == 'false'){
						$('#das_text_italic_'+elementIDs.myID+'_button').css('display', 'none');
					} else {
						$('#das_text_italic_'+elementIDs.myID+'_button').css('display', '');
					}
					
					$('#das_text_bold_'+elementIDs.myID).attr('checked', false).button('refresh');
					$('#das_text_italic_'+elementIDs.myID).attr('checked', false).button('refresh');
				});
				
				$('.das_font_options', menu_scope).attr('id', 'das_font_options_' + elementIDs.myID);
				
				$('.das_font_option', menu_scope).each(function(){
					$(this).attr('id', $(this).attr('id') + elementIDs.myID);
				});
				
				$('label', $('#das_font_options_'+elementIDs.myID)).each(function(){
					$(this).attr('for', $(this).attr('for') + elementIDs.myID);
					$(this).attr('id', $(this).attr('for') + '_button');
				});
				
				$('#das_font_options_'+elementIDs.myID).buttonset();
				
				$('#das_text_bold_'+elementIDs.myID+'_button').click(function(event){
					if($('#'+elementIDs.myTextSpan).css('font-weight') != 'bold'){
						$('#'+elementIDs.myTextSpan).css('font-weight', 'bold');
					} else {
						$('#'+elementIDs.myTextSpan).css('font-weight', '');
					}
					
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('#das_text_italic_'+elementIDs.myID+'_button').click(function(event){
					if($('#'+elementIDs.myTextSpan).css('font-style') != 'italic'){
						$('#'+elementIDs.myTextSpan).css('font-style', 'italic');
					} else {
						$('#'+elementIDs.myTextSpan).css('font-style', '');
					}
					
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('.das_font_tracking_less', menu_scope).button({icons: {primary: "ui-icon-arrow-1-w"}, text: false});
				$('.das_font_tracking_reset', menu_scope).button({icons: {primary: "ui-icon-cancel"}, text: false});
				$('.das_font_tracking_more', menu_scope).button({icons: {primary: "ui-icon-arrow-1-e"}, text: false});
				
				$('.das_font_tracking_btn', $('.das_font_tracking')).css('width', 'auto');
				
				$('.das_font_tracking_less', menu_scope).click(function(event){
					var spacing = parseFloat($('#'+elementIDs.myTextSpan).css('letter-spacing')) - 1 || -1;
					$('#'+elementIDs.myTextSpan).css('letter-spacing', spacing);
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('.das_font_tracking_reset', menu_scope).click(function(event){
					$('#'+elementIDs.myTextSpan).css('letter-spacing', 0);
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('.das_font_tracking_more', menu_scope).click(function(event){
					var spacing = parseFloat($('#'+elementIDs.myTextSpan).css('letter-spacing')) + 1 || 1;
					$('#'+elementIDs.myTextSpan).css('letter-spacing', spacing);
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('.das_text_scale', menu_scope).buttonset();
				$('.das_text_scale', menu_scope).click(function(event){
					// if scale button is clicked then re-initialize text box for scale
					if($('#das_text_scale_'+elementIDs.myID+' :radio:checked').attr('mynum') == 1){
						makeResizable(dasContainerID, elementIDs.myID, true);
					} else {
						makeResizable(dasContainerID, elementIDs.myID, false);
					}
				});
				
				$('.ui-button-text', $('.das_font_options')).css('font-size', '8pt');
				
				$(window).click(function(event){
					$('#'+elementIDs.myTextSpan).css('font-family', curr_font);
					$('.'+menuIDs.textFontOptions, menu_scope).hide(100);
					$('.'+menuIDs.textSizeList, menu_scope).hide(0);
				});
								
				// Text Color Setup
				if($('#'+elementIDs.myTextContainer).hasClass('das_tag_chngColor')){
				
					var textColor = $('#'+elementIDs.myTextSpan).css('color');
					var bgColor = $('#'+elementIDs.myTextSpan).css('background-color');
					
					$('.'+menuIDs.textColorHolder, menu_scope).css('display', '');
					$('.das_text_color_heading', menu_scope).css('display', '');
					
					$('.'+menuIDs.textColorSelector, menu_scope).empty();
					createColorPicker(menuIDs.textColorSelector+'_'+elementIDs.myID, menuIDs.textColorHolder+'_'+elementIDs.myID, textColor, elementIDs.myTextSpan, 'color', elementIDs.myDASID, myFranchise);
					
					$('.'+menuIDs.textBgColorSelector, menu_scope).empty();
					createColorPicker(menuIDs.textBgColorSelector+'_'+elementIDs.myID, menuIDs.textColorHolder+'_'+elementIDs.myID, bgColor, elementIDs.myTextSpan, 'background-color', elementIDs.myDASID, myFranchise);
				} else {
					$('.das_text_color', menu_scope).css('display', 'none');
					$('.ui-accordion-header-active', menu_scope).removeClass('ui-accordion-header-active');
				}
				
				if(!$('.das_container').hasClass('das_tag_bgColor')){
					$('.das_text_bgColor_heading', menu_scope).css('display', 'none');
				} else {
					$('.das_text_bgColor_heading', menu_scope).css('display', '');
				}
				
				var dasBGColor = $('#'+elementIDs.myDASID).css('background-color');
				$('.'+menuIDs.dasBGColorSelector, menu_scope).empty();
				createColorPicker(menuIDs.dasBGColorSelector+'_'+elementIDs.myID, menuIDs.dasBGColorHolder+'_'+elementIDs.myID, dasBGColor, elementIDs.myDASID, 'background-color', elementIDs.myDASID, myFranchise);
				// hide irrelevant menu items
				if(!$('#'+elementIDs.myTextContainer).hasClass('das_tag_moveable')){
					$('.das_element_alignment', menu_scope).remove();
					$('.das_layer_options', menu_scope).css('visibility', 'hidden');
				}
				
				if(!$('#'+elementIDs.myTextContainer).hasClass('das_tag_font_size')){
					$('.das_text_size_label', menu_scope).css('visibility', 'hidden');
					$('.das_text_size_container', menu_scope).css('visibility', 'hidden');
				}
				
				if(!$('#'+elementIDs.myTextContainer).hasClass('das_tag_font_family')){
					$('.das_text_font_label', menu_scope).css('visibility', 'hidden');
					$('.das_text_font_container', menu_scope).css('visibility', 'hidden');
					$('.das_font_options', menu_scope).css('visibility', 'hidden');
				}

				if(!$('#'+elementIDs.myTextContainer).hasClass('das_tag_resizable')){
					$('.das_text_scale', menu_scope).css('visibility', 'hidden');
					$('.das_layer_options', menu_scope).css('visibility', 'hidden');
				}
				
				if(!$('#'+elementIDs.myTextContainer).hasClass('das_tag_editable')){
					$('.das_text_val', menu_scope).css('opacity', '.75').attr('disabled', true);
					$('.das_text_remove', menu_scope).css('visibility', 'hidden');
				}
				
				if(!$('#'+elementIDs.myTextContainer).hasClass('das_tag_alignment')){
					$('.das_alignment', menu_scope).css('display', 'none');
				}
				
				if(!$('#'+elementIDs.myTextContainer).hasClass('das_tag_chngColor')){
					$('.das_text_color', menu_scope).css('display', 'none');
				}
			} else if(elementType == "image"){
				function resizeImg(objSize, ratioLock){
					var ratioLock = ratioLock || false;
					if(typeof objSize.width != "undefined" && typeof objSize.height != "undefined"){
					
					} else {
						if(typeof objSize.width != "undefined"){
							$('#'+elementIDs.myDivID).css("width", objSize.width);
							$('#'+elementIDs.myImgID).css("width", objSize.width);
							
							if(ratioLock){
								$('#'+elementIDs.myDivID).css("height", '');
								$('#'+elementIDs.myImgID).css("height", '');
							}
							setPropSize("height");
						} else {
							$('#'+elementIDs.myDivID).css("height", objSize.height);
							$('#'+elementIDs.myImgID).css("height", objSize.height);
							if(ratioLock){
								$('#'+elementIDs.myDivID).css("width", '');
								$('#'+elementIDs.myImgID).css("width", '');
							}
							setPropSize("width");
						}
					}
					
					function setPropSize(sizeAttr){
						var imgDim;
						if(sizeAttr == "width"){
							imgDim = $('#'+elementIDs.myImgID).width();	
						} else {
							imgDim = $('#'+elementIDs.myImgID).height();	
						}
						
						if(imgDim != 0){
							$('#'+elementIDs.myDivID).css(sizeAttr, imgDim);
							updateDesignerControls(elementIDs.myDivID, elementIDs.myODASID, {omit: sizeAttr});
						} else {
							setTimeout(function(){setPropSize(sizeAttr);}, 500);
						}
					};
				};
	
				$('.'+menuIDs.imgFullSize, menu_scope).click(function(event){
					var newWidth = $('#' + elementIDs.myDASID).width();
					var newHeight = $('#' + elementIDs.myDASID).height();
					$('#'+elementIDs.myDivID).css("width", newWidth).css('height', newHeight);
					$('#'+elementIDs.myImgID).css("width", newWidth).css('height', newHeight);
					//setImgHeight(elementIDs.myImgID, elementIDs.myDivID);
				});
								
				$('.'+menuIDs.imgThumb, menu_scope).attr('src', $('#'+elementIDs.myImgID).attr('src'));
				
				if($('.'+menuIDs.imgThumb, menu_scope).width() > 200){
					$('.'+menuIDs.imgThumb, menu_scope).css('height', '');
					$('.'+menuIDs.imgThumb, menu_scope).css('width', 200);
				}
				
				if($('.'+menuIDs.imgThumb, menu_scope).height() > 200){
					$('.'+menuIDs.imgThumb, menu_scope).css('width', '');
					$('.'+menuIDs.imgThumb, menu_scope).css('height', 200);
				}
				
				$('.das_img_thumb_container', menu_scope).css('width', $('.'+menuIDs.imgThumb, menu_scope).width()).css('height', $('.'+menuIDs.imgThumb, menu_scope).height());
				
				$('.das_img_width', menu_scope).val($('#'+elementIDs.myDivID).width());
				$('.das_img_height', menu_scope).val($('#'+elementIDs.myDivID).height());
				
				function arrowKey(code){
					if(code.keyCode >= 37 && code.keyCode <= 40){
						return true;
					} else {
						return false;
					}
				};
				
				$('.das_img_width', menu_scope).keyup(function(e){
					if(!arrowKey(e)){
						if($(this).val() != ""){
							var ratioLock = false;
							if($('.das_img_ratio_lock', menu_scope).attr('checked') == "checked"){
								ratioLock = true;
							}
							resizeImg({width: $(this).val()}, ratioLock);
						}
					}
				});
				$('.das_img_height', menu_scope).keyup(function(e){
					if(!arrowKey(e)){
						if($(this).val() != ""){
							var ratioLock = false;
							if($('.das_img_ratio_lock', menu_scope).attr('checked') == "checked"){
								ratioLock = true;
							}
							resizeImg({height: $(this).val()}, ratioLock);
						}
					}
				});
				
				$('.'+menuIDs.imgName, menu_scope).html($('#'+elementIDs.myImgID).attr('imgName'));
				
				$('.'+menuIDs.imgReplace, menu_scope).click(function(event){					
					var userID = calcMD5($('#'+$('#'+dasContainerID).attr('content_id')).attr('das_contextid'));
					
					if ('true' == $(this).attr('das_no_image_library')) {
						imgUpload(event, userID, elementIDs.myImgID);
					} else {
						loadImgPicker(['/das/users/'+userID+'/images/thumb'], undefined, elementIDs.myImgID/*, replaceCallback*/);
					}
				});
				
				if($('#'+elementIDs.myDivID).hasClass('das_tag_can_substitute')){
					var DesignVars = {};
					var MenuVars = {};
					
					MenuVars.contWidth = $('#'+elementIDs.myDivID).attr('das_thumb_width');
					MenuVars.contHeight = $('#'+elementIDs.myDivID).attr('das_thumb_height');
					
					$('.'+menuIDs.imgThumbContainer, menu_scope).css({'width': MenuVars.contWidth, 'height': MenuVars.contHeight});
					$('.'+menuIDs.imgThumb, menu_scope).css({'width': MenuVars.contWidth, 'height': ''});
					
					if($('.'+menuIDs.imgThumb, menu_scope).height() > MenuVars.contHeight){
						$('.'+menuIDs.imgThumb, menu_scope).css({'height': MenuVars.contHeight, 'width': ''});
					}
					
					MenuVars.maskWidth = $('#'+elementIDs.myDivID).attr('das_mask_width') || MenuVars.contWidth;
					MenuVars.maskHeight = $('#'+elementIDs.myDivID).attr('das_mask_height') || MenuVars.contHeight;
					MenuVars.maskLeft = parseFloat($('#'+elementIDs.myDivID).attr('das_mask_left'));
					MenuVars.maskTop = parseFloat($('#'+elementIDs.myDivID).attr('das_mask_top'));
					
					$('.'+menuIDs.imgThumbMask, menu_scope).css({'background-color': 'black', 'opacity': .75,'width': MenuVars.maskWidth, 'height': MenuVars.maskHeight, 'position': 'absolute', 'border': '0px solid white', 'left': MenuVars.maskLeft, 'top': MenuVars.maskTop, 'display': ''});
					
					$('#'+elementIDs.myDivID).css('overflow', 'hidden');
					$('#'+elementIDs.myImgID).css('position', 'absolute');
					
					if($('.'+menuIDs.imgThumbMask, menu_scope).hasClass('ui-draggable')){
						$('.'+menuIDs.imgThumbMask, menu_scope).draggable('destroy');
					}
					
					if($('.'+menuIDs.imgThumbMask, menu_scope).hasClass('ui-resizable')){
						$('.'+menuIDs.imgThumbMask, menu_scope).resizable('destroy');
					}
					
					$('.'+menuIDs.imgThumbMask, menu_scope).unbind('mouseover');
					
					if(g_DaS_subMaskStrict){
						$('.'+menuIDs.imgThumbMask, menu_scope).mousedown(function(){
							setTimeout(function(){mask_drag(elementIDs);}, 0);							
						});
						$('.'+menuIDs.imgThumbMask, menu_scope).draggable({drag: function(){ mask_drag(elementIDs); }});
						$('.'+menuIDs.imgThumbMask, menu_scope).resizable({
							handles: 'n, ne, e, se, s, sw, w, nw',
							aspectRatio: true,
							resize: function(){
								$(this).attr('das_mask_width', $(this).width()).attr('das_mask_height', $(this).height());
								mask_drag(elementIDs);
							},
							stop: function(){
								$(this).attr('das_mask_width', $(this).width()).attr('das_mask_height', $(this).height());
							},
							containment: "parent"
						});
					} else {
						$('.'+menuIDs.imgThumbMask, menu_scope).draggable({drag: function(){ mask_drag(elementIDs);}});
						$('.'+menuIDs.imgThumbMask, menu_scope).resizable({
							handles: 'n, ne, e, se, s, sw, w, nw',
							aspectRatio: true,
							resize: function(){
								$(this).attr('das_mask_width', $(this).width()).attr('das_mask_height', $(this).height());
								mask_drag(elementIDs);
							},
							stop: function(){
								$(this).attr('das_mask_width', $(this).width()).attr('das_mask_height', $(this).height());
							}
						});
					}
					
					$('.'+menuIDs.imgThumbMask, menu_scope).mouseover(function(){
						$('.ui-resizable-handle', $('.'+menuIDs.imgThumbMask, menu_scope)).css('visibility', 'visible');
					});
					
					// todo: update css rules to change the size of the handles
					// thought: what happens to handles when they overlap because the mask is too small?
					$('.ui-resizable-handle', $('.'+menuIDs.imgThumbMask, menu_scope)).addClass('ui-icon ui-icon-gripsmall-diagonal-se das_img_mask_handle');
										
					$('.'+menuIDs.imgReplace, menu_scope).css('display', '');
				} else {
					$('.'+menuIDs.imgThumbMask, menu_scope).css({'background-color': '', 'opacity': '', 'width': '', 'height': '', 'position': '', 'display': 'none'});
					$('.'+menuIDs.imgReplace, menu_scope).css('display', 'none');
				}
				
				$('#das_change_background_color_selector_img', menu_scope).empty();
				var das = $('.das_container');
				createColorPicker('das_change_background_color_selector_img', 'das_color_holder', $(das).css('background-color'), das.attr('id'), 'background-color', das.attr('id'));
				
				// Make Background
				if($('#'+elementIDs.myDivID).hasClass("inBackground")){
					$('.'+menuIDs.mkBkgrnd, menu_scope).prop("checked", true);
				} else {
					$('.'+menuIDs.mkBkgrnd, menu_scope).prop("checked", false);
				}
				
				$('.'+menuIDs.mkBkgrnd, menu_scope).click(function(event){
					if($('.'+menuIDs.mkBkgrnd, menu_scope).prop("checked")){
						// Send image to back and give class 'inBackground'
						MoveElement($('#'+elementIDs.myDivID).attr('das_layer'), -1, true);
					} else {
						$('.inBackground', $('.das_container')).removeClass('inBackground');
					}
				});
				
				// Rotate buttons
				$('.'+menuIDs.rotatecw, menu_scope).button({icons: {primary: "ui-icon-arrowrefresh-1-e"}, text: false});
				$('.'+menuIDs.rotateccw, menu_scope).button({icons: {primary: "ui-icon-arrowrefresh-1-e"}, text: false});
				$('.ui-icon', $('#'+menuIDs.rotateccw, menu_scope)).css({ transform: 'rotateY(180deg)' });
				$('.'+menuIDs.rotatecw, menu_scope).click(function(event){
					$('#'+elementIDs.myDivID).transition({ rotate: '+=90deg' });
					$('#'+elementIDs.myMoveHandle).transition({ rotate: '-=90deg' });
				});
				$('.'+menuIDs.rotateccw, menu_scope).click(function(event){
					$('#'+elementIDs.myDivID).transition({ rotate: '-=90deg' });
					$('#'+elementIDs.myMoveHandle).transition({ rotate: '+=90deg' });
				});
				
				// Background Color Setup
				if(!$('.das_container').hasClass('das_tag_bgColor')){
					$('.das_img_bgColor_heading', menu_scope).css('display', 'none');
				} else {
					$('.das_img_bgColor_heading', menu_scope).css('display', '');
				}
				
				$('.'+menuIDs.dasBGColorSelectorImg, menu_scope).attr('id', menuIDs.dasBGColorSelectorImg + '_' + elementIDs.myID);
				
				$('.das_img_color_holder', menu_scope).css('display', '');				
				
				var dasBGColor = $('#'+elementIDs.myDASID).css('background-color');
				$('.'+menuIDs.dasBGColorSelectorImg, menu_scope).empty();
				createColorPicker(menuIDs.dasBGColorSelectorImg+'_'+elementIDs.myID, menuIDs.dasBGColorHolder+'_'+elementIDs.myID, dasBGColor, elementIDs.myDASID, 'background-color', elementIDs.myDASID, myFranchise);
				
				// hide irrelevant menu items
				if(!$('#'+elementIDs.myDivID).hasClass('das_tag_moveable')){
					$('.das_element_alignment', menu_scope).remove();
					$('.das_layer_options', menu_scope).remove();
					$('.das_img_rotation', menu_scope).remove();
				}
				
				if(!$('#'+elementIDs.myDivID).hasClass('das_tag_resizable')){
					$('.das_img_resize_container', menu_scope).css('display', 'none');
				}
				
				if(!$('#'+elementIDs.myDivID).hasClass('das_tag_editable')){
					$('.das_text_val', menu_scope).css('opacity', '.75').attr('disabled', true);
					$('.das_text_remove', menu_scope).css('visibility', 'hidden');
					$('.das_img_full_size', menu_scope).css('visibility', 'hidden');
				}
				
				if(!$('#'+elementIDs.myDivID).hasClass('das_tag_alignment')){
					$('.das_alignment', menu_scope).css('display', 'none');
				}
				
				if(!$('#'+elementIDs.myDivID).hasClass('das_tag_chngColor')){
					$('.das_text_color', menu_scope).css('display', 'none');
				}
			}
			
			// Move Buttons
			var moveSteps = 5;
			var btnMouseDown = false;
			var moveable = $('#'+elementIDs.myTextContainer).hasClass('das_tag_moveable') || $('#'+elementIDs.myDivID).hasClass('das_tag_moveable');
			
			var imgFldr = '../img_files/';
			
			moveElement = function(myElementIDs, x, y){
				if(moveable){
					if($('#'+myElementIDs.myTextContainer).length > 0){
						var myElement = $('#'+myElementIDs.myTextContainer);
					} else {
						var myElement = $('#'+myElementIDs.myDivID);
					}
					
					var top = parseFloat($(myElement).css('top')) || 0;
					var left = parseFloat($(myElement).css('left')) || 0;
					
					$(myElement).css('top', top-(moveSteps*y));
					$(myElement).css('left', left-(moveSteps*x));
				}
			};
			
			$('.das_element_alignment').css('display', '');
			$('.das_move_btn').css('opacity', 1);
			
			// Up Button
			$('.'+menuIDs.moveUp, $(menu_scope)).hover(function(){
				$(this).hover_img();
			}, function(){
				$(this).hover_img();
			});
			
			$('.'+menuIDs.moveUp, $(menu_scope)).mousedown(function(e) {
					clearTimeout(this.downTimer);
					btnMouseDown = true;
					rapid = function() {
						moveElement(elementIDs, 0, 1);
						if(btnMouseDown){
							setTimeout(rapid, 75);
						}
					}
					this.downTimer = setTimeout(rapid, 500);		    
			}).mouseup(function(e) {
					clearTimeout(this.downTimer);
					btnMouseDown = false;
			});
			
			$('.'+menuIDs.moveUp, $(menu_scope)).click(function(event){
				moveElement(elementIDs, 0, 1);
			});
			
			// Down Button
			$('.'+menuIDs.moveDown, $(menu_scope)).hover(function(){
				$(this).hover_img();
			}, function(){
				$(this).hover_img();
			});
			
			$('.'+menuIDs.moveDown, $(menu_scope)).mousedown(function(e) {
					clearTimeout(this.downTimer);
					btnMouseDown = true;
					rapid = function() {
						moveElement(elementIDs, 0, -1);
						if(btnMouseDown){
							setTimeout(rapid, 75);
						}
					}
					this.downTimer = setTimeout(rapid, 500);		    
			}).mouseup(function(e) {
					clearTimeout(this.downTimer);
					btnMouseDown = false;
			});
	
			
			$('.'+menuIDs.moveDown, $(menu_scope)).click(function(event){
				moveElement(elementIDs, 0, -1);
			});
			
			// Left Button
			$('.'+menuIDs.moveLeft, $(menu_scope)).hover(function(){
				$(this).hover_img();
			}, function(){
				$(this).hover_img();
			});
			
			$('.'+menuIDs.moveLeft, $(menu_scope)).mousedown(function(e) {
					clearTimeout(this.downTimer);
					btnMouseDown = true;
					rapid = function() {
						moveElement(elementIDs, 1, 0);
						if(btnMouseDown){
							setTimeout(rapid, 75);
						}
					}
					this.downTimer = setTimeout(rapid, 500);		    
			}).mouseup(function(e) {
					clearTimeout(this.downTimer);
					btnMouseDown = false;
			});
	
			
			$('.'+menuIDs.moveLeft, $(menu_scope)).click(function(event){
				moveElement(elementIDs, 1, 0);
			});
			
			// Right Button
			$('.'+menuIDs.moveRight, $(menu_scope)).hover(function(){
				$(this).hover_img();
			}, function(){
				$(this).hover_img();
			});
			
			$('.'+menuIDs.moveRight, $(menu_scope)).mousedown(function(e) {
					clearTimeout(this.downTimer);
					btnMouseDown = true;
					rapid = function() {
						moveElement(elementIDs, -1, 0);
						if(btnMouseDown){
							setTimeout(rapid, 75);
						}
					}
					this.downTimer = setTimeout(rapid, 500);		    
			}).mouseup(function(e) {
					clearTimeout(this.downTimer);
					btnMouseDown = false;
			});
			
			$('.'+menuIDs.moveRight, $(menu_scope)).click(function(event){
				moveElement(elementIDs, -1, 0);
			});
			
			// Alignment Buttons
			$('.das_alignment').button();
			var element = elementIDs.myTextContainer || elementIDs.myDivID;
			
			$('.'+menuIDs.alignLeft, $(menu_scope)).click(function(event){
				$('#'+element).css('left', 0).css('right', '');
				$('#'+elementIDs.myTextSpan).css('text-align', 'left');
			});
			
			$('.'+menuIDs.alignCenter, $(menu_scope)).click(function(event){
				var dasWidth, elementWidth, left;
				dasWidth = $('.das_container').width();
				elementWidth = $('#'+element).width();
				left = (dasWidth - elementWidth) / 2;
				$('#'+element).css('left', left).css('right', '');
				$('#'+elementIDs.myTextSpan).css('text-align', 'center');
			});
			
			$('.'+menuIDs.alignRight, $(menu_scope)).click(function(event){
				$('#'+element).css('left', '').css('right', 0);
				var myLeft = $('#'+element).position().left / parseFloat($('.das_container').css('scale'));
				$('#'+element).css('left', myLeft).css('right', '');
				$('#'+elementIDs.myTextSpan).css('text-align', 'right');
			});
			
			$('.'+menuIDs.alignTop, $(menu_scope)).click(function(event){
				$('#'+element).css('top', 0).css('bottom', '');
				$('#'+elementIDs.myTextSpan).css('vertical-align', 'top').attr('das_vert_align', 'top');
			});
			
			$('.'+menuIDs.alignMiddle, $(menu_scope)).click(function(event){
				var dasHeight, elementHeight, top;
				dasHeight = $('.das_content').height();
				elementHeight = $('#'+element).height();
				top = (dasHeight - elementHeight) / 2;
				$('#'+element).css('top', top).css('bottom', '');
				$('#'+elementIDs.myTextSpan).css('vertical-align', 'middle').attr('das_vert_align', 'middle');
			});
			
			$('.'+menuIDs.alignBottom, $(menu_scope)).click(function(event){
				$('#'+element).css('top', '').css('bottom', 0);
				var myTop = $('#'+element).position().top / parseFloat($('.das_container').css('scale'));
				$('#'+element).css('top', myTop).css('bottom', '');
				$('#'+elementIDs.myTextSpan).css('vertical-align', 'bottom').attr('das_vert_align', 'bottom');
			});
	
			
			// Bring to Front || Send to Back
			var elementContainer = elementIDs.myTextContainer || elementIDs.myDivID;
					
			$('.'+menuIDs.bringFront, menu_scope).button().click(function(event){
				MoveElement($('#'+elementContainer).attr('das_layer'), 1);
			});
			
			$('.'+menuIDs.sendBack, menu_scope).button().click(function(event){
				MoveElement($('#'+elementContainer).attr('das_layer'), -1);
			});
			
			$('.ui-button-text', $('.das_layer_options')).css('font-size', '8pt');
			$('.ui-button', $('.das_layer_options')).css('width', 100);
			
			$('.das_text_color_holder', menu_scope).accordion({collapsible: true, active: false, heightStyle: "content"});
			$('.das_img_color_holder', menu_scope).accordion({collapsible: true, active: false, heightStyle: "content"});
			
			// Element Tags
			if(elementType == "text"){
				var myElement = elementIDs.myTextContainer;
			} else if(elementType == "img") {
				var myElement = elementIDs.myDivID;
			}
	
			$('.das_tag', menu_scope).each(function(){
				if($('#'+myElement).hasClass($(this).val())){
					$(this).attr('checked', 'checked');
				} else {
					$(this).attr('checked', false);
				}
			});
			
			$('.das_tag', menu_scope).change(function(){				
				if($(this).is(':checked')){
					$('#'+myElement).addClass($(this).attr('value'));
					if($(this).attr('value') == 'das_tag_resizable' && elementType == "text"){
						$('#'+elementIDs.myTextContainer).resizable('option', 'aspectRatio', true);
						//$('#'+elementIDs.myTextSpan).removeAttr('das_max_font');
					} else if($(this).attr('value') == 'das_tag_uppercase' && elementType == "text"){
						var myText = $('#'+elementIDs.myTextSpan).val();
						$('#'+elementIDs.myTextSpan).val(myText.toUpperCase());
						// resize textbox to contain new, uppercase text
						$('#'+elementIDs.myTextDiv).fit_to_content(elementIDs.myTextContainer);
					}
				} else {
					$('#'+myElement).removeClass($(this).attr('value'));
					if($(this).attr('value') == 'das_tag_resizable' && elementType == "text"){
						$('#'+elementIDs.myTextContainer).resizable('option', 'aspectRatio', false);
						//$('#'+elementIDs.myTextSpan).attr('das_max_font', parseFloat($('#'+elementIDs.myTextSpan).css('font-size')));
					}
				}
			});
		} else if (elementType !== "image" || false == $('#'+elementIDs.myDivID).hasClass('inBackground')) {
			//temporary condition to not show image menu for background images
			$('#das_element_menu_'+elementIDs.myID).css('display', '');
		}
	};
  
  function mask_drag(elementIDs){
  	var menuIDs = mainMenu_elements();
		var menu_scope = $('#das_element_menu_'+elementIDs.myID);
		
		if(g_DaS_subMaskStrict){
			var contPos = $('.'+menuIDs.imgThumb, menu_scope).offset();
			var contWidth = $('.'+menuIDs.imgThumb, menu_scope).width();
			var contHeight = $('.'+menuIDs.imgThumb, menu_scope).height();
			var maskWidth = $('.'+menuIDs.imgThumbMask, menu_scope).width();
			var maskHeight = $('.'+menuIDs.imgThumbMask, menu_scope).height();
			
			$('.'+menuIDs.imgThumbMask, menu_scope).draggable("option", "containment", [contPos.left, contPos.top, contPos.left+contWidth-maskWidth, contPos.top+contHeight-maskHeight]);
			$('.'+menuIDs.imgThumbMask, menu_scope).resizable("option", "containment", $('.'+menuIDs.imgThumb, menu_scope));
		}
		
		if($('.'+menuIDs.imgThumbMask, menu_scope).length > 0){
			var myScale;
			var DesignVars = {};
			var MenuVars = {};
			
			$('#'+elementIDs.myImgID).css('width', $('#'+elementIDs.myDivID).width());
			
			DesignVars.windowWidth = $('#'+elementIDs.myDivID).width();
			DesignVars.windowHeight = $('#'+elementIDs.myDivID).height();
			DesignVars.imgWidth = $('#'+elementIDs.myImgID).width();
			DesignVars.imgHeight = $('#'+elementIDs.myImgID).height();
			DesignVars.imgLeft = $('#'+elementIDs.myImgID).position().left;
			DesignVars.imgTop = $('#'+elementIDs.myImgID).position().top;
			
			MenuVars.imgWidth = $('.'+menuIDs.imgThumb, menu_scope).width();
			MenuVars.imgHeight = $('.'+menuIDs.imgThumb, menu_scope).height();
			MenuVars.imgLeft = $('.'+menuIDs.imgThumb, menu_scope).position().left;
			MenuVars.imgTop = $('.'+menuIDs.imgThumb, menu_scope).position().top;
			MenuVars.maskWidth = (DesignVars.windowWidth / DesignVars.imgWidth) * MenuVars.imgWidth;
			MenuVars.maskHeight = (DesignVars.windowHeight / DesignVars.imgHeight) * MenuVars.imgHeight;
			MenuVars.maskLeft = ((MenuVars.imgWidth / DesignVars.imgWidth) * Math.abs(DesignVars.imgLeft)) + MenuVars.imgLeft;
			MenuVars.maskTop = ((MenuVars.imgHeight / DesignVars.imgHeight) * Math.abs(DesignVars.imgTop)) + MenuVars.imgTop;
			
			myScale =  parseFloat($('.'+ menuIDs.imgThumb, menu_scope).width()) / parseFloat($('.'+menuIDs.imgThumbMask, menu_scope).attr('das_mask_width'));			
			
			$('#'+elementIDs.myImgID).css({transformOrigin: '0px 0px'});
			$('#'+elementIDs.myImgID).css({scale: myScale});
			
			var myScaleX = parseFloat($('.'+ menuIDs.imgThumb, menu_scope).width()) / parseFloat($('.'+menuIDs.imgThumbMask, menu_scope).width());
			var myScaleY = parseFloat($('.'+ menuIDs.imgThumb, menu_scope).height()) / parseFloat($('.'+menuIDs.imgThumbMask, menu_scope).height());
			$('#'+elementIDs.myImgID).attr('scaleX', myScaleX).attr('scaleY', myScaleY);
			DesignVars.windowWidth = $('#'+elementIDs.myDivID).width();
			DesignVars.windowHeight = $('#'+elementIDs.myDivID).height();

			var imgLeft = (($('.'+menuIDs.imgThumbMask, menu_scope).position().left-MenuVars.imgLeft)*(DesignVars.windowWidth / MenuVars.imgWidth))*myScaleX;
			var imgTop = (($('.'+menuIDs.imgThumbMask, menu_scope).position().top-MenuVars.imgTop)*(DesignVars.windowHeight / MenuVars.imgHeight))*myScaleY;
			
			//$('#'+elementIDs.myImgID).css({transformOrigin: imgLeft+'px '+imgTop+'px'});
			$('#'+elementIDs.myImgID).css('left', -imgLeft).css('top', -imgTop);

			das_modify_design(true);
			
			subImgQuality(elementIDs);
		}
	}
  
  $.fn.initializePermMenu = function(encodedID){
	  var mainMenuIDs = mainMenu_elements();
	  var permMenuIDs = permMenu_elements();
	  
	  if(!$('.das_container').hasClass('das_tag_add_text')){
		  $('#'+permMenuIDs.addText).css('opacity', .5).css('cursor', '').addClass('das_menu_disabled');
	  }else{
		  $('#'+permMenuIDs.addText).css('cursor', 'pointer').click(function(event){
			  $('.das_container').addText('Type Your Text Here');
		  });
		}
	  
	  if(!$('.das_container').hasClass('das_tag_add_imgs')){
		  $('#'+permMenuIDs.addImg).css('opacity', .5).css('cursor', '').addClass('das_menu_disabled');
		  $('#'+permMenuIDs.uploadImg).css('opacity', .5).css('cursor', '').addClass('das_menu_disabled');
	  } else {
		  $('#'+permMenuIDs.addImg).css('cursor', 'pointer').click(function(event){
			  var myFranchise = $('.das_container').attr('das_toolkit');
			  loadImgPicker(['/das/users/'+encodedID+'/images/thumb/', '/das/images/thumb/franchise_'+myFranchise, '/das/images/thumb/'], myFranchise);
			});
		  
		  $('#'+permMenuIDs.uploadImg).css('cursor', 'pointer').click(function(event){
		  	imgUpload(event, encodedID);
		  });
		}
	
	  var sVar = $('#'+permMenuIDs.save);	
	  if (!sVar.hasClass('das_not_button')) {
		  sVar.button();
	  }
	  sVar.click(function(event){
		  var filename = $('.das_container').attr('das_template_name');
		  var dasID = $('.das_container').attr('content_id');
			var contextID = $('#'+dasID).attr('das_contextid');
			var scale = $('.das_container').attr('size');
			$('#'+dasID).Save(filename, contextID);
	  });
	  
	  $('#'+permMenuIDs.preview).button();
	  
	  $('#das_design_btns_bottom').css('display', '');
	  
	  $('#'+mainMenuIDs.textColorSelector).empty();
	  createColorPicker(mainMenuIDs.textColorSelector, mainMenuIDs.textColorHolder);
	  
	  if(!$('.das_container').hasClass('das_tag_bgColor')){
	  	$('#'+permMenuIDs.chngBkgnd).css('display', 'none');
	  } else {
		  $('#'+permMenuIDs.chngBkgrnd).css('cursor', 'pointer').click(function(event){
			  var chngBkgndColor = $('<div>').attr('id', 'das_background_colors');
			  chngBkgndColor.dialog({title: 'Background Color', close: function(){
				  $(this).dialog('destroy');
				  $(this).remove();
			  }});
			  var das = $('.das_container');
			  createColorPicker('das_background_colors', 'das_bkgndColor_holder', $(das).css('background-color'), das.attr('id'), 'background-color', das.attr('id'));
		  });
		}
	  
	  $('#'+permMenuIDs.chkRealtor).click(function(event){
		  if($(this).prop('checked')){
			  $('.das_tag_realtor_logo').css('visibility', '').attr('das_visible', 'true');
		  } else {
			  $('.das_tag_realtor_logo').css('visibility', 'hidden').attr('das_visible', 'false');
		  }
		  das_modify_design(true);
	  });
	  
	  $('#'+permMenuIDs.chkMLS).click(function(event){
		  if($(this).prop('checked')){
			  $('.das_tag_mls_logo').css('visibility', '').attr('das_visible', 'true');;
		  } else {
			  $('.das_tag_mls_logo').css('visibility', 'hidden').attr('das_visible', 'false');
		  }
		  das_modify_design(true);
	  });
	  
	  $('#'+permMenuIDs.chkEq).click(function(event){
		  if($(this).prop('checked')){
			  $('.das_tag_equal_opportunity').css('visibility', '').attr('das_visible', 'true');;
		  } else {
			  $('.das_tag_equal_opportunity').css('visibility', 'hidden').attr('das_visible', 'false');
		  }
		  das_modify_design(true);
	  });
	  
	  if($('.das_tag_realtor_logo').size() > 0){
		  $('.das_realtor').css('display', '');
	  }
	  
	  if($('.das_tag_mls_logo').size() > 0){
		  $('.das_mls').css('display', '');
	  }
	  
	  if($('.das_tag_equal_opportunity').size() > 0){
		  $('.das_equal').css('display', '');
	  }
	  
	  if('true' == $('.das_tag_realtor_logo').attr('das_visible') || ($('.das_tag_realtor_logo').hasClass('das_tag_visible') && 'false' !== $('.das_tag_realtor_logo').attr('das_visible'))) {
		  $('#das_checkbox_realtor').attr('checked', 'checked');
		  $('.das_tag_realtor_logo').css('visibility', '');
	  } else {
		  $('#das_checkbox_realtor').attr('checked', false);
	  }
	  
	  if(($('.das_tag_mls_logo').hasClass('das_tag_visible') && 'false' !== $('.das_tag_mls_logo').attr('das_visible')) || 'true' == $('.das_tag_mls_logo').attr('das_visible')){
		  $('#das_checkbox_mls').attr('checked', 'checked');
		  $('.das_tag_mls_logo').css('visibility', '');
	  } else {
		  $('#das_checkbox_mls').attr('checked', false);
	  }
	  
	  if(($('.das_tag_equal_opportunity').hasClass('das_tag_visible') && 'false' !== $('.das_tag_equal_opportunity').attr('das_visible')) || 'true' == $('.das_tag_equal_opportunity').attr('das_visible')){
		  $('#das_checkbox_equal').attr('checked', 'checked');
		  $('.das_tag_equal_opportunity').css('visibility', '');
	  } else {
		  $('#das_checkbox_equal').attr('checked', false);
	  }
  };
  
  designMainMenu_elements = function(){
	  var elements = {};
	  elements.textVal = "das_text_val";
	  elements.textSizeContainer = "das_text_size_container";
	  elements.textSize = "das_text_size";
	  elements.textSizeInput = "das_text_size_input";
	  elements.textSizeInputbox = "das_text_size_inputbox";
	  elements.textSizeList = "das_text_size_list";
	  elements.textSizeListItem = "das_text_size_list_item";
	  elements.textFont = "das_text_font";
	  elements.textSelectedFont = "das_text_font_selected";
	  elements.textFontOptions = "das_text_font_options";
	  elements.textSizeUnit = "das_text_size_unit";
	  elements.textWidth = "das_text_width";
	  elements.textHeight = "das_text_height";
	  elements.textTop = "das_text_top";
	  elements.textLeft = "das_text_left";
	  elements.moveUp = "das_move_up";
	  elements.moveRight = "das_move_right";
	  elements.moveDown = "das_move_down";
	  elements.moveLeft = "das_move_left";
	  elements.alignContainerLeft = "das_align_container_left";
	  elements.alignContainerCenter = "das_align_container_center";
	  elements.alignContainerRight = "das_align_container_right";
	  elements.alignContainerTop = "das_align_container_top";
	  elements.alignContainerMiddle = "das_align_container_middle";
	  elements.alignContainerBottom = "das_align_container_bottom";
	  elements.alignTextLeft = "das_align_text_left";
	  elements.alignTextCenter = "das_align_text_center";
	  elements.alignTextRight = "das_align_text_right";
	  elements.alignTextTop = "das_align_text_top";
	  elements.alignTextMiddle = "das_align_text_middle";
	  elements.alignTextBottom = "das_align_text_bottom";
	  elements.mkBkgrnd = "das_background_img";
	  elements.textColorHolder = "das_text_color_holder";
	  elements.textColorSelector = "das_text_color_selector";
	  elements.textBgColorSelector = "das_text_background_color_selector";
	  elements.dasBGColorSelector = "das_change_background_color_selector_txt";
	  elements.dasBGColorSelectorImg = "das_change_background_color_selector_img";
	  elements.imgFullSize = "das_img_full_size";
	  elements.remove = "das_text_remove";
	  elements.chngBkgndColor = "das_chng_bknd_color";
	  elements.bringFront = "das_btf";
	  elements.sendBack = "das_stb";
	  elements.rotatecw = "das_rotate_cw";
	  elements.rotateccw = "das_rotate_ccw";
	  elements.imgReplace = "das_img_replace";
	  elements.imgThumb = "das_img_thumb";
	  elements.imgThumbContainer = "das_img_thumb_container";
	  elements.imgThumbMask = "das_img_thumb_mask";
	  elements.imgName = "das_img_name";
	  return elements;
  };
  
  designPermMenu_elements = function(){
	  var elements = {};
	  elements.file = "das_file";
	  elements.save = "das_save";
	  elements.saveAs = "das_saveAs";
	  elements.load = "das_load";
	  elements.clear = "das_clear";
	  elements.addText = "das_add_text";
	  elements.addImg = "das_add_img";
	  elements.uploadImg = "das_upload_img";
	  elements.scale = "das_scale";
	  elements.mode = "das_mode";
	  elements.logout = "das_logout";
	  elements.franchise = "das_franchise";
	  elements.size = "das_size";
	  return elements;	  
  };
  
  $.fn.initializeDesignMainMenu = function(elementID, elementType, dasContainerID, toolkit){
  	var menuIDs = designMainMenu_elements();
  	var scope = $(this);
  	
  	var perm_menuIDs = designPermMenu_elements();
  	var myFranchise = toolkit || $('#'+perm_menuIDs.franchise).find(":selected").val();
  	
		if(elementType == "text"){
			var elementIDs = text_elements(dasContainerID, elementID);
			var menuTemplate = $('<div>').append($('#das_text_menu').html());
			
			$('.das_text_color_holder', menuTemplate).attr('id', 'das_text_color_holder_' + elementIDs.myID);
			$('.das_text_color_selector', menuTemplate).attr('id', 'das_text_color_selector_' + elementIDs.myID);
			$('.das_text_background_color_selector', menuTemplate).attr('id', 'das_text_background_color_selector_' + elementIDs.myID);
			$('.das_change_background_color_selector_txt', menuTemplate).attr('id', 'das_change_background_color_selector_txt_' + elementIDs.myID);
			$('.das_text_scale', menuTemplate).attr('id', 'das_text_scale_'+elementIDs.myID);
			$('.das_overflow', menuTemplate).attr('name', 'das_tags_for_txt'+elementIDs.myID);
			$('input', $('.das_text_scale', menuTemplate)).each(function(){
				$(this).attr('name', 'das_text_scale_'+elementIDs.myID);
				$(this).attr('id', 'das_text_scale_'+elementIDs.myID+$(this).attr('myNum'));
			});
			$('label', $('.das_text_scale', menuTemplate)).each(function(){
				$(this).attr('for', 'das_text_scale_'+elementIDs.myID+$(this).attr('myNum'));
			});
			
			$('#das_menu_type').html("TEXT FIELD");
		} else if(elementType == "img"){
			var elementIDs = Img_Elements(dasContainerID, elementID);
			var menuTemplate = $('<div>').append($('#das_img_menu').html());
			
			$('.das_img_full_size', menuTemplate).attr('id', 'das_img_full_size_'+elementIDs.myID);
			$('.das_img_width', menuTemplate).attr('id', 'das_img_width_'+elementIDs.myID);
			$('.das_img_height', menuTemplate).attr('id', 'das_img_height_'+elementIDs.myID);
			
			$('#das_menu_type').html("IMAGE");
		}
		
		$('.das_element_menu').css('display', 'none');
		
		if($('#das_element_menu_'+elementIDs.myID).length == 0){			
			var element_menu = $('<div>').attr('id', 'das_element_menu_'+elementIDs.myID).addClass('das_element_menu').append(menuTemplate.html());
			$(scope).append(element_menu);
			
			var menu_scope = $('#das_element_menu_'+elementIDs.myID);
	  	
	  	$('.'+menuIDs.remove, $(menu_scope)).click(function(event){
		  	$('#'+elementIDs.myMenuEnd).css('display', 'none');
				$('#'+elementIDs.myTextContainer).remove();
				$('#'+elementIDs.myDivID).remove();
				$('#das_element_menu_'+elementIDs.myID).remove();
	  	});
	  	
	  	if(elementType == "text"){
		  	$('.das_side_menu').scroll(function(){
			  	var myTop = $('.'+menuIDs.textSelectedFont, menu_scope).offset().top - ($('.das_menu').offset().top - 18);
			  	$('.'+menuIDs.textFontOptions, menu_scope).css('top', myTop);
		  	});
		  	

				var oTxtVal = $('.'+menuIDs.textVal, menu_scope);
		  	oTxtVal.val($('#'+elementIDs.myTextSpan).val());
		  	oTxtVal.focus(function() { setTimeout(function() { oTxtVal.select(); $('#'+elementIDs.myTextSpan).text_border(); }, 1); });
				oTxtVal.keyup(function(){
					if($('#'+elementIDs.myTextContainer).hasClass('das_tag_uppercase')){
						$(this).val($(this).val().toUpperCase());
					}
					
					writeText(elementIDs.myTextSpan, this.value, undefined, undefined, undefined, undefined, undefined, true);
					$('#'+elementIDs.myTextSpan).keyup();
					das_modify_design(true);
		  	});
		  	
		  	$('#'+elementIDs.myTextSpan).keyup(function(){
					if (oTxtVal.val() != $(this).val()) {
						oTxtVal.val($(this).val());
					}
				});
				
				function initializeFontSize(){
					// Text Size Setup
					var options = new Array(8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 54, 60, 72, 84, 96, 108, 126, 144, 162, 175, 200, 225, 250, 275, 300, 325, 350);
					
					var font_size = Math.round(parseFloat($('#'+elementIDs.myTextSpan).css('font-size')), 0);
					
					$('.'+menuIDs.textSizeList, $(menu_scope)).empty();
					
					for (var i=0; i<options.length; i++){
						$('.'+menuIDs.textSizeList, $(menu_scope)).append($('<div>').attr('value', options[i]).addClass('das_text_size_list_item').append(options[i]));
					}
					
					$('.'+menuIDs.textSize, $(menu_scope)).empty().button({icons: {secondary: "ui-icon-triangle-1-s"}, label: font_size});
					
					$('.'+menuIDs.textSizeInputbox, menu_scope).val(font_size);
					
					$('.'+menuIDs.textSize, $(menu_scope)).click(function(event){
						font_size = parseFloat($('#'+elementIDs.myTextSpan).css('font-size'));
						
						das_clickHandler(event);
						
						$('.'+menuIDs.textSizeList, menu_scope).css('display', '');
						
						$('.'+menuIDs.textSizeInputbox, menu_scope).val(font_size);
					});
					
					$('.'+menuIDs.textSizeInput, menu_scope).click(function(event){
						das_clickHandler(event);
					});
					
					$('.'+menuIDs.textSizeInputbox, menu_scope).keyup(function(e){
						changeFontSize(parseFloat($(this).val()));
						$('.'+menuIDs.textSizeList, menu_scope).css('display', 'none');
					});
					
					$('.'+menuIDs.textSizeListItem, $(menu_scope)).click(function(event){
						changeFontSize($(this).attr('value'));
					});
				};
				
				function changeFontSize(size){
					$('#'+elementIDs.myTextSpan).css('font-size', size);
					$('#'+elementIDs.myTextSpan).attr('das_max_font', size);
					// todo: don't resize the container if stretching has occured
					var elementStretchX = $('#'+elementIDs.myTextContainer).attr('stretchx');
					var elementStretchY = $('#'+elementIDs.myTextContainer).attr('stretchy');
					
					if((typeof elementStretchX == 'undefined' && typeof elementStretchY == 'undefined') || (elementStretchX == 1 && elementStretchY == 1)){
						$('#'+elementIDs.myTextSpan).fit_to_content(elementIDs.myTextContainer);
					}
					
					$('.'+menuIDs.textSize, menu_scope).button('option', 'label', size);
					$('.'+menuIDs.textSizeInputbox, menu_scope).val(size);
					
					updateDesignerControls(elementIDs.myTextContainer, elementIDs.myDASID);
				};
				
				$('.das_text_size_less', menu_scope).button({icons: {primary: "ui-icon-arrow-1-w"}, text: false});
				$('.das_text_size_reset', menu_scope).button({icons: {primary: "ui-icon-cancel"}, text: false});
				$('.das_text_size_more', menu_scope).button({icons: {primary: "ui-icon-arrow-1-e"}, text: false});
				
				$('.das_text_size_btn', menu_scope).css('width', 'auto');
				
				$('.das_text_size_less', menu_scope).click(function(event){
					var newSize = parseFloat($('#'+elementIDs.myTextSpan).css('font-size')) - 1;
					changeFontSize(newSize);
				});
				
				$('.das_text_size_reset', menu_scope).click(function(event){
					changeFontSize(45);
				});
				
				$('.das_text_size_more', menu_scope).click(function(event){
					var newSize = parseFloat($('#'+elementIDs.myTextSpan).css('font-size')) + 1;
					changeFontSize(newSize);
				});
				
				initializeFontSize();
				
				$('#'+elementIDs.myTextContainer).on("resizestop", function(){
					initializeFontSize();
				});
				
				// todo: on resize if the element is tagged as center, right, middle and/or bottom then the element needs to be adjusted
				
				// Text Font Setup
				var fonts = franchise_fonts(myFranchise);
				var curr_font = $('#'+elementIDs.myTextSpan).css('font-family');
				var myText = $('#'+elementIDs.myTextSpan).val();
				var fontDisplayName;
				
				$('.'+menuIDs.textSelectedFont, menu_scope).html(myText).css('font-family', curr_font);
				$('.'+menuIDs.textFontOptions, menu_scope).empty();
				for(var i=0; i<fonts.length; i++){
					$('.'+menuIDs.textFontOptions, menu_scope).append($('<div>').attr('value', fonts[i][0]).attr('id', fonts[i][0] + '_' + elementIDs.myID).attr('original-title', fonts[i][1]).addClass("das_menu_font_select das_menu_font_option").css('font-family',fonts[i][0]).html(myText).attr('das_bold_avail', fonts[i][3]).attr('das_italic_avail', fonts[i][4]).html(fonts[i][1]));
					
					if(curr_font == fonts[i][0]){
						if(fonts[i][3]){
							$('.das_text_bold', menu_scope).css('display', '');
						} else {
							$('.das_text_bold', menu_scope).css('display', 'none');
						}
						
						if(fonts[i][4]){
							$('.das_text_italic', menu_scope).css('display', '');
						} else {
							$('.das_text_italic', menu_scope).css('display', 'none');
						}
						
						fontDisplayName = fonts[i][1];
					}
				}
				
				$('.'+menuIDs.textSelectedFont, menu_scope).html(fontDisplayName);
				
				$('.'+menuIDs.textSelectedFont, menu_scope).click(function(event){
					das_clickHandler(event);
					var myTop = $(this).offset().top - ($('.das_menu').offset().top - 18);
					$('.'+menuIDs.textFontOptions, menu_scope).css('top', myTop).show(100);
				});
				
				$('.das_menu_font_option', menu_scope).hover(function(){
					$('#'+elementIDs.myTextSpan).attr('das_bold', $('#'+elementIDs.myTextSpan).css('font-weight'));
					$('#'+elementIDs.myTextSpan).attr('das_italic', $('#'+elementIDs.myTextSpan).css('font-style'));
					$('#'+elementIDs.myTextSpan).css('font-family', $(this).attr('value')).css('font-weight', '').css('font-style', '');
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				}, function(){
					var elementBold = $('#'+elementIDs.myTextSpan).attr('das_bold');
					var elementItalic = $('#'+elementIDs.myTextSpan).attr('das_italic');
					$('#'+elementIDs.myTextSpan).css('font-family', curr_font).css('font-weight', elementBold).css('font-style', elementItalic);
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('.das_menu_font_option', menu_scope).click(function(event){
					das_clickHandler(event);
					$('#'+elementIDs.myTextSpan).css('font-family', $(this).attr('value')).css('font-weight', '').css('font-style', '').attr('das_bold', '').attr('das_italic', '').attr('font', $(this).attr('original-title'));
					$('.das_text_font_selected', menu_scope).html($(this).attr('original-title'));
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
					curr_font = $(this).attr('value');
					$('.'+menuIDs.textSelectedFont, menu_scope).css('font-family', $(this).attr('value'));
					$('.'+menuIDs.textFontOptions, menu_scope).hide(100);
					
					if($(this).attr('das_bold_avail') == 'false'){
						$('#das_text_bold_'+elementIDs.myID+'_button').css('display', 'none');
					} else {
						$('#das_text_bold_'+elementIDs.myID+'_button').css('display', '');
					}
					
					if($(this).attr('das_italic_avail') == 'false'){
						$('#das_text_italic_'+elementIDs.myID+'_button').css('display', 'none');
					} else {
						$('#das_text_italic_'+elementIDs.myID+'_button').css('display', '');
					}
					
					$('#das_text_bold_'+elementIDs.myID).attr('checked', false).button('refresh');
					$('#das_text_italic_'+elementIDs.myID).attr('checked', false).button('refresh');
				});
				
				$('.das_font_options', menu_scope).attr('id', 'das_font_options_' + elementIDs.myID);
				
				$('.das_font_option', menu_scope).each(function(){
					$(this).attr('id', $(this).attr('id') + elementIDs.myID);
				});
				
				$('label', $('#das_font_options_'+elementIDs.myID)).each(function(){
					$(this).attr('for', $(this).attr('for') + elementIDs.myID);
					$(this).attr('id', $(this).attr('for') + '_button');
				});
				
				$('#das_font_options_'+elementIDs.myID).buttonset();
				
				$('#das_text_bold_'+elementIDs.myID+'_button').click(function(event){
					if($('#'+elementIDs.myTextSpan).css('font-weight') != 'bold'){
						$('#'+elementIDs.myTextSpan).css('font-weight', 'bold');
					} else {
						$('#'+elementIDs.myTextSpan).css('font-weight', '');
					}
					
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('#das_text_italic_'+elementIDs.myID+'_button').click(function(event){
					if($('#'+elementIDs.myTextSpan).css('font-style') != 'italic'){
						$('#'+elementIDs.myTextSpan).css('font-style', 'italic');
					} else {
						$('#'+elementIDs.myTextSpan).css('font-style', '');
					}
					
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('.das_font_tracking_less', menu_scope).button({icons: {primary: "ui-icon-arrow-1-w"}, text: false});
				$('.das_font_tracking_reset', menu_scope).button({icons: {primary: "ui-icon-cancel"}, text: false});
				$('.das_font_tracking_more', menu_scope).button({icons: {primary: "ui-icon-arrow-1-e"}, text: false});
				
				$('.das_font_tracking_btn', $('.das_font_tracking')).css('width', 'auto');
				
				$('.das_font_tracking_less', menu_scope).click(function(event){
					var spacing = parseFloat($('#'+elementIDs.myTextSpan).css('letter-spacing')) - 1 || -1;
					$('#'+elementIDs.myTextSpan).css('letter-spacing', spacing);
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('.das_font_tracking_reset', menu_scope).click(function(event){
					$('#'+elementIDs.myTextSpan).css('letter-spacing', 0);
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('.das_font_tracking_more', menu_scope).click(function(event){
					var spacing = parseFloat($('#'+elementIDs.myTextSpan).css('letter-spacing')) + 1 || 1;
					$('#'+elementIDs.myTextSpan).css('letter-spacing', spacing);
					FitToContent(elementIDs.myTextSpan);
					$('#'+elementIDs.myTextContainer).resizeContainer(elementIDs.myTextSpan);
				});
				
				$('.das_text_stretchingx_less', menu_scope).button({icons: {primary: "ui-icon-arrow-1-w"}, text: false});
				$('.das_text_stretchingx_reset', menu_scope).button({icons: {primary: "ui-icon-cancel"}, text: false});
				$('.das_text_stretchingx_more', menu_scope).button({icons: {primary: "ui-icon-arrow-1-e"}, text: false});
				
				$('.das_text_stretchingx_btn', $('.das_text_stretchingx')).css('width', 'auto');
				
				$('.das_text_stretchingx_less', menu_scope).click(function(event){
					var currentX = $('#'+elementIDs.myTextContainer).attr('stretchx') || 1;
					var stretchY = $('#'+elementIDs.myTextContainer).attr('stretchy') || 1;
					var stretchX = parseFloat(currentX) - .1;
					$('#'+elementIDs.myTextSpan).css({transformOrigin: '0px 0px'});
					$('#'+elementIDs.myTextSpan).css({scale: [stretchX, stretchY]});
					var width = $('#'+elementIDs.myTextSpan).width() * stretchX;
					var height = $('#'+elementIDs.myTextSpan).height() * stretchY;
					$('#'+elementIDs.myTextContainer).attr('stretchX', stretchX).attr('stretchY', stretchY).css('width', width).css('height', height);
					$('#'+elementIDs.myTextSpan).attr('stretchx', stretchX).attr('stretchy', stretchY);
				});
				
				$('.das_text_stretchingx_reset', menu_scope).click(function(event){
					var currentY = $('#'+elementIDs.myTextContainer).attr('stretchy') || 1;
					$('#'+elementIDs.myTextSpan).css({transformOrigin: '0px 0px'});
					$('#'+elementIDs.myTextSpan).css({scale: [1, currentY]});
					var width = $('#'+elementIDs.myTextSpan).width();
					var height = $('#'+elementIDs.myTextSpan).height() * currentY;
					$('#'+elementIDs.myTextContainer).attr('stretchx', 1).css('width', width).css('height', height);
				});
				
				$('.das_text_stretchingx_more', menu_scope).click(function(event){
					var currentX = $('#'+elementIDs.myTextContainer).attr('stretchx') || 1;
					var stretchY = $('#'+elementIDs.myTextContainer).attr('stretchy') || 1;
					var stretchX = parseFloat(currentX) + .1;
					$('#'+elementIDs.myTextSpan).css({transformOrigin: '0px 0px'});
					$('#'+elementIDs.myTextSpan).css({scale: [stretchX, stretchY]});
					var width = $('#'+elementIDs.myTextSpan).width() * stretchX;
					var height = $('#'+elementIDs.myTextSpan).height() * stretchY;
					$('#'+elementIDs.myTextContainer).attr('stretchX', stretchX).attr('stretchY', stretchY).css('width', width).css('height', height);
					$('#'+elementIDs.myTextSpan).attr('stretchx', stretchX).attr('stretchy', stretchY);
				});
				
				$('.das_text_stretchingy_less', menu_scope).button({icons: {primary: "ui-icon-arrow-1-w"}, text: false});
				$('.das_text_stretchingy_reset', menu_scope).button({icons: {primary: "ui-icon-cancel"}, text: false});
				$('.das_text_stretchingy_more', menu_scope).button({icons: {primary: "ui-icon-arrow-1-e"}, text: false});
				
				$('.das_text_stretchingy_btn', $('.das_text_stretchingy')).css('width', 'auto');
				
				$('.das_text_stretchingy_less', menu_scope).click(function(event){
					var currentY = $('#'+elementIDs.myTextContainer).attr('stretchy') || 1;
					var stretchX = $('#'+elementIDs.myTextContainer).attr('stretchx') || 1;
					var stretchY = parseFloat(currentY) - .1;
					$('#'+elementIDs.myTextSpan).css({transformOrigin: '0px 0px'});
					$('#'+elementIDs.myTextSpan).css({scale: [stretchX, stretchY]});
					var width = $('#'+elementIDs.myTextSpan).width() * stretchX;
					var height = $('#'+elementIDs.myTextSpan).height() * stretchY;
					$('#'+elementIDs.myTextContainer).attr('stretchX', stretchX).attr('stretchY', stretchY).css('width', width).css('height', height);
					$('#'+elementIDs.myTextSpan).attr('stretchx', stretchX).attr('stretchy', stretchY);
				});
				
				$('.das_text_stretchingy_reset', menu_scope).click(function(event){
					var currentX = $('#'+elementIDs.myTextContainer).attr('stretchx') || 1;
					$('#'+elementIDs.myTextSpan).css({transformOrigin: '0px 0px'});
					$('#'+elementIDs.myTextSpan).css({scale: [currentX, 1]});
					var width = $('#'+elementIDs.myTextSpan).width() * currentX;
					var height = $('#'+elementIDs.myTextSpan).height();
					$('#'+elementIDs.myTextContainer).attr('stretchy', 1).css('width', width).css('height', height);
				});
				
				$('.das_text_stretchingy_more', menu_scope).click(function(event){
					var currentY = $('#'+elementIDs.myTextContainer).attr('stretchy') || 1;
					var stretchX = $('#'+elementIDs.myTextContainer).attr('stretchx') || 1;
					var stretchY = parseFloat(currentY) + .1;
					$('#'+elementIDs.myTextSpan).css({transformOrigin: '0px 0px'});
					$('#'+elementIDs.myTextSpan).css({scale: [stretchX, stretchY]});
					var width = $('#'+elementIDs.myTextSpan).width() * stretchX;
					var height = $('#'+elementIDs.myTextSpan).height() * stretchY;
					$('#'+elementIDs.myTextContainer).attr('stretchX', stretchX).attr('stretchY', stretchY).css('width', width).css('height', height);
					$('#'+elementIDs.myTextSpan).attr('stretchx', stretchX).attr('stretchy', stretchY);
				});
				
				$('.das_text_scale', menu_scope).buttonset();
				$('.das_text_scale', menu_scope).click(function(event){
					// if scale button is clicked then re-initialize text box for scale
					if($('#das_text_scale_'+elementIDs.myID+' :radio:checked').attr('mynum') == 1){
						makeResizable(dasContainerID, elementIDs.myID, true);
					} else {
						makeResizable(dasContainerID, elementIDs.myID, false);
					}
				});
				
				$('.ui-button-text', $('.das_font_options')).css('font-size', '8pt');
				
				$(window).click(function(event){
					$('#'+elementIDs.myTextSpan).css('font-family', curr_font);
					$('.'+menuIDs.textFontOptions, menu_scope).hide(100);
					$('.'+menuIDs.textSizeList, menu_scope).hide(0);
				});
				
				// Text Mask Selection
				for(var i=0; i < g_DaS_text_masks.length; i++){
					$('.das_text_mask', menu_scope).append($('<option>').attr('value', g_DaS_text_masks[i].id).append(g_DaS_text_masks[i].text));
				}
				
				$('.das_text_mask', menu_scope).change(function(){
					if($(this).val() != 0){
						$('#'+elementIDs.myTextContainer).addClass('das_text_mask').attr('das_mask_id', $(this).val());
					} else {
						$('#'+elementIDs.myTextContainer).removeClass('das_text_mask').attr('das_mask_id', '');
					}
				});
				
				// Designer Input Width, Height, Top and Left
				var width = $('#'+elementIDs.myTextSpan).css('width');
				var height = $('#'+elementIDs.myTextSpan).css('height');
				var position = $('#'+elementIDs.myTextContainer).position();
				
				$('.'+menuIDs.textWidth, menu_scope).val(parseFloat(width));
				$('.'+menuIDs.textHeight, menu_scope).val(parseFloat(height));
				$('.'+menuIDs.textTop, menu_scope).val(position.top);
				$('.'+menuIDs.textLeft, menu_scope).val(position.left);
				
				$('.das_text_duplicate', menu_scope).button().click(function(event){
					$('#'+elementIDs.myTextContainer).cloneText(elementIDs.myDASID);
				});
				
				$('.'+menuIDs.textSizeUnit, menu_scope).change(function(){
					updateDesignerControls(elementIDs.myTextContainer, elementIDs.myDASID);
				});
				
				function manually_size(prop, value){
					var mod = 1;
					
					if($('.'+menuIDs.textSizeUnit, menu_scope).val() == 'in'){
						mod = $('#das_dpi').val();
					} else if($('.'+menuIDs.textSizeUnit, menu_scope).val() == 'mm'){
						mod = $('#das_dpi').val() / 25.4;
					}
					
					$('#'+elementIDs.myTextContainer).css(prop, value * mod);
					
					if($('#'+elementIDs.myTextContainer).hasClass('das_tag_resizable')){ //!das_tag_text_not_fill
						var stretchX = $('#'+elementIDs.myTextContainer).width() / $('#'+elementIDs.myTextSpan).width();
						var stretchY = $('#'+elementIDs.myTextContainer).height() / $('#'+elementIDs.myTextSpan).height();
						
						$('#'+elementIDs.myTextSpan).css({transformOrigin: '0px 0px'});
						$('#'+elementIDs.myTextSpan).css({scale: [stretchX, stretchY]});
						
						$('#'+elementIDs.myTextContainer).attr('stretchX', stretchX).attr('stretchY', stretchY);
					} else {
						if(prop == 'width' || prop == 'height'){
							$('#'+elementIDs.myTextDiv).css(prop, value * mod);
							$('#'+elementIDs.myTextSpan).css(prop, value * mod);
						}
						
						$('#'+elementIDs.myTextSpan).autoTextSize(false, 0, 350);
					}
				}
				
				$('.'+menuIDs.textWidth, menu_scope).keyup(function(){
					manually_size('width', $(this).val());
				});
				$('.'+menuIDs.textHeight, menu_scope).keyup(function(){
					manually_size('height', $(this).val());
				});
				$('.'+menuIDs.textTop, menu_scope).keyup(function(){
					manually_size('top', $(this).val());
				});
				$('.'+menuIDs.textLeft, menu_scope).keyup(function(){
					manually_size('left', $(this).val());
				});
				
				// Text Color Setup
				var textColor = $('#'+elementIDs.myTextSpan).css('color');
				var bgColor = $('#'+elementIDs.myTextSpan).css('background-color');
				
				$('.'+menuIDs.textColorHolder, menu_scope).css('display', '');
				$('.das_text_color_heading', menu_scope).css('display', '');
				
				$('.'+menuIDs.textColorSelector, menu_scope).empty();
				createColorPicker(menuIDs.textColorSelector+'_'+elementIDs.myID, menuIDs.textColorHolder+'_'+elementIDs.myID, textColor, elementIDs.myTextSpan, 'color', elementIDs.myDASID, myFranchise);
				
				$('.'+menuIDs.textBgColorSelector, menu_scope).empty();
				createColorPicker(menuIDs.textBgColorSelector+'_'+elementIDs.myID, menuIDs.textColorHolder+'_'+elementIDs.myID, bgColor, elementIDs.myTextBGColor, 'background-color', elementIDs.myDASID, myFranchise);
				
				var dasBGColor = $('#'+elementIDs.myDASID).css('background-color');
				$('.'+menuIDs.dasBGColorSelector, menu_scope).empty();
				createColorPicker(menuIDs.dasBGColorSelector+'_'+elementIDs.myID, menuIDs.dasBGColorHolder+'_'+elementIDs.myID, dasBGColor, elementIDs.myDASID, 'background-color', elementIDs.myDASID, myFranchise);
	  	} else if(elementType == "img"){
		  	function resizeImg(objSize, ratioLock){
		  		var ratioLock = ratioLock || false;
		  		if(typeof objSize.width != "undefined" && typeof objSize.height != "undefined"){
		  		
		  		} else {
		  			$('#'+elementIDs.myImgID).removeAttr('width').removeAttr('height');
		  			if(typeof objSize.width != "undefined"){
					  	$('#'+elementIDs.myDivID).css("width", objSize.width);
							$('#'+elementIDs.myImgID).css("width", objSize.width);
							
							if(ratioLock){
								$('#'+elementIDs.myDivID).css('height', '');
								$('#'+elementIDs.myImgID).css('height', '');
							}
							
							setPropSize("height");
						} else {
							$('#'+elementIDs.myDivID).css("height", objSize.height);
							$('#'+elementIDs.myImgID).css("height", objSize.height);
							
							if(ratioLock){
								$('#'+elementIDs.myDivID).css("width", '');
								$('#'+elementIDs.myImgID).css("width", '');
							}
							
							setPropSize("width");
						}
					}
					
					function setPropSize(sizeAttr){
						var imgDim;
						if(sizeAttr == "width"){
							imgDim = $('#'+elementIDs.myImgID).width();	
						} else {
							imgDim = $('#'+elementIDs.myImgID).height();	
						}
						
						if(imgDim != 0){
							$('#'+elementIDs.myDivID).css(sizeAttr, imgDim);
							updateDesignerControls(elementIDs.myDivID, elementIDs.myODASID, {omit: sizeAttr});
						} else {
							setTimeout(function(){setPropSize(sizeAttr);}, 500);
						}
					};
		  	};

	  		$('.'+menuIDs.imgFullSize, menu_scope).click(function(event){
		  		// make image fill the design
		  		var newWidth = $('#'+ elementIDs.myDASID).width();
					var newHeight = $('#' + elementIDs.myDASID).height();
					$('#'+elementIDs.myDivID).css("width", newWidth).css('height', newHeight);
					$('#'+elementIDs.myImgID).css("width", newWidth).css('height', newHeight);
					//setImgHeight(elementIDs.myImgID, elementIDs.myDivID);
	  		});
	  						
				$('.'+menuIDs.imgThumb, menu_scope).attr('src', $('#'+elementIDs.myImgID).attr('src'));
				
				if($('.'+menuIDs.imgThumb, menu_scope).width() > 200){
					$('.'+menuIDs.imgThumb, menu_scope).css('height', '');
					$('.'+menuIDs.imgThumb, menu_scope).css('width', 200);
					var imgHeight = $('.'+menuIDs.imgThumb, menu_scope).height();
					$('.'+menuIDs.imgThumb, menu_scope).css('height', imgHeight);
				}
				
				if($('.'+menuIDs.imgThumb, menu_scope).height() > 200){
					$('.'+menuIDs.imgThumb, menu_scope).css('width', '');
					$('.'+menuIDs.imgThumb, menu_scope).css('height', 200);
					var imgWidth = $('.'+menuIDs.imgThumb, menu_scope).width();
					$('.'+menuIDs.imgThumb, menu_scope).css('width', imgWidth);
				}
				
				$('.das_img_width', menu_scope).val($('#'+elementIDs.myDivID).width());
				$('.das_img_height', menu_scope).val($('#'+elementIDs.myDivID).height());
				
				function arrowKey(code){
					if(code.keyCode >= 37 && code.keyCode <= 40){
						return true;
					} else {
						return false;
					}
				};
				
				$('.das_img_width', menu_scope).keyup(function(e){
					if(!arrowKey(e)){
						if($(this).val() != ""){
							var ratioLock = false;
							if($('.das_img_ratio_lock', menu_scope).attr('checked') == 'checked'){
								ratioLock = true;
							}
							resizeImg({width: $(this).val()}, ratioLock);
						}
					}
				});
				$('.das_img_height', menu_scope).keyup(function(e){
					if(!arrowKey(e)){
						if($(this).val() != ""){
							var ratioLock = false;
							if($('.das_img_ratio_lock', menu_scope).attr('checked') == 'checked'){
								ratioLock = true;
							}
							resizeImg({height: $(this).val()}, ratioLock);
						}
					}
				});
				
				$('.das_img_ratio_lock', menu_scope).change(function(){
					$('#'+elementIDs.myDivID).resizable('destroy');
					var ratioLock = true;
					
					if(typeof $(this).attr('checked') == 'undefined'){
						ratioLock = false;
					}
					
					$('#'+elementIDs.myDivID).img_resizable(elementIDs, ratioLock);
				});
				
				$('.'+menuIDs.imgName, menu_scope).html($('#'+elementIDs.myImgID).attr('imgName'));
				
				$('.'+menuIDs.imgReplace, menu_scope).click(function(event){
					var replaceCallback = function(){
						$('#'+elementIDs.myImgID).css('width', '').css('height', '');
						
						var width = $('#'+elementIDs.myImgID).width();
						var height = $('#'+elementIDs.myImgID).height();
						var cWidth = $('#'+elementIDs.myDivID).width();
						var cHeight = $('#'+elementIDs.myDivID).height();
						var percentW = cWidth / width;
						var percentH = cHeight / height;
						
						$('#'+elementIDs.myImgID).css('left', 0).css('top', 0);
						
						if(percentW < percentH){
							$('#'+elementIDs.myImgID).css('width', '').css('height', cHeight);
						} else {
							$('#'+elementIDs.myImgID).css('width', cWidth).css('height', '');
						}
						
						$('.das_main_menu').initializeMainMenu(elementIDs.myID, 'image', elementIDs.myDASID);
					}
					
					loadImgPicker($('.'+elementIDs.myImgID), replaceCallback);
				});
				
				if($('#'+elementIDs.myDivID).hasClass('das_tag_can_substitute')){
					var DesignVars = {};
					var MenuVars = {};
					
					DesignVars.windowWidth = $('#'+elementIDs.myDivID).width();
					DesignVars.windowHeight = $('#'+elementIDs.myDivID).height();
					DesignVars.imgWidth = $('#'+elementIDs.myImgID).width();
					DesignVars.imgHeight = $('#'+elementIDs.myImgID).height();
					DesignVars.imgLeft = $('#'+elementIDs.myImgID).position().left;
					DesignVars.imgTop = $('#'+elementIDs.myImgID).position().top;
					
					MenuVars.imgWidth = $('.'+menuIDs.imgThumb, menu_scope).width();
					MenuVars.imgHeight = $('.'+menuIDs.imgThumb, menu_scope).height();
					MenuVars.imgLeft = $('.'+menuIDs.imgThumb, menu_scope).position().left;
					MenuVars.imgTop = $('.'+menuIDs.imgThumb, menu_scope).position().top;
					MenuVars.maskWidth = (DesignVars.windowWidth / DesignVars.imgWidth) * MenuVars.imgWidth;
					MenuVars.maskHeight = (DesignVars.windowHeight / DesignVars.imgHeight) * MenuVars.imgHeight;
					MenuVars.maskLeft = ((MenuVars.imgWidth / DesignVars.imgWidth) * Math.abs(DesignVars.imgLeft)) + MenuVars.imgLeft;
					MenuVars.maskTop = ((MenuVars.imgHeight / DesignVars.imgHeight) * Math.abs(DesignVars.imgTop)) + MenuVars.imgTop;
					
					$('.'+menuIDs.imgThumbMask, menu_scope).css({'background-color': 'black', 'opacity': .75,'width': MenuVars.maskWidth - 2, 'height': MenuVars.maskHeight - 2, 'position': 'absolute', 'border': '2px solid white', 'left': MenuVars.maskLeft, 'top': MenuVars.maskTop, 'display': ''});
					
					$('#'+elementIDs.myDivID).css('overflow', 'hidden');
					$('#'+elementIDs.myImgID).css('position', 'absolute');
					
					if($('.'+menuIDs.imgThumbMask, menu_scope).hasClass('ui-draggable')){
						$('.'+menuIDs.imgThumbMask, menu_scope).draggable('destroy');
					}
					
					if($('.'+menuIDs.imgThumbMask, menu_scope).hasClass('ui-resizable')){
						$('.'+menuIDs.imgThumbMask, menu_scope).resizable('destroy');
					}
					
					$('.'+menuIDs.imgThumbMask, menu_scope).unbind('mouseover');
					
					var dragContainment = {left: $('.'+menuIDs.imgThumb, menu_scope).position().left, 
						top: $('.'+menuIDs.imgThumb, menu_scope).position().top, 
						right: ($('.'+menuIDs.imgThumb, menu_scope).position().left + $('.'+menuIDs.imgThumb, menu_scope).width()) - MenuVars.maskWidth,
						bottom: ($('.'+menuIDs.imgThumb, menu_scope).position().top + $('.'+menuIDs.imgThumb, menu_scope).height()) - MenuVars.maskHeight};
					
					$('.'+menuIDs.imgThumbMask, menu_scope).draggable({containment: [dragContainment.left, dragContainment.top, dragContainment.right, dragContainment.bottom], stop: mask_drag});
					
					$('.'+menuIDs.imgThumbMask, menu_scope).resizable({handles: 'n, ne, e, se, s, sw, w, nw', stop: function(){
						// TODO: change the draggable containment to include the new size of the mask
					}});
					
					$('.'+menuIDs.imgThumbMask, menu_scope).mouseover(function(){
						$('.ui-resizable-handle', $('.'+menuIDs.imgThumbMask, menu_scope)).css('visibility', 'visible');
					});
					
					function mask_drag(){
						var imgLeft = ($('.'+menuIDs.imgThumbMask, menu_scope).position().left-MenuVars.imgLeft)*(DesignVars.imgWidth / MenuVars.imgWidth);
						var imgTop = ($('.'+menuIDs.imgThumbMask, menu_scope).position().top-MenuVars.imgTop)*(DesignVars.imgHeight / MenuVars.imgHeight);
						
						$('#'+elementIDs.myImgID).css('left', -imgLeft).css('top', -imgTop);
					}
					
					$('.'+menuIDs.imgReplace, menu_scope).css('display', '');
				} else {
					$('.'+menuIDs.imgThumbMask, menu_scope).css({'background-color': '', 'opacity': '', 'width': '', 'height': '', 'position': '', 'display': 'none'});
					$('.'+menuIDs.imgReplace, menu_scope).css('display', 'none');
				}
				
				$('#das_change_background_color_selector_img', menu_scope).empty();
				var das = $('.das_container');
				createColorPicker('das_change_background_color_selector_img', 'das_color_holder', $(das).css('background-color'), das.attr('id'), 'background-color', das.attr('id'));
				
				// Make Background
				if($('#'+elementIDs.myDivID).hasClass("inBackground")){
					$('.'+menuIDs.mkBkgrnd, menu_scope).prop("checked", true);
				} else {
					$('.'+menuIDs.mkBkgrnd, menu_scope).prop("checked", false);
				}
				
				$('.'+menuIDs.mkBkgrnd, menu_scope).click(function(event){
					if($('.'+menuIDs.mkBkgrnd, menu_scope).prop("checked")){
						// Send image to back and give class 'inBackground'
						MoveElement($('#'+elementIDs.myDivID).attr('das_layer'), -1, true);
					} else {
						$('.inBackground', $('.das_container')).removeClass('inBackground');
					}
				});
				
				// Rotate buttons
				$('.'+menuIDs.rotatecw, menu_scope).button({icons: {primary: "ui-icon-arrowrefresh-1-e"}, text: false});
				$('.'+menuIDs.rotateccw, menu_scope).button({icons: {primary: "ui-icon-arrowrefresh-1-e"}, text: false});
				$('.ui-icon', $('#'+menuIDs.rotateccw, menu_scope)).css({ transform: 'rotateY(180deg)' });
				$('.'+menuIDs.rotatecw, menu_scope).click(function(event){
					$('#'+elementIDs.myDivID).transition({ rotate: '+=90deg' });
					$('#'+elementIDs.myMoveHandle).transition({ rotate: '-=90deg' });
				});
				$('.'+menuIDs.rotateccw, menu_scope).click(function(event){
					$('#'+elementIDs.myDivID).transition({ rotate: '-=90deg' });
					$('#'+elementIDs.myMoveHandle).transition({ rotate: '+=90deg' });
				});
				
				// Background Color Setup
				$('.'+menuIDs.dasBGColorSelectorImg, menu_scope).attr('id', menuIDs.dasBGColorSelectorImg + '_' + elementIDs.myID);
				
				$('.das_img_color_holder', menu_scope).css('display', '');				
				
				var dasBGColor = $('#'+elementIDs.myDASID).css('background-color');
				$('.'+menuIDs.dasBGColorSelectorImg, menu_scope).empty();
				createColorPicker(menuIDs.dasBGColorSelectorImg+'_'+elementIDs.myID, menuIDs.dasBGColorHolder+'_'+elementIDs.myID, dasBGColor, elementIDs.myDASID, 'background-color', elementIDs.myDASID, myFranchise);
		  }
			
			// Move Buttons
			var moveSteps = 1;
			var btnMouseDown = false;
			
			var imgFldr = '../img_files/';
			
			moveElement = function(myElementIDs, x, y){
				if($('#'+myElementIDs.myTextContainer).length > 0){
					var myElement = $('#'+myElementIDs.myTextContainer);
				} else {
					var myElement = $('#'+myElementIDs.myDivID);
				}
				
				var top = parseFloat($(myElement).css('top')) || 0;
				var left = parseFloat($(myElement).css('left')) || 0;
				
				$(myElement).css('top', top-(moveSteps*y));
				$(myElement).css('left', left-(moveSteps*x));
			};
			
			$('.das_element_alignment').css('display', '');
			$('.das_move_btn').css('opacity', 1);
			
			// Up Button
			$('.'+menuIDs.moveUp, $(menu_scope)).hover(function(){
				$(this).hover_img();
			}, function(){
				$(this).hover_img();
			});
			
			$('.'+menuIDs.moveUp, $(menu_scope)).mousedown(function(e) {
			    clearTimeout(this.downTimer);
			    btnMouseDown = true;
			    rapid = function() {
			    	moveElement(elementIDs, 0, 1);
			    	if(btnMouseDown){
			    		setTimeout(rapid, 75);
			    	}
			    }
			    this.downTimer = setTimeout(rapid, 500);		    
			}).mouseup(function(e) {
			    clearTimeout(this.downTimer);
			    btnMouseDown = false;
			});
			
			$('.'+menuIDs.moveUp, $(menu_scope)).click(function(event){
				moveElement(elementIDs, 0, 1);
			});
			
			// Down Button
			$('.'+menuIDs.moveDown, $(menu_scope)).hover(function(){
				$(this).hover_img();
			}, function(){
				$(this).hover_img();
			});
			
			$('.'+menuIDs.moveDown, $(menu_scope)).mousedown(function(e) {
			    clearTimeout(this.downTimer);
			    btnMouseDown = true;
			    rapid = function() {
			    	moveElement(elementIDs, 0, -1);
			    	if(btnMouseDown){
			    		setTimeout(rapid, 75);
			    	}
			    }
			    this.downTimer = setTimeout(rapid, 500);		    
			}).mouseup(function(e) {
			    clearTimeout(this.downTimer);
			    btnMouseDown = false;
			});
	
			
			$('.'+menuIDs.moveDown, $(menu_scope)).click(function(event){
				moveElement(elementIDs, 0, -1);
			});
			
			// Left Button
			$('.'+menuIDs.moveLeft, $(menu_scope)).hover(function(){
				$(this).hover_img();
			}, function(){
				$(this).hover_img();
			});
			
			$('.'+menuIDs.moveLeft, $(menu_scope)).mousedown(function(e) {
			    clearTimeout(this.downTimer);
			    btnMouseDown = true;
			    rapid = function() {
			    	moveElement(elementIDs, 1, 0);
			    	if(btnMouseDown){
			    		setTimeout(rapid, 75);
			    	}
			    }
			    this.downTimer = setTimeout(rapid, 500);		    
			}).mouseup(function(e) {
			    clearTimeout(this.downTimer);
			    btnMouseDown = false;
			});
	
			
			$('.'+menuIDs.moveLeft, $(menu_scope)).click(function(event){
				moveElement(elementIDs, 1, 0);
			});
			
			// Right Button
			$('.'+menuIDs.moveRight, $(menu_scope)).hover(function(){
				$(this).hover_img();
			}, function(){
				$(this).hover_img();
			});
			
			$('.'+menuIDs.moveRight, $(menu_scope)).mousedown(function(e) {
			    clearTimeout(this.downTimer);
			    btnMouseDown = true;
			    rapid = function() {
			    	moveElement(elementIDs, -1, 0);
			    	if(btnMouseDown){
			    		setTimeout(rapid, 75);
			    	}
			    }
			    this.downTimer = setTimeout(rapid, 500);		    
			}).mouseup(function(e) {
			    clearTimeout(this.downTimer);
			    btnMouseDown = false;
			});
			
			$('.'+menuIDs.moveRight, $(menu_scope)).click(function(event){
				moveElement(elementIDs, -1, 0);
			});
			
			// Alignment Buttons
			$('.das_alignment').button();
			var element = elementIDs.myTextContainer || elementIDs.myDivID;
			
			$('.'+menuIDs.alignContainerLeft, $(menu_scope)).click(function(event){
				$('#'+element).css('left', 0).css('right', '');
				$('#'+elementIDs.myTextSpan).css('text-align', 'left');
				text_background(elementIDs.myTextSpan);
			});
			
			$('.'+menuIDs.alignContainerCenter, $(menu_scope)).click(function(event){
				$('#'+element).alignElement('center');
				text_background(elementIDs.myTextSpan);
			});
			
			$('.'+menuIDs.alignContainerRight, $(menu_scope)).click(function(event){
				$('#'+element).css('left', '').css('right', 0);
				var myLeft = $('#'+element).position().left / parseFloat($('.das_container').css('scale'));
				$('#'+element).css('left', myLeft).css('right', '');
				$('#'+elementIDs.myTextSpan).css('text-align', 'right');
				text_background(elementIDs.myTextSpan);
			});
			
			$('.'+menuIDs.alignContainerTop, $(menu_scope)).click(function(event){
				$('#'+element).css('top', 0).css('bottom', '');
				$('#'+elementIDs.myTextSpan).css('vertical-align', 'top').attr('das_vert_align', 'top');
				text_background(elementIDs.myTextSpan);
			});
			
			$('.'+menuIDs.alignContainerMiddle, $(menu_scope)).click(function(event){
				$('#'+element).alignElement('middle');
				text_background(elementIDs.myTextSpan);
			});
			
			$('.'+menuIDs.alignContainerBottom, $(menu_scope)).click(function(event){
				$('#'+element).css('top', '').css('bottom', 0);
				var myTop = $('#'+element).position().top / parseFloat($('.das_container').css('scale'));
				$('#'+element).css('top', myTop).css('bottom', '');
				$('#'+elementIDs.myTextSpan).css('vertical-align', 'bottom').attr('das_vert_align', 'bottom');
				text_background(elementIDs.myTextSpan);
			});
	
			$('.'+menuIDs.alignTextLeft, menu_scope).click(function(event){
				$('#'+elementIDs.myTextSpan).css('text-align', 'left');
				text_background(elementIDs.myTextSpan);
			});
			
			$('.'+menuIDs.alignTextCenter, menu_scope).click(function(event){
				
				$('#'+elementIDs.myTextSpan).css('text-align', 'center');
				text_background(elementIDs.myTextSpan);
			});
			
			$('.'+menuIDs.alignTextRight, menu_scope).click(function(event){
				
				$('#'+elementIDs.myTextSpan).css('text-align', 'right');
				text_background(elementIDs.myTextSpan);
			});
			
			$('.'+menuIDs.alignTextTop, menu_scope).click(function(event){
				$('#'+elementIDs.myTextSpan).css('vertical-align', 'top').attr('das_vert_align', 'top');});
				text_background(elementIDs.myTextSpan);
			
			$('.'+menuIDs.alignTextMiddle, menu_scope).click(function(event){
				$('#'+elementIDs.myTextSpan).css('vertical-align', 'middle').attr('das_vert_align', 'middle');});
				text_background(elementIDs.myTextSpan);
			
			$('.'+menuIDs.alignTextBottom, menu_scope).click(function(event){
				$('#'+elementIDs.myTextSpan).css('vertical-align', 'bottom').attr('das_vert_align', 'bottom');});
				text_background(elementIDs.myTextSpan);
			
			// Bring to Front || Send to Back
			var elementContainer = elementIDs.myTextContainer || elementIDs.myDivID;
					
			$('.'+menuIDs.bringFront, menu_scope).button().click(function(event){
				MoveElement($('#'+elementContainer).attr('das_layer'), 1);
			});
			
			$('.'+menuIDs.sendBack, menu_scope).button().click(function(event){
				MoveElement($('#'+elementContainer).attr('das_layer'), -1);
			});
			
			$('.ui-button-text', $('.das_layer_options')).css('font-size', '8pt');
			$('.ui-button', $('.das_layer_options')).css('width', 100);
			
			$('.das_text_color_holder', menu_scope).accordion({collapsible: true, active: false, heightStyle: "content"});
			$('.das_img_color_holder', menu_scope).accordion({collapsible: true, active: false, heightStyle: "content"});
			
			// Element Tags
			if(elementType == "text"){
				var myElement = elementIDs.myTextContainer;
			} else if(elementType == "img") {
				var myElement = elementIDs.myDivID;
			}

			$('.das_tag', menu_scope).each(function(){
				if($('#'+myElement).hasClass($(this).val())){
					$(this).attr('checked', 'checked');
				} else {
					$(this).attr('checked', false);
				}
			});
			
			$('.das_tag', menu_scope).change(function(){				
				if($(this).is(':checked')){
					if($(this).hasClass('das_overflow')){
						$('#'+myElement).removeClass('das_tag_stretch').removeClass('das_tag_scale').removeClass('das_tag_overflow_none');
					}
					
					$('#'+myElement).addClass($(this).attr('value'));
					if($(this).attr('value') == 'das_tag_resizable' && elementType == "text"){
						//$('#'+elementIDs.myTextSpan).removeAttr('das_max_font');
					} else if($(this).attr('value') == 'das_tag_uppercase' && elementType == "text"){
						var myText = $('#'+elementIDs.myTextSpan).val();
						$('#'+elementIDs.myTextSpan).val(myText.toUpperCase());
						// resize textbox to contain new, uppercase text
						$('#'+elementIDs.myTextDiv).fit_to_content(elementIDs.myTextContainer);
					}
				} else {
					$('#'+myElement).removeClass($(this).attr('value'));
					if($(this).attr('value') == 'das_tag_resizable' && elementType == "text"){
						//$('#'+elementIDs.myTextSpan).attr('das_max_font', parseFloat($('#'+elementIDs.myTextSpan).css('font-size')));
					}
				}
				
				if($(this).attr('value') == 'das_tag_bg_text_only'){
					text_background(myElement);
				}
			});
		} else {
  		$('#das_element_menu_'+elementIDs.myID).css('display', '');
		}
  };
  
  $.fn.initializeDesignPermMenu = function(){
	  var menuIDs = designPermMenu_elements();
	  var dasContainer = $(this);
	  
	  for(var key in menuIDs){
		  $('#'+menuIDs[key]).unbind();
	  }
	  
	  $('#das_nav li').hover(
		function () {
			//show its submenu
			$('ul', this).stop().slideDown(100);		
		}, 
		function () {
			//hide its submenu
			$('ul', this).stop().slideUp(100);          
		});
	  
	  $('#'+menuIDs.save).click(function(event){
		  var filename = $('#das_container_for_ban001').attr('das_template_name');
			$('#ban001').Save(filename);
	  });
	  
	  $('#'+menuIDs.saveAs).click(function(event){
		  $('#ban001').Save();
	  });
	  
	  $('#'+menuIDs.load).click(function(event){
		  $('#ban001').Load('ban001', true);
		  $('#'+menuIDs.scale).html($('<div>').append('Fit Window'));
	  });
	  
	  $('#'+menuIDs.clear).click(function(event){
		  $('#ban001').empty();
			$('.das_container_menu_wrapper').remove();		
			$('.tipsy').remove();
			$('#ban001').das(true);
			$('#chngSize').html($('<div>').append('Fit Window'));
			document.title = 'Oakley Sign';
			$('.das_element_menu').remove();
			$('#'+menuIDs.scale).html($('<div>').append('Fit Window'));
	  });
	  
	  $('#'+menuIDs.addText).click(function(event){
	  	var colors = franchise_palette($('#'+menuIDs.franchise).find(":selected").val());
	  	var fonts = franchise_fonts($('#'+menuIDs.franchise).find(":selected").val());
	  	var myToolkit = $('#'+menuIDs.franchise).find(":selected").val();
	  	var default_color;
	  	var default_font;
	  	
	  	for(var i=0; i<colors.length; i++){
		  	if(colors[i][1]){
			  	default_color = colors[i][0];
		  	}
	  	}
	  	
	  	for(var i=0; i<fonts.length; i++){
		  	if(fonts[i][2]){
			  	default_font = fonts[i][0];
		  	}
	  	}
	  	
		  $('.das_container').addText('Type Your Text Here', default_font, default_color, myToolkit, true);
	  });
	  
	  $('#'+menuIDs.addImg).click(function(event){
	  	var myFranchise = $('#das_franchise').val();
	  	loadImgPicker(['/das/images/thumb/franchise_'+myFranchise, '/das/images/thumb/'], myFranchise);
	  });
	  
	  $('#'+menuIDs.uploadImg).click(function(event){
			var uploader = $('<div>').append($('<form>').attr('id', 'imageform').attr('method', 'post').attr('enctype', 'multipart/form-data').attr('action', '/das/code/ajaximage.php').append('Upload your image').append($('<select>').attr('id', 'das_imgUpload_folder').append($('<option>').attr('value', 'main').append('Main Folder')).append($('<option>').attr('value', 'franchise').append('Franchise Folder'))).append($('<input>').attr('type', 'file').attr('name', 'photoimg').attr('id', 'photoimg').css('width', 250))).append($('<div>').attr('id', 'preview'));
			uploader.dialog({ modal: true, stack:true, zIndex:200000, close: function(){
				$('#photoimg').die('change');
				$(this).dialog("destroy");
				uploader.remove();
			}});
			$('#photoimg').live('change', function(){ 
				$("#preview").html('');
				$("#preview").html('<img src="/das/img_files/loader.gif" alt="Uploading...."/>');
				
				var uploadFolder;
				
				if($('#das_imgUpload_folder').val() != "main"){
					uploadFolder = $('#das_franchise').val();
				} else {
					uploadFolder = -1;
				}
				
				$("#imageform").ajaxForm({type: 'GET', async: false, data: {opt1: uploadFolder}, success: function(data){
					if(data.indexOf('<img')!=-1){
						$('#preview').html(data);
						$('#'+$(data).attr('id')).click(function(event){
							myScope.addImg($(this).attr('src'), true);
						});
					} else {
						$('#preview').html(data);
					}
				}}).submit();
			});
		});
	  
	  $('#'+menuIDs.scale).click(function(event){
			var currScale = $('.das_container').attr('size') || 1;	
			if(currScale == 1){
				// Fit in page
				fitWindow();
			} else {
				// Make original size
				var resize = 1;
				$(this).html($('<div>').append('Fit Window'));
				$('.das_move_handle').css('visibility', '');
				$('#das_container_for_ban001').css({ transformOrigin: '0px 0px' });
				$('#das_container_for_ban001').transition({scale: resize}, 0).attr('size', resize);
				$('#ban001').css('width', parseFloat($('#das_container_for_ban001').css('width')) * resize);
				$('#ban001').css('height', parseFloat($('#das_container_for_ban001').css('height')) * resize);
			}
			
			resizeHandles();
		});
	  
	  $('#'+menuIDs.logout).click(function(event){});
	  
	  $.ajax({
		  type:"GET",
		  url:"/das/franchise_data/franchises.php",
		  dataType:"json",
		  async: false,
		  success: function(data){
		  	$('#'+menuIDs.franchise).empty();
		  	
		  	data.sort(function(a, b){
				 var nameA=a[1].toLowerCase(), nameB=b[1].toLowerCase()
				 if (nameA < nameB){
				  return -1;
				 } else if (nameA > nameB){
				  return 1;
				 } else {
				 	return 0; //default return value (no sorting)
				 }
				});
		  	
		  	$('#'+menuIDs.franchise).append($('<option>').attr('value', 0).append('Select a Franchise...'));
		  	
		  	for(var i=0; i<data.length; i++){
			  	$('#'+menuIDs.franchise).append($('<option>').attr('value', data[i][0]).append(data[i][1]));
		  	} 
		  }
	  });
	  
	  $('#'+menuIDs.franchise).change(function(){
		  // store all franchise data (sizes, fonts, colors) in a div at the bottom of the page
		  $('#das_franchise_data').remove();
		  
		  var selected = $(this).find(":selected").val();
		  
		  $('body').append($('<div>').attr('id', 'das_franchise_data').attr('franchise', selected));
		  
		  var colors = franchise_palette(selected);
		  // todo: get franchise_fonts() to add the elements the first time
		  var fonts = franchise_fonts(selected);
		  var sizes = franchise_sizes(selected);
		  
		  $('#'+menuIDs.size).empty();
		  
		  sizes.sort(function(a, b){
			  if(a[2] < b[2]){
				  return -1;
			  } else if(a[2] > b[2]){
				  return 1;
			  } else {
				 	if(a[3] < b[3]){
					 	return -1;
				 	} else if(a[3] > b[3]){
					 	return 1;
				 	} else {
					 	return 0;
				 	}
			  }
		  });
		  
		  $('#'+menuIDs.size).append($('<option>').attr('value', 0).append('Select a Size...'));
		  
		  for(var i=0; i<sizes.length; i++){
			  $('#'+menuIDs.size).append($('<option>').attr('id', i).attr('value', sizes[i][0]).attr('das_height', sizes[i][2]).attr('das_width', sizes[i][3]).text(sizes[i][1]));
		  }
		  
		  load_bg_colors();
		  
		  load_franchise_fonts(selected);
	  });
	  
	  $('#'+menuIDs.size).change(function(){
	  	var selected = $(this).find(":selected");
	  	var mult = $('#das_dpi').val();
	  	var das_scale = 1;
	  	var width = $(selected).attr('das_width')*mult;
	  	var height = $(selected).attr('das_height')*mult;
	  	$('.das_container').css('width', width).css('height', height);
	  	$('.das_original_element').css('width', width * das_scale).css('height', height * das_scale);
	  	
	  	fitWindow();
	  });
	  
	  $('#das_dpi').change(function(){
		  var selected = $('#'+menuIDs.size).find(":selected");
		  var mult = $('#das_dpi').find(":selected").val();
		  var das_scale = $('.das_container').attr('size') || 1;
		  var width = $(selected).attr('das_width')*mult;
		  var height = $(selected).attr('das_height')*mult;
		  $('.das_container').css('width', width).css('height', height);
		  $('.das_original_element').css('width', width * das_scale).css('height', height * das_scale);
	  });
	  
	  function load_bg_colors(){
		  // Background Color Setup
			var bgColor_holder = 'das_background_color_holder';
			var bgColor_selector = 'das_change_background_color_selector_main';
			var myDASID = 'das_container_for_'+$('.das_original_element').attr('id');
			var myFranchise = $('#'+menuIDs.franchise).find(":selected").val();				
			
			var dasBGColor = $('.das_container').css('background-color');
			
			$('#'+bgColor_holder).accordion({collapsible: true, active: false, heightStyle: "content"});
			
			$('.das_change_background_color_selector').empty().each(function(){
				createColorPicker($(this).attr('id'), bgColor_holder, dasBGColor, myDASID, 'background-color', myDASID, myFranchise);
			});
	  };
	  
	  load_bg_colors();
	  
	  $('.das_design_tag').change(function(){				
			if($(this).is(':checked')){
				$('.das_container').addClass($(this).attr('value'));
			} else {
				$('.das_container').removeClass($(this).attr('value'));
			}
		});
	  
	  fitWindow();
	  
	  $('.das_side_menu').css('height', $(window).height() - 90);
	  
	  $(window).resize(function(){
		  $('.das_side_menu').css('height', $(window).height() - 90);
	  });
  };
  
  $.fn.hover_img = function(){
		var src = $(this).attr('src');
		var hover = $(this).attr('hover_img');
		$(this).attr('src', hover);
		$(this).attr('hover_img', src);
	};
  
  function load_franchise_fonts(myToolkit){
	  // load franchise fonts
	  data = franchise_fonts(myToolkit);
	  
	  // todo: load css files for fonts
	  var myFonts = new Array();
	  
	  for(var i=0; i<data.length; i++){
		  myFonts.push(data[i][0]);
	  }
	  
	  loadFonts(myFonts);
  };
  
  function franchise_sizes(franchiseID){	  
	  var sizes = new Array();
	  
	  if($('#franchise_sizes').length > 0){
		  // read info from page
		  $('.franchise_size').each(function(){
			  sizes.push([$(this).attr('width'), $(this).att('height'), $(this).attr('desc')]);
		  });
	  } else {
		  // lookup info from php
		  $.ajax({
				type:"GET",
				url: "/das/franchise_data/franchise_sizes.php",
				dataType: 'json',
				data: { franchiseID: franchiseID },
				async: false,
				success: function(data){
					sizes = data;
				}
			});
			
			$('#das_franchise_data').append($('<div>').attr('id', 'franchise_sizes'));
			
			for(var i=0; i<sizes.length; i++){
				$('#franchise_sizes').append($('<div>').attr('id', 'size_'+i).addClass('franchise_size').attr('height', sizes[i][1]).attr('width', sizes[i][2]).attr('desc', sizes[i][0]));
			}
	  }
	  
	  return sizes;
  };
  
  function franchise_fonts(franchiseID){
	  var fonts = new Array();
	  
	  if($('#franchise_fonts').length > 0){
		  // read from info on page
		  $('.franchise_font').each(function(){
			  fonts.push([$(this).attr('name'), $(this).attr('title'), $(this).attr('default') == "true", $(this).attr('bold') == "true", $(this).attr('italics') == "true"]);
		  });
	  } else {
	  	// lookup info from php
		  $.ajax({
			  type:"GET",
			  url: "/das/franchise_data/franchise_fonts.php",
			  dataType: 'json',
			  data: { franchiseID: franchiseID },
			  async: false,
			  success: function(data){
				  fonts = data;
			  }
		  });
		  
		  $('#das_franchise_data').append($('<div>').attr('id', 'franchise_fonts'));
		  
		  for(var i=0; i<fonts.length; i++){
			  $('#franchise_fonts').append($('<div>').attr('id', 'font_'+i).addClass('franchise_font').addClass('font_data_'+fonts[i][0]).attr('name', fonts[i][0]).attr('title', fonts[i][1]).attr('default', fonts[i][2]).attr('bold', fonts[i][3]).attr('italics', fonts[i][4]).attr('ie_padding', fonts[i][5]));
		  }
	  }
	  
	  return fonts;
  };
  
  function franchise_palette(franchiseID){
	  var colors = new Array();
		
		if($('#franchise_colors').length > 0){
			// read from info on page
			$('.franchise_color').each(function(){
				colors.push([$(this).attr('rgb'), $(this).attr('default') == true]);
			});
		} else {
			// lookup info from php
			$.ajax({
				type:"GET",
				url: "/das/franchise_data/franchise_colors.php",
				dataType: 'json',
				data: { franchiseID: franchiseID },
				async: false,
				success: function(data){
					colors = data;
				}
			});
			
			$('#das_franchise_data').append($('<div>').attr('id', 'franchise_colors'));
			
			for(var i=0; i<colors.length; i++){
				$('#franchise_colors').append($('<div>').attr('id', 'color_'+i).addClass('franchise_color').attr('rgb', colors[i][0]).attr('default', colors[i][1]));
			}
		}
				
		return colors;
  };
  
  function updateDesignerControls(elementID, dasID, parameters){
  	// todo: fix the parameter OMIT that's being passed, it's backwards
  	var parameters = parameters || {};
  	var menuIDs = designMainMenu_elements();
  	var menu_scope = $('#das_element_menu_'+$('#'+elementID).attr('myid'));
  	
  	parameters.omit = parameters.omit || null;
  	
  	if($('#'+elementID).hasClass('das_img_container')){
	  	if(parameters.omit != "height"){
				$('#das_img_width_'+$('#'+elementID).attr('myID')).val($('#'+elementID).width());
			}
			
			if(parameters.omit != "width"){
				$('#das_img_height_'+$('#'+elementID).attr('myID')).val($('#'+elementID).height());
			}
		}
		
		if($('#'+elementID).hasClass('text_container')){
			var elementIDs = text_elements(dasID, $('#'+elementID).attr('myid'));
			var dasScale = $('.das_container').attr('size') || 1;
			var units = $('.'+menuIDs.textSizeUnit, menu_scope).val() || 'px';
			var unitMod = 1;
			var stretchX = $('#'+elementIDs.myTextSpan).css('scale')[0] || 1;
			var stretchY = $('#'+elementIDs.myTextSpan).css('scale')[1] || 1;
			var width = $('#'+elementIDs.myTextSpan).width() * stretchX;
			var height = $('#'+elementIDs.myTextSpan).height() * stretchY;
			var top = $('#'+elementIDs.myTextContainer).position().top / dasScale;
			var left = $('#'+elementIDs.myTextContainer).position().left / dasScale;
			
			if(units == 'in'){
				unitMod = $('#das_dpi').val();
			} else if(units == 'mm'){
				unitMod = $('#das_dpi').val() / 25.4;
			}
			
			$('.'+menuIDs.textWidth, menu_scope).val(width / unitMod);
			$('.'+menuIDs.textHeight, menu_scope).val(height / unitMod);
			$('.'+menuIDs.textTop, menu_scope).val(top / unitMod);
			$('.'+menuIDs.textLeft, menu_scope).val(left / unitMod);
		}
  };
  
  function loadImgPicker(directories, franchise, replaceImg, callback){
	  var myDirList = directories || ['/das/images/thumb/'];
	  var myIDs = das_elements($('.das_container').attr('content_id'));
		
	  // Show dialog with image choices
		var myDialog = $('#'+myIDs.ImgPicker);
		
		myDialogHTML = $('<div>').attr('id', myIDs.ImgPicker);
		myDialogHTML.append($('<div>').attr('id', 'das_img_search').append($('<input>').attr('id', 'das_img_searchbox').attr('type', 'text')).append($('<div>').attr('id', 'das_img_searchbtn').html('search')).append($('<div>').attr('id', 'das_img_clearsearch').html('clear')).append($('<input>').attr('type', 'checkbox').attr('name', 'das_img_background').attr('value', '1').attr('id', 'das_img_background')).append('Insert as Background').append($('<div>').attr('id', 'das_img_upload').append('Upload Image')));
		myImages = $('<div>').attr('id', myIDs.ImgChoice).addClass('das_imgPicker_container');
		
		$.ajax({
			type:"GET",
			url: "/das/code/list_files.php",
			data: { dir: myDirList },
			dataType: 'json',
			async: false,
			success: function(data){
				function search(){
					var strSearch = $('#das_img_searchbox').val();
					
					var arrFound = new Array();
					var mySrc = new Array();
					
					for(var c=0; c<data.length; c++){
						var secImgs = new Array();
						for(var d=0; d<data[c].length; d++){
							if(data[c][d].match(strSearch)){
								secImgs.push(data[c][d]);
							}
						}
						arrFound.push(secImgs);
						mySrc.push($('#das_img_section_'+c).attr('das_src'));
					}
					
					$('.das_imgPicker_container').empty();
					for(var i=0; i<mySrc.length; i++){
						$('.das_imgPicker_container').append($('<div>').attr('id', 'das_img_section_'+i).attr('das_src', mySrc[i]));
						if(i!=(mySrc.length - 1)){
							$('#das_img_section_'+i).css({'border-bottom': 'solid black 1px', 'margin-bottom': 5, 'padding-bottom': 5});
						}
						loadImgs($('#das_img_section_'+i), arrFound[i], mySrc[i]);
					}
					
					$('.imgPicker_thumb').lazyload({
						effect:"fadeIn",
						container:".das_imgPicker_container"
					});
					
					$('.das_imgPicker_container').trigger("scroll");
					
					imgPicker_onCLick();
				};
				
				$('#das_img_searchbox', myDialogHTML).keyup($.throttle(100, search));
				
				$('#das_img_searchbtn', myDialogHTML).button().click(function(event){
					search();
				});
				
				$('.ui-button-text', $('#das_img_searchbtn', myDialogHTML)).css('line-height', '.8em');
				
				$('#das_img_clearsearch', myDialogHTML).button().click(function(event){
					$('#das_img_searchbox').val('');
					
					search();
				});
				
				$('.ui-button-text', $('#das_img_clearsearch', myDialogHTML)).css('line-height', '.8em');
				
				$('#das_img_upload', myDialogHTML).button().click(function(event){
					var encodedID = calcMD5($('.image-box').attr('das_contextid'));
					$(this).parents('.ui-dialog-content').dialog('destroy');
					imgUpload(event, encodedID, replaceImg);
				});
				
				$('.ui-button-text', $('#das_img_upload', myDialogHTML)).css('line-height', '.8em');
				
				for(var j=0; j<data.length; j++){
					if(data[j][0] != 'no data'){
						var franchiseImgs = $('<div>').attr('id', 'das_img_section_'+j).attr('das_src', myDirList[j]);
						if(j!=(data.length - 1)){
							franchiseImgs.css({'border-bottom': 'solid black 1px', 'margin-bottom': 5, 'padding-bottom': 5});
						}
						for(var i=(data[j].length-1); i>=0; i--){
							
							if(data[j][i].indexOf('.')<=0){
								data[j].splice(i, 1);
							}
						}
						
						loadImgs(franchiseImgs, data[j], myDirList[j]);
						
						myImages.append(franchiseImgs);
					}
				}
				
				function loadImgs(jqObj, arrImgs, srcDir){
					for(var i=0; i<arrImgs.length; i++){
						var filename = arrImgs[i];
						var mySrc = '../images/blank.jpg';
						var myData = srcDir+'/'+filename;
						if(filename){
							if($('.das_imgPicker_container').height() <= $('.das_imgPicker_container').height()){
								mySrc = myData;
							}
							$(jqObj).append($('<div>').addClass('imgPicker_thumb_holder').append($('<img>').attr('id', filename).addClass('imgPicker_thumb').attr('data-original', myData).attr('src', mySrc).attr('filename', filename)).append($('<div>').addClass('imgPicker_thumb_descr').append(filename)));
						}
					}
				}
			},
			error: function(jqXHR, status, err){
				alert(status);
			}
		});
		
		myDialogHTML.append(myImages);
		var maxWidth = Math.min(971, $(window).width() - 25);
		var maxHeight = $(window).height() - 25;
		myDialogHTML.dialog({stack:true, zIndex:200000, modal: true, width: maxWidth, height: maxHeight, title: 'Select An Image', buttons:[{
			text: 'Done',
			click: function(){
				if(callback){
					callback(replaceImg);
				}
				$('.das_new_img').removeClass('das_new_img');
				$(this).dialog('destroy').remove();
			}
		}, {
			text: 'Cancel',
			click: function(){
				$('.das_new_img').remove();
				$(this).dialog('destroy').remove();
			}
		}], close: function(){
			$('.das_new_img').removeClass('das_new_img');
			$(this).dialog('destroy').remove();
		}});
		
		$('.imgPicker_thumb').lazyload({
			effect:"fadeIn",
			container:".das_imgPicker_container"
		});
		
		$('.das_imgPicker_container').css('height', $('#das_container_for_'+$('.das_container').attr('content_id')+'_imgPicker').height()-45).trigger("scroll");
		
		imgPicker_onCLick();
		
		function imgPicker_onCLick(){
			var debounced = jQuery.debounce( 250, true, chooseImg );
			$('.imgPicker_thumb').click(debounced);
			
			function chooseImg(){
				var mySrc = $(this).attr('src').replace('thumb', 'full');
				var myName = $(this).attr('id');
				if(typeof replaceImg == 'undefined'){
					// remove any previously placed photos
					$('.das_new_img').remove();
					
					var img = $('<img src="'+mySrc+'" />');
					$('#'+myIDs.myDASID).prepend($('<img>').attr('src', '/das/img_files/loading.gif').attr('id', 'load_gif_for_'+myIDs.myDASID).css('width', 900).css('height', 900).css('z-index', 3000).css('position', 'absolute'));
					$(img).load(function() {
						$('#load_gif_for_'+myIDs.myDASID).remove();
					});
					if($('.das_container_large').length > 0){
						$('.das_container_large').addImg(mySrc, true, 'background');
					} else {
						if($('#das_img_background').attr('checked') == 'checked'){
							// make image fill design
							// todo: when a second img is clicked it doesn't center properly
							
							var newWidth = $('#'+myIDs.myDASID).width();
							var newSize = {};
							newSize.width = newWidth;
							$('.das_container').addImg(mySrc, true, 'background', null, myName, true);
						} else {
							$('.das_container').addImg(mySrc, true, 'background', null, myName);
						}
					}
				} else {
					
					replaceSubstituteImg(replaceImg, mySrc);
				}
			};
		}
		
		$('#das_img_background').click(function(event){
			$('.das_new_img').css('width', '').css('height', '');
			$('.das_content', $('.das_new_img')).css('width', '');
			$('.das_new_img').css('height', $('.das_content', $('.das_new_img')).css('height'))
			$('.das_new_img').alignElement('center');
			$('.das_new_img').alignElement('middle');
			MoveElement($('.das_new_img').attr('das_layer'), -1, true);
		});
  };
  
  function replaceSubstituteImg(imgID, imgSrc){
	  $('#'+imgID).attr('src', imgSrc);
		imgSrc = imgSrc.replace('full', 'thumb');
		var elementID = $('#'+imgID).parents('.das_img_container').attr('myid');
		
		$('.das_img_thumb', $('#das_element_menu_'+elementID)).imagesLoaded().done(function(){
			var containerWidth = $('.das_img_thumb_container', $('#das_element_menu_'+elementID)).width();
			var containerHeight = $('.das_img_thumb_container', $('#das_element_menu_'+elementID)).height();
			
			if(parseInt($('.das_img_thumb', $('#das_element_menu_'+elementID)).css('width')) != containerWidth){
				$('.das_img_thumb', $('#das_element_menu_'+elementID)).css('width', '');
			}
			if(parseInt($('.das_img_thumb', $('#das_element_menu_'+elementID)).css('height')) != containerHeight){
				$('.das_img_thumb', $('#das_element_menu_'+elementID)).css('height', '');
			}
			
			if($('.das_img_thumb', $('#das_element_menu_'+elementID)).width() > containerWidth){
				$('.das_img_thumb', $('#das_element_menu_'+elementID)).css('width', containerWidth).css('height', '');
			} else if($('.das_img_thumb', $('#das_element_menu_'+elementID)).height() > containerHeight) {
				$('.das_img_thumb', $('#das_element_menu_'+elementID)).css('width', '').css('height', containerHeight);
			}
			
			setTimeout(function(){
				var maskWidth = $('.das_img_thumb_mask', $('#das_element_menu_'+elementID)).width();
				var maskHeight = $('.das_img_thumb_mask', $('#das_element_menu_'+elementID)).height();
				var imgWidth = $('.das_img_thumb', $('#das_element_menu_'+elementID)).width();
				var imgHeight = $('.das_img_thumb', $('#das_element_menu_'+elementID)).height();
				var ratio = Math.min((imgWidth / maskWidth), (imgHeight / maskHeight));
				
				$('.das_img_thumb_mask_container', $('#das_element_menu_'+elementID)).css('width', imgWidth).css('height', imgHeight);
				$('.das_img_thumb_mask_container', $('#das_element_menu_'+elementID)).css('top', ((containerHeight - imgHeight)/2)).css('left', ((containerWidth - imgWidth)/2));
				
				var imgPos = $('.das_img_thumb', $('#das_element_menu_'+elementID)).position();
				
				$('.das_img_thumb', $('#das_element_menu_'+elementID)).css('width', imgWidth);
				
				$('.das_img_thumb_mask', $('#das_element_menu_'+elementID)).css('width', maskWidth*ratio).css('height', maskHeight*ratio);
				
				$('.das_img_thumb_mask', $('#das_element_menu_'+elementID)).css('top', imgPos.top).css('left', imgPos.left);
				
				$('.das_img_thumb_mask', $('#das_element_menu_'+elementID)).attr('das_mask_width', maskWidth*ratio).attr('das_mask_height', maskHeight*ratio);
				
				replaceCallback(imgID);
			}, 100);
		});
		$('.das_img_thumb', $('#das_element_menu_'+elementID)).attr('src', imgSrc);
  }
  
  function replaceCallback(imgID){
  	var elementID = $('#'+imgID).attr('myid');
  	var myDASID = $('#'+imgID).parents('.das_container').attr('id');
  	var imgThumb = 'das_img_thumb';
  	var imgThumbContainer = 'das_img_thumb_container';
  	var menu_scope = $('#das_element_menu_'+elementID);
		if($('.'+imgThumb, menu_scope).width() > $('.'+imgThumbContainer, menu_scope).width()){
			$('.'+imgThumb, menu_scope).css('height', '').css('width', $('.'+imgThumbContainer, menu_scope).width());
		} else if($('.'+imgThumb, menu_scope).height() > $('.'+imgThumbContainer, menu_scope).height()){
			$('.'+imgThumb, menu_scope).css('width', '').css('height', $('.'+imgThumbContainer, menu_scope).height());
		}
		
		$('#'+imgID).css('width', '').css('height', '');
		
		var width = $('#'+imgID).width();
		var height = $('#'+imgID).height();
		var cWidth = $('#'+imgID).width();
		var cHeight = $('#'+imgID).height();
		var percentW = cWidth / width;
		var percentH = cHeight / height;
		
		$('#'+imgID).css('left', 0).css('top', 0);
		
		if(percentW < percentH){
			$('#'+imgID).css('width', '').css('height', cHeight);
		} else {
			$('#'+imgID).css('width', cWidth).css('height', '');
		}
		
		$('.das_main_menu').initializeMainMenu(elementID, 'image', myDASID);
		
		var elementIDs = Img_Elements(myDASID, elementID);
		
		setTimeout(function(){mask_drag(elementIDs);}, 75);
	}
  
  function imgUpload(event, encodedID, imgID){
		var uploader = $('<div>').attr('id', 'das_img_uploader').append($('<form>').attr('id', 'imageform').attr('method', 'post').attr('enctype', 'multipart/form-data').attr('action', '/das/code/ajaxuserimage.php').append('Upload your image').append($('<input>').attr('type', 'file').attr('name', 'photoimg').attr('id', 'photoimg').css('width', 250))).append($('<div>').attr('id', 'preview'));
		uploader.dialog({ modal: true, stack:true, zIndex:200000, close: function(){
			$('#photoimg').die('change');
			$(this).dialog("destroy");
			uploader.remove();
		}});
		
		$('#photoimg').live('change', function(){ 
			$("#preview").html('');
			$("#preview").html('<img src="/das/img_files/loader.gif" alt="Uploading...."/>');
			$("#imageform").ajaxForm({type: 'GET', async: false, data: {userID: encodedID, imgID: imgID}, success: function(data){
				if(data.indexOf('<img')!=-1){
					$('#preview').html('Done!');
					$('#'+$(data).attr('id')).click(function(event){
						myScope.addImg($(this).attr('src'), true);
					});
					$('#photoimg').die('change');
					$('#das_img_uploader').dialog('destroy');
					$('#das_img_uploader').remove();

					setTimeout(replaceSubstituteImg(imgID, $(data).attr('src')), 1);
				} else {
					$('#preview').html(data);
				}
			}}).submit();
		});
	}
  
  function resizeHandles(){
  	$('body').append($('<div>').attr('id', 'test_border').addClass('das_border').css('display', 'none'));
  	var default_width = parseFloat($('#test_border').css('border-top-width'));
  	$('#test_border').remove();
  	
	  var inverseScale = 1 / $('.das_container').attr('size');
	  var border_width = default_width * inverseScale;
		$('.ui-resizable-handle', $('.das_container')).transition({scale: inverseScale}, 0);
		$('.das_text_handle').css('border-width', border_width);
  };
  
  resize_handles = function(){resizeHandles();};

  das_check_design_mandatory_elements = function() {
	//for user save operations remove the mandatory flags once the save is done
	$('.das_tag_mandatory').each(function(){
		originalValue = $(this).attr('das_default_value');
		userValue = '';
		if ($(this).hasClass('text_container')) {
			userValue = $('.das_text_element', $(this)).val();
		} else {
			userValue = $('.das_content', $(this)).attr('src');
		}

		if ('' != userValue && userValue != originalValue) {
			$(this).removeClass('das_tag_mandatory');
			$(this).addClass('das_tag_mandatory_satisfied');
		}
	});

	return ($('.das_tag_mandatory').length > 0);
  };

  das_activate_first_mandatory = function() {
	$('.das_tag_mandatory').first().activateElement();
  };
  
  das_modify_design = function (modified){  
	  // this function is called after design is modified
	  if(modified){
		  $('.das_original_element, .das_show_when_saved_only, .das_show_when_unsaved_only').addClass('das_modified');
	  } else {
		  $('.das_original_element, .das_show_when_saved_only, .das_show_when_unsaved_only').removeClass('das_modified');
	  }
  }
  
	function calcMD5(str){
		/*
		 * Convert a 32-bit number to a hex string with ls-byte first
		 */
		var hex_chr = "0123456789abcdef";
		function rhex(num){
		  str = "";
		  for(j = 0; j <= 3; j++)
		    str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) +
		           hex_chr.charAt((num >> (j * 8)) & 0x0F);
		  return str;
		}
		
		/*
		 * Convert a string to a sequence of 16-word blocks, stored as an array.
		 * Append padding bits and the length, as described in the MD5 standard.
		 */
		function str2blks_MD5(str){
		  nblk = ((str.length + 8) >> 6) + 1;
		  blks = new Array(nblk * 16);
		  for(i = 0; i < nblk * 16; i++) blks[i] = 0;
		  for(i = 0; i < str.length; i++)
		    blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
		  blks[i >> 2] |= 0x80 << ((i % 4) * 8);
		  blks[nblk * 16 - 2] = str.length * 8;
		  return blks;
		}
		
		/*
		 * Add integers, wrapping at 2^32. This uses 16-bit operations internally 
		 * to work around bugs in some JS interpreters.
		 */
		function add(x, y){
		  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		  return (msw << 16) | (lsw & 0xFFFF);
		}
		
		/*
		 * Bitwise rotate a 32-bit number to the left
		 */
		function rol(num, cnt){
		  return (num << cnt) | (num >>> (32 - cnt));
		}
		
		/*
		 * These functions implement the basic operation for each round of the
		 * algorithm.
		 */
		function cmn(q, a, b, x, s, t){
		  return add(rol(add(add(a, q), add(x, t)), s), b);
		}
		function ff(a, b, c, d, x, s, t){
		  return cmn((b & c) | ((~b) & d), a, b, x, s, t);
		}
		function gg(a, b, c, d, x, s, t){
		  return cmn((b & d) | (c & (~d)), a, b, x, s, t);
		}
		function hh(a, b, c, d, x, s, t){
		  return cmn(b ^ c ^ d, a, b, x, s, t);
		}
		function ii(a, b, c, d, x, s, t){
		  return cmn(c ^ (b | (~d)), a, b, x, s, t);
		}
		
	  x = str2blks_MD5(str);
	  a =  1732584193;
	  b = -271733879;
	  c = -1732584194;
	  d =  271733878;
	
	  for(i = 0; i < x.length; i += 16){
	    olda = a;
	    oldb = b;
	    oldc = c;
	    oldd = d;
	
	    a = ff(a, b, c, d, x[i+ 0], 7 , -680876936);
	    d = ff(d, a, b, c, x[i+ 1], 12, -389564586);
	    c = ff(c, d, a, b, x[i+ 2], 17,  606105819);
	    b = ff(b, c, d, a, x[i+ 3], 22, -1044525330);
	    a = ff(a, b, c, d, x[i+ 4], 7 , -176418897);
	    d = ff(d, a, b, c, x[i+ 5], 12,  1200080426);
	    c = ff(c, d, a, b, x[i+ 6], 17, -1473231341);
	    b = ff(b, c, d, a, x[i+ 7], 22, -45705983);
	    a = ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
	    d = ff(d, a, b, c, x[i+ 9], 12, -1958414417);
	    c = ff(c, d, a, b, x[i+10], 17, -42063);
	    b = ff(b, c, d, a, x[i+11], 22, -1990404162);
	    a = ff(a, b, c, d, x[i+12], 7 ,  1804603682);
	    d = ff(d, a, b, c, x[i+13], 12, -40341101);
	    c = ff(c, d, a, b, x[i+14], 17, -1502002290);
	    b = ff(b, c, d, a, x[i+15], 22,  1236535329);    
	
	    a = gg(a, b, c, d, x[i+ 1], 5 , -165796510);
	    d = gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
	    c = gg(c, d, a, b, x[i+11], 14,  643717713);
	    b = gg(b, c, d, a, x[i+ 0], 20, -373897302);
	    a = gg(a, b, c, d, x[i+ 5], 5 , -701558691);
	    d = gg(d, a, b, c, x[i+10], 9 ,  38016083);
	    c = gg(c, d, a, b, x[i+15], 14, -660478335);
	    b = gg(b, c, d, a, x[i+ 4], 20, -405537848);
	    a = gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
	    d = gg(d, a, b, c, x[i+14], 9 , -1019803690);
	    c = gg(c, d, a, b, x[i+ 3], 14, -187363961);
	    b = gg(b, c, d, a, x[i+ 8], 20,  1163531501);
	    a = gg(a, b, c, d, x[i+13], 5 , -1444681467);
	    d = gg(d, a, b, c, x[i+ 2], 9 , -51403784);
	    c = gg(c, d, a, b, x[i+ 7], 14,  1735328473);
	    b = gg(b, c, d, a, x[i+12], 20, -1926607734);
	    
	    a = hh(a, b, c, d, x[i+ 5], 4 , -378558);
	    d = hh(d, a, b, c, x[i+ 8], 11, -2022574463);
	    c = hh(c, d, a, b, x[i+11], 16,  1839030562);
	    b = hh(b, c, d, a, x[i+14], 23, -35309556);
	    a = hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
	    d = hh(d, a, b, c, x[i+ 4], 11,  1272893353);
	    c = hh(c, d, a, b, x[i+ 7], 16, -155497632);
	    b = hh(b, c, d, a, x[i+10], 23, -1094730640);
	    a = hh(a, b, c, d, x[i+13], 4 ,  681279174);
	    d = hh(d, a, b, c, x[i+ 0], 11, -358537222);
	    c = hh(c, d, a, b, x[i+ 3], 16, -722521979);
	    b = hh(b, c, d, a, x[i+ 6], 23,  76029189);
	    a = hh(a, b, c, d, x[i+ 9], 4 , -640364487);
	    d = hh(d, a, b, c, x[i+12], 11, -421815835);
	    c = hh(c, d, a, b, x[i+15], 16,  530742520);
	    b = hh(b, c, d, a, x[i+ 2], 23, -995338651);
	
	    a = ii(a, b, c, d, x[i+ 0], 6 , -198630844);
	    d = ii(d, a, b, c, x[i+ 7], 10,  1126891415);
	    c = ii(c, d, a, b, x[i+14], 15, -1416354905);
	    b = ii(b, c, d, a, x[i+ 5], 21, -57434055);
	    a = ii(a, b, c, d, x[i+12], 6 ,  1700485571);
	    d = ii(d, a, b, c, x[i+ 3], 10, -1894986606);
	    c = ii(c, d, a, b, x[i+10], 15, -1051523);
	    b = ii(b, c, d, a, x[i+ 1], 21, -2054922799);
	    a = ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
	    d = ii(d, a, b, c, x[i+15], 10, -30611744);
	    c = ii(c, d, a, b, x[i+ 6], 15, -1560198380);
	    b = ii(b, c, d, a, x[i+13], 21,  1309151649);
	    a = ii(a, b, c, d, x[i+ 4], 6 , -145523070);
	    d = ii(d, a, b, c, x[i+11], 10, -1120210379);
	    c = ii(c, d, a, b, x[i+ 2], 15,  718787259);
	    b = ii(b, c, d, a, x[i+ 9], 21, -343485551);
	
	    a = add(a, olda);
	    b = add(b, oldb);
	    c = add(c, oldc);
	    d = add(d, oldd);
	  }
	  return rhex(a) + rhex(b) + rhex(c) + rhex(d);
	};
	
	function fitWindow(){
		var menuIDs = designPermMenu_elements();
		
	  var maxWidth = $(window).width() - 300;
	  var maxHeight = $(window).height() - 135;
	  
	  var resizeWidth = maxWidth / $('.das_original_element').width();
	  var resizeHeight = maxHeight / $('.das_original_element').height();
	  
	  var resize = Math.min(resizeWidth, resizeHeight, 1);
	  if(resize != 1){
		  $('#'+menuIDs.scale).html($('<div>').append('Original Size'));
	  } else {
		  $('#'+menuIDs.scale).html($('<div>').append('Fit Window*'));
	  }
	  
	  $('#das_container_for_ban001').css({ transformOrigin: '0px 0px' });
		$('#das_container_for_ban001').transition({scale: resize}, 0).attr('size', resize);
		$('#ban001').css('width', parseFloat($('#das_container_for_ban001').css('width')) * resize);
		$('#ban001').css('height', parseFloat($('#das_container_for_ban001').css('height')) * resize);
  };
	
	$.fn.alignElement = function(alignment){
		if(alignment == "center"){
			var dasWidth, elementWidth, left;
			dasWidth = $('.das_container').width();
			elementWidth = $(this).width();
			left = (dasWidth - elementWidth) / 2;
			$(this).css('left', left).css('right', '');
			$('.das_text_element', $(this)).css('text-align', 'center');
		} else if(alignment == "middle"){
			var dasHeight, elementHeight, top;
			dasHeight = $('.das_content').height();
			elementHeight = $(this).height();
			top = (dasHeight - elementHeight) / 2;
			$(this).css('top', top).css('bottom', '');
			$('.das_text_element', $(this)).css('vertical-align', 'middle').attr('das_vert_align', 'middle');
		}
	};

	function init_autosave(){
		clearInterval(save_interval_id);
	  
	  save_interval_id = window.setInterval(function(){
			var filename = $('.das_container').attr('das_template_name');
			if(filename != null){
				$('.das_menu_top_left').append($('<span>').attr('id', 'das_saving').append('Saving...'));
				var dasID = $('.das_container').attr('content_id');
				var contextID = $('#'+dasID).attr('das_contextid');
				$('.das_original_element').Save(filename, contextID, true);
				setTimeout(function(){
					$('#das_saving').hide({duration: 400});
					$('#das_saving').remove();
				}, 5000)
			}
		}, 300000);
	};

	g_DasSavedCallBackList.push(function(dasId) {
		var ts = (new Date().getTime());
		$('img[das_user_project_id="' + dasId + '"]').each(function() {
			var cSrc = $(this).attr('src');
			$(this).attr('src', cSrc.replace(/das_ref_ts=[0-9]*/g, 'das_ref_ts=' + ts));
		});

		$('a[das_user_project_id="' + dasId + '"], span[das_user_project_id="' + dasId + '"], td[das_user_project_id="' + dasId + '"]').each(function() {
			var cSrc = $(this).attr('onclick');
			$(this).attr('onclick', cSrc.replace(/das_ref_ts=[0-9]*/, 'das_ref_ts=' + ts)).attr('das_ref_ts', ts);
		});
	});
	
	$.fn.text_border = function(color){
		var textHandle = null;
		var textTop = null;

		if ($(this).hasClass('das_text_handle')) {
			textHandle = $(this);
			textTop = $(this).parent();
		} else if ($(this).hasClass('das_text_container')) {
			textHandle = $(this).parent().find('.das_text_handle');
			textTop = $(this).parent();
		} else if ($(this).hasClass('text_container')) {
			textHandle = $(this).find('.das_text_handle');
			textTop = $(this);
		} else if ($(this).hasClass('das_text_element')) {
			textHandle = $(this).parents('.text_container').find('.das_text_handle');
			textTop = $(this).parents('.text_container');
		}

		if (!color && textHandle) {
			color = textHandle.parent().find('.das_text_element').css('color');
		}

		// off
		$('.das_border').css('border-color', '').removeClass('das_border').removeClass('das_border_toggle');
		window.clearInterval(border_toggle);

		if(color && textHandle){
			// on
			textHandle.css('border-color', color).addClass('das_border');
			if (textTop.hasClass('das_tag_editable')) {
				border_toggle = window.setInterval(function(){
					$('.das_border').toggleClass('das_border_toggle');
				}, g_Das_border_time);
			}
		}
	};
	
	function getBrowser(){
		if(/Chrome/.test(navigator.userAgent)){
			return 'Chrome';
		} else if(/MSIE/.test(navigator.userAgent)){
			return 'IE';
		} else if(/Safari/.test(navigator.userAgent)){
			return 'Safari';
		} else if(/Firefox/.test(navigator.userAgent)){
			return 'Firefox';
		} else {
			return navigator.userAgent;
		}
	};

	$.fn.activateElement = function() {
		var el = $(this);	
		setTimeout(function() {
			if (el.find('textarea').length > 0) {
				el.trigger('mousedown');
				setTimeout(function() {
					el.trigger('mouseup');
					if (el.find('textarea').length > 0) {
						setTimeout(function() {el.find('textarea').select()}, 1);;
					}
				}, 20);
			} else {
				el.click();
			}
		}, 10);
	};
	
	$.fn.getDASversion = function(){ return (g_DaS_version ? g_DaS_version : '0.0.0'); };
	
	function subImgQuality(elementIDs){
		function calculateQuality(){
			if((imgRealWidth < imgContWidth * imgStretchX) || (imgRealHeight < imgContHeight * imgStretchY)){
				$('#'+elementIDs.myDivID).addClass('das_img_quality_low');
			} else {
				$('#'+elementIDs.myDivID).removeClass('das_img_quality_low');
			}
		};
		
		var imgRealWidth = $('#'+elementIDs.myImgID).attr('dasImgRealWidth') || 0;
		var imgRealHeight = $('#'+elementIDs.myImgID).attr('dasImgRealHeight') || 0;
		
		var imgContWidth = $('#'+elementIDs.myDivID).width();
		var imgContHeight = $('#'+elementIDs.myDivID).height();
		
		var imgStretchX = $('#'+elementIDs.myImgID).attr('scaleX') || 1;
		var imgStretchY = $('#'+elementIDs.myImgID).attr('scaleY') || 1;
		
		if(imgRealWidth == 0){
			var imgSrc = $('#'+elementIDs.myImgID).attr('src');

			$("<img/>").attr("src", imgSrc).load(function(){
				imgRealWidth = this.width;
				imgRealHeight = this.height;
				$('#'+elementIDs.myImgID).attr('dasImgRealWidth', imgRealWidth).attr('dasImgRealHeight', imgRealHeight);
				calculateQuality();
			});	
		} else {
			calculateQuality();
		}
	};
	
	test_text = function(text, mask_id){
		return test_text_mask(text, mask_id);
	}
	
	function test_text_mask(text, mask_id){
		var mask_class = g_DaS_text_masks[mask_id].type;
		var formattedString;
		
		var regexObj = g_DaS_text_masks[mask_id].test;
		var strReplace = g_DaS_text_masks[mask_id].replace;
		
		if (regexObj.test(text)) {
			formattedString = text.replace(regexObj, strReplace);
		} else {
			formattedString = text;
		}
		
		return formattedString;
	};
})( jQuery );
