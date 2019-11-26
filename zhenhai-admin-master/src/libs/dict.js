export const ownersType = type => {
  let re = ''
  switch (type) {
    case 0:
      re = '未审核'
      break
    case 2:
      re = '审核驳回'
      break
    case 3:
      re = '待确认'
      break
    case 4:
      re = '已认证'
      break
    default:
      re = ''
      break
  }
  return re
}

export const ownersIdentity = type => {
  let re = ''
  switch (type) {
    case 1:
      re = '产权人'
      break
    case 2:
      re = '家属'
      break
    case 3:
      re = '租客'
      break
    default:
      re = '暂不清楚'
      break
  }
  return re
}
