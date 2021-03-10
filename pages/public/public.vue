<template>
	<view  class="content">
		<!-- <uni-search-bar @confirm="search" @input="input" ></uni-search-bar> -->
		<uni-easyinput suffixIcon="search" v-model="searchValue" placeholder="请输入内容" @confirm="onSearch"	 @iconClick="onSearch()"></uni-easyinput>

		<view class="noteStyle " @longpress="longPressDeleteNote(item)" v-for="item in noteList">
			<view :style="{'color':item.color?item.color:'black'}">{{item.content}} </view>
			<view class="rightTxt">创建时间:{{item.createTime}} 更新时间:{{item.updateTime}}</view>

		</view>
		<l-modal top="40%" ref="customModal" modalTitle="修改" @onClickConfirm="confirmChangeContent">
			<template>
				<textarea fixed maxlength="-1" style="width: auto;" v-model="changeContent" class="inputBorder">
			</textarea>
			</template>
		</l-modal>
		<!-- 操作菜单 -->
		<wyb-action-sheet ref="actionSheet" :duration='200' :options="options" @itemclick="onItemClick" />
		<!-- 颜色选择插件 -->
		<picker-color :isShow="isShowPickerColor" :bottom="bottomPickerColor" @callback='getPickerColor' />
		<uni-drawer ref="showLeft" mode="left" :width="drawerWidth" @change="change($event,'showLeft')">
			<view style="margin-top: 20px;">
				<textarea maxlength="-1" style="width: auto;" v-model="inputContent" class="inputBorder">
				</textarea>
				<button @click="publish()" style="margin-top: 20px;" type="primary">发布</button>
			</view>
		</uni-drawer>
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
				searchValue: '',
				changeContent: '',
				bottomPickerColor: 0,
				isShowPickerColor: false,
				focusNoteItem: {}, //聚焦的笔记行项
				userInfo: [], //用户信息
				inputContent: '',
				noteList: []
			}
		},
		onShow() {
			// this.getUserNoteList(true);
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
			//长按复制
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
			//点击搜索
			onSearch() {
				this.getUserNoteList()
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
				
				var that = this;
				const db = uniCloud.database()
				var whereStr="isPublic==true";
				if(this.searchValue!=''){
					// whereStr="/"+this.searchValue+"/.test(content)";
					whereStr=whereStr+"&&/"+this.searchValue+"/.test(content)";
				}
				console.log("searchValue",whereStr)
				db.collection('notes').where(whereStr)
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
