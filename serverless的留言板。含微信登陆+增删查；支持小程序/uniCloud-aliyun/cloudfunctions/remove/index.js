'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	console.log(event);
	db.collection('list').where({
		_id: event._id
	}).remove().then(function(res) {
		if (res.deleted === 1) {
		  return {
		    status: 0,
		    msg: '成功删除unicloud-test内第一条数据'
		  }
		} else {
		  return {
		    status: -2,
		    msg: '删除数据失败'
		  }
		}
	})
};