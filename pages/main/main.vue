<template>
	<view class="content">
		<!-- <view v-if="hasLogin" class="hello">
				<view class="title">
					您好 {{userName}}，您已成功登录。
				</view>
				<view class="ul">
					<view>这是 uni-app 带登录模板的示例App首页。</view>
					<view>在 “我的” 中点击 “退出” 可以 “注销当前账户”</view>
				</view>
			</view>
			<view v-if="!hasLogin" class="hello">
				<view class="title">
					您好 游客。
				</view>
				<view class="ul">
					<view>这是 uni-app 带登录模板的示例App首页。</view>
					<view>在 “我的” 中点击 “登录” 可以 “登录您的账户”</view>
				</view>
			</view> -->
		<view class="noteStyle" @longpress="longPressDeleteNote(item._id)" v-for="item in noteList">
			{{item.content}} {{item.createTime}}
		</view>
		<view style="margin-top: 20px;">
			<input v-model="inputContent" class="inputBorder" />
			<button @click="publish()" style="margin-top: 20px;" type="primary">发布</button>
		</view>
	</view>
</template>

<script>
	import SOtime from '../../js_sdk/fl-SOtime/SOtime.js'

	import {
		mapState,
		mapMutations
	} from 'vuex'

	export default {
		computed: mapState(['forcedLogin', 'hasLogin', 'userName']),
		data() {
			return {
				userInfo: [], //用户信息
				inputContent: '',
				noteList: []
			}
		},
		onShow() {
			//检查登录
			this.checkLogin();

			this.userInfo = uni.getStorageSync('userInfo');
			console.log("getUserNoteList userInfo", this.userInfo)
			//如果已有笔记，不加载
			if(this.noteList.length==0){
				this.getUserNoteList();
			}
		},
		onLoad() {

		},
		methods: {
			//检查是否登录
			checkLogin() {
				var that = this;
				const loginType = uni.getStorageSync('login_type')
				if (loginType === 'local') {
					this.login(uni.getStorageSync('username'));
					return
				}
				let uniIdToken = uni.getStorageSync('uniIdToken')
				if (uniIdToken) {
					this.login(uni.getStorageSync('username'))
					uniCloud.callFunction({
						name: 'user-center',
						data: {
							action: 'checkToken',
						},
						success: (e) => {
							console.log("e", e);

							if (e.result.code > 0) {
								//token过期或token不合法，重新登录

								//请先登录
								uni.showToast({
									title: '请先登录',
									icon:'none'
								});
								
								setTimeout(function () {
								    uni.navigateTo({
								    	url: '../login/login'
								    });
								}, 2000);

								// if (this.forcedLogin) {
								// 	uni.reLaunch({
								// 		url: '../login/login'
								// 	});
								// } else {
								// 	uni.navigateTo({
								// 		url: '../login/login'
								// 	});
								// }
							}
						},
						fail(e) {
							uni.showModal({
								content: JSON.stringify(e),
								showCancel: false
							})
						}
					})
				} else {
					this.guideToLogin()
				}
			},
			//长按删除
			longPressDeleteNote(id) {
				var that = this;
				console.log("longPressDeleteNote", id);
				uni.showModal({
					title: '提示',
					content: '确定删除?',
					success: function(res) {
						if (res.confirm) {
							console.log('用户点击确定');
							const db = uniCloud.database();
							db.collection("notes").doc(id).remove()
								.then(res => {
									uni.showToast({
										title: '删除成功'
									})
									//重新获取笔记
									that.getUserNoteList();
								})
								.catch((err) => {
									uni.showModal({
										content: err.message || '删除失败',
										showCancel: false
									})
								})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			//保存笔记
			publish() {
				console.log("pub", this.inputContent);
				var that = this;
				const db = uniCloud.database();

				db.collection('notes').add({
						userId: that.userInfo._id,
						content: this.inputContent
					})
					.then(res => {
						uni.showToast({
							title: '新增成功'
						})
						//清空输入框
						that.inputContent = '';
						//重新获取笔记
						this.appendNote();
						// this.getUserNoteList();
					})
					.catch((err) => {
						uni.showModal({
							content: err.message || '新增失败',
							showCancel: false
						})
					})

			},
			//追加笔记
			appendNote(){
				var that=this;
				uni.showLoading({
					title: '添加中'
				});
				const db = uniCloud.database()
				db.collection('notes').where({
					userId: this.userInfo._id // 查询当前用户的数据。虽然代码编写在客户端，但环境变量会在云端运算
				}).get().then(res => {
					console.log("res", res)
					that.noteList = res.result.data;
					for (var i = 0; i < that.noteList.length; i++) {
						that.noteList[i].createTime = SOtime.time1(that.noteList[i].createTime);
					}
					uni.showToast({
						title: '添加成功'
					})
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					//隐藏加载框
					uni.hideLoading();
					
				});
			},
			//获取用户笔记
			getUserNoteList() {
				uni.showLoading({
					title: '加载用户笔记中'
				});
				//先清空笔记列表
				this.noteList = [];

				//未登录，终止获取
				if (!this.userInfo) {
					//隐藏加载框
					uni.hideLoading();
					return;
				}
				var that = this;
				const db = uniCloud.database()
				db.collection('notes').where({
					userId: this.userInfo._id // 查询当前用户的数据。虽然代码编写在客户端，但环境变量会在云端运算
				}).get().then(res => {
					console.log("res", res)
					that.noteList = res.result.data;
					for (var i = 0; i < that.noteList.length; i++) {
						that.noteList[i].createTime = SOtime.time1(that.noteList[i].createTime);
					}
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					//隐藏加载框
					uni.hideLoading();
				});
			},
			...mapMutations(['login']),
			guideToLogin() {
				uni.showModal({
					title: '未登录',
					content: '您未登录，需要登录后才能继续',
					/**
					 * 如果需要强制登录，不显示取消按钮
					 */
					showCancel: !this.forcedLogin,
					success: (res) => {
						if (res.confirm) {
							/**
							 * 如果需要强制登录，使用reLaunch方式
							 */
							if (this.forcedLogin) {
								uni.reLaunch({
									url: '../login/login'
								});
							} else {
								uni.navigateTo({
									url: '../login/login'
								});
							}
						}
					}
				});
			}
		}

	}
</script>

<style>
	.noteStyle{
		    border-bottom: 1px solid black;
			    padding: 14px 5px;
	}
	.inputBorder {
		border: 1px solid black;
		padding: 2px 0;
	}

	.hello {
		display: flex;
		flex: 1;
		flex-direction: column;
	}

	.title {
		color: #8f8f94;
		margin-top: 25px;
	}

	.ul {
		font-size: 15px;
		color: #8f8f94;
		margin-top: 25px;
	}

	.ul>view {
		line-height: 25px;
	}
</style>
