// JALANGI DO NOT INSTRUMENT
let Logger = require('./log');
const path = require('path');

(function(sandbox){
    function DynCG() {
        let callGraph = [];
        let uniqueCalls = []; // todo
        let callsiteStack = [];
        let iidToLocation = new Map();

        let outputPath = J$.initParams.outputPath;
        let logger = new Logger(outputPath);

        callsiteStack.push({
            iid: -1,
            name: 'GraalVM'
        });

        // let cg = new Map();
        // let lastCallsite = undefined;

        function getLocation (iid) {
            return J$.iidToLocation(iid);
        }

        function addCall (callsite, calleeIid, func) {
            if (callsite.iid === -1) {
                return;
            }
            // todo
            if (callsite.f.name === 'require' || callsite.f.name === 'import') {
                return;
            }

            let newCall = callsite.iid + ',' + calleeIid;
            if (uniqueCalls.includes(newCall)) {
                return;
            }
            // console.log(newCall);
            uniqueCalls.push(newCall);

            // callGraph.push(newCall);
            // logger.addEntry(newCall);
        }

        // function addCallee(callsite, callee) {
        // callsite = callsite === undefined ? "GraalVM" : callsite;
        // cg.has(callsite) ? cg.get(callsite).add(callee) : cg.set(callsite, new Set([callee]));
        // }

        this.invokeFunPre = function(iid, f, base, args, isConstructor, isMethod) {
            iidToLocation.set(iid, J$.iidToLocation(iid));
            // lastCallsite = iid;

            callsiteStack.push({
                iid: iid,
                f: f
            })
        };

        this.invokeFun = function (iid, f, base, args, result, isConstructor, isMethod) {
            // lastCallsite = undefined;
            iidToLocation.set(iid, J$.iidToLocation(iid));
            callsiteStack.pop();
        };

        this.functionEnter = function (iid, func, receiver, args) {
            iidToLocation.set(iid, J$.iidToLocation(iid));
            // addCallee(lastCallsite, iid);
            let callsite = callsiteStack[callsiteStack.length - 1];

            addCall(callsite, iid, func);
        };

        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
            iidToLocation.set(iid, J$.iidToLocation(iid));
        };

        this.endExecution = function() {
            console.log('end ' + uniqueCalls.length);
            // logger.write(uniqueCalls);
            createCallGraphFromEdges();
        };

        function createCallGraphFromEdges () {
            let callGraph = [];
            for (let edge in uniqueCalls) {
                if (uniqueCalls.hasOwnProperty(edge)) {
                    let iids = getIidsFromCall(uniqueCalls[edge]);
                    let callerLoc = getLocation(Number(iids.callerIid));
                    let calleeLoc = getLocation(Number(iids.calleeIid));
                    callGraph.push({
                        caller: parseLocation(callerLoc),
                        callee: parseLocation(calleeLoc)
                    });
                }
            }
            logger.write(callGraph);
        }

        function getIidsFromCall (edge) {
            let tokens = edge.split(',');
            return {
                callerIid: tokens[0],
                calleeIid: tokens[1]
            }
        }

        function parseLocation (entry) {
            // split loc
            let loc = entry.split(/\(|\)|:/);
            let filePath = loc[1];
            let start = {
                line: loc[2],
                column: loc[3]
            };
            let end = {
                line: loc[4],
                column: loc[5]
            };

            return {
                fileName: path.basename(filePath),
                // fullPath: path.resolve(filePath),
                // loc: {
                    start: start,
                    end: end
                // }
            }
        }
    }
    sandbox.analysis = new DynCG();
})(J$);
