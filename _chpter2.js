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

var f = function() {
    // Top Level Object
    const COMMENT = 'comment';
    const IDENTIFIER = 'indentifier';
    const NUMBER = 'number';
    const STRING = 'string';
    const CLOSURE = 'closure';
    const REGEXP = 'regexp';

    // Node
    const PROGRAM = 'program';
    const EXPRESSION = 'expression';

    var clone = function(obj) {
	var f = function() {};
	f.prototype = obj;
	return new f;
    };

    // Token オブジェクト スキャニング用
    var Token = function(str, tag) {
	this.str = str;
	this.tag = tag;
    };

    // Node オブジェクト
    //     var Node = function(val, type) {
    //         this.val = val;
    //         this.type = type;
    //     };

    // コンストラクタ関数の定義
    var createToken = function(str, tag){
	return new Token(str, tag);
    };
    //  var createNode = function(val, type){
    // 	return new Node(val,type);
    //  };
    var createProgram = function(exp) {
	return new L_Program(exp);
    };
    var createExpression = function(tokens){
	return new L_Expression(tokens);
    };
    var createNumber = function(str){
	return new L_Number(str);
    };
    var createIdentifier = function(str) {
	return new L_Identifier(str);
    };
    //     var createString = function(str) {
    // 	return new L_String(str);
    //     };
    //     var createClosure = function(str){
    // 	return new L_Closure(str);
    //     };

    var L_Program = function(exp) {
	this.type = PROGRAM;
	this.expression = exp;
    };
    var L_Expression = function(tokens) {
	this.type = EXPRESSION;
	this.tokens = tokens; // Array
    };

    // data structure
    var L_Identifier = function(token) {
	this.type = IDENTIFIER;
	this.name = token.str;
    };
    var L_Number = function(token) {
	this.type = NUMBER;
	this.num = parseFloat(token.str);
    };
    //  var L_String = function(str) {
    // 	this.tag = STRING;
    // 	this.str = new String(str);
    //     };
    //  var L_Rx = function(str) {
    // 	this.tag = REGEXP;
    // 	this.reg = new RegExp(str);
    //     };
    //     var L_Closure = function(form, args, env) {
    // 	this.tag = CLOSURE;
    // 	this.form = form;
    // 	this.args = args;
    // 	this.env = env;
    //     };


    // 判定関数
    var isNumber = function(token) {
	return (token.tag === NUMBER) ? true : false;
    }; // token -> bool
    var isIdentifier = function(token) {
	return (token.tag === IDENTIFIER) ? true : false;
    };
    
    // 実行
    var run = function(src) {
	var tokens = scaner(src);
	var tree = parser(tokens);
	return ret;
    };

    
    // Scaner Start
    var scaner = function(str) {
	var tokens = [];
	// 	var i = 0;

	var temp = [];
	var lexSpec = /([A-Za-z][\w\-\?]+)|([\d]+)/g;

	while ((temp = lexSpec.exec(str)) != null) {
	    if (temp[1] !== undefined) { // idetifier
		tokens.push(new Token(temp[0], IDENTIFIER));
		//i++;
		continue;
	    }
	    if (temp[2] !== undefined) { // number
		tokens.push(new Token(temp[0], NUMBER));
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
    var parser = function(tokens) {
	// 下降再帰パーサ(右再帰)
	var tokenPoint = 0;
	var program = function(tokenPoint){
	    var tree = createProgram(expression(tokenPoint));
	    // 	    while(tokenPoint < tokensLength){
	    // 		tree = hoge();
	    // 	    }
	    return tree;
	};

	var expression = function(tokenPoint){

	    if (isNumber(tokens[tokenPoint])) {
		var num = createNumber(tokens[tokenPoint]);
		tokenPoint++;

		return num;
	    }
	    if (tokens[tokenPoint].str === '-') {
		var ide = createIdentifier(tokens[tokenPoint]);
		tokenPoint = tokenPoint + 1;
		var exp1 = expression(tokenPoint);
		tokenPoint = tokenPoint + 1;
		var exp2 = expression(tokenPoint);
		tokenPoint = tokenPoint + 1;

		return createExpression([ide,exp1,,exp2]);
	    }
	    if (tokens[tokenPoint].str === 'zero?') {
		var ide = createIdentifier(tokens[tokenPoint]);
		tokenPoint = tokenPoint + 1;
		var exp = expression(tokenPoint);
		tokenPoint = tokenPoint + 1;

		return createExpression([ide, exp]);
	    }
	    if (tokens[tokenPoint].str === 'if') {
		var ide = createIdentifier(tokens[tokenPoint]);
		var exp1 = expression(tokenPoint + 1);
		var exp2 = expression(tokenPoint + 3);
		var exp3 = expression(tokenPoint + 5);
		
		return createExpression([ide,exp1,exp2,exp3]);
	    }
	    if (tokens[tokenPoint].str === 'let') {
		var ide1 = createIdentifier(tokens[tokenPoint]);
		var ide2 = createIdentifier(tokens[tokenPoint + 1]);
		var exp1 = expression(tokenPoint + 3);
		var exp2 = expression(tokenPoint + 5);
		
		return createExpression([ide1,ide2,exp1,exp2]);
	    }

	    if (isIdentifier(tokens[tokenPoint])) {
		var ide = createIdentifier(tokens[tokenPoint]);
		tokenPoint++;

		return ide;
	    }
	    return null;
	};

	var tokensLength = tokens.length;
	var ret = program(tokenPoint);

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
		var str = '{expression: ';
		for(var i=0; i < tree.tokens.length; i++){
		    str = str + _print(tree.tokens[i]);
		}
		return str + '}';
	    case NUMBER :
		return '{number: ' + String(tree.num) + '}';
// 	    case STRING :
// 		return '"' + tree.str  + '"';
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
    return {
	scaner: scaner,
	printTokens: printTokens,
	parser: parser,
	printTree: printTree
    };

}();

