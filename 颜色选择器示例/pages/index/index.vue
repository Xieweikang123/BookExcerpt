<template>
	<view>
		<!-- 颜色选择插件 -->
		<view>
			<button :style="{'backgroundColor':buttonColor}" @tap="showPickerColorPop">点我修改颜色</button>
			<picker-color :isShow="showPickerColor" :bottom="bottomPickerColor"  @callback='getPickerColor' />
		</view>
	</view>
</template>

<script>
	import pickerColor from "@/components/helang-pickerColor/helang-pickerColor.vue"
	export default {
		components: {
		    "picker-color":pickerColor,
		},
		data() {
			return {
				buttonColor:"#0099FF",
				showPickerColor:false,
				bottomPickerColor:0
			}
		},
		methods: {
			/* 显示获取颜色选择弹窗 */
			showPickerColorPop(){
				this.showPickerColor=true;
			},
			/* 获取颜色选择回调 */
			getPickerColor(color){
				/* 隐藏弹窗 */
				this.showPickerColor=false;
				/* 判断颜色值是否有效 */
				if(color){
					this.buttonColor=color;
					console.log('选择的颜色值是：'+color);
				}
			}
		}
	}
</script>

<style>
	button{
		margin: 50upx;
		color:#fff;
	}
	button:after{
		display: none;
	}
	.copy{
		text-align: center;
		font-size: 28upx;
		color: #999;
		line-height: 48upx;
	}
</style>
