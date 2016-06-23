/**
 * Created by timtian on 2016/5/12.
 */


var _ = require('lodash');
var yy = require('./parser/yy');
var jsbeautify = require('js-beautify');

var compiler = {};

compiler.mode = {
    inline:"INLINE",
    lib:"LIB",
    lodash:"LODASH"
};



compiler.exec = function (ast) {

    var code = [];
    code.push('var source = params[' + ast.from.from[0].index + '];');
    code.push('var keys = Object.keys(source);');
    code.push('var res = {};');

    if (ast.order) {
        code.push('var orderList = [];');
    }

    code.push('for(var i = 0; i < keys.length; ++i){');
    code.push('var key = keys[i];');
    code.push('var item = source[key];');

    if (ast.where) {
        code.push('//set where expression here');
        code.push('if (' + compiler.parseOp(ast.where) + ') {');

        if (ast.order) {
            code.push('//set order expression');
            code.push('orderList.push(key)');
        }else if(ast.limit){
            code.push('if(i < ' + ast.limit[0].value + '){');
            code.push('    continue;');
            code.push('}');
            code.push('else (i > ' + ast.limit[0].value + ast.limit[1].value + '){');
            code.push('    break;');
            code.push('}');
        }

        code.push('res[key] = ');
        code = code.concat(compiler.parseReturnColumns(ast.columns));

        code.push('}');
    }

    code.push('}');

    if (ast.order) {
        code.push('function ___sortByResname(a,b,name){');
        code.push('    if(a[name] < b[name])');
        code.push('        return -1;');
        code.push('    else if(a[name] != b[name])');
        code.push('        return 1;');
        code.push('    return 0;');
        code.push('}');

        //ceate code
        //var sortList = [['id', 'ASC'], ['name', 'DESC']]
        var sortListCode = ['['];
        ast.order.forEach(function(x){
            if(sortListCode.length > 1)
                sortListCode.push(',');
            sortListCode.push("['" + compiler.safeStr(x.column.as) + "',");
            sortListCode.push("'" + x.order + "']");
        });
        sortListCode.push('];');

        code.push('var sortList = ');
        code = code.concat(sortListCode);

        code.push('orderList = orderList.sort(function(a, b){');
        code.push('    for(var i = 0 ; i < sortList.length ; i ++){');
        code.push('        var sortRet = ___sortByResname(res[a], res[b], sortList[i][0]);');
        code.push('        if(sortRet != 0){');
        code.push('            return sortList[i][1] == "ASC" ? sortRet :-sortRet;');
        code.push('        }');
        code.push('    }');
        code.push('});');
        code.push('');
        code.push('var orderRes = {};');

        if(ast.limit){
            code.push('orderList = ');
            if(ast.limit[1] == -1){
                code.push('orderList.slice(' + ast.limit[0].value + ');');
            }else{
                code.push('orderList.slice(' + ast.limit[0].value + ',' + (parseInt(ast.limit[0].value) +  parseInt(ast.limit[1].value)) +');');
            }
        }

        code.push('orderList.forEach(x=>{');
        code.push('    orderRes[x] = res[x]');
        code.push('});');
        code.push('res = orderRes');
    }




    code.push('return res;');

    //set order
    //orderList.sort((x, y)=> {
    //    return x.value == y.value ? 0 : (x.value > y.value ? -1 : 1);
    //});

    //set top
    //orderList = orderList.slice(0, 1);

    //var output = {};
    //orderList.forEach(x=> {
    //    output[x.key] = res[x.key];
    //});


    code.unshift('function (params){');
    code.push('}');

    return jsbeautify.js_beautify(code.join('\n'));
};

compiler.parseOp = function (op) {

    var code = ['('];
    code = code.concat(compiler.parseLeftOrRight(op.left));

    if (op.op == "AND")
        code.push('&&');
    else if (op.op == "OR")
        code.push('||');
    else
        code.push(op.op);

    code = code.concat(compiler.parseLeftOrRight(op.right));
    code.push(')');

    return code.join(' ');
};

compiler.parseLeftOrRight = function (lr) {
    var code = [];
    if (lr instanceof yy.Op) {
        code.push(compiler.parseOp(lr));
    } else if (lr instanceof yy.Column) {
        code.push('item' + compiler.parseColumn(lr))
    } else if (lr instanceof yy.Value) {
        if (typeof lr.value === 'string') {
            code.push("'" + compiler.safeStr(lr.value) + "'");
        } else {
            code.push(lr.value);
        }
    } else if (lr instanceof yy.ParamValue) {
        code.push('params[' + lr.index + ']');
    }
    return code;
};

compiler.parseColumn = function (col) {
    var code = [];
    col.value.forEach(function (x) {
        code.push("['" + compiler.safeStr(x) + "']")
    });
    return code.join('');
};

compiler.safeStr = function (name) {
    return name.replace(/'/gi, "\\\'")
};

compiler.parseReturnColumns = function (columns) {

    var code = ['{'];
    for (var i = 0; i < columns.length; i++) {

        var col = columns[i];

        if (i > 0)
            code.push(',');

        code.push("'" + compiler.safeStr(col.as) + "' : ");
        if (col instanceof yy.Column) {
            if (col.value[0] === '*') {
                code.pop();
                code.push('...item')
            } else {
                code.push('item' + compiler.parseColumn(col));
            }
        } else if (col instanceof yy.Op) {
            code.push(compiler.parseOp(col));
        }
    }
    code.push('}');

    return code;
};

/**
 * @param from
 */
compiler.parseFrom = function (from) {

};


module.exports = compiler;