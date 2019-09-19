/*******************************************************************************
 * Copyright 2018 Dynamic Analysis Group, Università della Svizzera Italiana (USI)
 * Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
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
import com.oracle.truffle.js.nodes.control.YieldException;
import com.oracle.truffle.js.runtime.objects.Undefined;

import ch.usi.inf.nodeprof.handlers.BaseEventHandlerNode;
import ch.usi.inf.nodeprof.handlers.CFBranchEventHandler;

public class AwaitFactory extends AbstractFactory {

    public AwaitFactory(Object jalangiAnalysis, DynamicObject pre, DynamicObject post) {
        super("await", jalangiAnalysis, pre, post, 2, 3);
    }

    @Override
    public BaseEventHandlerNode create(EventContext context) {
        return new CFBranchEventHandler(context) {
            @Child DirectCallNode preCall = createDirectCallNode(pre);
            @Child DirectCallNode postCall = createDirectCallNode(post);

            @Override
            public void executePre(VirtualFrame frame, Object[] inputs) {
                if (pre != null && this.isAwaitNode()) {
                    // ignore the first entry of await node
                    if (inputs == null || inputs.length == 0) {
                        return;
                    }
                    setPreArguments(0, getSourceIID());
                    setPreArguments(1, inputs[0]);
                    directCall(preCall, true, getSourceIID());
                }
            }

            @Override
            public void executePost(VirtualFrame frame, Object result,
                            Object[] inputs) {

                if (post != null && this.isAwaitNode()) {
                    setPostArguments(0, this.getSourceIID());
                    setPostArguments(1, result);
                    setPostArguments(2, Undefined.instance);
                    directCall(postCall, false, getSourceIID());
                }
            }

            @Override
            public void executeExceptional(VirtualFrame frame, Throwable exception) {
                if (post != null && !(exception instanceof YieldException)) {
                    Object exceptionValue = parseErrorObject(exception);
                    setPostArguments(0, getSourceIID());
                    setPostArguments(1, Undefined.instance);
                    setPostArguments(2, exceptionValue == null ? exception.getClass().getSimpleName() : exceptionValue);
                    directCall(postCall, false, getSourceIID());
                }
            }
        };
    }
}