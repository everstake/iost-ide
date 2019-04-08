class TabsStorage {

  getArray(){
    return  JSON.parse(localStorage.getItem('tabs-list'))
  }
  addToArray(hash){
    let tabs = this.getArray();
    if (tabs != null && tabs.length>0){
      if(tabs.indexOf(hash) < 0){
        tabs.push(hash)
        localStorage.setItem('tabs-list', JSON.stringify( tabs ))
      }
    } else {
      tabs = []
      tabs.push(hash)
      localStorage.setItem('tabs-list', JSON.stringify( tabs ))
    }
  }
  removeToArray(hash){
    let tabs = this.getArray();
    if(tabs.indexOf(hash)>=0){
      tabs.splice(tabs.indexOf(hash),1)
      localStorage.setItem('tabs-list', JSON.stringify( tabs ))
    }
  }

  is (key) {
    const cached = JSON.parse(
      localStorage.getItem(key)
    )

    if (!cached) {
      return false
    }
    return true
  }

  get (key, value) {
    const cached = JSON.parse(
      localStorage.getItem(key)
    )
    if (!cached) {
      return null
    }
    return cached[value]
  }

  set (key, data){
    localStorage.setItem(key, JSON.stringify(data))
  }

  setCode(key, code){
    if(this.is(key)){
      let data = JSON.parse(
        localStorage.getItem(key)
      )
      data.code = code
      localStorage.setItem(key, JSON.stringify(data))
    }
  }
}
export default new TabsStorage()
