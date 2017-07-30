/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../../node_modules/@types/chai/index.d.ts" />
import "reflect-metadata";
import 'mocha';
import * as chai from 'chai';
import * as sinon from 'sinon';
let expect = chai.expect, assert = chai.assert;
import * as i from '../i';
import * as nci from './i';

import { BaseCommand } from './base-command';
import { mockMessagerFactory } from '../../spec-lib'

describe('BaseCommand', () => {
    let nc: BaseCommand<any, any>;
    beforeEach(() => {
        nc = new BaseCommand(mockMessagerFactory(), <any>{});
    });

    describe('#run', () => {
        it("exits non-zero if tempDir not set.", () => {
            let spy = sinon.spy();
            nc.tempDir = "";
            nc["process"].exit = <any>spy;
            nc.run(<any>{}, <any>{});
            expect(spy.calledOnce).to.be.true;
            expect(spy.calledWith(1)).to.be.true;
        });

        it("does not exit if tempDir set.", () => {
            let spy = sinon.spy();
            nc.tempDir = "I am set!";
            nc["process"].exit = <any>spy;
            nc.run(<any>{}, <any>{});
            expect(spy.calledOnce).to.be.false;
        });
    });
});