import * as i from '../lib/i';

export let mockMessagerFactory = () => {
    let m: i.IUserMessager = <any>{
        __mf: () => {},
        info: (message: any, indent?: number): i.IUserMessager => m,
        debug: (message: any, indent?: number): i.IUserMessager => m,
        warn: (message: any, indent?: number): i.IUserMessager => m,
        error: (message: any, indent?: number): i.IUserMessager => m,
        write: (message: string, indent: number = 0, level: i.Levels = i.LEVELS.Debug): i.IUserMessager => m,
        i18n: (mfDict?: any) => <i.IUserMessager> m
    };
    return m;
}