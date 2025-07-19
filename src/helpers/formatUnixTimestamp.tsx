

const formatUnixTimestamp = (UNIX_timestamp, withSeconds = true) => {
  const a = new Date(UNIX_timestamp * 1000)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const year = a.getFullYear()
  const month = months[a.getMonth()]
  const date = a.getDate()
  const hour = (a.getHours() < 10) ? `0${a.getHours()}` : a.getHours()
  const min = (a.getMinutes() < 10) ? `0${a.getMinutes()}` : a.getMinutes()
  const sec = (a.getSeconds() < 10) ? `0${a.getSeconds()}` : a.getSeconds()
  const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ((withSeconds) ? ':' + sec : '')
  return time
}


export default formatUnixTimestamp