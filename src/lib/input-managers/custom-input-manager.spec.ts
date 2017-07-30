/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../../node_modules/@types/chai/index.d.ts" />
import "reflect-metadata";
import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
chai.use(chaiAsPromised);
let expect = chai.expect, assert = chai.assert;

import * as i from '../i';
import { CustomInputManager } from './custom-input-manager';

describe(CustomInputManager.name, () => {
    describe(`#${CustomInputManager.prototype.ask.name}`, () => {
        let cim: CustomInputManager;
        let resolveAndLoadStub: sinon.SinonStub;
        let handlerStub: sinon.SinonStub;
        let hs: i.IHandlerService;
        let mytmp: string;

        beforeEach(() => {
            mytmp = "/my/tmp";
            handlerStub = sinon.stub();
            resolveAndLoadStub = sinon.stub();
            hs = {
                resolveAndLoad: resolveAndLoadStub
            };
            resolveAndLoadStub.returns(Promise.resolve(handlerStub));
            cim = new CustomInputManager(hs);
            cim.configure(mytmp);
        });

        it("resolves the handler using the root tmpl path and calls the handler with the input config", () => {
            let inputConfig = {
                handler: "myhandler"
            };
            return cim.ask(inputConfig).then(() => {
                sinon.assert.calledWith(resolveAndLoadStub, mytmp, inputConfig.handler);
                expect(handlerStub.called).to.be.true;
                sinon.assert.calledWith(handlerStub, inputConfig);
            });
        });

        it("returns a rejected promise on unknown error", () =>  {
            resolveAndLoadStub.throws(new Error("umm... null pointer? let's go with that"), );
            return cim.ask({})
                .catch(e => expect(e).property("message").to.contain("Error running handler"));
        });
    });
});