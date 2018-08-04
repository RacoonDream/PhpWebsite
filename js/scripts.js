// JavaScript Document

$(function(){
	
	"use strict";
	
	
// WOW Animations  
	
//new WOW().init();	
	


// Main Navigation Toggle Menu 	
	
	$(".nav-link").click(function(){
				//alert();	
				 $('.navbar-collapse').collapse('hide');
			});
		
		  // Smooth scrolling using jQuery easing
		 $('a.nav-link[href*="#"]:not([href="#"])').click(function() {
		  
	
		if($(".navbar-toggler").is(":visible") === true) {
			
			$(".mainnav .navbar-toggler").find('i').toggleClass('fa-times fa-bars');	
		 $('html,body').animate({ scrollTop: jQuery(this.hash).offset().top - 290}, 1000);
	 }
		 else{
		 $('html,body').animate({ scrollTop: jQuery(this.hash).offset().top}, 1000);
		 }
		 return false;
	});
			
$(".topheader .navbar-toggler").click(function() {  					
				$(this).find('i').toggleClass('fa-bars fa-times');				
});
	
	
$(".mainnav .navbar-toggler").click(function() {  					
				$(this).find('i').toggleClass('fa-bars fa-times');
	
						if($('.topheader .navbar-collapse').hasClass('show'))	{					
							 $('.topheader .navbar-collapse').collapse('hide');							
								$(".topheader .navbar-toggler").find('i').toggleClass('fa-times fa-bars');
				}	
});
	
	
	
// Home Slider 
// Check the Mobile and Desktop and If Mobile found then turn autoplay On	
	
function checkIsMobile(){	
      if(navigator.userAgent.indexOf("Mobile") > 0){
							$(".carousel").attr("data-interval","6000");							
						}										
						else
						{        
							$(".carousel").attr("data-interval","8000");		
						}
}
	
checkIsMobile();	
	
	
	/*$(".carousel").carousel();	

	$(".carousel .carousel-control-prev").click(function(){
						//		alert();
        $(".carousel").carousel("prev");
								//new WOW().init();
 });
 $(".carousel .carousel-control-next").click(function(){
						//		alert();
        $(".carousel").carousel("next");
								//new WOW().init();
 });*/
	
	

// Click event to scroll to top	
	
    $('.scroll-top').click(function(){
         $('html, body').animate({scrollTop : 0},1500, 'easeInOutExpo');  
        return false;
});	
	

// Click event to scroll to top
	
$(window).scroll(function(){
				if ($(this).scrollTop() > 100) {
					$('.section-top').fadeIn();
				} else {
					$('.section-top').fadeOut();
				}
}); 
	
$('.section-top').click(function(){
				 $('html, body').animate({scrollTop : 0},1500, 'easeInOutExpo');	
});
	
	
//// When user scroll down to bottom of the page Scroll Top button will be fadeout
	
	$(window).scroll(function() {
  if ($(window).scrollTop() === $(document).height() - $(window).height()) {
   				$(".section-top").fadeOut("fast");
  }
});		
	
	
		
	//// Footer Links Anchor links
	
	  $('.footer-links ul li a').on('click', function() {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
      var target = $(this.hash);
      if (target.length) {       

        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1500, 'easeInOutExpo');
       
        return false;
      }
    }
  });
	
	
	//// Get Strated (Slider) Button Anchor link
	
	$('a.getStarted').on('click', function() {
    if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
      var target = $(this.hash);
      if (target.length) {       

        $('html, body').animate({
          scrollTop: target.offset().top
        }, 1500, 'easeInOutExpo');
       
       return false;
      }
    }
				
			
				
  });
	

		
//// Footer Dropdown Menu Navigation
	
	 $('.select-menu select').on('change',function(){
						if (this.selectedIndex !== 0) {
								window.location.href = this.value;								
						}		
			
					if($(this).val() === '#feedback'){      
								$("#feedback").modal();
					}
  });
	
	
	
	
	$("#Openfeedback").click(function(e){
							e.preventDefault();
						 $("#feedback").modal();
	});
	
	

	
 $("#tab-content div").hide(); // Initially hide all content
    $("#tabs li:first").attr("id","current"); // Activate first tab
    $("#tab-content div:first").fadeIn("slow"); // Show first tab content
    $('#tabs li a').click(function(e) {
        e.preventDefault();
        if ($(this).attr("id") === "current"){ //detection for current tab
         return;        
        }
        else{             
        $("#tab-content div").hide(); //Hide all content
        $("#tabs li").attr("id",""); //Reset id's
        $(this).parent().attr("id","current"); // Activate this
        $( $(this).attr('href')).fadeIn("slow"); // Show content for current tab
									
									if($(window).width() < 767) {	
										
													//$(".closejob").show();
										
												//	$(".closejob").click(function(){
																		//	$('html, body').animate({scrollTop : 0},1500, 'easeInOutExpo');	
													//	});
										
														var target = $(this.hash);
															if (target.length) {       

																	$('html, body').animate({
																			scrollTop: target.offset().top
																	}, 1500, 'easeInOutExpo');

															}					
										}
									
									
        }
    });
	
if($(window).width() < 767) {	
										
			$(".closejob").show();
										
			$(".closejob").click(function(){
					$("#tab-content div").fadeOut("slow");	
					$('html, body').animate({scrollTop : 0},1500, 'easeInOutExpo');	
});
}

	$(".job-details ul li strong").append("&nbsp;&nbsp;:&nbsp;&nbsp;");
	$(".job-details .joblocation span").append("&nbsp;&nbsp;:&nbsp;&nbsp;");
	
	$(".job-details ul li a").before("&nbsp;-&nbsp;&nbsp;");
	
	
 
	
	$("#modal1").on('shown.bs.modal', function () {				
		
				if($(window).width() < 767)
    {
      
						$(".section-top").hide();						
    }		
				
    });
	
		$("#modal2").on('shown.bs.modal', function () {				
		
				if($(window).width() < 767)
    {
     
						$(".section-top").hide();					
    }		
				
    });
	
	
$('#modal1')
  .on('shown.bs.modal', function () {
    $('body').on('wheel.modal mousewheel.modal', function () {
      return false;
    });
  })
  .on('hidden.bs.modal', function () {
    $('body').off('wheel.modal mousewheel.modal');
  });
	
	$('#modal2')
  .on('shown.bs.modal', function () {
    $('body').on('wheel.modal mousewheel.modal', function () {
      return false;
    });
  })
  .on('hidden.bs.modal', function () {
    $('body').off('wheel.modal mousewheel.modal');
  });
	
		
//// Jquery Form Validator 
	

	 
	$.validate({
									lang: 'en',
								 //modules : 'file, security',
									form : '#feedback',
									validateOnBlur : true,
								/*	onSuccess : function($form) {
											alert('The form '+$form.attr('id')+' is valid!');
											return true; // Will stop the submission of the form
									},
									*/
						});


	
 
$('.animate').scrolla({
			mobile: false,
			once: true
});
	
	
	$("#tab1 #applyjobbtn").click(function(){		
					$("#feedback").modal();					
				//	var txtVal = $(".jcode .code").html();				
				//	alert(txtVal);
					//$("input#jobcode").val(txtVal); 		
	});
	
		
	//$("#feedbackbtn").animatedModal();
	
	$("#feedbackbtn").animatedModal({
                modalTarget:'feedback',
                animatedIn:'lightSpeedIn',
                animatedOut:'bounceOutDown',
                color:'#fff',               
            });


});