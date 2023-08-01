'use strict';

const commandLineArgs = require('command-line-args');

/**
 * Specify what command line options are available and then
 * retrieve them
 */
const optionDefinitions = [
    {
        name: 'cartridge',
        type: String,
        defaultOption: true,
        defaultValue: 'cartridge_name'
    },
    {
        name: 'path',
        type: String
    },
    {
        name: 'lib',
        type: String
    },
    {
        name: 'page',
        type: String
    },
    {
        name: 'content',
        type: String
    },
    {
        name: 'siteid',
        type: String
    },
    {
        name: 'remove',
        type: Boolean
    },
    {
        name: 'all',
        type: Boolean
    }
];

module.exports = commandLineArgs(optionDefinitions);
