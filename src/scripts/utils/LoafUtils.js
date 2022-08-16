class LoafUtils {
  clone(json) {
    return JSON.parse(JSON.stringify(json));
  }

  guid4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.floor(Math.random() * 16);
      var v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  }
}

export default new LoafUtils();