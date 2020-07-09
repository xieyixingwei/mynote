( function( $ ) {

'use strict';

/**
 * Return a Deferred object which will be resolved after timeout ms.
 * @timeout the unit is ms.
 */
$.DeferredWait = function (timeout) {
    return $.Deferred( function( dfd ) {
        // wait for ms to call dfd.resolve()
        setTimeout( dfd.resolve, timeout );
    } );
};

/**
 * Return a countable Deferred object which will be resolved when the number of countDown() calls reaches count.
 * @count the number of countDown() calls.
 * @min the bottom value of count which default is 0.
 */
$.DeferredCount = function ( count, min ) {
    min = min || 0;
    var dfd = $.Deferred();
    dfd.count = count;

    if ( dfd.count <= min ) {
        dfd.resolve();
    }

    dfd.countDown = function () {
        dfd.count--;
        if ( dfd.count <= min ) {
            dfd.resolve();
        }
    };

    dfd.countUp = function () {
        dfd.count++;
    };
    return dfd;
};

//----------------------------------------------------------------------------------------------------------------------

/**
 * Define Stage object, it is a extend Defferred object.
 * 
 * @name <string> this stage's name.
 * @time <number> the unit is ms, specify this timeout of current stage.
 * 
 * Public fucntions:
 *     reset()
 *     subscribe(fn)
 *     unsubscribe(fn)
 *     run()
 * 
 * @fn is function which must invok the done() when it end. for example:
 *      function fn( done ) {
 *            $.ajax( {
 *               url: 'index.md',
 *               dataType: 'text'
 *           } ).done( function( data ) {
 *               done();
 *           } );
 *      }
 */
$.Stage = function( name, timeout) {

    // Define a defer object
    var self = $.extend($.Deferred(), {});

    self.done( function() {
        console.log('stage ' + self.name + ' completed successfully.');
    } );

    self.fail(function() {
        console.log('stage ' + self.name + ' completed with errors!');
    } );

    self.name = name;
    self.timeout = timeout || 3000;
    self.funcs = [];
    self.started = false;

    self.reset = function () {
        self.complete = $.Deferred();
        self.outstanding = [];
    };

    self.reset();

    // Register a function to the current stage.
    // @fn fn is function which must invok the done() when it end. for example
    self.subscribe = function ( fn ) {
        if (self.started) {
            console.log('Subscribing to stage which already started!');
            return;
        }
        self.funcs.push(fn);
        return this;
    };

    // Unregister a function from the current stage.
    self.unsubscribe = function ( fn ) {
        self.funcs.remove(fn);
        return this;
    };

    // Execute the fn
    self._executeFn = function ( fn ) {
        var d = $.Deferred();
        self.outstanding.push(d);

        // Display an error if our done() callback is not called
        $.DeferredWait(self.timeout).done( function() {
            if ( d.state() !== 'resolved' ) {
                console.log('Timeout reached for done callback in stage: ' + self.name +
                    '. Did you forget a done() call in a .subscribe() ?');
                console.log('stage ' + name + ' failed running subscribed function: ' + fn );
            }
            // d.resolve();
        } );

        var done = function done() {
            d.resolve();
        };

        fn( done );
    };

    // It will cyclically excute the functions subscribed in this stage.
    self.run = function() {
        self.started = true;

        $(self.funcs).each( function ( i, fn ) {
            self._executeFn(fn);
        } );

        // If no funcs are in our queue, we resolve immediately
        if (self.outstanding.length === 0) {
            self.resolve();
        }

        // We resolve when all our registered funcs have completed
        $.when.apply( $, self.outstanding
            ).done( function() {
            self.resolve();
        } ).fail(function() {
            self.resolve();
        } );
    };

    return self;
}; // $.Stage end

//----------------------------------------------------------------------------------------------------------------------

/**
 * Define a States object to manage muti stages.
 * Public functions:
 *     register(stageNameList)
 *     stage(stageName)
 *     reset()
 *     run()
 */
$.Stages = function( stageNameList ) {
    this.stages = [];
    this.register(stageNameList);
};

// Register a stage
// @stageNameList list<string> stage name
$.Stages.prototype.register = function( stageNameList ) {
    var self = this;
    $(stageNameList).each( function( i, e ) {
        var s = $.Stage(e);
        var end = self.stages.slice(-1);
        if(end.length > 0) {
            end[0].done( function() {
                s.run();
            } );
        }
        self.stages.push(s);
    } );
};

// return a stage by stageName
// @stageName <string>
$.Stages.prototype.stage = function( stageName ) {
    var stages = $.grep(this.stages, function( e, i ) {
        return e.name === stageName;
    } );

    if ( stages.length === 0 ) {
        console.log('A stage by name ' + stageName + '  does not exist');
        return undefined;
    } else if ( stages.length > 1 ) {
        console.log('There are muti same name ' + stageName + '  stages exist');
    }

    return stages[0];
};

// Reset current stages, this will clear the func of stage, but only keep the stage.
$.Stages.prototype.reset = function() {
    var self = this;
    var oldStages = self.stages;
    self.stages = [];
    $(oldStages).each( function( i, e ) {
        self.stages.push($.Stage(e.name));
    });
};

// Run stages registered and return a Differed object.
$.Stages.prototype.run = function() {
    var self = this;
    var dfd = $.Deferred();

    self.stages.slice(-1)[0].done( function() {
        dfd.resolve();
    } );

    // Run the first stage.
    self.stages[0].run();
    return dfd;
};
// $.Stages end

} ( jQuery ) );
