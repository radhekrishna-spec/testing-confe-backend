const s = require('../../../store/store');
module.exports = {
  save: (id, t) => {
    if (!s.history[id]) s.history[id] = [];
    s.history[id].unshift({ text: t, time: new Date().toISOString() });
  },
};
