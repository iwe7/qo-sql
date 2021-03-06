/**
 * Created by timtian on 2016/7/12.
 */
var testData = require('./test_data.js').arrayData;
var _ = require('lodash');



    //"id": 1,
    //"name": "Finn Obrien",
    //"email": "Sed.eu@sedtortor.co.uk",
    //"count": 103,
    //"type": "A",
    //"city": "Iqaluit",
    //"country": "Canada",
    //"birthday": "497520060"

var testCase = {};

testCase.formatter = {};
testCase.formatter.formatMoney = function(number){
    return number.toFixed(2).replace(/./g, function(c, i, a) {
        return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
    });
};

testCase.customReduce = function(empty, result, value, key){
    var ids = [];
    value.forEach(function (item) {
        ids.push(item.id);
    });

    return ids;
};

testCase.demo = function(type, id, size){
    return `sql: select id, name, ${type} from ${testData} where id>${id} order by id desc limit 10, ${size}`;
};


testCase.checkPrefix = function(str){
    return `hi:this is a test ${str}!`;
}

testCase.selectById = function(id){
    return `sql:select * from ${testData} where id=${id}`;
};

testCase.selectByNotEqId = function(excludeId, minId){
    return `sql:select * from ${testData} where id!=${excludeId} and id > ${minId}`;
};

testCase.selectByIdAndName = function(id,name){
    return `sql:select * from ${testData} where id=${id} and name=${name}`;
};

testCase.selectByIdOrCount = function(id, mincount){
    return `sql:select * from ${testData} where id=${id} or count>${mincount}`;
};

testCase.selectByBwId = function(minid, maxid){
    return `sql:select * from ${testData} where id>=${minid} and id<=${maxid}`;
};

testCase.selectByBwIdWithOrder = function(minid, maxid, start, count){
    return `sql:select * from ${testData} where id>=${minid} and id<=${maxid} order by type, count desc, id asc limit ${start}, ${count}`;
};

testCase.selectByMaxIdWithOrderType = function(maxid, ordername, ordertype){
    return `sql:select * from ${testData} where id<=${maxid} order by ${ordername} ${ordertype}, id asc`;
};

testCase.selectByMaxWithLimit = function(maxid){
    return `sql:select * from ${testData} where id<=${maxid} order by type, count desc, id asc limit 2`;
};

testCase.selectByMaxWithLimit2 = function(maxid){
    return `sql:select * from ${testData} where id<=${maxid} order by type, count desc, id asc limit 2, -1`;
}

testCase.selectByInCountryListAndNotInTypeList = function(ctyList, typeList){
    return `sql:select * from ${testData} where country IN ${ctyList} AND type NOT IN ${typeList}`;
};

testCase.selectByInStaticTypeList = function(){
    return `sql:select * from ${testData} where type IN ('A', 'C')`;
}

testCase.selectFieldWithExpressionByType = function(type){
    return `sql:select id as ID, (id + 1) as ID2, (id / 3) as ID3, (city + '@' + country)  as address, testCase.formatter.formatMoney(count) from ${testData} where type=${type}`;
};

testCase.selectAggByTypeAndCountry = function(minId){
    return `sql:select type, country, min(count) as min, max(count) as max, count(*) as total, sum(count) as sum from ${testData} WHERE id >${minId} group by type, country order by country, type`;
};


testCase.selectAvgAndCustomReduce = function(){
    return `sql:select type, testCase.customReduce(id) as ids, avg(count) as avg, count(*) as count from ${testData} WHERE id <= 4 group by type order by type`;

};


module.exports = testCase;