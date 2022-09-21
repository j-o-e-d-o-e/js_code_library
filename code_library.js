const fs = require('fs');
const readline = require('readline');
const log = console.log;
const DIR = './library'
const DELIMITER_H = '=============================='
const DELIMITER_E = '------------------------------'
const RED = 91 // text color
const GREEN = 32
const CYAN = 96
const COLOR_E = [CYAN, GREEN]
const BLACK = 40 // background color
const COLOR_E_BG = [BLACK, undefined]
const LITERATURE = [
    "David Flanagan (2020): JavaScript. The Definitive Guide, 7th Edition, O'Reilly.",
    "Marijn Haverbeke (2018): Eloquent JavaScript, 3rd Edition, No Starch Press."
];
let library = [];

function readTitleAndSrc(fn) {
    return new Promise((resolve) => {
        const reader = readline.createInterface({input: fs.createReadStream(DIR + '/' + fn)});
        let count = 1;
        let lines = {};
        reader.on('line', function (line) {
            if (count === 1) lines.title = line; else if (count === 3) {
                lines.src = line;
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
            let promises = filenames.map(fn => readTitleAndSrc(fn));
            let count = 1;
            for await (const [fn, content] of promises) library.push({
                index: count++, fn, title: content.title, src: content.src
            })
            resolve();
        });
    });
}

function toc() {
    log(format({color: RED, bold: true}, `${DELIMITER_H} JS CODE LIBRARY ${DELIMITER_H}`));
    for (let entry of library) {
        log(format({
            color: COLOR_E[entry.index % 2],
            color_bg: COLOR_E_BG[entry.index % 2]
        }, `${" ".repeat(entry.index < 10 ? 1 : 0)}${entry.index} - ${entry.title} ${" ".repeat(40 - entry.title.length)} ${entry.src}`));
    }
    recursiveAsyncReadInput();
}

function entry(num) {
    const entry = library[num - 1];
    log(format({color: RED}, '\n' + DELIMITER_E));
    log(format({color: COLOR_E[entry.index % 2], bold: true}, `${entry.index} - ${entry.title}`));
    let count = 1;
    const reader = readline.createInterface({input: fs.createReadStream(DIR + '/' + entry.fn)});
    reader.on('line', function (line) {
        if (count > 3) {
            if (line === 'EXAMPLE') log(format({color: COLOR_E[entry.index % 2], bold: true}, line));
            else log(format({color: COLOR_E[entry.index % 2]}, line));
        } else count++;
    });
    reader.on('close', function () {
        log(format({color: RED}, DELIMITER_E));
        recursiveAsyncReadInput();
    });
}

function format({color, color_bg = null, bold = false, underline = false}, str) {
    const FORMAT_ESC = "\033[";
    let format = color;
    if (color_bg) format += ";" + color_bg;
    if (bold) format += ";1";
    if (underline) format += ";4";
    return `${FORMAT_ESC}${format}m${str}${FORMAT_ESC}0m`;
}

const reader = readline.createInterface({
    input: process.stdin, output: process.stdout
});

const recursiveAsyncReadInput = function () {
    reader.question(format({color: RED}, '\nWhat would you like to read? '), function (input) {
        const num = +input;
        if (isNaN(num)) {
            log(format({color: RED}, 'Not a num.'));
            recursiveAsyncReadInput();
        } else if (num === 667) {
            log(format({color: RED}, "Devil's neighbour wishes a good day."));
            return reader.close();
        } else if (num < 0 || num > library.length) {
            log(format({color: RED}, 'Not a valid num.'));
            recursiveAsyncReadInput();
        } else if (num === 0) {
            log('');
            toc();
        } else entry(num);
    });
};

function main() {
    if (process.argv.length === 3) {
        flags(process.argv[2]);
        process.exit(0);
    }
    setup()
        .then(() => toc())
        .catch(err => {
            log(err);
            process.exit(0);
        });
}

function flags(arg) {
    if (arg === '-h' || arg === '-help') {
        log(format({color: RED, bold: true}, `${DELIMITER_H} JS CODE LIBRARY ${DELIMITER_H}`));
        log(format({color: CYAN}, "Commands\n\t- 0/'Enter': Table of Content\n\t- 667: Exit"));
        log(format({color: GREEN}, 'Literature'));
        for (let lit of LITERATURE) log(format({color: GREEN}, `\t- ${lit}`))
    }
}

main();
