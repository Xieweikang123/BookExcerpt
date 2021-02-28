var userManager={
	
	
	//写入登录日志
	writeLoginLog:function(loginType) {
		var that=this;
		var userInfo = uni.getStorageSync('userInfo');
		
		const db = uniCloud.database();
		db.collection('uni-id-log').add({
				user_id: userInfo._id,
				type: loginType,
				state:1,
				ip:userInfo.last_login_ip
			})
			.then(res => {
				console.log("write log success",res);
			})
			.catch((err) => {
				uni.showModal({
					content: err.message || '写入登录日志失败',
					showCancel: false
				})
			})
	}
}


module.exports = {
	userManager
}