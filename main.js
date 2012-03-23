jQuery(
    function($, undefined) {

	// Terminalから読み込んだ文字列をスキャニングするScaner
	var scaner = function(str) {
	    // Token オブジェクト スキャニング用
	    var createToken = function(str, tag) {
		var obj = {};
		obj.str = str;
		obj.tag = tag;
		return obj;
	    };
	    var tokens = [];

	    var temp = [];

	    var identifierSpec = new RegExp(/[A-Za-z][\w\-\?]*/g);
	    var numberSpec = new RegExp(/([\d]+)/g);
	    var commentSpec = new RegExp(/[\%].*[\n]/g);
	    var lexSpec = RegExp(/([A-Za-z][\w\-\?]*)|([\d]+)/g);

	    while ((temp = lexSpec.exec(str)) != null){
		if (temp[1] !== undefined) { // idetifier
		    tokens.push(createToken(temp[0], 'id'));
		    continue;
		}
		if (temp[2] !== undefined) { // number
		    tokens.push(createToken(temp[0], 'num'));
		    continue;
		}
	    }
	    return tokens;
	};

	$('#term_demo').terminal(
	    function(command, term) {
		// alert("command: "+command.toSource());
		// alert("term: "+term.set_prompt("にゃあ"));//.toSource());
		// var result = window.eval(command);
		// if (result != undefined) {
		//     term.echo(String(result));
		// }

		var tokens = scaner(command);
		if (tokens.length != 0) {
		    switch (tokens[0].str) {
		    case 'test':
			var result = window.eval('"let x = 1 in if zero?(x) then 123 else 789"');
			if (result != undefined) {
			    term.echo(String(result));
			}
			// alert('にゃあ');
			result = window.eval('a = YhjML.scaner("let x = 1 in if zero?(x) then 123 else 789")');
			if (result != undefined) {
			    term.echo(String(result));
			}
			result = window.eval('b = YhjML.parser(a)');
			if (result != undefined) {
			    term.echo(String(result));
			}
			result = window.eval('YhjML.printTokens(a)');
			if (result != undefined) {
			    term.echo(String(result));
			}
			result = window.eval('YhjML.printTree(b)');
			if (result != undefined) {
			    term.echo(String(result));
			}
			result = window.eval('YhjML.run("let x = 1 in if zero?(x) then x else 789")');
			if (result != undefined) {
			    term.echo(String(result));
			}
			break;
		    default:
			var result = window.eval(command);
			if (result != undefined) {
			    term.echo(String(result));
			}
			break;
		    }
		}
	    }, {
		greetings: 'EOPL Test',
		name: 'js_demo',
		height: 400,
		prompt: 'js>'});
    });
