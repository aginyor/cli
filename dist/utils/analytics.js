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
const uuidv4 = require("uuid/v4");
const env_1 = require("./env");
const inquirer = require("inquirer");
const dclinfo_1 = require("./dclinfo");
const moduleHelpers_1 = require("./moduleHelpers");
const AnalyticsNode = require('analytics-node');
// Setup segment.io
const WRITE_KEY = 'sFdziRVDJo0taOnGzTZwafEL9nLIANZ3';
const SINGLEUSER = 'cli-user';
exports.analytics = new AnalyticsNode(WRITE_KEY);
const ANONYMOUS_DATA_QUESTION = 'Send Anonymous data';
var Analytics;
(function (Analytics) {
    Analytics.sceneCreated = (properties) => trackAsync('Scene created', properties);
    Analytics.preview = (properties) => trackAsync('Preview started', properties);
    Analytics.sceneDeploy = (properties) => trackAsync('Scene deploy started', properties);
    Analytics.sceneDeploySuccess = (properties) => trackAsync('Scene deploy success', properties);
    Analytics.sceneLink = (properties) => trackAsync('Scene ethereum link started', properties);
    Analytics.sceneLinkSuccess = (properties) => trackAsync('Scene ethereum link succeeded', properties);
    Analytics.deploy = (properties) => trackAsync('Scene deploy requested', properties);
    Analytics.pinRequest = (properties) => trackAsync('Pin requested', properties);
    Analytics.pinSuccess = (properties) => trackAsync('Pin success', properties);
    Analytics.sendData = (shareData) => trackAsync(ANONYMOUS_DATA_QUESTION, { shareData });
    function identify(devId) {
        return __awaiter(this, void 0, void 0, function* () {
            exports.analytics.identify({
                userId: SINGLEUSER,
                traits: {
                    os: process.platform,
                    createdAt: new Date().getTime(),
                    devId
                }
            });
        });
    }
    Analytics.identify = identify;
    function reportError(type, message, stackTrace) {
        return __awaiter(this, void 0, void 0, function* () {
            return track('Error', {
                errorType: type,
                message,
                stackTrace
            });
        });
    }
    Analytics.reportError = reportError;
    function requestPermission() {
        return __awaiter(this, void 0, void 0, function* () {
            const dclinfo = yield dclinfo_1.getDCLInfo();
            if (!dclinfo) {
                const results = yield inquirer.prompt({
                    type: 'confirm',
                    name: 'continue',
                    default: true,
                    message: 'Send anonymous usage stats to Decentraland?'
                });
                const devId = uuidv4();
                yield dclinfo_1.writeDCLInfo(devId, results.continue);
                if (results.continue) {
                    yield Analytics.identify(devId);
                    yield Analytics.sendData(true);
                }
                else {
                    yield Analytics.sendData(false);
                }
            }
        });
    }
    Analytics.requestPermission = requestPermission;
})(Analytics = exports.Analytics || (exports.Analytics = {}));
/**
 * Tracks an specific event using the Segment API
 * @param eventName The name of the event to be tracked
 * @param properties Any object containing serializable data
 */
function track(eventName, properties = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (env_1.isDev || !(yield moduleHelpers_1.isOnline())) {
            return;
        }
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const dclinfo = yield dclinfo_1.getDCLInfo();
            let devId = dclinfo ? dclinfo.userId : null;
            let shouldTrack = dclinfo ? dclinfo.trackStats : true;
            shouldTrack = shouldTrack || eventName === ANONYMOUS_DATA_QUESTION;
            if (!shouldTrack) {
                resolve();
            }
            const event = {
                userId: SINGLEUSER,
                event: eventName,
                properties: Object.assign({}, properties, { os: process.platform, ci: process.env.CI, devId })
            };
            try {
                exports.analytics.track(event, () => {
                    resolve();
                });
            }
            catch (e) {
                resolve();
            }
        }));
    });
}
const pendingTracking = [];
function trackAsync(eventName, properties = {}) {
    const pTracking = track(eventName, properties)
        .then()
        .catch(e => {
        // tslint:disable-next-line:no-console
        if (process.env.DEBUG)
            console.log(e);
    });
    pendingTracking.push(pTracking);
}
function finishPendingTracking() {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all(pendingTracking);
    });
}
exports.finishPendingTracking = finishPendingTracking;
