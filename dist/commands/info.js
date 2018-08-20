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
const logging_1 = require("../utils/logging");
const Decentraland_1 = require("../lib/Decentraland");
const Coordinates = require("../utils/coordinateHelpers");
const command = 'info [target]';
const description = 'Displays information about the project, a LAND or a LAND owner\n';
const example = `
  Example usage:

    dcl info      - Returns the information of the current project
    dcl info 1,1  - Returns the information of the LAND located at the given coordinates
    dcl info 0x.. - Returns the information of all LANDs owned by the specified Ethereum address
`;
function info(vorpal) {
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
            return `info coord:${target} ${rest}`;
        }
        else if (target.startsWith('0x')) {
            return `info address:${target} ${rest}`;
        }
        return command;
    })
        .action(wrapCommand_1.wrapCommand((args) => __awaiter(this, void 0, void 0, function* () {
        const dcl = new Decentraland_1.Decentraland();
        if (!args.target) {
            yield dcl.project.validateExistingProject();
            const coords = yield dcl.project.getParcelCoordinates();
            const scene = yield dcl.getProjectInfo(coords.x, coords.y);
            logInfo(vorpal, scene);
        }
        else if (args.target.startsWith('address:')) {
            const address = args.target.replace('address:', '');
            const parcels = yield dcl.getAddressInfo(address);
            const formatted = parcels.reduce((acc, parcel) => {
                return Object.assign({}, acc, { [`${parcel.x},${parcel.y}`]: { name: parcel.name, description: parcel.description, ipns: parcel.ipns } });
            }, {});
            if (parcels.length === 0) {
                vorpal.log(logging_1.italic('\n  No information available\n'));
            }
            else {
                vorpal.log(`\n  LAND owned by ${address}:\n`);
                vorpal.log(logging_1.formatDictionary(formatted, { spacing: 2, padding: 2 }));
            }
        }
        else if (args.target.startsWith('coord:')) {
            const raw = args.target.replace('coord:', '');
            const coords = Coordinates.getObject(raw);
            const scene = yield dcl.getParcelInfo(coords.x, coords.y);
            logInfo(vorpal, scene);
        }
        else {
            vorpal.log(`\n  Invalid argument: ${args.target}`);
            vorpal.log(example);
        }
    })));
}
exports.info = info;
function logInfo(vorpal, scene) {
    vorpal.log('\n  Scene Metadata:\n');
    if (scene.scene) {
        vorpal.log(logging_1.formatDictionary(scene.scene, { spacing: 2, padding: 2 }));
    }
    else {
        vorpal.log(logging_1.italic('    No information available\n'));
    }
    vorpal.log('  LAND Metadata:\n');
    if (scene.land) {
        vorpal.log(logging_1.formatDictionary(scene.land, { spacing: 2, padding: 2 }));
    }
    else {
        vorpal.log(logging_1.italic('    No information available\n'));
    }
}
exports.logInfo = logInfo;
