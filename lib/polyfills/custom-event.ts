export const polyfillCustomEvent = () => {
    if ( typeof (<any>window).CustomEvent === "function" ) return false;

    function CustomEvent ( event, params ) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = (<any>window).Event.prototype;

    (<any>window).CustomEvent = CustomEvent;
}
