module.exports = function getEmptyFilter(fields) {
  let emptyFilter = {};
  let andFilter = [];
  let orFilter = [];
  let norFilter = [];

  let fieldsKeys = Object.keys(fields);

  for(let k = 0; k < fieldsKeys.length; k++) {
    let field = fieldsKeys[k];
    let operator = fields[field];

    // let filters = [];
    let fieldFilter = {};

    switch(operator) {
      case '$and':
        fieldFilter[field] = { $ne: '' };
        andFilter.push(Object.assign({}, fieldFilter));

        fieldFilter[field] = { $ne: undefined };
        andFilter.push(Object.assign({}, fieldFilter));

        fieldFilter[field] = { $ne: null };
        andFilter.push(Object.assign({}, fieldFilter));
        break;
      case '$or':
        fieldFilter[field] = { $ne: '' };
        orFilter.push(Object.assign({}, fieldFilter));

        fieldFilter[field] = { $ne: undefined };
        orFilter.push(Object.assign({}, fieldFilter));

        fieldFilter[field] = { $ne: null };
        orFilter.push(Object.assign({}, fieldFilter));
        break;
      case '$nor':
        fieldFilter[field] = { $ne: '' };
        norFilter.push(Object.assign({}, fieldFilter));

        fieldFilter[field] = { $ne: undefined };
        norFilter.push(Object.assign({}, fieldFilter));

        fieldFilter[field] = { $ne: null };
        norFilter.push(Object.assign({}, fieldFilter));
        break;
    }

    if (orFilter.length > 0) {
      emptyFilter.$or = orFilter;
    }

    if (norFilter.length > 0) {
      emptyFilter.$nor = norFilter;
    }

    if (andFilter.length > 0) {
      emptyFilter.$and = andFilter;
    }
  }

  return emptyFilter;
}
