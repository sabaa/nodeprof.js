// JALANGI DO NOT INSTRUMENT
let Logger = require('./log');
const path = require('path');

(function(sandbox){
    function DynCG() {
        let uniqueCalls = []; // todo
        let callsiteStack = [];
        let iidToLocation = new Map();

        let outputPath = J$.initParams.outputPath;
        let logger = new Logger(outputPath);

        callsiteStack.push({
            iid: -1,
            name: 'GraalVM'
        });

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
            uniqueCalls.push(newCall);
        }

        this.invokeFunPre = function(iid, f, base, args, isConstructor, isMethod) {
            iidToLocation.set(iid, J$.iidToLocation(iid));

            callsiteStack.push({
                iid: iid,
                f: f
            })
        };

        this.invokeFun = function (iid, f, base, args, result, isConstructor, isMethod) {
            iidToLocation.set(iid, J$.iidToLocation(iid));
            callsiteStack.pop();
        };

        this.functionEnter = function (iid, func, receiver, args) {
            iidToLocation.set(iid, J$.iidToLocation(iid));
            let callsite = callsiteStack[callsiteStack.length - 1];

            addCall(callsite, iid, func);
        };

        this.functionExit = function (iid, returnVal, wrappedExceptionVal) {
            iidToLocation.set(iid, J$.iidToLocation(iid));
        };

        this.endExecution = function() {
            console.log('end ' + uniqueCalls.length);
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
