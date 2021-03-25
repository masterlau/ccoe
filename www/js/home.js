$(function(){

    console.log('Home Screen');
    centerDiv(".container");

    $(window).resize( function() {
        console.log('Re-Centering Window');
        centerDiv(".container");
    });

    // Subscribe
    $('section#login #input-subscribe').click( function() {
        var email = $.trim($('section#login #input-email').val()).toLowerCase()
		var name = $.trim($('section#login #input-name').val())
        console.log('api: subscribe, email: ' + email + ', name: ' + name)

        // Check if email is blank
        if( email == "" ) {
            $('section#login .loginMsgBox').html('Email address cannot be blank').show()
            return;
        }

        // Check Email got oacceptable Characters
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if( !re.test(email) ) {
            $('section#login .loginMsgBox').html('Email address does not seem valid').show()
            return
        }

        // Check email domain is optus.com.au
        var esplit = email.split("@");
		if(esplit[1] != "optus.com.au" && esplit[1] != "trustwave.com" && esplit[1] != "ensyst.com.au" && esplit[1] != "optusbusiness.com.au") {
            $('section#login .loginMsgBox').html('Sorry only Optus email addresses accepted').show()
            return
        }

        $.ajax({
          type: "POST",
          url: "/subscribe",
          contentType: "application/json",
          dataType: "json",
          data: JSON.stringify({api: "subscribe", email: email, name: name}),
          success: function( data ) {
            console.log(data);
            if( data.result ) {
                $('section#login .loginForm').toggle("fade", function() {
                    $('section#login .loginMsgBox').html('Please check your Optus email,<br/>it can take upto 5 mins to receive.<br/>If not received <span id="retry">click here to retry</span>');
                });
            } else {
                $('section#login .loginMsgBox').html(data.msg).show()
            }
          }
      });
	});

	// Retry 
	$(document).on('click', '#retry', function() {
    	$('.loginForm').toggle("fade", function() {
    		$('.loginMsgBox').toggle("fade");
        });
    });
})

