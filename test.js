var i = 0;
parse("1+1+1", i);

function parse(expr, i) {
    if (expr[i++] !== '1') throw Error;
    if (expr[i++] !== '+') return 1;
    var right = parse(expr, i);
    return [1, right];
}
