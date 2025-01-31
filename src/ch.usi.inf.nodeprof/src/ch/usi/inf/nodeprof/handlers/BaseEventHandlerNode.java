/*******************************************************************************
 * Copyright 2018 Dynamic Analysis Group, Università della Svizzera Italiana (USI)
 * Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
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
package ch.usi.inf.nodeprof.handlers;

import com.oracle.truffle.api.CompilerDirectives.TruffleBoundary;
import com.oracle.truffle.api.frame.VirtualFrame;
import com.oracle.truffle.api.instrumentation.EventContext;
import com.oracle.truffle.api.instrumentation.InstrumentableNode;
import com.oracle.truffle.api.interop.ForeignAccess;
import com.oracle.truffle.api.interop.Message;
import com.oracle.truffle.api.interop.TruffleObject;
import com.oracle.truffle.api.nodes.Node;
import com.oracle.truffle.api.source.SourceSection;
import com.oracle.truffle.js.runtime.objects.Undefined;

import ch.usi.inf.nodeprof.utils.GlobalConfiguration;
import ch.usi.inf.nodeprof.utils.Logger;
import ch.usi.inf.nodeprof.utils.SourceMapping;

/**
 *
 * BaseEventHandlerNode defines the common methods needed to handle an event
 *
 */
public abstract class BaseEventHandlerNode extends Node {
    protected final EventContext context;

    /**
     * the unique instrumentation ID for the instrumented source section
     */
    protected final int sourceIID;

    /**
     * used to read the attribute of the tags
     */
    @Child protected Node read = Message.READ.createNode();

    public BaseEventHandlerNode(EventContext context) {
        this.context = context;
        this.sourceIID = SourceMapping.getIIDForSourceSection(getSourceSectionForIID());
    }

    /**
     * @return the instrumented source section
     */
    private SourceSection getInstrumentedSourceSection() {
        return this.context.getInstrumentedSourceSection();
    }

    /**
     * @return the source section to be used for reporting purposes
     */
    protected SourceSection getSourceSectionForIID() { return this.context.getInstrumentedSourceSection(); }

    /**
     * @return the instrumentation ID for the instrumented source section
     */
    public int getSourceIID() {
        return sourceIID;
    }

    @SuppressWarnings(value = {"unused"})
    public void enter(VirtualFrame frame) {
    }

    /**
     * @param frame the current virtual frame
     * @param inputs the input array get from ExecutionEventNode.getSavedInputValues()
     */
    public void executePre(VirtualFrame frame, Object[] inputs) {

    }

    /**
     * @param frame the current virtual frame
     * @param result of the execution of the instrumented node
     * @param inputs the input array get from ExecutionEventNode.getSavedInputValues()
     */
    public void executePost(VirtualFrame frame, Object result, Object[] inputs) {

    }

    public void executeExceptional(VirtualFrame frame, Throwable exception) {

    }

    /**
     *
     * get the node-specific attribute, in case of missing such attributes report an error
     *
     * @param key of the current InstrumentableNode
     * @return the value of this key
     */
    public Object getAttribute(String key) {
        Object result = null;
        try {
            result = ForeignAccess.sendRead(read, (TruffleObject) ((InstrumentableNode) context.getInstrumentedNode()).getNodeObject(),
                            key);
        } catch (Exception e) {
            reportAttributeMissingError(key, e);
        }
        return result;
    }

    /**
     *
     * get the node-specific attribute, in case of missing such attributes, return null
     *
     * @param key of the current InstrumentableNode
     * @return the value of this key
     */
    public Object getAttributeNoReport(String key) {
        Object result = null;
        try {
            result = ForeignAccess.sendRead(read, (TruffleObject) ((InstrumentableNode) context.getInstrumentedNode()).getNodeObject(),
                            key);
        } catch (Exception e) {
            return null;
        }
        return result;
    }

    @TruffleBoundary
    private void reportAttributeMissingError(String key, Exception e) {
        Logger.error(getInstrumentedSourceSection(), "attribute " + key + " doesn't exist " + context.getInstrumentedNode().getClass().getSimpleName());
        e.printStackTrace();
        if (!GlobalConfiguration.IGNORE_JALANGI_EXCEPTION) {
            Thread.dumpStack();
            System.exit(-1);
        }
    }

    /**
     * retrieve the real value from the inputs with exception handler
     *
     * @param index
     * @param inputs
     * @param inputName
     * @return the value of inputs[index]
     */
    protected Object assertGetInput(int index, Object[] inputs, String inputName) {
        if (inputs == null) {
            reportInputsError(index, inputs, "InputsArrayNull");
            return Undefined.instance;
        }
        if (index < inputs.length) {
            Object result = inputs[index];
            if (result == null) {
                result = Undefined.instance;
                reportInputsError(index, inputs, "InputElementNull " + index);
            }
            return result;
        } else {
            /**
             * if the inputs are not there, report the detail and stop the engine.
             */
            reportInputsError(index, inputs, "MissingInput");
        }
        return Undefined.instance;
    }

    @TruffleBoundary
    private void reportInputsError(int index, Object[] inputs, String info) {
        Logger.error(context.getInstrumentedSourceSection(),
                        "Error[" + info + "] getting inputs at index '" + index + "' from " +
                                        context.getInstrumentedNode().getClass().getSimpleName() + " (has " + (inputs == null ? 0 : inputs.length) + " input(s))");

        if (!GlobalConfiguration.IGNORE_JALANGI_EXCEPTION) {
            Thread.dumpStack();
            System.exit(-1);
        }
    }

    public abstract int expectedNumInputs();

    public Object onUnwind(VirtualFrame frame, Object info) {
        return null;
    }

    /**
     * used to determinate whether the necessary inputs are all collected
     *
     * @return the index or -1 if no inputs are needed
     */
    public final boolean isLastIndex(int inputCount, int index) {
        int expected = expectedNumInputs();
        assert inputCount >= expected : Logger.printSourceSectionWithCode(this.getInstrumentedSourceSection()).append(context.getInstrumentedNode().getClass()).append(" ").append(inputCount).append(
                        " < ").append(expected + " ").toString();
        if (expected == -1) {
            // not sure how many inputs
            return index == inputCount - 1;
        } else {
            return index == expected - 1;
        }
    }
}
