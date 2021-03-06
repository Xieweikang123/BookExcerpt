var userManager={
	
	login(){
		
	},
	
	//写入登录日志
	writeLoginLog:function(loginType) {
		var that=this;
		var userInfo = uni.getStorageSync('userInfo');
		console.log("write log userinfo",userInfo)
		const db = uniCloud.database();
		db.collection('uni-id-log').add({
				user_id: userInfo._id?userInfo._id:userInfo,
				type: loginType,
				state:1,
				ip:userInfo.last_login_ip?userInfo.last_login_ip:userInfo.register_ip
			})
			.then(res => {
				console.log("write log success",res);
			})
			.catch((err) => {
				console.log("write log fail",err);
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