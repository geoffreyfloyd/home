/**
 * React needs to be imported even
 * though the variable is not directly
 * used until the JSX is compiled to JS
 */
/* eslint-disable no-unused-vars */
import React from 'react';

const glyphs = [
    'refresh',
    'info-sign',
    'menu-hamburger',
    'remove',
    'plus',
];

export default {
    typeOf: function (key) {
        // Check if it is a png
        if (glyphs.indexOf(key) > -1) {
            return 'glyph';
        }

        return null;
    },
    options: function () {
        var options = glyphs.slice();
        return options;
    }
};
/* eslint-enable no-unused-vars */
