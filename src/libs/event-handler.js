import Rx from 'rx-lite';

const EventHandler = {
    create: function () {
        function subject (value) {
            subject.onNext(value);
        }

        for (var key in Rx.Subject.prototype) {
            subject[key] = Rx.Subject.prototype[key];
        }

        Rx.Subject.call(subject);

        return subject;
    }
};

export function getThrottledHandler (handler, throttle) {
    // Create a form changes observer object
    // that waits for a half a second pause
    // in input before firing the event callback
    var throttledHandler = EventHandler.create();

    throttledHandler
        .debounce(throttle || 500)
        .subscribe(handler);
        
    return throttledHandler;
}

export default EventHandler;
