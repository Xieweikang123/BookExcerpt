'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	const collection = db.collection('list')
	const res = await collection.add(event)
	return res
};
