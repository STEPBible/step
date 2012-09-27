
jQuery.localStore = function(name, value) {
    if (typeof value != 'undefined') { // name and value given, set value
        if (value === null) {
            value = '';
        }
        
        //we have localstorage
        if(window.localStorage) {
            window.localStorage.setItem(name, value);
        } else {
            $.cookie(name, value);
        }
        return value;
    } else { // only name given, get cookie
        if (window.localStorage) {
            return window.localStorage.getItem(name);
        } else {
            return $.cookie(name);
        }
    }
};