//
//
//---------------------------------------------------------------------
function $(id) { return document.getElementById(id); }
//---------------------------------------------------------------------------

function runYkLsp(src) {
    var SymbolSet = [];
    var GlobalEnv = {};

    var Nil = createSymbol("nil");
    var T = createSymbol("t");

    initYkLsp();
    return run(src);

    function clone(obj) {
	var f = function() {};
	f.prototype = obj;
	return new f;
    }


    function run(src) {
	var sexpObj = sexpParse(src);
	var retSexpObj = sexpEval(sexpObj, GlobalEnv);
	var retStr = sexpToStr(retSexpObj);
	return retStr;
    }

    function insertEnv(env, name, type){
	env[name] = type;
	return env;
    }
    function initYkLsp() {
	GlobalEnv = insertEnv(GlobalEnv,"nil",Nil);
	GlobalEnv = insertEnv(GlobalEnv,"t",T);

	// Lisp basic functions
	builtinFunc("car", built_car);
	builtinFunc("cdr", built_cdr);
	builtinFunc("equal", built_equal);
	builtinFunc("atom", built_atom);
	builtinFunc("cons", built_cons);

	// list functions
	builtinFunc("list", built_list);
	builtinFunc("consp", built_consp);
	builtinFunc("length", built_length);
	builtinFunc("append", built_append);
	builtinFunc("reverse", built_reverse);

	builtinFunc("symbolp", built_symbolp);

	// num functions
	builtinFunc("+", built_add);
	builtinFunc("-", built_sub);
	builtinFunc("*", built_mult);
	builtinFunc("/", built_div);
	builtinFunc("mod", built_mod);
	builtinFunc("abs", built_abs);
	builtinFunc("zerop", built_zerop);
	builtinFunc(">", built_inequalityL);
	builtinFunc("<", built_inequalityR);
	builtinFunc("=", built_equalCalc);
	builtinFunc(">=", built_inequalityLe);
	builtinFunc("<=", built_inequalityRe);

	builtinSpform("prog", built_prog);
	builtinSpform("define", built_define);
	builtinSpform("defun", built_defun);
	builtinSpform("cond", built_cond);
	builtinSpform("quote", built_quote);
	builtinSpform("setq", built_setq);
	builtinSpform("lambda", built_lambda);
	// builtinSpform("let", built_let);

	// String functions
	// builtinFunc("", built_);
	// builtinFunc("", built_);
	

	builtinFunc("alert", built_alert);

	function builtinFunc(funcName, funcType) {
	    GlobalEnv = insertEnv(GlobalEnv, funcName, createFunc(funcType));
	}
	function builtinSpform(formName, formType) {
	    GlobalEnv = insertEnv(GlobalEnv, formName, createSpform(formType));
	}
    }

    function sexpParse(src) {
	var ary = createTokens(src);
	var sexp = parser(ary);
	return sexp;

	function createTokens(src) {
	    var ary = src.match(/\(|\)|\'|[^\(\)\s]+/g);
	    return transQuote(ary);

	    function transQuote(ary) { //'(シングルクオート)部をS式の表現に変換
		var pos = 0;
		var i = 0;
		while (i < ary.length) {
		    if(ary[i] === "'"){
			if (ary[i+1] === "(") {
			    for (var j=ary.length - 1; j >= i+1; j--) {
				ary[j+1] = ary[j];
			    }
			    ary[i] = "(";
			    ary[i+1] = "quote";
			    pos = correspondParenPos(ary,i+2);
			    for (var j=ary.length - 1; j >= pos; j--) {
				ary[j+1] = ary[j];
			    }
			    ary[pos] = ")";
			    i = i + 2;
			} else {
			    for (var j=ary.length - 1; j >= i+2; j--) {
				ary[j+2] = ary[j];
			    }
			    ary[i+0] = "(";
			    ary[i+2] = ary[i+1];
			    ary[i+1] = "quote";
			    ary[i+3] = ")";
			    i = i + 3;
			}
		    }
		    i++;
		}
		return ary;

		function correspondParenPos(ary, pos) { //対応するカッコを見つけて、その配列の位置
		    var i = pos+1;
		    var depth = 1;
		    try {
			while (depth > 1 || ary[i] !== ")") {
			    if (ary[i] === "(") { depth++; }
			    if (ary[i] === ")") { depth--; }
			    i++;
			}

		    } catch (e) {
			alert("Error ( -> ) nothing.");
		    }
		    return i;
		}
	    }
	    
	}
	
	function parser(ary) { return parseAryToObj(ary, 0, ary.length-1); }
	function parseTokenToObj(token) { //"("以外のトークンがくる
	    if(isNumber(token)) {
		return createNumber(token);
	    } else if (isString(token)) {
		token = token.slice(1, token.length-1);
		return createString(token);
	    } else if (isRegexp(token)) {
		token = token.slice(2, token.length-1);
		return createRegexp(token);
	    } else { //symbolなら
		return createSymbol(token);
	    }
	}
	function parseAryToObj(ary) { //pos=0
	    if (ary[0] === "(") {
		return parseAryToList(ary);
	    } else if (isNumber(ary[0])) {
		return createNumber(ary[0]);
	    } else if (isString(ary[0])){
		ary[0] = ary[0].slice(1, ary[0].length-1);
		return createString(ary[0]);
	    } else if (isRegexp(ary[0])) {
		ary[0] = ary[0].slice(2, ary[0].length-1);
		return createRegexp(ary[0]);
	    } else {
		return createSymbol(ary[0]);
	    }
	}
	function isNumber(str) { return /^-?[0-9]+$/.test(str); }
	function isString(str) { return (str.search(/\"[\w\W\s\S]*\"/) > -1); }
	function isRegexp(str) { return (str.search(/\#\/[\w\W\s\S]*\//) > -1); }
	function parseAryToList(ary) {
	    var retCell = createCell();
	    var cell = retCell;
	    for (var i=1; ary[i] !== ")"; i++) {
		if (ary[i] !== "(") {
		    cell.car = parseTokenToObj(ary[i]);
		} else 
		    if (ary[i] === "(") {
			var childAry = [];
			for (var j=0, depth=0; depth > 1 || ary[i+j] !== ")"; j++) {
			    if (ary[i+j] === "(") { depth++; }
			    if (ary[i+j] === ")") { depth--; }
			    childAry[j] = ary[i+j];
			}
			childAry[j] = ")";
			cell.car = parseAryToList(childAry);
			
			i = i + j;
		    }
		if (ary[i+1] !== ")") {
		    cell.cdr = createCell();
		    cell = cell.cdr;
		} else {
		    cell.cdr = Nil;
		}
	    }
	    return retCell;
	}	
    }


    //output-----------------------------------------------------------
    function sexpToStr(obj) { return outputObjToStr(obj); }
    function outputObjToStr(obj) { //完成?
	switch (obj.tag) {
	case "number" :
	    return String(obj.num);
	case "string" :
	    return "\"" + obj.str + "\"";
	case "symbol" :
	    return obj.name;
	//html
	case "htmldom" :
	    //alert(obj.htag);
	    return "<" + obj.htag + ">" + obj.dom.innerHTML + "</" + obj.htag+ ">";
	case "htmldoc" :
	    //alert(obj.tag);
	    return "<html>" + obj.doc.getElementsByTagName("html")[0].innerHTML + "</html>";
	//end

	case "regexp" :
	    return "#/" + obj.reg.source + "/";
	case "numrange":
	    return "(NumRange" + obj.max + " " + obj.min + ")";
	case "cell" :
	    var str;
	    str = outputListToStr(obj);
	    return str;
	}
    }
    function outputListToStr(obj) {
	var str = "";
	str = str + "(";
	str = str + outputObjToStr(car(obj)) + " . ";
	str = str + outputObjToStr(cdr(obj)) + ")";

	return str;
    }

    // evals
    function sexpEval(s, env) {
	if (s.tag === "number") { return s; }
	if (s.tag === "string") { return s; }
	if (s.tag === "regexp") { return s; }
	if (s.tag === "symbol") { return env[s.name]; }
	if (s.tag === "cell") { return sApply(sexpEval(car(s), env), cdr(s), env); }
    }
    function sApply(func, args, env) {
	if (func.tag === "func" || func.tag === "lambda") {
	    args = evlis(args, env);
	}

	switch (func.tag) {
	case "func" :
	    return func.func(args);
	case "spform" :
	    return func.form(args, env);
	case "lambda" :
	    return built_prog(func.form, pushEnv(args, func.args, func.env));
	}
	return Nil;
    }
    function pushEnv(args, formArgs, env) {
	var newEnv = clone(env);

	var len = length(formArgs);
	var current = formArgs;
	for (var i = car(current).name; car(current) !==Nil; current = cdr(current)) {
	    newEnv[i] = car(args);
	    args = cdr(args);
	}
	return newEnv;
    }
    
    function evlis(args, env) { //argsをすべて評価して、それらをリストにして返す
	var p = args;
	var topCell = createCell();
	var current = topCell;
	while (p !== Nil) {
	    current.car = sexpEval(car(p), env);
	    current.cdr = createCell();
	    if (cdr(p) !== Nil) {
		current = cdr(current);
		p = cdr(p);
	    } else {
		current.cdr = Nil;
		break;
	    }
	}
	return topCell;
    }

    // data structure
    function Symbol(str) {
	this.tag = "symbol";
	this.name = str;
    }
    function Num(val) {
	this.tag = "number";
	this.num = parseFloat(val);
    }
    function Str(str) {
	this.tag = "string";
	this.str = new String(str);
    }
    function Cell() {
	this.tag = "cell";
	this.car = Nil;
	this.cdr = Nil;
    }
    function Rx(str) {
	this.tag = "regexp";
	this.reg = new RegExp(str);
    }
        
    function Func(func) {
	this.tag = "func";
	this.func = func;
    }
    function Spform(form) {
	this.tag = "spform";
	this.form = form;
    }
    function Lambda(form, args, env) {
	this.tag = "lambda";
	this.form = form;
	this.args = args;
	this.env = env;
    }

    // data structure creates
    function createSymbol(str) {
	for (var i=0; i<SymbolSet.length; i++) {
	    if (SymbolSet[i] === str) {
		return SymbolSet[i];
	    }
	}
	SymbolSet[SymbolSet.length] = new Symbol(str);
	return SymbolSet[SymbolSet.length - 1]; //ひとつ増えたから
    }
    function createNumber(n) { return new Num(n); }
    function createCell() { return new Cell(); }
    function createString(str) { return new Str(str); }
    function createRegexp(str) { return new Rx(str); }
    
    function createFunc(func) { return new Func(func); }
    function createSpform(form) { return new Spform(form); }
    function createLambda(form, args, env) { return new Lambda(form, args, env); }
    
    // ----------------------------------------------------------------------------------
    function numberp(x) { return (x.tag === "num") ? T : Nil; }
    function consp(x) { return (x.tag === "cell") ? T : Nil; }
    function stringp(x) { return (x.tag === "string") ? T : Nil; }
    function regexpp(x) { return (x.tag === "regexp") ? T : Nil; }
    function symbolp(x) { return (x.tag !== "cell") ? T : Nil; }

    function valToBool(val) {
	if (val.tag === "num") { return (val.num === 0) ? Nil : T; }
	return (val === Nil) ? Nil : T;
    }
    
    function car(x) { return (x === Nil) ? Nil : x.car; }
    function cdr(x) { return (x === Nil) ? Nil : x.cdr; }
    function cons(a ,b) {
	var cell = createCell();
	cell.car = a;
	cell.cdr = b;
	return cell;
    }
    function setCar(x, val) { x.car = val; }
    function setCdr(x, val) { x.cdr = val; }

    function nullp(x) { return (x === Nil || (car(x) === Nil && cdr(x) === Nil)) ? T : Nil; }
    function length(lst) { return (nullp(lst) === T) ? 0 : 1 + length(cdr(lst)); }
    function append(lst1, lst2) { return (nullp(lst1) === T) ? lst2 : cons(car(lst1), append(cdr(lst1), lst2)); }
    function reverse(lst) {
	return _rev(lst, Nil);
	function _rev(lst1, lst2) {
	    return (nullp(lst1) === T) ? lst2 : _rev(cdr(lst1), cons(car(lst1), lst2));
	}
    }
    function list(lst) { return (lst === Nil) ? lst : cons(car(lst), list(cdr(lst))); }

    function caar(x) { return car(car(x)); }
    function caaar(x) { return car(car(car(x))); }
    function cddr(x) { return cdr(cdr(x)); }
    function cdddr(x) { return cdr(cdr(cdr(x))); }
    function cdar(x) { return cdr(car(x)); }
    function cadr(x) { return car(cdr(x)); }
    function caddr(x) { return car(cddr(x)); }

//builtin------------------------------------------------------------------------------------------------

    function built_quote(args, env) { return car(args); }
    function built_car(args) { return caar(args); }
    function built_cdr(args) { return cdar(args); }
    function built_cons(args) { return cons(car(args), car(cdr(args))); }
    function built_list(args) { return list(args); }

    function built_equal(args) {
	var x = car(args);
	var y = cadr(args);
	return ((x.tag === "number" && y.tag === "number" && x.num === y.num) || x === y) ? T : Nil;
    }
    function built_atom(s) { return (car(s).tag !== "cell") ? T : Nil; }
    function built_add(args) { 
	var current = args;
	var ret = 0;
	while (current !== Nil && car(current).tag === "number") {
		ret = ret + car(current).num;
		current = cdr(current);
	}
	return createNumber(ret);
    }
    function built_sub(args) { 
	var x = car(args);
	var y = cadr(args);
	return (x.tag === "number" && y.tag === "number") ? createNumber(x.num - y.num) : Nil;
    }
    function built_mult(args) {
	var current = args;
	var ret = 1;
	while (current !== Nil && car(current).tag === "number") {
	    ret = ret * car(current).num;
	    current = cdr(current);
	}
	return createNumber(ret);
    }
    function built_div(args) {
	var x = car(args);
	var y = cadr(args);
	return (x.tag === "number" && y.tag === "number") ? createNumber(x.num / y.num) : Nil;
    }
    function built_mod(args) {
	var x = car(args);
	var y = cadr(args);
	return (x.tag === "number" && y.tag === "number") ? createNumber(x.num % y.num) : Nil;
    }

    function built_consp(args) { return consp(car(args)); }
    function built_zerop(args) { return zerop(car(args)); }
    function built_stringp(s) { return stringp(car(s)); }
    function built_regexpp(s) { return regexpp(car(s)); }
    function built_symbolp(s) { return symbolp(car(s)); }

    function built_and(args) {
	var x = valToBool(car(args));
	var next = cdr(args);
	var y;

	while (x !== Nil && next !== Nil) {
		y = valToBool(car(next));
		x = (x !== Nil && y !== Nil) ? T : Nil;
		next = cdr(next); 
	}
	return x;
    }

    function built_or(args) {
	var x = car(args);
	var y = cadr(args);
	if (x.tag === "number") { x = (x.num === 0) ? Nil : T; }
	if (y.tag === "number") { y = (y.num === 0) ? Nil : T; }

	return (x === Nil && y === Nil) ? Nil : T;
    }

    function built_inequalityL(args) { //x > y?
	var x = car(args);
	var y = cadr(args);
	if(x.tag === "number" && y.tag === "number") { return (x.num > y.num) ? T : Nil; }
    }
    function built_inequalityLe(args) { //x >= y?
	var x = car(args);
	var y = cadr(args);
	if(x.tag === "number" && y.tag === "number") { return (x.num >= y.num) ? T : Nil; }
    }

    function built_inequalityR(args) { //x < y?
	var x = car(args);
	var y = cadr(args);
	if(x.tag === "number" && y.tag === "number") { return (x.num < y.num) ? T : Nil; }
    }
    function built_inequalityRe(args) { //x <= y?
	var x = car(args);
	var y = cadr(args);
	if(x.tag === "number" && y.tag === "number") { return (x.num <= y.num) ? T : Nil; }
    }

    function built_equalCalc(args) {
	var x = car(args);
	var y = cadr(args);
	if(x.tag === "number" && y.tag === "number") { return (x.num === y.num) ? T : Nil; }
    }
    
    function built_length(args) {
	return createNumber(length(car(args)));
    }

    function built_append(args) {
	return append(car(args), cadr(args));
    }

    function built_reverse(args) {
	return reverse(car(args));
    }
    function built_abs(args) {
	return Math.abs(car(args).num);
    }
    
    // function built_str_rx(args) {
    // 	return createRx(car(args).str);
    // }

    // function built_rx_search(args) {
    // 	var reg = car(args).reg;
    // 	var str = cadr(args).str;
    // 	return createNum(str.search(reg));
    // }

    // function built_rx_test(args) {
    // 	var reg = car(args).reg;
    // 	var str = cadr(args).str;
    // 	return reg.test(str) ? T : Nil;
    // }

    // function built_num_range(args) {
    // 	var max = car(args).num;
    // 	var min = cadr(args).num;
    // 	return createNumRange(max, min);
    // }

    // function built_num_range_test(args) {
    // 	var numRange = car(args);
    // 	var str = cadr(args).str;
	
    // 	var reg = /[0-9]+\.?[0-9]*/i;
    // 	var numx = Number((str.match(reg))[0]);
    // 	return (numRange.min <= numx && numx <= numRange.max) ? T : Nil;
    // }

    //----------------------------------------------------------------------------
    function built_prog(args, env) {
	var ret = Nil;
	var current = args;
	while (current !== Nil) {
		ret = sexpEval(car(current), env);
		current = cdr(current);
	}
	return ret;
    }

    // function built_map(args, env) {
    // 	var ret = createCell();
    // 	var retp = ret;
    // 	var current = sEval(cadr(args), env);
    // 	var func = car(args);
    // 	var tmp;
    
    // 	while (current !== Nil) {
    // 		tmp = cons(func, cons(car(current), Nil)); //alert(output(tmp));
    // 		retp.car = sEval(tmp, env);// alert(output(ret.car));
    // 		current = cdr(current); //alert(output(current));
    // 		retp.cdr = (current !== Nil) ? createCell() : Nil; //alert(output(ret.cdr));
    // 		retp = retp.cdr;
    // 	}
    // 	return ret;
    // }

    function built_setq(args, env) {
	var name = car(args).name;
	var val = cadr(args);
	var bind = searchFromBooks(name, env);
	if (bind === Nil) {
	    return built_define(args, env);
	}
	val = sexpEval(val, env);
	env[name] = val;
	return name;
    }
    function built_defun(args, env) {
	var name = car(args);
	var sArgs = cadr(args);
	var form = cddr(args);
	form = built_lambda(cdr(args) , env);
	env = insertEnv(env, name.name, form);
	return name; //<-mada
    }
    function built_define(args, env) {
	var name = car(args);
	var val = cadr(args);
	val = sexpEval(val, env);
	env = insertEnv(env, name.name, val);
	return name;
    }

    function built_lambda(args, env) {
	return createLambda(cdr(args), car(args), env);
    }

    function built_cond(args, env) {
	while (args != Nil) {
	    if (sexpEval(caar(args), env) !== Nil) { return built_prog(cdar(args), env); }
	    args = cdr(args);
	}
	return Nil;
    }

    function built_let(args, env) {
    }



    function built_alert(args) {
	alert(sexpToStr(car(args)));
	return car(args);
    }
}