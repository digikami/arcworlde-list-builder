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

  addativeMerge(...objs) {
    let keys = new Set(objs.map(o => Object.keys(o)).reduce((p,c) => p.concat(c), []));
    let merged = {};
    keys.forEach((key) => {
      objs.forEach((obj) => {
        if (!merged.hasOwnProperty(key)) {
          if (obj.hasOwnProperty(key)) {
            merged[key] = obj[key];
          }
        } else if (Array.isArray(merged[key])) {
          if (obj[key] && Array.isArray(obj[key])) {
            merged[key] = merged[key].concat(obj[key]);
          } else if (obj[key]) {
            merged[key].push(obj[key]);
          }
        } else if (!isNaN(merged[key]) && !isNaN(obj[key])) {
          merged[key] += obj[key];
        }
      })
    });
    return merged;
  }
}

export default new LoafUtils();