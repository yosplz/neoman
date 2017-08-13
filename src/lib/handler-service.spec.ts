/// <reference path="../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../node_modules/@types/chai/index.d.ts" />
import "reflect-metadata";
import 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import * as chai from 'chai';
let expect = chai.expect, assert = chai.assert;

import { mockPathFactory, mockMessagerFactory } from '../spec-lib';
import * as i from './i';
import { HandlerService } from './handler-service';

describe('HandlerService', () => {
    let accessStub: sinon.SinonStub;
    let msg: i.IUserMessager;
    let path: i.IPath;
    let hs: HandlerService;
    before(() => {
        chai.should();
        chai.use(chaiAsPromised);
    });

    beforeEach(() => {
        accessStub = sinon.stub();
        accessStub.returns(Promise.resolve(() => {}));
        path = mockPathFactory();
        msg = mockMessagerFactory();
        hs = new HandlerService(path, msg);
        hs['access'] = accessStub;
    })

    describe('#resolveAndLoadSync', () => {
        let reqNatStub: sinon.SinonStub;
        beforeEach(() => {
            reqNatStub = sinon.stub();
            hs['accessSync'] = accessStub;
            hs['requireNative'] = <any>reqNatStub;
            
        });

        it('build appropriate handler path relative to tmpl config root', () => {
            let retVal = function Mine() {};
            reqNatStub.returns(retVal);
            let result = hs.resolveAndLoadSync('root/path', 'hndid');
            sinon.assert.calledWith(reqNatStub, 'root/path/.neoman.config/handlers/hndid.js');
        });


        it('should return result of require when function', () => {
            let retVal = function Mine() {};
            reqNatStub.returns(retVal);
            let result = hs.resolveAndLoadSync('root/path', 'hndid');
            expect(result).to.equal(retVal);
        });

        it('should throw when require returns non-function', () => {
            reqNatStub.returns("some string");
            expect(() => {
                hs.resolveAndLoadSync('root/path', 'hndid');
            }).to.throw();
        });

        it('should throw on no access', () => {
            accessStub.throws(new Error("blah"));
            expect(() => {
                hs.resolveAndLoadSync('root/path', 'hndid');
            }).to.throw();
        });
    });

    describe('#formatPath', () => {
        it('should add .js extension if missing', () => {
            let result = hs.formatPath('something');
            expect(result).to.equal('something.js');
        });
        it('should return unmodified, if not missing', () => {
            let result = hs.formatPath('something.js');
            expect(result).to.equal('something.js');
        });
    });

    describe('#resolveAndLoad', () => {
        let crequireStub: sinon.SinonStub;
        beforeEach(() => {
            crequireStub = sinon.stub();
            crequireStub.returns(Promise.resolve(() => {}));
            hs.checkAndRequire = <any>crequireStub;
        });
        it('should load from the handlers folder, if exists', () => {
            return hs.resolveAndLoad('/tmp/base/path', 'handlerid')
                .then(() => {
                    sinon.assert.calledWith(crequireStub, '/tmp/base/path/.neoman.config/handlers/handlerid.js');
                });
        });
        it('should delegate validation to validateHandler', () => {
            let stub = sinon.stub();
            let hnd = () => {};
            hs['validateHandler'] = stub;
            crequireStub.returns(Promise.resolve(hnd));
            hs.resolveAndLoad('a', 'b')
                .then(() => {
                    sinon.assert.calledWith(stub, 'a/.neoman.config/handlers/b.js', hnd);
                });
        });
    });

    describe('#checkAndRequire', () => {
        let requireStub: sinon.SinonStub;
        beforeEach(() => {
            requireStub = sinon.stub();
            requireStub.returns(Promise.resolve(() => {}));
            hs['require'] = requireStub;
        });
        it('should reject, if not exists/accessible', () => {
            accessStub.returns(Promise.reject("bad bad")); 
            return expect(hs.checkAndRequire('/tmp/base/path')).to.be.rejected;
        });
        it('should not reject, if exists/accessible', () => {
            let ret = {};
            requireStub.returns(ret);
            return expect(hs.checkAndRequire("path")).to.eventually.equal(ret);
        });
    });

    describe('#require', () => {
        it('should resolve with value from native require', () => {
            let ret = "boogie";
            let stub = sinon.stub();
            stub.returns(ret);
            hs['requireNative'] = <any>stub;
            expect(hs['require']('path')).to.eventually.equal(ret)
        });
    });

    describe('#validateHandler', () => {
        it('should reject, if not a function', () => {
            let hnd = { nonsense: 'obj' };
            return expect(hs['validateHandler']('/tmp/base/path', <any>hnd)).to.be.rejected;
        });
        it('should not reject, if a function', () => {
            let hnd = () => {};
            return expect(hs['validateHandler']('/tmp/base/path', hnd)).to.eventually.equal(hnd);
        });
    });
});