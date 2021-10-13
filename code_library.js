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

function setup() {
    return new Promise((resolve, reject) => {
        fs.readdir(DIR, (err, filenames) => {
            if (err) return reject('Opening Directory ' + DIR + 'failed.');
            let promises = filenames.map(fn => {
                return new Promise((resolve) => {
                    const reader = readline.createInterface({input: fs.createReadStream(DIR + '/' + fn)});
                    let count = 1;
                    let lines = []; // reading 1st and 3rd line (title and src)
                    reader.on('line', function (line) {
                        if (count > 3) reader.close();
                        else if (count !== 2) lines.push(line);
                        count++;
                    });
                    reader.once('close', function () {
                        resolve([fn, lines]);
                    });
                });
            });
            Promise.all(promises).then(files => {
                let count = 1;
                files.forEach(([fn, lines]) => {
                    library.push({index: count, fn, title: lines[0], src: lines[1]})
                    count++;
                });
                resolve();
            });
        });
    });
}

function toc(callback) {
    log(delimiterH, 'JS CODE LIBRARY', delimiterH);
    for (let entry of library) {
        const len = entry.index < 10 ? entry.title.length - 1 : entry.title.length;
        log('%s - %s %s ->(%s) %s', entry.index, entry.title, " ".repeat(space - len), entry.index, entry.src)
    }
    callback();
}

function entry(num, callback) {
    log('\n' + delimiterE);
    const reader = readline.createInterface({input: fs.createReadStream(DIR + '/' + library[num - 1].fn)});
    let count = 1;
    reader.on('line', function (line) {
        if (count !== 2 && count !== 3) log(line);
        count++;
    });
    reader.on('close', function () {
        log(delimiterE);
        callback();
    });
}

const reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const recursiveAsyncReadLine = function () {
    reader.question('\nWhat would you like to read? ', function (input) {
        const num = parseInt(input);
        if (num === 667) {
            log("Devil's neighbour wishes a good day.");
            return reader.close(); // closing reader and returning from func
        } else if (num < 0 || num > library.length) {
            log('Not a valid num.');
            recursiveAsyncReadLine();
        } else {
            if (num === 0) {
                log('');
                toc(recursiveAsyncReadLine);
            } else
                entry(num, recursiveAsyncReadLine); // calling func again to ask new question
        }
    });
};

function main() {
    if (process.argv.length === 3) {
        flags(process.argv[2]);
        process.exit(0);
    }
    setup().then(() => {
        toc(recursiveAsyncReadLine);
    }).catch(err => log(err));
}

function flags(f) {
    if (f === '-h' || f === '-help') {
        log('Commands:\n\t- 0: Table of Content\n\t- 667: Exit');
        log('Literature:');
        for (let book of literature) log('\t-', book);
    }
}

main();
