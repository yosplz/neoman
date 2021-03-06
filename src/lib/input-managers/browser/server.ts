import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import { injectable } from 'inversify';
import * as WebSocket from 'ws';
import { IWebSocketFactory } from '.';
import { IUserMessager } from "../../i";
import { IInputConfig } from '../../user-extensibility';
import { curry } from '../../util/curry';
import { IClient } from './i-client';

// FIXME Could improve SoC, here. Use DI for express, etc.
@injectable()
export class Server {
    serverInstance: http.Server;
    express: () => express.Express = express;
    static: typeof express.static = express.static;
    bodyParser: typeof bodyParser = bodyParser;
    webSocket: typeof WebSocket = WebSocket;

    constructor(
        protected wsFactory: IWebSocketFactory,
        protected msg: IUserMessager,
        protected resolve: (value?: {} | PromiseLike<{}>) => void,
        protected reject: (reason?: any) => void
    ) {

    }

    launch(
        staticContentPath: string,
        inputConfig: IInputConfig,
        client: IClient
    ): void {
        var app = this.express();
        app.use(this.bodyParser.json());
        app.use('/', this.static(staticContentPath));
        app.get('/questions', (req, res) => res.json(inputConfig));
        app.post('/', curry.bindOnly(this.handleUserInput, this));
        this.serverInstance = app.listen(3638, curry.bindOnly(client.launch, client));
        // The webSocket will close automatically when the http server shuts down.
        this.wsFactory.build(this.serverInstance, this.resolve, this.reject);
    }

    stop(): void {
        if (this.serverInstance) {
            this.serverInstance.close();
        }
    }

    protected handleUserInput(
        req: express.Request,
        res: express.Response
    ): void {
        try {
            this.resolve(req.body);
        } catch(err) {
            this.reject(err);
        }
    }
}