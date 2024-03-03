const fs = require('fs');
const readline = require('readline');
const log = console.log;
const DIR = '/home/joe/prog/js/code_library/library'
const DELIMITER_H = '=============================='
const DELIMITER_E = '------------------------------'
const RED = 91 // text color
const GREEN = 92
const CYAN = 96
const COLOR_E = [GREEN, CYAN]
const BLACK = 40 // background color
const COLOR_E_BG = [undefined, BLACK]
const LITERATURE = [
    "David Flanagan (2020): JavaScript. The Definitive Guide, 7th Edition, O'Reilly.",
    "Marijn Haverbeke (2018): Eloquent JavaScript, 3rd Edition, No Starch Press."
];
const reader = readline.createInterface({
    input: process.stdin, output: process.stdout, removeHistoryDuplicates: true
});
reader.on('history', history => { if (history[0] === '0') history.splice(0, 1) });
let library = [];

function readTitleAndTags(fn) {
    return new Promise((resolve) => {
        const reader = readline.createInterface({input: fs.createReadStream(DIR + '/' + fn)});
        let count = 1;
        let lines = {};
        reader.on('line', function (line) {
            if (count === 1) lines.title = line; else if (count === 3) {
                lines.tags = line;
                reader.close();
            }
            count++;
        });
        reader.once('close', function () {
            resolve([fn, lines]);
        });
    });
}

function setup() {
    return new Promise((resolve, reject) => {
        fs.readdir(DIR, async (err, filenames) => {
            if (err) return reject(format({color: RED}, 'Opening Directory ' + DIR + ' failed.'));
            let promises = filenames.map(fn => readTitleAndTags(fn));
            for await (const [fn, content] of promises) library.push({
                fn, title: content.title, tags: content.tags
            })
            library = library.sort((a, b) => {
                return a.title.localeCompare(b.title);
            });
            let count = 1;
            for (let entry of library) {
                entry["index"] = count++;
            }
            resolve();
        });
    });
}

function printToc(lib) {
    log(format({color: RED, bold: true}, `${DELIMITER_H} JS CODE LIBRARY ${DELIMITER_H}`));
    for (let [i, entry] of lib.entries()) {
        log(format({
            color: COLOR_E[i % 2],
            color_bg: COLOR_E_BG[i % 2]
        }, `${" ".repeat(entry.index < 10 ? 1 : 0)}${entry.index} - ${entry.title} ${" ".repeat(40 - entry.title.length)} ${entry.tags}`));
    }
    log();
    recursiveAsyncReadInput();
}

function printEntry(entry) {
    log(format({color: RED}, '\n' + DELIMITER_E));
    let color = Number(entry.index % 2 !== 1);
    log(format({color: COLOR_E[color], bold: true, underline: true}, `${entry.index} - ${entry.title}`));
    let count = 1;
    const reader = readline.createInterface({input: fs.createReadStream(DIR + '/' + entry.fn)});
    reader.on('line', function (line) {
        if (count > 3) {
            if (line === 'EXAMPLE') log(format({color: COLOR_E[color], bold: true}, line));
            else log(format({color: COLOR_E[color]}, line));
        } else count++;
    });
    reader.on('close', function () {
        log(format({color: RED}, DELIMITER_E + '\n'));
        recursiveAsyncReadInput();
    });
}

function format({color, color_bg = null, bold = false, underline = false}, str) {
    const ANSI_ESC = "\033[";
    let format = color;
    if (color_bg) format += ";" + color_bg;
    if (bold) format += ";1";
    if (underline) format += ";4";
    return `${ANSI_ESC}${format}m${str}${ANSI_ESC}0m`;
}

function recursiveAsyncReadInput() {
    reader.question(format({color: RED}, 'What would you like to read? '), function (input) {
        if (input.startsWith("s:")) {
            let search = input.substring(2).trim()
            let tmp = library.filter(e => e.tags.toLowerCase().includes(search));
            if (tmp.length === 0) {
                reader.history.splice(0, 1);
                log(format({color: RED}, 'No match found.\n'));
            } else {
                log();
                printToc(tmp);
            }
            recursiveAsyncReadInput();
        } else {
            input = input.replace(/ \(.+\)$/, "");
            const num = +input;
            if (isNaN(num)) {
                reader.history.splice(0, 1);
                log(format({color: RED}, 'Not a num.\n'));
                recursiveAsyncReadInput();
            } else if (num === 667) {
                log(format({color: RED}, "Devil's neighbour wishes a good day."));
                reader.close();
                process.exit();
            } else if (num < 0 || num > library.length) {
                reader.history.splice(0, 1);
                log(format({color: RED}, 'Not a valid num.\n'));
                recursiveAsyncReadInput();
            } else if (num === 0) {
                log('');
                printToc(library);
            } else {
                let entry = library[num - 1];
                reader.history[0] = `${num} (${entry.title})`;
                printEntry(entry);
            }
        }
    });
};

function main() {
    if (process.argv.length === 3) {
        flags(process.argv[2]);
        process.exit(0);
    }
    setup()
        .then(() => printToc(library))
        .catch(err => {
            log(err);
            process.exit(0);
        });
}

function flags(arg) {
    if (arg === '-h' || arg === '-help') {
        log(format({color: RED, bold: true}, `${DELIMITER_H} JS CODE LIBRARY ${DELIMITER_H}`));
        log(format({color: CYAN}, "Commands\n\t- 0  : Table of Content (or 'ENTER')\n\t- 667: Exit\n\t- s: : Search"));
        log(format({color: GREEN}, 'Literature'));
        for (let lit of LITERATURE) log(format({color: GREEN}, `\t- ${lit}`))
    }
}

main();
