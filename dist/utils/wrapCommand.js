"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = require("./logging");
const analytics_1 = require("./analytics");
const moduleHelpers_1 = require("./moduleHelpers");
function wrapCommand(fn) {
    return function (args, cb) {
        wrapper(fn, this, args).then(() => {
            cb();
        });
    };
}
exports.wrapCommand = wrapCommand;
function wrapper(fn, ctx, args) {
    return __awaiter(this, void 0, void 0, function* () {
        yield analytics_1.Analytics.requestPermission();
        try {
            yield fn.call(ctx, args);
            yield analytics_1.finishPendingTracking();
        }
        catch (e) {
            yield analytics_1.Analytics.reportError(e.name, e.message, e.stack);
            logging_1.exit(e, ctx);
        }
        if (yield moduleHelpers_1.isCLIOutdated()) {
            ctx.log(logging_1.warning('\nWARNING: outdated decentraland version\nPlease run ') + 'npm update -g decentraland\n');
        }
        if (yield moduleHelpers_1.isMetaverseApiOutdated()) {
            ctx.log(logging_1.warning('\nWARNING: outdated decentraland-api version\nPlease run ') + 'npm install decentraland-api@latest\n');
        }
    });
}
