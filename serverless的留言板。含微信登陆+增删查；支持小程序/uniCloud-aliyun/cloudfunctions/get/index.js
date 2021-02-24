'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	const collection = db.collection('list')
	//const res = await collection.limit(10).where().get()
	const res = await collection.orderBy("_id", "desc").get()
	return res
};
