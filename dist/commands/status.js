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
const wrapCommand_1 = require("../utils/wrapCommand");
const Decentraland_1 = require("../lib/Decentraland");
const Coordinates = require("../utils/coordinateHelpers");
const logging_1 = require("../utils/logging");
const command = 'status [target]';
const description = 'Displays the deployment status of the project or a given LAND';
const example = `
  Example usage:

    dcl status      - Returns the deployment status of the current project
    dcl status 1,1  - Returns the deployment status of the LAND located at the given coordinates
`;
function status(vorpal) {
    vorpal
        .command(command)
        .description(description)
        .help(() => vorpal.log(`\n  Usage: ${command}\n\n  ${description}${example}`))
        .parse((command, args) => {
        // Vorpal doesn't like negative numbers (confused with flags), walkaround:
        const parts = args.split(' ');
        const target = parts.shift();
        const rest = parts.join(' ');
        if (Coordinates.isValid(target)) {
            return `status coord:${target} ${rest}`;
        }
        return command;
    })
        .action(wrapCommand_1.wrapCommand((args) => __awaiter(this, void 0, void 0, function* () {
        const dcl = new Decentraland_1.Decentraland();
        if (!args.target) {
            yield dcl.project.validateExistingProject();
            const coords = yield dcl.project.getParcelCoordinates();
            const { lastModified, files } = yield dcl.getParcelStatus(coords.x, coords.y);
            logStatus(vorpal, files, lastModified, `${coords.x},${coords.y}`);
        }
        else if (typeof args.target === 'string' && args.target.startsWith('coord:')) {
            const raw = args.target.replace('coord:', '');
            const coords = Coordinates.getObject(raw);
            const { lastModified, files } = yield dcl.getParcelStatus(coords.x, coords.y);
            logStatus(vorpal, files, lastModified, raw);
        }
        else {
            vorpal.log(`\n  Invalid coordinates: ${args.target}`);
            vorpal.log(example);
        }
    })));
}
exports.status = status;
function logStatus(vorpal, files, lastModified, coords) {
    const serializedList = logging_1.formatList(files, { spacing: 2, padding: 2 });
    if (files.length === 0) {
        vorpal.log(logging_1.italic('\n  No information available'));
    }
    else {
        vorpal.log(`\n  Deployment status for ${coords}:`);
        if (lastModified) {
            vorpal.log(`\n    Last Deployment: ${lastModified}`);
        }
        vorpal.log(serializedList);
    }
}
exports.logStatus = logStatus;
