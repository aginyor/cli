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
const path = require("path");
const semver = require("semver");
const child_process_1 = require("child_process");
const packageJson = require("package-json");
const filesystem_1 = require("../utils/filesystem");
const project_1 = require("../utils/project");
const fetch = require("isomorphic-fetch");
exports.npm = /^win/.test(process.platform) ? 'npm.cmd' : 'npm';
function installDependencies(silent = false) {
    return new Promise((resolve, reject) => {
        const child = child_process_1.spawn(exports.npm, ['install'], { shell: true });
        if (!silent) {
            child.stdout.pipe(process.stdout);
            child.stderr.pipe(process.stderr);
        }
        child.on('close', () => resolve());
    });
}
exports.installDependencies = installDependencies;
function buildTypescript() {
    return new Promise((resolve, reject) => {
        const child = child_process_1.spawn(exports.npm, ['run', 'watch'], { shell: true });
        child.stdout.pipe(process.stdout);
        child.stdout.on('data', data => {
            if (data.toString().indexOf('The compiler is watching file changes...') > -1) {
                return resolve();
            }
        });
        child.stderr.pipe(process.stderr);
        child.on('close', () => resolve());
    });
}
exports.buildTypescript = buildTypescript;
function getLatestVersion(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let pkg;
        if (!(yield isOnline())) {
            return null;
        }
        try {
            pkg = yield packageJson(name.toLowerCase());
        }
        catch (e) {
            return null;
        }
        return pkg.version;
    });
}
exports.getLatestVersion = getLatestVersion;
function getInstalledVersion(name) {
    return __awaiter(this, void 0, void 0, function* () {
        let metaverseApiPkg;
        try {
            metaverseApiPkg = yield filesystem_1.readJSON(path.resolve(project_1.getNodeModulesPath(project_1.getRootPath()), name, 'package.json'));
        }
        catch (e) {
            return null;
        }
        return metaverseApiPkg.version;
    });
}
exports.getInstalledVersion = getInstalledVersion;
function isMetaverseApiOutdated() {
    return __awaiter(this, void 0, void 0, function* () {
        const metaverseApiVersionLatest = yield getLatestVersion('decentraland-api');
        const metaverseApiVersion = yield getInstalledVersion('decentraland-api');
        if (metaverseApiVersionLatest && metaverseApiVersion && semver.lt(metaverseApiVersion, metaverseApiVersionLatest)) {
            return true;
        }
        return false;
    });
}
exports.isMetaverseApiOutdated = isMetaverseApiOutdated;
function getInstalledCLIVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        let pkg;
        try {
            pkg = yield filesystem_1.readJSON(path.resolve(__dirname, '../../package.json'));
        }
        catch (e) {
            return null;
        }
        return pkg.version;
    });
}
exports.getInstalledCLIVersion = getInstalledCLIVersion;
function isCLIOutdated() {
    return __awaiter(this, void 0, void 0, function* () {
        const cliVersion = yield this.getInstalledCLIVersion();
        const cliVersionLatest = yield getLatestVersion('decentraland');
        if (cliVersionLatest && cliVersion && semver.lt(cliVersion, cliVersionLatest)) {
            return true;
        }
        else {
            return false;
        }
    });
}
exports.isCLIOutdated = isCLIOutdated;
function isOnline() {
    return new Promise(resolve => {
        fetch('https://decentraland.org/')
            .then(() => resolve(true))
            .catch(() => resolve(false));
        setTimeout(() => {
            resolve(false);
        }, 4000);
    });
}
exports.isOnline = isOnline;
