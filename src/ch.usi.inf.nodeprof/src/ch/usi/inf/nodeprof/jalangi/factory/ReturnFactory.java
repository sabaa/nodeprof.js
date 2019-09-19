/*******************************************************************************
 * Copyright 2018 Dynamic Analysis Group, Università della Svizzera Italiana (USI)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *******************************************************************************/
package ch.usi.inf.nodeprof.jalangi.factory;

import com.oracle.truffle.api.frame.VirtualFrame;
import com.oracle.truffle.api.instrumentation.EventContext;
import com.oracle.truffle.api.nodes.DirectCallNode;
import com.oracle.truffle.api.object.DynamicObject;
import com.oracle.truffle.js.runtime.objects.Undefined;

import ch.usi.inf.nodeprof.handlers.BaseEventHandlerNode;
import ch.usi.inf.nodeprof.handlers.CFBranchEventHandler;

public class ReturnFactory extends AbstractFactory {
    public ReturnFactory(Object jalangiAnalysis, DynamicObject pre) {
        super("_return", jalangiAnalysis, pre, null, 2, -1);
    }

    @Override
    public BaseEventHandlerNode create(EventContext context) {
        return new CFBranchEventHandler(context) {
            @Child DirectCallNode preCall = createPreCallNode();

            @Override
            public void executePre(VirtualFrame frame,
                            Object[] inputs) {
                if (pre != null && isReturnNode()) {
                    setPreArguments(0, getSourceIID());
                    if (inputs == null || inputs.length == 0) {
                        // empty return statement (i.e., 'return;')
                        setPreArguments(1, Undefined.instance);
                    } else {
                        setPreArguments(1, inputs[0]);
                    }
                    directCall(preCall, true, getSourceIID());
                }
            }
        };
    }

}
