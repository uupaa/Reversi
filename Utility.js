(function(global) {
"use strict";

// --- define ----------------------------------------------
// platform detection
// var _BROWSER = !!global.self;
// var _WORKER  = !!global.WorkerLocation;
var _NODE_JS = !!global.global;

// --- local variable --------------------------------------

// --- interface -------------------------------------------
function Utility() {}

Utility.loadScript = loadScript;
Utility.loadUserLogic = loadUserLogic;

// --- implement -------------------------------------------
function loadScript(id,   // @arg String: id
                    src,  // @arg String: JavaScript source
                    fn) { // @arg Function(= null): fn(err: Error)
    var script = document.createElement("script");

    script.onload = function() {
        fn && fn(null, id);
    };
    script.onerror = function() {
        fn && fn(new TypeError("Bad Request"), id);
    };
    script.charset = "utf-8";
    script.src = src;
    document.head.appendChild(script);
}

function loadUserLogic() {
    var select1 = document.querySelector("select#Player1");
    var select2 = document.querySelector("select#Player2");
    var i = 1, iz = 17;

    for (; i < iz; ++i) {
        loadScript("USER" + i, "cpu/USER" + i + ".js", function(err, id) {
            if (err) { return; }

            var option1 = document.createElement("option");
            var option2 = document.createElement("option");

            option1.value = id;
            option2.value = id;
            option1.textContent = id;
            option2.textContent = id;
            select1.appendChild(option1);
            select2.appendChild(option2);
        });
    }
}

// --- export ----------------------------------------------
if (_NODE_JS) {
    module.exports = Utility;
}
global.Utility = Utility;

})(this.self || global);


