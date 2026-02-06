# 定时更新LOF基金数据云函数

## 功能说明

该云函数用于定时更新 `funds` 集合中的LOF基金数据，包括：
- 现价
- 昨收价
- 涨跌幅
- 成交量
- 成交额
- 净值
- 溢价率
- 申购/赎回状态

## 定时触发配置

当前配置为每天下午16:00（北京时间）触发一次。

### Cron表达式说明

```
0 0 16 * * * *
```

格式：`秒 分 时 日 月 星期`

- `0` - 第0秒
- `0` - 第0分
- `16` - 16点
- `*` - 每日
- `*` - 每月
- `*` - 每星期
- `*` - 每年

### 修改触发时间

如需修改触发时间，编辑 `config.json` 文件中的 `config` 字段。

常见配置示例：

| Cron表达式 | 说明 |
|-----------|------|
| `0 0 16 * * * *` | 每天16:00 |
| `0 0 */2 * * * *` | 每2小时 |
| `0 0 9,16 * * * *` | 每天9:00和16:00 |
| `0 0 16 * * 1-5` | 工作日16:00 |

## 部署步骤

1. 在微信开发者工具中打开云函数目录
2. 右键点击 `updateFundsData` 文件夹
3. 选择 "上传并部署：云端安装依赖"

## 数据源配置

当前使用模拟数据，需要替换为真实的数据源API。

### 替换数据源

编辑 `index.js` 文件中的 `fetchLOFData()` 函数：

```javascript
async function fetchLOFData() {
  // 替换为真实的API调用
  const response = await cloud.callFunction({
    name: 'fetchExternalData', // 如果需要使用其他云函数
    data: {
      url: 'https://api.example.com/lof-data'
    }
  })
  
  return response.result.data
}
```

或直接使用HTTP请求：

```javascript
async function fetchLOFData() {
  const request = require('request-promise')
  
  const options = {
    uri: 'https://api.example.com/lof-data',
    json: true
  }
  
  return await request(options)
}
```

## 云函数日志

云函数执行日志可在微信开发者工具的云开发控制台查看：

1. 打开云开发控制台
2. 选择 "云函数"
3. 点击 "updateFundsData"
4. 查看 "日志" 标签

## 注意事项

1. 确保云函数有足够的权限读写 `funds` 集合
2. 定时任务触发后，实际执行可能有几分钟延迟
3. 数据源API需要稳定可靠，避免频繁失败
4. 建议添加错误监控和告警机制