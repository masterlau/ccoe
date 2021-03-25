$(function() {

	// Body Height
	var winHeight=$(window).height();
	$('.wrapper').css('height',winHeight);

	// Menu Select
	$('.menu').click(function(e) {
		e.preventDefault()
		var navLink = $(this).attr('navLink')
		if( navLink == "close" ) {
        	$( ".page-header #subMenu" ).animate({
           		top: -1000
        	}, 300, function() {
            	// Animation complete.
        	});
			return;
		}
		$('section.views').css('display','none')
		var navLink = $(this).attr('navLink')
		var navObjectString = "$('section.views#" + navLink + "').css('display','block')";
		console.log("navObjectString: " + navObjectString);
		eval( navObjectString )
        $( ".page-header #subMenu" ).animate({
            top: -1000 
        }, 300, function() {
            // Animation complete.
        });
	});
	
	// Menu Appear 
	$('.page-header #menu i').click( function() {

		$( ".page-header #subMenu" ).animate({
    		top: 0
  		}, 300, function() {
    		// Animation complete.
  		});
	});

	// Audio Play
	$('.podcastPlay').click( function() {
		var show = $(this).attr('link');
        $('.podcastPlay').each( function(){ $(this).removeClass('far'); $(this).addClass('fal'); $(this).removeClass('active'); });
        $(this).removeClass('fal');
		$(this).addClass('far');
		$(this).addClass('active');
        $('#showStream').attr('src', show);
        document.getElementById('audioElement').load();
        console.log('Changing Audio to Archive: ' + show);
		//$('section#podcasts').scrollTop();
	})

});
