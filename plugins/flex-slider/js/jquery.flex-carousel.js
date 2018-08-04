/**************************************************************************
 * Flex Carousel Responsive jQuery Plugin
 * @info: http://www.codegrape.com/item/flex-carousel-responsive-jquery-plugin/3418
 * @version: 1.0 (02/08/2016)
 * @requires: jQuery v1.7 or later (tested on 1.12.4)
 * @author: flashblue - http://www.codegrape.com/user/flashblue
**************************************************************************/

;(function($,undefined) {
	
	$.fn.extend({	
	
		flexCarousel:function(options) {

			//Default values
			var defaults = {				
				showItems:4,
				itemWidthRangeConflict:"margin",
				rangeCalculate:"maxFirst",
				pagination:true,
				navigation:false,
				navigationText:["Prev", "Next"],
				itemLess:"margin",
				scrollPerPage:false,
				rewind:true,
				pauseOnHover:true,
				drag:true,
				mouseWheel:false,
				
				//Autoplay
				autoPlay:false,
				interval:3000,
				
				//Theme
				themeClass:"flex-theme-default",
				
				//Speed
				slideSpeed:400,
				responsiveSpeed:400,
				scrollPageSpeed:600,
				
				//Responsive
				responsive:true,
				responsiveMode:"breakPoints",
				responsiveBaseOn:window,				
				responsiveDelay:200,
				breakPoints:[[480, 1], [768, 2], [992, 3], [1200, 4]],
				itemWidthRange:[100, 400],
				
				//Animation
				itemAnimation:false,	//flex-fade-in, flex-flip-in-x, flex-flip-in-y, flex-zoom-in
				
				//Lazy load
				lazyLoad:false,			//Load all images if no lazy load for each image
				
				//Callbacks
				beforeInit:null,
				afterInit:null,
				beforeUpdate:null,
				afterUpdate:null,
				indexChanged:null,
				beforeDrag:null,
				afterDrag:null
			};
		
			//Options
			var options = $.extend({}, defaults, options);
		
			/*************************
			    - Carousel class -
			*************************/
			function FlexCarousel($obj, options) {
				
				//Variables
				this.container = $obj;
				this.container.data("flexCarousel", this);
				
				//Options
				this.opt = options;	
				
				//Init carousel
				this.init();
			}
		
		
			FlexCarousel.prototype = {
		
				//Init carousel
				init:function() {
					if ($.isFunction(this.opt.beforeInit)) {
						this.opt.beforeInit();
					}
					
					this.getBrowserStatus();
					this.initMainVars();
					this.buildWrap();
					this.updateUI(false);
					this.wrapper.css("display", "block");
					this.loadEvents();
					
					if (this.opt.autoPlay) {
						this.play();
					}
					
					if ($.isFunction(this.opt.afterInit)) {
						this.opt.afterInit();
					}
					
					//Check visib
					if (this.needCheckVisible) {
						this.checkVisible(0);
					}
				},
				
				//Get browser status
				getBrowserStatus:function() {
					var that = this;
					
					this.isTouch = Modernizr.touch;
					this.transform3d = Modernizr.csstransforms3d;
					this.transform2d = Modernizr.csstransforms;
					this.transition = Modernizr.csstransitions;
					this.cssanimations = Modernizr.cssanimations;
		
					if (this.transition) {
						var transEndEventNames = {
							"WebkitTransition":"webkitTransitionEnd",
							"MozTransition":"transitionend",
							"OTransition":"oTransitionEnd otransitionend",
							"transition":"transitionend"
						};
						
						this.transitionName = Modernizr.prefixed("transition");
						this.transEndName = transEndEventNames[Modernizr.prefixed("transition")];
						
						this.emulateTransitionEnd = function($target, duration) {
							var called = false;
							
							$target.one(that.transEndName, function() {
								called = true;
							});
							
							var callback = function() {
								if (!called)
									$target.trigger(that.transEndName);
							};
							
							window.setTimeout(callback, duration);
						};
						
						this.moveProperty = Modernizr.prefixed("transform");
						
						if (this.transform3d) {
							this.moveValueMarkup = "translate3d({0}px,0px,0px)";
						} else {
							this.moveValueMarkup = "translate({0}px,0px)";
						}
					} else {
						this.moveProperty = "left";
						this.moveValueMarkup = "{0}px";
					}		
				},
				
				//Init main variables
				initMainVars:function() {
					if (window.flexId==undefined) {
						window.flexId = 0;
					}
					
					this.internalId = window.flexId+1;
					this.items = this.container.children();
					this.itemTotal = this.items.size();
					this.visibleItemCount = this.opt.showItems;
					this.showIndex = 0;
					this.activeIndex = 0;
					this.itemPad = 0;
					this.pageIndex = -1;
					this.isSliding = false;
					this.dragging = false;
					this.playStatus = "stop";
					this.doAnimation = this.cssanimations && this.opt.itemAnimation!=false;
					this.needCheckVisible = this.doAnimation || this.opt.lazyLoad;
					
					//Lazy load images
					if (this.opt.lazyLoad) {
						this.lazyImages = this.container.find(".img-lazy[data-src]");
					}
				},
				
				//Build wrapper
				buildWrap:function() {
					var that = this;
					
					//CSS class
					this.originalClass = this.container.attr("class") || "";
					
					this.container.addClass("flex-carousel");
					
					if (this.opt.themeClass!="" && !this.container.hasClass(this.opt.themeClass)) {
						this.container.addClass(this.opt.themeClass);
					}
					
					//Wrapper
					this.items.wrapAll('<div class="flex-wrapper"></div>').wrap('<div class="flex-item"></div>');
					this.flexItems = this.container.find(".flex-item");
					this.wrapper = this.container.find(".flex-wrapper").wrap('<div class="flex-wrapper-holder"></div>');
					this.wrapperHolder = this.container.find(".flex-wrapper-holder");
					
					//Show container
					this.container.css("display", "block");
					
					//Pagination
					if (this.opt.pagination) {
						this.pagination = $('<div class="flex-pagination"></div>').appendTo(this.container);
						
						//Bind pagination event
						this.pagination.on("click.flex touchend", ".flex-page", function() {
							var pageIndex = $(this).data("flexIndex");
							
							if (that.showIndex!=pageIndex) {
								that.goTo(pageIndex, that.opt.scrollPageSpeed, true);
							}
						});
					}
					
					//Navigation
					if (this.opt.navigation) {
						this.navigation = $('<div class="flex-navigation"></div>').appendTo(this.container);
						this.previousBtn = $('<div class="flex-prev">'+this.opt.navigationText[0]+'</div>').appendTo(this.navigation);
						this.nextBtn = $('<div class="flex-next">'+this.opt.navigationText[1]+'</div>').appendTo(this.navigation);
						
						this.previousBtn.on("click.flex", function() {
							that.prev();
						});
						
						this.nextBtn.on("click.flex", function() {
							that.next();
						});
					}
				},
				
				//Calculate responsive items
				calculateResponsiveItems:function() {
					var count = 1, pad = 0, minWidth, maxWidth;					
					var width = $(this.opt.responsiveBaseOn).width();
					var elWidth = this.wrapperHolder.innerWidth();
					
					this.holderWidth = elWidth;
					
					if (this.opt.responsive) {
						if (this.opt.responsiveMode=="itemWidthRange") {
							var minmax;
							minmax = this.opt.itemWidthRange.sort();
							minWidth = minmax[0];
							maxWidth = minmax[1];
							var maxCount = elWidth / minWidth;
							var minCount = elWidth / maxWidth;
		
							if (this.opt.rangeCalculate==="minFirst") {
								count = Math.floor(maxCount);
								
								if (count>0) {
									if (count<minCount) {
										if (this.opt.itemWidthRangeConflict!=="adjust") {
											pad = elWidth/count-maxWidth;
										}
		
									}
								} else {
									count = 1;
								}
							} else if (this.opt.rangeCalculate==="maxFirst") {
								count = Math.ceil(minCount);
								
								if (count>maxCount) {
									count -= 1;
									
									if (count>0) {		
										if (this.opt.itemWidthRangeConflict!=="adjust") {
											pad = elWidth / count - maxWidth;
										}
									} else {
										count = 1;
									}
								}
							}
						} else {
							var breakPoints = this.opt.breakPoints.sort(function(a, b) {
								return b[0] - a[0];
							});
							
							count = this.opt.showItems > breakPoints[0][1] ? this.opt.showItems : breakPoints[0][1];
							
							for (var i = 0; i<breakPoints.length; i++) {
								if (width<=breakPoints[i][0]) {
									count = breakPoints[i][1];
								} else {
									break;
								}
							}
						}
						
						if (count>this.itemTotal) {
							//Break points
							if (this.opt.responsiveMode==="breakPoints") {
								if (this.opt.itemLess==="margin") {
									pad = elWidth/this.itemTotal-elWidth/count;
									count = this.itemTotal;
								} else if (this.opt.itemLess==="scaleUp") {
									count = this.itemTotal;
								}
							}
							
							//Item width range
							if (this.opt.responsiveMode==="itemWidthRange") {		
								if (this.opt.itemLess==="margin") {
									if (this.opt.rangeCalculate==="minFirst") {
										if (minCount>this.itemTotal) {
											count = this.itemTotal;
											pad = elWidth/count-maxWidth;		
										} else {
											count = this.itemTotal;
											pad = 0;
										}
									}
									
									if (this.opt.rangeCalculate==="maxFirst") {
										count = this.itemTotal;
										pad = elWidth/count-maxWidth;
									}		
								}
								
								if (this.opt.itemLess==="scaleUp") {
									count = this.itemTotal;
									pad = 0;
								}
		
							}
		
						}
					} else {
						count = this.opt.showItems;
					}
		
					this.visibleItemCount = count;
					this.itemPad = pad;
					this.itemWidth = elWidth / count;
				},
				
				//Calculate position array
				calculatePositionArray:function() {
					this.itemPositions = [];
					this.pagePositions = [];
					this.userItemPositions = [];
					
					//1.1 add
					this.pageIndexs = [];
					var lastPageIndex = this.itemTotal-this.visibleItemCount;
					var pageNum = 0;
					
					for (var i=0; i<this.itemTotal; i++) {
						this.itemPositions.push(this.itemWidth*i*-1);
						this.userItemPositions.push(this.itemPositions[i]-this.itemPad/2);
						
						if ((i%this.visibleItemCount==0 && i<lastPageIndex) || i==lastPageIndex) {
							pageNum++;
							this.pagePositions.push(this.itemPositions[i]);
							this.pageIndexs.push(i);
						}
						
						this.flexItems.eq(i).data("page", pageNum);
					}		
				},
				
				//Update pagination
				updatePagination:function() {					
					if (this.opt.pagination) {
						this.pagination.empty().hide();
						
						if (this.pagePositions.length>1) {
							this.pagination.show();
							
							for (var i=0; i<this.pagePositions.length; i++) {
								$('<div class="flex-page"><span> </span></div>').data('flexIndex', $.inArray(this.pagePositions[i], this.itemPositions)).appendTo(this.pagination);
							}
						}
					}
				},
				
				//Check pagination
				checkPagination:function() {
					if (this.opt.pagination) {
						for (var i=0; i<this.pageIndexs.length; i++) {
							if (this.showIndex>=this.pageIndexs[i]) {
								pageIndex = i;
							} else {
								break;
							}
						}
		
						this.pagination.find(".active-page").removeClass("active-page");
						this.pagination.find(".flex-page").eq(pageIndex).addClass("active-page");
						this.pageIndex = pageIndex;
					}
				},
				
				//Check navigation
				checkNavigation:function() {
					if (!this.opt.rewind && this.opt.navigation) {
						this.previousBtn.removeClass("flex-disable");
						this.nextBtn.removeClass("flex-disable");
						
						if (!this.showIndex) {
							if (!this.previousBtn.hasClass("flex-disable")) {
								this.previousBtn.addClass("flex-disable");
							}
						}
						
						if (this.showIndex==this.maxTransItems) {
							if (!this.nextBtn.hasClass("flex-disable")) {
								this.nextBtn.addClass("flex-disable");
							}
						}
					}
				},
				
				//Max trans
				maxTrans:function() {
					if (this.visibleItemCount>this.itemTotal) {
						this.maxTransLeft = 0;
						this.maxTransItems = 0;
					} else {
						this.maxTransLeft = (this.itemTotal-this.visibleItemCount)*this.itemWidth;
						this.maxTransItems = this.itemTotal-this.visibleItemCount;
					}
				},
		
				//Update UI
				updateUI:function(animate) {
					var that = this;
					
					if ($.isFunction(this.opt.beforeUpdate)) {
						this.opt.beforeUpdate();
					}
		
					this.calculateResponsiveItems();
					this.maxTrans();
					this.calculatePositionArray();
					this.updatePagination();
					this.checkPagination();
					this.checkNavigation();
					
					var pad = this.itemPad;
					var count = this.visibleItemCount;
					var perWidth = this.itemWidth;
					var nowWrapperWidth = this.wrapper.width();
					var changeWrapperWidth = perWidth*this.itemTotal*2;
		
					if (animate) {
						var callback = function() {};
						
						if (nowWrapperWidth<=changeWrapperWidth) {
							this.wrapper.width(changeWrapperWidth);
							callback = function() {
								that.goTo(that.showIndex, that.opt.slideSpeed, true);
							};
						} else {
							callback = function() {
								that.wrapper.width(changeWrapperWidth);
								that.goTo(that.showIndex, that.opt.slideSpeed, true);
							};
						}
						
						var fullWidth;
						
						if (this.transition) {
							this.wrapper.css(this.transitionName, "");
						}
						
						$.when(this.flexItems.stop(true, false).animate({
							"width":perWidth-pad,
							"marginLeft":pad/2,
							"marginRight":pad/2
						}, {
							duration:this.opt.responsiveSpeed,
							step:function(now, fv) {
								if (true) {
									if (fv.prop=="width") {
										fullWidth = now;
									}
									
									if (fv.prop=="marginLeft") {
										fullWidth += now*2;
										that.moveTo(-that.showIndex*fullWidth);
									}
								}
							}
						})).then(function() {
							if ($.isFunction(that.opt.afterUpdate)) {
								that.opt.afterUpdate();
							}
							
							callback();
						});
					} else {
						this.wrapper.width(changeWrapperWidth);
						this.flexItems.css({
							"width":perWidth-pad,
							"marginLeft":pad/2,
							"marginRight":pad/2
						});
		
						if ($.isFunction(this.opt.afterUpdate)) {
							this.opt.afterUpdate();
						}
					}
		
					this.resumePlay();
				},
				
				//Resize handler
				resizeHandler:function() {
					var that = this;
					var lastWinWidth = $(window).width();
					var resizeTimer;
					
					this.doRezise = function() {
						if ($(window).width()!=lastWinWidth) {
							window.clearTimeout(resizeTimer);
							
							that.clearPlay();
							
							resizeTimer = window.setTimeout(function() {
								var winWidth = $(window).width();
								
								if (lastWinWidth!=winWidth) {
									lastWinWidth = winWidth;
									that.updateUI(true);
								}
		
							}, that.opt.responsiveDelay);
						}
					};
					
					if (this.opt.responsive) {
						$(window).on("resize.flex"+this.internalId, this.doRezise);
					}
				},
				
				//Drag events
				dragEvents:function() {
					var that = this;
					var startPosition;
					var scrollY;
					var dragTarget;
					
					var objHammer = this.wrapperHolder.hammer({
						drag_min_distance:1
					});		
					
					objHammer.on("dragstart", function(ev) {		
						scrollY = undefined;
					}).on("drag", function(ev) {
						if (!that.dragging) {		
							if (typeof scrollY=="undefined") {
								scrollY = !!(scrollY || Math.abs(ev.gesture.deltaX)<Math.abs(ev.gesture.deltaY) );
								
								if (!scrollY) {
									ev.gesture.preventDefault();
								}
							}
		
							if ($.isFunction(that.opt.beforeDrag)) {
								that.opt.beforeDrag();
							}
							
							that.clearPlay();
							that.dragging = true;
							startPosition = that.wrapper.position();
							
							if (that.transition) {
								that.wrapper.css(that.transitionName, "");
							} else {
								that.wrapper.stop();
							}
							
							if (!that.isTouch) {
								that.wrapperHolder.addClass("dragging");
								that.wrapperHolder.css("cursor", that.wrapperHolder.css("cursor"));
							}
		
							dragTarget = ev.target || ev.srcElement;		
						} else {
							if ( typeof scrollY=="undefined") {
								scrollY = !!(scrollY || Math.abs(ev.gesture.deltaX)<Math.abs(ev.gesture.deltaY));
							}
		
							if ((!scrollY && ev.gesture.pointerType=="touch") || ev.gesture.pointerType=="mouse") {		
								ev.gesture.preventDefault();
								
								var overRate = 0.6;
								var newPosX;
								
								if (startPosition.left>0 || startPosition.left<-that.maxTransLeft) {
									newPosX = ev.gesture.deltaX*overRate+startPosition.left;
								} else {
									newPosX = ev.gesture.deltaX+startPosition.left;
								}
		
								if (newPosX<-that.maxTransLeft) {
									if (startPosition.left<-that.maxTransLeft) {
										newPosX = startPosition.left+ev.gesture.deltaX*overRate;
									} else {
										newPosX = -that.maxTransLeft+(newPosX-(-that.maxTransLeft))*overRate;
									}		
								}
								
								if (newPosX>0) {
									if (startPosition.left>0) {
										newPosX = startPosition.left+ev.gesture.deltaX*overRate;
									} else {
										newPosX = newPosX*overRate;
									}		
								}
								
								that.dragEndX = newPosX;
								that.moveTo(newPosX);
							}
						}		
					}).on("dragend", function(ev) {		
						var dragendTarget = ev.target || ev.srcElement;
						
						if ($(dragTarget).is($(dragendTarget)) && !that.isTouch) {
							$(dragTarget).on("click.flex-disableclick", function(evt) {
								evt.stopImmediatePropagation();
								evt.stopPropagation();
								evt.preventDefault();
								$(dragTarget).off("click.flex-disableclick");
								return false;
							});
							
							var eventList = $._data(dragTarget, "events");
							eventList.click.unshift(eventList.click.pop());
						}
						
						ev.gesture.preventDefault();
		
						if (ev.gesture.pointerType=="touch" && scrollY) {
							return;
						}
						
						ev.gesture.preventDefault();
						that.dragging = false;
						
						var posArray = that.opt.scrollPerPage ? that.pagePositions : that.itemPositions;
						var goIndex;
						
						if (that.dragEndX<-that.maxTransLeft) {
							goIndex = that.itemPositions.length-1;
						} else if (that.dragEndX>0) {
							goIndex = 0;
						} else {
							var nextRate = 0.1;
							var nextRateWidth = nextRate*that.itemWidth;
							
							$.each(posArray, function(index, value) {
								var biger = posArray[index-1]===undefined ? Number.MAX_VALUE : posArray[index-1];
								var smaller = posArray[index+1]===undefined ? -Number.MAX_VALUE : posArray[index+1];
								
								if (ev.gesture.deltaX<0 && that.dragEndX>=value-nextRateWidth && that.dragEndX<biger-nextRateWidth) {
									if (that.opt.scrollPerPage) {
										goIndex = $.inArray(value, that.itemPositions);
									} else {
										goIndex = index;
									}
								}
								
								if (ev.gesture.deltaX>0 && that.dragEndX>=smaller+nextRateWidth && that.dragEndX<=value+nextRateWidth) {
									if (that.opt.scrollPerPage) {
										goIndex = $.inArray(value, that.itemPositions);
									} else {
										goIndex = index;
									}
								}
		
							});
						}
		
						if (!that.isTouch) {
							that.wrapperHolder.removeClass("dragging");
							that.wrapperHolder.css("cursor", "");
						}
						
						if ($.isFunction(that.opt.afterDrag)) {
							that.opt.afterDrag();
						}
						
						that.goTo(goIndex, that.opt.slideSpeed, true);
					});		
				},
				
				//Swap events
				swapEvents:function() {
					var that = this;
					
					var objHammer = Hammer(this.wrapperHolder.get(0), {
						swipe_velocity:0.1
					});
					
					objHammer.on("swipeleft swiperight", function(e) {		
						e.gesture.preventDefault();
						
						if (e.type=="dragleft" || e.type=="dragright") {
							return;
						}
						
						if (e.type=="swipeleft") {
							that.next();
						} else {
							that.prev();
						}
					});
				},
				
				//Load events
				loadEvents:function() {
					var that = this;
					
					if (this.opt.responsive) {
						this.resizeHandler();
					}
					
					if (this.opt.drag) {
						this.dragEvents();
					} else {
						this.swapEvents();
					}
					
					if (this.opt.pauseOnHover && !this.isTouch) {
						this.pauseOnHover();
					}
					
					if (this.opt.mouseWheel) {
						this.container.on("mousewheel.flex", function(e) {
							e.stopPropagation();
							e.preventDefault();
							
							if (e.deltaY<0) {
								that.next();
							}
							
							if (e.deltaY>0) {
								that.prev();
							}
						});
					}
					
					if (this.opt.lazyLoad) {
						this.lazyLoadImage();
					}
				},
				
				//Move to
				moveTo:function(value) {
					var style = {};
					
					style[this.moveProperty] = this.moveValueMarkup.replace("{0}", value);
					this.wrapper.css(style);
					
					if (this.needCheckVisible) {
						this.checkVisible(value);
					}		
				},
				
				//Slide to
				slideTo:function(value, speed) {
					var that = this;
					
					if (this.transition) {
						this.isSliding = true;
						this.wrapper.css(this.transitionName, "all "+speed+ "ms cubic-bezier(0.215, 0.61, 0.355, 1)");
						this.moveTo(value);
						
						this.wrapper.one(this.transEndName, function() {
							that.isSliding = false;
						});
						
						this.emulateTransitionEnd(this.wrapper, speed+50);
					} else {
						this.wrapper.stop().animate({"left": value}, speed, function() {
							that.isSliding = false;
						});
					}
				},
				
				//Go to
				goTo:function(index, speed, animate) {
					if (speed===undefined) {
						speed = this.opt.slideSpeed;
					}
					
					if (animate===undefined) {
						animate = true;
					}
					
					if (index<0) {
						index = 0;
					}
					
					if (index>this.maxTransItems) {
						index = this.maxTransItems;
					}
					
					if (animate) {
						this.slideTo(Math.round(this.itemPositions[index]), speed);
						
						if (this.needCheckVisible) {
							this.checkVisible(this.itemPositions[index]);
						}
					} else {
						if (this.transition) {
							this.wrapper.css(this.transitionName, "");
						}
						
						this.moveTo(Math.round(this.itemPositions[index]));
					}
					
					if (index!=this.showIndex && $.isFunction(this.opt.indexChanged)) {
						this.opt.indexChanged(index);
					}
					
					this.showIndex = index;
					this.afterGo();
				},
				
				//Go to start
				toStart:function() {
					this.goTo(0);
				},
				
				//Go to end
				toEnd:function() {
					this.goTo(this.maxTransItems);
				},
				
				//After go
				afterGo:function() {
					this.checkPagination();
					this.checkNavigation();
					this.resumePlay();
				},
				
				//Previous
				prev:function() {
					var prevIndex;
					
					if (this.opt.scrollPerPage) {
						prevIndex = this.pageIndex-1;
						
						if (this.opt.rewind && prevIndex<0) {
							prevIndex = this.pageIndexs.length-1;
						} else if (!this.opt.rewind && prevIndex<0) {
							return false;
						}
						
						this.goTo(this.pageIndexs[prevIndex], this.opt.slideSpeed, true);
					} else {
						prevIndex = this.showIndex-1;
						
						if (this.opt.rewind && prevIndex<0) {
							prevIndex = this.maxTransItems;
						} else if (!this.opt.rewind && prevIndex<0) {
							return false;
						}
						
						this.goTo(prevIndex, this.opt.slideSpeed, true);
					}		
				},
				
				//Next
				next:function() {
					var nextIndex;
					
					if (this.opt.scrollPerPage) {
						nextIndex = this.pageIndex+1;
						
						if (this.opt.rewind && nextIndex>this.pageIndexs.length-1) {
							nextIndex = 0;
						} else if (!this.opt.rewind && nextIndex>this.pageIndexs.length-1) {
							return false;
						}
						
						this.goTo(this.pageIndexs[nextIndex], this.opt.slideSpeed, true);
					} else {
						nextIndex = this.showIndex+1;
						
						if (this.opt.rewind && nextIndex>this.maxTransItems) {
							nextIndex = 0;
						} else if (!this.opt.rewind && nextIndex>this.maxTransItems) {
							return false;
						}
						
						this.goTo(nextIndex, this.opt.slideSpeed, true);
					}		
				},
				
				//Play
				play:function() {
					var that = this;
					
					this.playStatus = "play";
					window.clearInterval(this.playTimer);
					
					this.playTimer = window.setInterval(function() {
						that.next();
					}, this.opt.interval);
				},
				
				//Stop
				stop:function() {
					this.playStatus = "stop";
					window.clearInterval(this.playTimer);
				},
				
				//Resume play
				resumePlay:function() {
					if (this.playStatus!=="stop") {
						this.play();
					}
				},
				
				//Clear play
				clearPlay:function() {
					window.clearInterval(this.playTimer);
				},
				
				//Pause on hover
				pauseOnHover:function() {
					var that = this;
		
					this.container.on("mouseenter.flex", function() {
						that.playStatusBeforeHover = that.playStatus;
						
						if (that.playStatus==="play") {
							that.stop();
						}
					});
					
					this.container.on("mouseleave.flex", function() {
						if (that.playStatusBeforeHover==="play") {
							if (that.dragging) {
								that.playStatus = "play";
							} else {
								that.play();
							}
						}
					});
				},
				
				//Check if visible
				checkVisible:function(x) {					
					var itemRealWidth = this.itemWidth-this.itemPad;
					var inview = [];
					
					for (var i=0; i<this.userItemPositions.length; i++) {
						if (this.userItemPositions[i]>(x-this.holderWidth) && this.userItemPositions[i]<=x || (this.userItemPositions[i]-itemRealWidth)>=(x-this.holderWidth) && (this.userItemPositions[i]-itemRealWidth)<x) {
							inview.push(i);
						}
					}
					
					var $inviewItems = this.items.filter(function(index) {
						return $.inArray(index, inview)>=0;
					});
					
					if (this.doAnimation) {
						$inviewItems.addClass(this.opt.itemAnimation);
						this.items.not($inviewItems).removeClass(this.opt.itemAnimation);
					}
					
					if (this.opt.lazyLoad) {
						var $loaded = $inviewItems.find(this.lazyImages).trigger("flexlazy");
						this.lazyImages = this.lazyImages.not($loaded);
					}		
				},
				
				//Lazy load images
				lazyLoadImage:function() {
					var that = this;
					
					that.lazyImages.one("flexlazy", function() {
						var src = this.getAttribute("data-src");
						this.setAttribute("src", src);
						this.removeAttribute("data-src");
					});
				},
				
				//Destroy carousel
				destroy:function() {
					if (this.pagination) {
						this.pagination.remove();
					}
					
					if (this.navigation) {
						this.navigation.remove();
					}
					
					this.items.unwrap().unwrap().unwrap();
					
					$(window).off("resize.flex"+this.internalId);
					this.container.attr("class", this.originalClass).removeData("flexCarousel");
				},
				
			};
		
			//Create carousel
			var container = $(this);			
			return this.each(function() {
				objCarousel = new FlexCarousel($(this), options);
			});
		
		}

	});
	
})(jQuery);