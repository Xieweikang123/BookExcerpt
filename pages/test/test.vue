<template>
	<view>
		
	</view>
</template>

<script>
	
	export default {
		data() {
			return {
				
			}
		},
		onLoad() {
			// 获取db引用
			const db = uniCloud.database() //代码块为cdb
			  
			  const collection = db.collection('walkertb') // 获取表'unicloud-test'的集合对象
			  const res =  collection.limit(10).get().then(res=>{
				  console.log('res : ', res);
				  
			  }) // 获取表中的10条数据，结果为json格式
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
