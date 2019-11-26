export default (url) => () => url === 'Main' ? import('@/components/main') : (url === 'pageView' ? import('@/components/layouts/pageView') : import(`@/view/${url}`))
