function centerDiv(selector) {
    var selectorHeight = $(selector).height();
    var winHeight=$(window).height();
    console.log(selector + " : " + selectorHeight);
    console.log("Window : " + winHeight);
    var winHeight=$(window).height();
    $(selector).css('margin-top', (winHeight-selectorHeight)/2);
    console.log(winHeight + ' | ' + selectorHeight);
}

function setCookie(name, value, expires, path, domain, secure) {
    var today = new Date();
    today.setTime(today.getTime());
    if (expires) {
        expires = expires * 1000 * 60 * 60 * 24;
    }
    var expires_date = new Date(today.getTime() + (expires));
    document.cookie = name + '=' + escape(value) +
        ((expires) ? ';expires=' + expires_date.toGMTString() : '') + //expires.toGMTString()
        ((path) ? ';path=' + path : '') +
        ((domain) ? ';domain=' + domain : '') +
        ((secure) ? ';secure' : '');
}

function getCookie(name) {
    var start = document.cookie.indexOf(name + "=");
    var len = start + name.length + 1;
    if ((!start) && (name != document.cookie.substring(0, name.length))) {
        return null;
    }
    if (start == -1) return null;
    var end = document.cookie.indexOf(';', len);
    if (end == -1) end = document.cookie.length;
    return unescape(document.cookie.substring(len, end));
}

function deleteCookie(name, path, domain) {
    if (getCookie(name)) document.cookie = name + '=' +
        ((path) ? ';path=' + path : '') +
        ((domain) ? ';domain=' + domain : '') +
        ';expires=Thu, 01-Jan-1970 00:00:01 GMT';
}

$(function() {

	$(window).on("orientationchange",function(){
    	if(window.orientation == 0) {}
	});

});
