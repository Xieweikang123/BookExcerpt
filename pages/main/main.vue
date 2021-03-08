<template>
	<view class="content">
		<view style="margin-top: 20px;">
			<textarea maxlength="-1" style="width: auto;" v-model="inputContent" class="inputBorder">
			</textarea>
			<button @click="publish()" style="margin-top: 20px;" type="primary">发布</button>
		</view>
		<view class="noteStyle " @click="noteFun(item)" @longpress="longPressDeleteNote(item)" v-for="item in noteList">
			<view :style="{'color':item.color?item.color:'black'}">{{item.content}} </view>
			<view class="rightTxt">创建时间:{{item.createTime}} 更新时间:{{item.updateTime}}</view>

		</view>
		<l-modal top="40%" ref="customModal" modalTitle="修改" @onClickConfirm="confirmChangeContent">
			<template>
				<textarea fixed  maxlength="-1" style="width: auto;" v-model="changeContent" class="inputBorder">
			</textarea>
			</template>
		</l-modal>
		<!-- 操作菜单 -->
		<wyb-action-sheet ref="actionSheet" :duration='200' :options="options" @itemclick="onItemClick" />
		<!-- 颜色选择插件 -->
		<picker-color :isShow="isShowPickerColor" :bottom="bottomPickerColor" @callback='getPickerColor' />
	</view>
</template>

<script>
	import lModal from '@/components/l-modal/l-modal.vue'
	import pickerColor from "@/components/helang-pickerColor/helang-pickerColor.vue"
	import SOtime from '../../js_sdk/fl-SOtime/SOtime.js'
	import wybActionSheet from '@/components/wyb-action-sheet/wyb-action-sheet.vue'

	import {
		mapState,
		mapMutations
	} from 'vuex'

	export default {
		components: {
			lModal,
			pickerColor,
			wybActionSheet
		},
		computed: mapState(['forcedLogin', 'hasLogin', 'userName']),
		data() {
			return {
				changeContent: '',
				bottomPickerColor: 0,
				isShowPickerColor: false,
				focusNoteItem: {}, //聚焦的笔记行项
				//操作菜单选项
				options: ['修改', '标记颜色', {
					label: '删除',
					color: '#a30002'
				}],
				userInfo: [], //用户信息
				inputContent: '',
				noteList: []
			}
		},
		onShow() {
			//检查登录
			this.userInfo = uni.getStorageSync('userInfo');

			//未登录的话，清除笔记列表
			if (!this.userInfo) {
				this.noteList = [];

				// #ifdef MP-WEIXIN
				//微信小程序，如果没登录，直接微信登录
				this.loginByWeixin()
				// #endif
			}
			console.log("getUserNoteList userInfo", this.userInfo)
			//如果已有笔记，不加载
			if (this.noteList.length == 0) {
				this.getUserNoteList(true);
			}
		},
		// 下拉刷新
		onPullDownRefresh() {
			console.log('refresh');
			this.getUserNoteList(true);
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 500);
		},

		methods: {
			...mapMutations(['login']),
			//内容合法性校验
			// async validatContent(content){
			// 	var access_token=await this.getAccessToken();
			// 	var url= 'https://api.weixin.qq.com/wxa/msg_sec_check?access_token='+access_token;
			// 	var postData={
			// 		content:content
			// 	}
			// 	return new Promise(resolve=>{
			// 		uni.request({
			// 			url:url,
			// 			data:postData,
			// 			method:'POST',
			// 			success(res) {
			// 				console.log("msg_sec_check",res)
			// 				resolve(res.data.errmsg=="ok");
			// 			}
			// 		})
			// 	})
			// },
			//确定修改内容
			confirmChangeContent() {
				var that = this;
				console.log("focusNoteItem", this.focusNoteItem)

				const db = uniCloud.database();
				let collection = db.collection("notes")
				collection.where({
						_id: that.focusNoteItem._id
					})
					.update({
						content: that.changeContent,
						updateTime: (new Date()).valueOf()
					}).then(res => {
						// 更新完毕
						that.getUserNoteList();
					});
			},
			//操作菜单回调
			onItemClick(e) {
				var that = this;
				console.log("onItemClick e", e)
				// let index = e.index
				// let label = e.label

				switch (e.label) {
					case '修改':
						this.changeContent = this.focusNoteItem.content;
						this.$refs.customModal.showModal() // 显示
						break;
					case '标记颜色':
						that.isShowPickerColor = true;
						break;
					case '删除':
						uni.showModal({
							title: '确定删除?',
							content: that.focusNoteItem.content,
							success: function(res) {
								if (res.confirm) {
									console.log('用户点击确定');
									const db = uniCloud.database();
									db.collection("notes").doc(that.focusNoteItem._id).remove()
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
								}
							}
						});

						break;
				}
			},

			loginByWeixin() {
				var that = this;
				this.getWeixinCode().then((code) => {
					return uniCloud.callFunction({
						name: 'user-center',
						data: {
							action: 'loginByWeixin',
							params: {
								code,
							}
						}
					})
				}).then((res) => {

					console.log("login weixin ", res);
					that.userInfo = res.result.userInfo;
					uni.setStorageSync('userInfo', that.userInfo);
					that.$common.userManager.writeLoginLog('login');
					that.login();

					that.getUserNoteList(true);

					if (res.result.code === 0) {
						uni.setStorageSync('uni_id_token', res.result.token)
						uni.setStorageSync('uni_id_token_expired', res.result.tokenExpired)
					}

				}).catch((e) => {
					console.error(e)
					uni.showModal({
						showCancel: false,
						content: '微信登录失败，请稍后再试'
					})
				})
			},
			getWeixinCode() {
				return new Promise((resolve, reject) => {
					// #ifdef APP-PLUS
					weixinAuthService.authorize(function(res) {
						resolve(res.code)
					}, function(err) {
						console.log(err)
						reject(new Error('微信登录失败'))
					});
					// #endif
					// #ifdef MP-WEIXIN
					uni.login({
						provider: 'weixin',
						success(res) {
							resolve(res.code)
						},
						fail(err) {
							reject(new Error('微信登录失败'))
						}
					})
					// #endif
				})
			},
			/* 获取颜色选择回调 */
			getPickerColor(color) {
				var that = this;
				/* 隐藏弹窗 */
				this.isShowPickerColor = false;
				/* 判断颜色值是否有效 */
				if (color) {
					// this.buttonColor=color;
					console.log('选择的颜色值是：' + color);
					console.log("focusNoteItem", this.focusNoteItem)

					const db = uniCloud.database();
					let collection = db.collection("notes")
					collection.where({
							_id: that.focusNoteItem._id
						})
						.update({
							color: color,
						}).then(res => {
							// 更新完毕
							that.getUserNoteList();
						});

				}
			},

			//点击了一条笔记
			noteFun(item) {
				this.focusNoteItem = item;
				this.$refs.actionSheet.showActionSheet(); // 显示
			},
			//长按删除
			longPressDeleteNote(item) {
				var that = this;
				console.log("longPressDeleteNote", item);
				uni.setClipboardData({
					data: item.content,
					success() {
						uni.showToast({
							title: '复制成功'
						});
					}
				})

			},
			//保存笔记
			async publish() {
				console.log("pub", this.inputContent);
				var that = this;
				
				//验证
				if (this.inputContent.trim() == "") {
					uni.showToast({
						title: '请输入内容',
						icon: "none"
					})
					return;
				}
				// var isSuccess=await this.validatContent(this.inputContent);
				// if(!isSuccess){
				// 	uni.showToast({
				// 		title: '输入内容不合法',
				// 		icon: "none"
				// 	})
				// 	return;
				// }
				//必须为已登录
				if (!this.userInfo || this.userInfo._id.length == 0) {
					uni.showToast({
						title: '请先登录',
						icon: "none"
					})
					return;
				}

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
						// this.appendNote();
						this.getUserNoteList(false);
					})
					.catch((err) => {
						uni.showModal({
							content: err.message || '新增失败',
							showCancel: false
						})
					})

			},
			//获取用户笔记
			getUserNoteList(isEmptyNoteList = false) {
				uni.showLoading({
					title: '加载用户笔记中'
				});

				if (isEmptyNoteList) {
					//先清空笔记列表
					this.noteList = [];
				}

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
					})
					.orderBy('updateTime desc, createTime desc')
					.get().then(res => {
						console.log("res", res)
						that.noteList = res.result.data;
						for (var i = 0; i < that.noteList.length; i++) {
							that.noteList[i].createTime = SOtime.time1(that.noteList[i].createTime);
							that.noteList[i].updateTime = SOtime.time1(that.noteList[i].updateTime);
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
			...mapMutations(['login'])
		}

	}
</script>

<style>
	.rightTxt {
		text-align: end;
		color: gray;
		font-size: 12px;
		margin-top: 9px;
	}

	.noteStyle {
		border-bottom: 1px dashed #747474;
		padding: 14px 5px;
	}

	.inputBorder {
		border: 1px solid #9f9f9f;
		padding: 6px 0;
		border-radius: 5px;
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
