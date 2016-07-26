/**
 * Created by timtian on 2016/5/12.
 */


var yy = {};

yy.paramList = [];

yy.clear = function(){
    yy.paramList = [];
};

yy.Column = function(options){
    this.value = options.value;
    if(options.as)
        this.as = options.as;
    else if(this.value && this.value.length)
        this.as = this.value[this.value.length - 1];
};


yy.ParamValue = function(options){
    this.value = options.value;
};

yy.Op = function(options){
    this.left = options.left;
    this.op = options.op;
    this.right = options.right;
};


yy.Value = function(options){
    this.value = options.value;
};

yy.FunctionValue = function(options){
    this.name = options.name;
    this.params = options.params;
};

yy.OrderValue = function(options){
    this.order = options.order;
    this.column = options.column;
};

//TODO:support join
//yy.Table = function(options){
//    console.log(options);
//};
//yy.Join = function(options){
//    this.source = options.source;
//    this.cond = options.cond;
//    this.type = options.type;
//};


module.exports = yy;
