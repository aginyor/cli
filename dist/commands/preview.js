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
const moduleHelpers_1 = require("../utils/moduleHelpers");
const wrapCommand_1 = require("../utils/wrapCommand");
const analytics_1 = require("../utils/analytics");
const Decentraland_1 = require("../lib/Decentraland");
const logging_1 = require("../utils/logging");
const errors_1 = require("../utils/errors");
const opn = require("opn");
const os = require("os");
function start(vorpal) {
    vorpal
        .command('preview')
        .alias('start')
        .option('-p, --port <number>', 'parcel previewer server port (default is 2044).')
        .option('--no-browser', 'prevents the CLI from opening a new browser window.')
        .option('--no-watch', 'prevents the CLI from watching filesystem changes.')
        .description('Starts local development server.')
        .action(wrapCommand_1.wrapCommand((args) => __awaiter(this, void 0, void 0, function* () {
        const dcl = new Decentraland_1.Decentraland({
            previewPort: args.options.port,
            watch: args.options.watch
        });
        analytics_1.Analytics.preview();
        const sdkOutdated = yield moduleHelpers_1.isMetaverseApiOutdated();
        const installedVersion = yield moduleHelpers_1.getInstalledVersion('decentraland-api');
        if (sdkOutdated) {
            vorpal.log(logging_1.bold(logging_1.error(`\n\n\n\n  ❗️ Your decentraland-api version is outdated. Please run:\n\n  npm install decentraland-api@latest\n\n\n`)));
            // TODO: would you like to install it? [Yn]
        }
        if (yield dcl.project.needsDependencies()) {
            if (yield moduleHelpers_1.isOnline()) {
                const spinner = logging_1.loading('Installing dependencies');
                yield moduleHelpers_1.installDependencies(true);
                spinner.succeed();
            }
            else {
                const e = new Error('Unable to install dependencies: no internet connection');
                e.name = errors_1.ErrorType.PREVIEW_ERROR;
                throw e;
            }
        }
        if (yield dcl.project.isTypescriptProject()) {
            yield moduleHelpers_1.buildTypescript();
        }
        dcl.on('preview:ready', port => {
            const ifaces = os.networkInterfaces();
            const openBrowser = args.options.browser !== undefined ? args.options.browser : true;
            let url = null;
            vorpal.log(''); // line break
            logging_1.info(`Preview server is now running`);
            vorpal.log(logging_1.bold('\n  Available on:\n'));
            Object.keys(ifaces).forEach((dev, i) => {
                ifaces[dev].forEach(details => {
                    if (details.family === 'IPv4') {
                        const addr = `http://${details.address}:${port}`;
                        if (i === 0) {
                            url = addr;
                        }
                        vorpal.log(`    ${addr}`);
                    }
                });
            });
            vorpal.log(logging_1.bold('\n  Details:\n'));
            vorpal.log(`    decentraland-api version: ${installedVersion}`, sdkOutdated ? '(OUTDATED)' : '');
            vorpal.log(logging_1.comment('\nPress CTRL+C to exit\n'));
            if (openBrowser) {
                opn(url);
            }
        });
        yield dcl.preview();
    })));
}
exports.start = start;
