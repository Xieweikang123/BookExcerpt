'use strict';

const db = uniCloud.database()

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	//event为客户端上传的参数
	const collection = db.collection('walkerTb') // 获取表'unicloud-test'的集合对象
	const res = await collection.limit(10).get() // 获取表中的10条数据，结果为json格式
	console.log('res : ', res);
	db.collection("walkerTb").add({name:"walker"});
	
	//返回数据给客户端
	return event
};
