const fs = require('fs');
const readline = require('readline');
const log = console.log;
const DIR = './library'
const DELIMITER_H = '======================================='
const DELIMITER_E = '---------------------------------------'
const LITERATURE = ["David Flanagan (2020): JavaScript. The Definitive Guide, 7th Edition, O'Reilly.", "Marijn Haverbeke (2018): Eloquent JavaScript, 3rd Edition, No Starch Press.",];
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
            if (err) return reject('Opening Directory ' + DIR + ' failed.');
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
    log(DELIMITER_H, 'JS CODE LIBRARY', DELIMITER_H);
    for (let entry of library) {
        const len = entry.index < 10 ? entry.title.length - 1 : entry.title.length;
        log('%s - %s %s ->(%s) %s', entry.index, entry.title, " ".repeat(40 - len), entry.index, entry.src)
    }
    recursiveAsyncReadInput();
}

function entry(num) {
    log('\n' + DELIMITER_E);
    const reader = readline.createInterface({input: fs.createReadStream(DIR + '/' + library[num - 1].fn)});
    let count = 1;
    reader.on('line', function (line) {
        if (count !== 2 && count !== 3) log(line);
        count++;
    });
    reader.on('close', function () {
        log(DELIMITER_E);
        recursiveAsyncReadInput();
    });
}

const reader = readline.createInterface({
    input: process.stdin, output: process.stdout
});

const recursiveAsyncReadInput = function () {
    reader.question('\nWhat would you like to read? ', function (input) {
        const num = +input;
        if (isNaN(num)) {
            log('Not a num.');
            recursiveAsyncReadInput();
        } else if (num === 667) {
            log("Devil's neighbour wishes a good day.");
            return reader.close();
        } else if (num < 0 || num > library.length) {
            log('Not a valid num.');
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
        log(DELIMITER_H, 'JS CODE LIBRARY', DELIMITER_H);
        log('Commands:\n\t- 0/Enter: Table of Content\n\t- 667: Exit');
        log('\nLiterature:');
        console.table(LITERATURE);
    }
}

main();
