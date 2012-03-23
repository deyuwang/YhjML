//
//     BUILTINOP = ['IFOP','WHILEOP','SETOP','BEGINOP','PLUSOP','MINUSOP','TIMESOP',
// 		 'DIVOP','EQOP','LTOP','GTOP','CONSOP','CAROP','CDROP','NUMBERPOP',
// 		 'SYMBOLPOP','LISTPOP','NULLOP','PROMOPOPP','CLOSUREPOP','PRINTPOP'];
//     VALUEOP = [];
//

// var $ = function(id) { return document.getElementById(id); };

var error = function(){
    alert("error!");
};

Array.prototype.mkArrayPart = function(str1, str2) {
    var i = 0;
    var ary = new Array;

    for (; i < this.length; i++) {
	if(this[i] === str1) break;
	if(i >= this.length - 1) return new Array;
    }

    for (; i < this.length; i++){
	if(this[i] === str2){
	    ary.push(this[i]);
	    return ary;
	}
	if(i >= this.length - 1) return ary;
    }
    return ary;
};

var YhjML = (
    function() {
	// Top Level Object
	const COMMENT = 'comment';
	const BOOLEAN = 'boolean';
	const IDENTIFIER = 'identifier';
	const NUMBER = 'number';
	const STRING = 'string';
	const PROCEDURE = 'procedure';
	const REGEXP = 'regexp';

	// Node
	const PROGRAM = 'program';
	const EXPRESSION = 'expression';
	const EXPVAL = 'expval';

	var clone = function(obj) {
	    var f = function() {};
	    YhjML.prototype = obj;
	    return new f;
	};

	// Token オブジェクト スキャニング用
	var createToken = function(str, tag) {
	    var obj = {};
	    obj.str = str;
	    obj.tag = tag;
	    return obj;
	};

	// コンストラクタ関数の定義
	var createProgram = function(exp) {
	    var obj = new Object();
	    obj.type = PROGRAM;
	    obj.expression = exp;
	    return obj;
	};
	var createExpression = function(tokens){
	    var obj = new Object();
	    obj.type = EXPRESSION;
	    obj.tokens = tokens; // Array
	    return obj;
	};
	var createNumber = function(token){
	    var obj = new Object();
	    obj.type = NUMBER;
	    obj.num = parseFloat(token.str);
	    return obj;
	};
	var createIdentifier = function(token) {
	    var obj = new Object();
	    obj.type = IDENTIFIER;
	    obj.name = token.str;
	    return obj;
	};
	var createProcedure = function(param, exp, env){
	    var obj = new Object();
	    obj.tag = CLOSURE;
    	    obj.param = param;
    	    obj.exp = exp;
    	    obj.env = env;
	    return obj;
	};
	var createL_EXPVAL = function(val) {
	    var obj = new Object();
	    obj.type = EXPVAL;
	    obj.val = val;
	    return obj;
	};
	var createL_Bool = function(x) {
	    var obj = new Object();
	    obj.type = BOOLEAN;
	    obj.bool = !!(x);
	    return obj;
	};
	var L_TRUE = createL_Bool(true);
	var L_FALSE = createL_Bool(false);
	
	// 判定関数
	var isNumber = function(token) {
	    return (token.tag === NUMBER) ? true : false;
	}; // token -> bool
	var isIdentifier = function(token) {
	    return (token.tag === IDENTIFIER) ? true : false;
	};
	
	// Scaner Start
	var scaner = function(str) {
	    var tokens = [];
	    // var i = 0;

	    var temp = [];

	    var identifierSpec = new RegExp(/[A-Za-z][\w\-\?]*/g);
	    var numberSpec = new RegExp(/([\d]+)/g);
	    var commentSpec = new RegExp(/[\%].*[\n]/g);

	    var lexSpec = RegExp(/([A-Za-z][\w\-\?]*)|([\d]+)/g);

	    while ((temp = lexSpec.exec(str)) != null){
		if (temp[1] !== undefined) { // idetifier
		    tokens.push(createToken(temp[0], IDENTIFIER));
		    //i++;
		    continue;
		}
		if (temp[2] !== undefined) { // number
		    tokens.push(createToken(temp[0], NUMBER));
		    // i++;
		    continue;
		}
	    }
	    return tokens;
	};
	// Scaner End
	
	var addStr = function(str){
	    var len = arguments.length;
	    var retStr = '';
	    for(var i = 0; i < len; i++) {
		retStr = retStr + arguments[i];
	    }
	    return retStr;
	};

	// print
	var printTokens = function(tokens){
	    var outputStr = "";
	    for(var i = 0; i < tokens.length; i++){
		outputStr = outputStr + '{' + 'token : ' + tokens[i].str + ' , ';
		outputStr = outputStr + ' tag : ' + tokens[i].tag + '}\n';
	    }
	    return outputStr;
	};

	// Parser start
	var parser = function(tokens){
	    // 下降再帰パーサ
	    var tokenPoint = 0;
	    var tokensLength = tokens.length;

	    var tokenPop = function(){
		if(tokenPoint < tokens.length){
		    tokenPoint++;
		    return tokens[tokenPoint - 1];
		}else{
		    return null;
		}
	    };
	    var tokenPush = function(token){
		tokenPoint--;
		tokens[tokenPoint] = token;
	    };

	    var program = function(){
		var tree = createProgram(expression());
		// 	    while(tokenPoint < tokensLength){
		// 		tree = hoge();
		// 	    }
		return tree;
	    };

	    var expression = function(){
		var token = tokenPop();

		if (isNumber(token)) {
		    var num = createNumber(token);
		    return num;
		}
		
		if (token.str === '-') {
		    var ide = createIdentifier(token);

		    var exp1 = expression();
		    var exp2 = expression();

		    return createExpression([ide,exp1,,exp2]);
		}
		if (token.str === 'zero?') {
		    var ide = createIdentifier(token);		
		    var exp = expression();

		    return createExpression([ide, exp]);
		}
		if (token.str === 'if') {
		    var ide = createIdentifier(token);
		    var exp1 = expression();
		    tokenPop(); // then
		    var exp2 = expression();
		    tokenPop(); // else
		    var exp3 = expression();
		    
		    return createExpression([ide,exp1,exp2,exp3]);
		}

		if (token.str === 'let') {
		    var ide1 = createIdentifier(token);
		    token = tokenPop(); // symbol
		    var ide2 = createIdentifier(token);
		    var exp1 = expression();
		    tokenPop(); // 'in'
		    var exp2 = expression();

		    return createExpression([ide1,ide2,exp1,exp2]);
		}

		if(token.str === 'proc') {
		    var ide = createIdentifier(token);
		    token = tokenPop();
		    var param = createIdentifier(token);
		    var exp = expression();

		    return createExpression([ide, param, exp]);
		}

		if (isIdentifier(token)) {
		    var ide = createIdentifier(token);

		    return ide;
		}
		return null;
	    };

	    var ret = program();
	    if (ret === null) {
		error();
	    }
	    return ret;
	};

	// print
	var printTree = function(tree){
	    var outputStr = "";
	    var str = '';
	    var _print = function(tree) {
		switch (tree.type) {
		case PROGRAM :
		    return '{program: ' + _print(tree.expression) + '}';
		case EXPRESSION :
		    var str = '{expression: [';
		    for(var i=0; i < tree.tokens.length; i++){
			str = str + _print(tree.tokens[i]);
		    }
		    return str + ']}';
		case NUMBER :
		    return '{number: ' + String(tree.num) + '}';
		    // 	    case STRING :
		    // 		return '{string' + tree.str  + '}';
		case IDENTIFIER :
		    return '{identifier: ' + tree.name + '}';
		    // 	    case CLOSURE :
		    // 		return '{closure : ' + tree.form + '';
		}
		return str;
	    };
	    return _print(tree);
	};
	// Parser End

	var EMPTY_ENV = 'emptyenv';
	var EXTEND_ENV = 'extendenv';

	var emptyEnv = function(){
	    return [EMPTY_ENV];
	};

	var initEnv = function(){
	    return emptyEnv();
	};

	var extendEnv = function(sym, val, env){
	    return [EXTEND_ENV, sym, val, env];
	};

	var applyEnv = function(searchSym, env){
	    switch (env[0]){
	    case EMPTY_ENV:
		error();
		return null;
	    case EXTEND_ENV:
		return (function(){
			    var savedSym = env[1];
			    var savedVal = env[2];
			    var savedEnv = env[3];
			    
			    return (searchSym === savedSym) ? savedVal : applyEnv(savedEnv, searchSym);
			}());
	    }
	    error();
	    return null;
	};

	//     var expval2num = function(val) {
	// 	if(val.type === EXPVAL){
	// 	    return numVal(val); // numVal未実装
	// 	}else{
	// 	    error();
	// 	}
	// 	return null;
	//     };
	//     var expval2bool = function(val){
	// 	if(val.type === EXPVAL){
	// 	    return boolVal(val); // boolVal未実装
	// 	}else{
	// 	    error();
	// 	}
	// 	return null;	
	//     };

	// var applyProcedure = function(){
	    
	// };
	
	var valueOfProgram = function(programTree){
	    var ret = null;
	    var env = initEnv();
	    switch(programTree.type){
	    case PROGRAM:
		ret = valueOf(programTree.expression, env);
		break;
	    default:
		error();
	    }
	    return ret;
	};
	
	var valueOf = function(tree, env){
	    switch(tree.type){
	    case NUMBER:
		return tree;
	    case IDENTIFIER:
		return applyEnv(tree.name, env);
	    case EXPRESSION:
		switch(tree.tokens[0].name) {
		case '-':
		    return valueOf(tree.tokens[1], env) - valueOf(tree.tokens[2], env);
		case 'zero?':
		    return valueOf(tree.tokens[1], env).num === 0 ? L_TRUE : L_FALSE;
		case 'if':
		    return valueOf(tree.tokens[1], env).bool ? valueOf(tree.tokens[2], env) : valueOf(tree.tokens[3], env);
		case 'let':
		    env = extendEnv(tree.tokens[1].name, valueOf(tree.tokens[2]), env);
		    return valueOf(tree.tokens[3], env);
		    // 	    case 'proc':
		    // 		return createClosure(tree.tokens[1].name, tree.tokens[2], env);
		}
		// 	case CLOSURE:
		// 	    return (function(){
		// 			var proc = valueOf(tree.exp, env);
		// 			var param = valueOf(tree.param, env);
		
		// 			return applyProcedure();
		// 		    }());
	    }
	    return null;
	};

	var val2Str = function(val) {
	    switch(val.type){
	    case NUMBER:
		return val.num;
	    case BOOLEAN:
		return val.bool;
	    }

	};

	// 実行
	var run = function(src) {
	    var tokens = scaner(src);
	    var tree = parser(tokens);
	    var val = valueOfProgram(tree);
	    return val2Str(val);
	};

	return {
	    scaner: scaner,
	    printTokens: printTokens,
	    parser: parser,
	    printTree: printTree,
	    valueOf: valueOfProgram,
	    run: run
	};

    }());
