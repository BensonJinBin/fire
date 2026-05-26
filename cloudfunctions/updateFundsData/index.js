// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化跨账号云开发
const c1 = new cloud.Cloud({
  // 资源方 AppID
  resourceAppid: 'wx4c4b54bc609bd79e',
  // 资源方环境 ID
  resourceEnv: 'toastmasters-9gbogzjz89b0e835',
})

// 云函数入口函数
exports.main = async (event, context) => {
  const startTime = Date.now()
  console.log('========== 云函数开始执行 ==========')
  console.log('执行时间:', new Date().toLocaleString('zh-CN'))
  console.log('Event:', JSON.stringify(event))
  console.log('运行环境:', process.env.TCB_ENV_ID || 'local')
  console.log('配置超时时间:', 600, '秒')
  
  try {
    let db
    
    // 判断是否是本地调试环境
    if (!process.env.TCB_ENV_ID) {
      console.log('检测到本地调试环境，使用本地数据库')
      // 本地调试：使用当前环境数据库
      cloud.init({
        env: cloud.DYNAMIC_CURRENT_ENV
      })
      db = cloud.database()
    } else {
      console.log('步骤1: 开始跨账号云开发初始化...')
      console.log('资源方AppID: wx4c4b54bc609bd79e')
      console.log('资源方环境ID: toastmasters-9gbogzjz89b0e835')
      
      // 跨账号调用，必须等待 init 完成
      await c1.init()
      console.log('✓ 步骤2: 跨账号云开发初始化成功')
      
      // 获取资源方数据库实例
      db = c1.database()
      console.log('✓ 步骤3: 获取数据库实例成功')
    }
    
    // 获取所有需要更新的LOF基金数据
    const fetchStartTime = Date.now()
    console.log('步骤4: 开始获取LOF数据...')
    const updatedData = await fetchLOFData(db)
    const fetchEndTime = Date.now()
    console.log(`✓ 步骤5: 获取到LOF数据，数量: ${updatedData ? updatedData.length : 0}，耗时: ${((fetchEndTime - fetchStartTime) / 1000).toFixed(2)}秒`)
    
    if (!updatedData || updatedData.length === 0) {
      console.log('✗ 未获取到LOF数据')
      return {
        success: false,
        message: '未获取到LOF数据'
      }
    }
    
    const updateStartTime = Date.now()
    console.log('步骤6: 开始更新数据库，共', updatedData.length, '条记录...')
    
    // 更新数据库中的数据
    const updatePromises = updatedData.map(async (fund, index) => {
      try {
        console.log(`  [${index + 1}/${updatedData.length}] 开始更新基金 ${fund.name} (${fund._id})`)
        
        // 使用 _id 更新文档
        const result = await db.collection('funds')
          .doc(fund._id)
          .update({
            data: {
              price: fund.price,
              last_close: fund.last_close,
              change_pct: fund.change_pct,
              volume: fund.volume,
              amount: fund.amount,
              nav: fund.nav,
              nav_date: fund.nav_date,
              iopv: fund.iopv,
              premium_rate: fund.premium_rate,
              is_premium_valid: fund.is_premium_valid,
              subscription_status: fund.subscription_status,
              redemption_status: fund.redemption_status,
              updated_at: new Date().toISOString()
            }
          })
        
        console.log(`  ✓ 更新基金 ${fund.name} (${fund._id}) 成功`)
        return { success: true, id: fund._id, name: fund.name }
      } catch (error) {
        console.error(`  ✗ 更新基金 ${fund.name} (${fund._id}) 失败:`, error)
        console.error(`  ✗ 错误详情:`, JSON.stringify(error))
        return { success: false, id: fund._id, name: fund.name, error: error.message }
      }
    })
    
    const results = await Promise.all(updatePromises)
    const updateEndTime = Date.now()
    
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length
    
    const totalEndTime = Date.now()
    const totalDuration = ((totalEndTime - startTime) / 1000).toFixed(2)
    
    console.log('✓ 步骤7: 数据更新完成')
    console.log('  总数:', updatedData.length)
    console.log('  成功:', successCount)
    console.log('  失败:', failCount)
    console.log(`  数据库更新耗时: ${((updateEndTime - updateStartTime) / 1000).toFixed(2)}秒`)
    console.log(`  总执行时间: ${totalDuration}秒`)
    console.log('========== 云函数执行结束 ==========')
    
    return {
      success: true,
      message: '数据更新完成',
      total: updatedData.length,
      successCount: successCount,
      failCount: failCount,
      details: results
    }
    
  } catch (error) {
    console.error('========== 云函数执行失败 ==========')
    console.error('错误对象:', error)
    console.error('错误类型:', typeof error)
    console.error('错误名称:', error ? error.name : 'undefined')
    console.error('错误信息:', error ? error.message : 'undefined')
    console.error('错误堆栈:', error ? error.stack : 'undefined')
    console.error('完整错误JSON:', JSON.stringify(error))
    console.error('====================================')
    
    // 确保返回的错误信息不为空
    const errorMessage = error && error.message ? error.message : '未知错误'
    const errorType = error && error.name ? error.name : 'UnknownError'
    const errorStack = error && error.stack ? error.stack : 'No stack trace'
    
    return {
      success: false,
      message: '更新数据失败',
      error: errorMessage,
      errorType: errorType,
      errorStack: errorStack
    }
  }
}

// 从数据库获取所有LOF代码，然后循环获取每个LOF的数据
async function fetchLOFData(db) {
  try {
    console.log('步骤1: 开始从数据库获取所有LOF基金代码...')
    
    // 从数据库查询所有LOF基金（假设funds集合存储基金信息，_id为基金代码）
    const fundsResult = await db.collection('funds')
      .field({
        _id: true,
        name: true
      })
      .get()
    
    const funds = fundsResult.data || []
    console.log(`✓ 查询到 ${funds.length} 个LOF基金`)
    
    if (funds.length === 0) {
      console.log('数据库中没有LOF基金数据')
      return []
    }
    
    const fetch = require('node-fetch')
    const iconv = require('iconv-lite')
    
    // 获取当前日期
    const today = new Date()
    const nav_date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    
    // 并行获取每个LOF的数据
    console.log('步骤2: 开始并行获取所有LOF的数据...')
    
    const fetchPromises = funds.map(async (fund, index) => {
      const fundCode = fund._id
      const fundName = fund.name || `基金${fundCode}`
      const requestStartTime = Date.now()
      
      try {
        console.log(`  [${index + 1}/${funds.length}] 正在获取 ${fundName} (${fundCode}) 的数据...`)
        
        // 构造腾讯证券接口URL
        // 根据代码长度判断是深圳还是上海：6位代码，以16开头的是深圳，以50开头的是上海
        const prefix = fundCode.startsWith('16') ? 'sz' : 'sh'
        const url = `https://qt.gtimg.cn/q=${prefix}${fundCode}`
        
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 5000
        })
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${url}`)
        }
        const buffer = await response.buffer()
        const data = iconv.decode(buffer, 'gbk')
        
        // 解析返回的数据
        // 格式: v_sz161226="国投白银LOF,现价,昨收,...,净值,..."
        const pattern = new RegExp(`v_${prefix}${fundCode}="([^"]+)"`)
        const match = data.match(pattern)
        
        if (!match) {
          console.log(`  ✗ 无法解析 ${fundName} (${fundCode}) 的接口返回数据`)
          return null
        }
        
        const fields = match[1].split('~')
        
        // 字段索引（从0开始）：
        // 1: 基金名称
        // 3: 现价
        // 4: 昨收
        // 5: 成交量
        // 6: 成交额
        // 39: IOPV实时参考净值
        // 81: 单位净值
        
        const name = fields[1] || fundName
        const price = parseFloat(fields[3]) || 0
        const last_close = parseFloat(fields[4]) || 0
        const volume = parseInt(fields[5]) || 0
        const amount = parseFloat(fields[6]) || 0
        const iopv = parseFloat(fields[39]) || 0
        const nav = parseFloat(fields[81]) || 0
        
        // 获取申赎状态
        const subscriptionStatus = await fetchSubscriptionStatus(fundCode, name)
        
        // 计算涨跌幅
        const change_pct = last_close > 0 ? ((price - last_close) / last_close * 100).toFixed(2) : 0
        
        // 计算溢价率
        const premium_rate = nav > 0 ? ((price - nav) / nav * 100).toFixed(2) : 0
        
        const requestDuration = ((Date.now() - requestStartTime) / 1000).toFixed(2)
        console.log(`  ✓ ${name}: 现价=${price}, 昨收=${last_close}, 净值=${nav}, 申购状态=${subscriptionStatus.status}, 涨跌幅=${change_pct}%, 溢价率=${premium_rate}% (耗时${requestDuration}秒)`)
        
        // 构造更新数据
        return {
          "_id": fundCode,
          "name": name,
          "price": price,
          "last_close": last_close,
          "change_pct": parseFloat(change_pct),
          "volume": volume,
          "amount": amount,
          "nav": nav,
          "nav_date": nav_date,
          "iopv": iopv,
          "premium_rate": parseFloat(premium_rate),
          "is_premium_valid": nav > 0,
          "subscription_status": subscriptionStatus.status,  // 开放、暂停、限X
          "redemption_status": "开放"  // 暂时固定为开放
        }
        
      } catch (error) {
        const requestDuration = ((Date.now() - requestStartTime) / 1000).toFixed(2)
        console.error(`  ✗ 获取 ${fundName} (${fundCode}) 数据失败 (耗时${requestDuration}秒):`, error.message)
        return null
      }
    })
    
    // 等待所有请求完成
    const results = await Promise.all(fetchPromises)
    
    // 过滤掉失败的请求
    const updatedData = results.filter(result => result !== null)
    
    console.log(`✓ 成功获取 ${updatedData.length}/${funds.length} 个LOF基金的数据`)
    return updatedData
    
  } catch (error) {
    console.error('获取LOF数据失败:', error)
    console.error('错误详情:', error.message)
    return []
  }
}

// 获取申购状态
async function fetchSubscriptionStatus(fundCode, fundName) {
  try {
    const fetch = require('node-fetch')

    // 使用天天基金网接口获取申购状态
    const url = `https://fundf10.eastmoney.com/jjfl_${fundCode}.html`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${url}`)
    }
    const text = await response.text()
    
    // 解析申购状态
    // 格式: <td class="w135">暂停申购</td> 或 <td class="w135">开放申购</td>
    const subscriptionMatch = text.match(/申购状态<\/td><td[^>]*>([^<]+)<\/td>/)
    const redemptionMatch = text.match(/赎回状态<\/td><td[^>]*>([^<]+)<\/td>/)
    const dailyLimitMatch = text.match(/日累计申购限额<\/td><td[^>]*>([^<]+)<\/td>/)
    
    const subscriptionStatus = subscriptionMatch ? subscriptionMatch[1] : '开放申购'
    const redemptionStatus = redemptionMatch ? redemptionMatch[1] : '开放赎回'
    const dailyLimit = dailyLimitMatch ? dailyLimitMatch[1] : null
    
    let status = '开放'
    
    if (subscriptionStatus === '暂停申购') {
      status = '暂停'
    } else if (subscriptionStatus === '限大额' && dailyLimit) {
      // 解析日累计申购限额，如"10.00元" → "限10"，"1.00万元" → "限1万"
      if (dailyLimit.includes('万元')) {
        const limitValue = parseFloat(dailyLimit)
        if (limitValue > 0) {
          status = `限${limitValue}万`
        } else {
          status = '限大额'
        }
      } else if (dailyLimit.includes('元')) {
        const limitValue = parseFloat(dailyLimit)
        if (limitValue > 0) {
          status = `限${limitValue}`
        } else {
          status = '限大额'
        }
      } else {
        status = '限大额'
      }
    } else if (subscriptionStatus.includes('限购')) {
      // 提取限购金额
      const limitMatch = subscriptionStatus.match(/限购([0-9.]+)(万|元)?/)
      if (limitMatch) {
        const amount = parseFloat(limitMatch[1])
        const unit = limitMatch[2] || '元'
        if (unit === '万') {
          status = `限${amount.toFixed(0)}万`
        } else {
          status = `限${amount}`
        }
      } else {
        status = subscriptionStatus.replace('申购', '')  // 去掉"申购"二字
      }
    } else if (subscriptionStatus === '开放申购') {
      status = '开放'
    }
    
    console.log(`    ${fundName} 申购状态: ${subscriptionStatus}${dailyLimit ? ` (限额:${dailyLimit})` : ''} → ${status}`)
    
    return { 
      status: status, 
      subscriptionStatus: subscriptionStatus,
      redemptionStatus: redemptionStatus,
      dailyLimit: dailyLimit
    }
    
  } catch (error) {
    console.log(`    获取 ${fundName} 申购状态失败，默认为"开放":`, error.message)
    return { 
      status: '开放', 
      subscriptionStatus: '开放申购',
      redemptionStatus: '开放赎回',
      dailyLimit: null
    }
  }
}