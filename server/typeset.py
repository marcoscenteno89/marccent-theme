"""
TYPESET on the server (#22): core/typeset.js's rules in Python, so a Django page arrives set and nothing shifts
after it loads. Same rules, same output: markup/typeset.json holds the cases, and `npm test` runs this file against
them (python3 server/typeset.py --cases markup/typeset.json). Change a rule in core/typeset.js first, then here and
in typeset.php, then `npm run typeset`.

    from typeset import typeset, typeset_html
    typeset_html(html)          # markup: every text in it but code, pre, kbd, samp, script, style, textarea, sup,
                                # sub, .no-typeset and [contenteditable]
    typeset('Mon--Fri', True)   # plain text in, escaped HTML out (True: keep the last two words together)

Both return HTML; a Django filter marks it safe.
"""
import html as _html
import json
import re
import sys

NBSP = ' '
# The units a number keeps beside it (core/typeset.js UNITS).
UNITS = ['kg', 'g', 'mg', 'lbs?', 'oz', 'km', 'm', 'cm', 'mm', 'mi', 'ft', 'in', 'yd', 'ac', 'ha', 'L', 'ml',
         'gal', '°F', '°C', '°', '%', 'hrs?', 'min', 'sec', 'mph', 'km/h', 'kWh', 'kW', 'W', 'V', 'psi', 'sq ft', 'sq m']
LENGTHS = 'mm|cm|km|m|ft|in|yd|mi'
# Not a letter or a digit next (JS (?![\p{L}\d])); Python's re has no \p{L}, and [^\W_] is a letter or a digit.
END = r'(?![^\W_])'
MARKS = {'tm': '™', 'r': '®', 'sm': '℠', 'c': '©'}
POWERS = {'2': '²', '3': '³'}
SKIP = {'code', 'pre', 'kbd', 'samp', 'script', 'style', 'textarea', 'sup', 'sub'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}
RAW = {'script', 'style', 'textarea', 'title'}

_RULES = [
    (re.compile(r'([0-9]) ?-- ?(?=[0-9])'), r'\1–'),
    (re.compile(r'(\S)--(?=\S)'), r'\1–'),
    (re.compile(r' ?-- ?'), '—'),
    (re.compile(r'\((tm|r|sm|c)\)', re.I), lambda m: MARKS[m[1].lower()]),
    (re.compile(r'([0-9])\'([0-9]{1,2})"'), r'\1′\2″'),
    (re.compile(r'([0-9])"' + END), r'\1″'),
    (re.compile(r"([0-9])'" + END), r'\1′'),
    (re.compile(r'([0-9][0-9,.]*) ?(' + LENGTHS + r')([23])' + END), lambda m: m[1] + NBSP + m[2] + POWERS[m[3]]),
    (re.compile(r'([0-9]) (?=(?:' + '|'.join(UNITS) + r')' + END + ')'), '\\1' + NBSP),
]
_WIDOW = re.compile(r' (\S{1,12}\s*)\Z')
_RAISED = re.compile(r'([0-9])(st|nd|rd|th)' + END + r'|([™®℠])')
_ATTR = r'''(?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*'''
_TOKENS = re.compile(r'(<!--.*?-->|<![^>]*>|<\?.*?>|</?[a-zA-Z][^\s/>]*' + _ATTR + r'\s*/?>)', re.S)
_TAG = re.compile(r'^<(/?)([a-zA-Z][^\s/>]*)')
_EDITABLE = re.compile(r'\scontenteditable(?=[\s=/>])', re.I)
_NO_TYPESET = re.compile(r'''\sclass\s*=\s*(?:"[^"]*|'[^']*|)(?<![\w-])no-typeset(?![\w-])''', re.I)


def _esc(s):
    return _html.escape(s, quote=False)


def typeset(text, widow=False):
    """The text set, as HTML: escaped, raised parts (an ordinal's letters, ™ ® ℠) in <sup>."""
    s = text.replace('...', '…')
    for pattern, to in _RULES:
        s = pattern.sub(to, s)
    if widow:
        s = _WIDOW.sub(NBSP + r'\1', s, count=1)
    out, at = [], 0
    for m in _RAISED.finditer(s):
        start = m.start() + (1 if m[2] else 0)
        out.append(_esc(s[at:start]) + '<sup>' + (m[2] or m[3]) + '</sup>')
        at = m.end()
    return ''.join(out) + _esc(s[at:])


def typeset_html(markup):
    """Markup set in place, as typesetElement() sets an element: every text but the skipped ones, the last one
    keeping its last two words together."""
    tokens = _TOKENS.split(markup)
    stack, texts = [], []  # stack: [name, skipped]; texts: token indexes of the texts to set
    i = 0
    while i < len(tokens):
        t = tokens[i]
        if i % 2:
            tag = _TAG.match(t)
            if tag:
                name = tag[2].lower()
                if tag[1]:
                    names = [n for n, _ in stack]
                    if name in names:
                        del stack[len(names) - 1 - names[::-1].index(name):]
                elif name not in VOID and not t.endswith('/>'):
                    skipped = bool((stack and stack[-1][1]) or name in SKIP or _EDITABLE.search(t) or _NO_TYPESET.search(t))
                    stack.append([name, skipped])
                    if name in RAW:
                        # Raw text up to its end tag, which the split may have cut at a "<" inside it.
                        end = re.compile(r'^</' + re.escape(name) + r'\s*>', re.I)
                        while i + 2 < len(tokens) and not end.match(tokens[i + 2]):
                            tokens[i + 1] += tokens[i + 2] + tokens[i + 3]
                            del tokens[i + 2:i + 4]
        elif t and not (stack and stack[-1][1]):
            texts.append(i)
        i += 1
    for n, i in enumerate(texts):
        plain = _html.unescape(tokens[i])
        done = typeset(plain, n == len(texts) - 1)
        if done != _esc(plain):
            tokens[i] = done
    return ''.join(tokens)


if __name__ == '__main__' and sys.argv[1:2] == ['--cases']:
    with open(sys.argv[2], encoding='utf-8') as f:
        cases = json.load(f)
    failed = 0
    for c in cases['text']:
        got = typeset(c['text'], bool(c.get('widow')))
        if got != c['html']:
            print(f"FAIL typeset python: {json.dumps(c['text'], ensure_ascii=False)} gave {json.dumps(got, ensure_ascii=False)}, not {json.dumps(c['html'], ensure_ascii=False)}")
            failed += 1
    for c in cases['markup']:
        got = typeset_html(c['markup'])
        if got != c['html']:
            print(f"FAIL typeset python: {json.dumps(c['markup'], ensure_ascii=False)} gave {json.dumps(got, ensure_ascii=False)}, not {json.dumps(c['html'], ensure_ascii=False)}")
            failed += 1
    if not failed:
        print(f"ok   typeset python: {len(cases['text']) + len(cases['markup'])} cases set as core/typeset.js sets them")
    sys.exit(1 if failed else 0)
