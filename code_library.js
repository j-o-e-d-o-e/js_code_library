const fs = require('fs');
const readline = require('readline');
const log = console.log;
const DIR = '/media/joe/E/programming/js/code_library/library'
const delimiterH = '==================================='
const delimiterE = '-----------------------------------'
const space = 40;
const literature = [
    "David Flanagan (2020): JavaScript. The Definitive Guide, 7th Edition, O'Reilly.",
    "Marijn Haverbeke (2018): Eloquent JavaScript, 3rd Edition, No Starch Press.",
];
let library = [];

function readTitleAndSrc(fn) {
    return new Promise((resolve) => {
        const reader = readline.createInterface({input: fs.createReadStream(DIR + '/' + fn)});
        let count = 1;
        let lines = {};
        reader.on('line', function (line) {
            if (count === 1) lines.title = line;
            else if (count === 3) {
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
            for await (const [fn, content] of promises)
                library.push({index: count++, fn, title: content.title, src: content.src})
            resolve();
        });
    });
}

function toc() {
    log(delimiterH, 'JS CODE LIBRARY', delimiterH);
    for (let entry of library) {
        const len = entry.index < 10 ? entry.title.length - 1 : entry.title.length;
        log('%s - %s %s ->(%s) %s', entry.index, entry.title, " ".repeat(space - len), entry.index, entry.src)
    }
    recursiveAsyncReadLine();
}

function entry(num) {
    log('\n' + delimiterE);
    const reader = readline.createInterface({input: fs.createReadStream(DIR + '/' + library[num - 1].fn)});
    let count = 1;
    reader.on('line', function (line) {
        if (count !== 2 && count !== 3) log(line);
        count++;
    });
    reader.on('close', function () {
        log(delimiterE);
        recursiveAsyncReadLine();
    });
}

const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const recursiveAsyncReadLine = function () {
    reader.question('\nWhat would you like to read? ', function (input) {
        const num = +input;
        if (isNaN(num)) {
            log('Not a num.');
            recursiveAsyncReadLine();
        } else if (num === 667) {
            log("Devil's neighbour wishes a good day.");
            return reader.close();
        } else if (num < 0 || num > library.length) {
            log('Not a valid num.');
            recursiveAsyncReadLine();
        } else if (num === 0) {
            log('');
            toc();
        } else
            entry(num);
    });
};

function main() {
    if (process.argv.length === 3) {
        flags(process.argv[2]);
        process.exit(0);
    }
    setup()
        .then(() => toc())
        .catch(err => log(err));
}

function flags(f) {
    if (f === '-h' || f === '-help') {
        log(delimiterH, 'JS CODE LIBRARY', delimiterH);
        log('Commands:\n\t- 0/Enter: Table of Content\n\t- 667: Exit');
        log('\nLiterature:');
        for (let book of literature) log('\t-', book);
    }
}

main();
