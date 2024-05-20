const rApos = /\'/g;
const rQuot = /\"/g;
const hChars = /[&<>\"\']/;
const rChars = /&[a-z]+;/i;

const reg = {
    rAmp: {
        raw_all: /&/g,
        entity_all: /&amp;/gi,
        entity_str: '&amp;',
        raw_str: '&'
    },
    rLt: {
        raw_all: /</g,
        entity_all: /&lt;/gi,
        entity_str: '&lt;',
        raw_str: '<'
    },
    rGt: {
        raw_all: />/g,
        entity_all: /&gt;/gi,
        entity_str: '&gt;',
        raw_str: '>'
    },
    rApos: {
        raw_all: /\'/g,
        entity_all: /&apos;/gi,
        entity_str: '&apos;',
        raw_str: '\''
    },
    rQuot: {
        raw_all: /\"/g,
        entity_all: /&quot;/gi,
        entity_str: '&quot;',
        raw_str: '"'
    }
};

module.exports = {
    sanitize: (str) => {
        if (str === null) {
            return str;
        }

        str = String(str);
        if (typeof str !== 'string') {
            return str;
        }

        if (!hChars.test(String(str))) {
            return str;
        }

        for (const [kk, vv] of Object.entries(reg)) {
            str = str.replace(vv.raw_all, vv.entity_str);
        }

        return str;
    },

    unsanitize: (str) => {
        if (str === null) {
            return str;
        }

        str = String(str);
        if (typeof str !== 'string') {
            return str;
        }

        if (!rChars.test(String(str))) {
            return str;
        }

        for (const [kk, vv] of Object.entries(reg)) {
            str = str.replace(vv.entity_all, vv.raw_str);
        }

        return str;
    }
};
