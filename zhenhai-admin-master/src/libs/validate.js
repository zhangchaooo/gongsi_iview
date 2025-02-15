/**
 * 密码格式验证
 * @param rule 验证规则（不少于6位）
 * @param value 需要验证的值
 * @param callback 回调函数
 */
export const validatePassword = (rule, value, callback) => {
  if (value.length < 6) {
    callback(new Error('密码长度不得小于6位'))
  } else {
    callback()
  }
}

/**
 * 手机号码格式验证
 * @param rule 验证规则
 * @param value 需要验证的值
 * @param callback 回调函数
 */
export const validateMobile = (rule, value, callback) => {
  var reg = /^[1][3,4,5,6,7,8][0-9]{9}$/
  if (!reg.test(value)) {
    callback(new Error('手机号格式错误'))
  } else {
    callback()
  }
}

/**
 * 身份证号码格式验证
 * @param rule 验证规则（是否满足18位）
 * @param value 需要验证的值
 * @param callback 回调函数
 */
export const validateIDCard = (rule, value, callback) => {
  const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
  if (!reg.test(value)) {
    callback(new Error('身份证号码格式错误'))
  } else {
    callback()
  }
}

// 提取信息中的网络链接:(h|H)(r|R)(e|E)(f|F) *= *('|")?(\w|\\|\/|\.)+('|"| *|>)?
// 提取信息中的邮件地址:\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*
// 提取信息中的图片链接:(s|S)(r|R)(c|C) *= *('|")?(\w|\\|\/|\.)+('|"| *|>)?
// 提取信息中的IP地址:(\d+)\.(\d+)\.(\d+)\.(\d+)
// 提取信息中的中国电话号码（包括移动和固定电话）:(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}
// 提取信息中的中国邮政编码:[1-9]{1}(\d+){5}
// 提取信息中的中国身份证号码:\d{18}|\d{15}
// 提取信息中的整数：\d+
// 提取信息中的浮点数（即小数）：(-?\d*)\.?\d+
// 提取信息中的任何数字 ：(-?\d*)(\.\d+)?
// 提取信息中的中文字符串：[\u4e00-\u9fa5]*
// 提取信息中的双字节字符串 (汉字)：[^\x00-\xff]*
