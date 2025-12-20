class ApiFeatures {
  constructor(query, querystring) {
    this.query = query;
    this.querystring = querystring;
  }

  filter() {
    const excludeFields = ['page', 'sort', 'fields', 'limit'];
    const queryobj = { ...this.querystring };
    excludeFields.forEach((el) => delete queryobj[el]);
    let querystring = JSON.stringify(queryobj);
    querystring = querystring.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(querystring));
    return this;
  }

  sort() {
    if (this.querystring.sort) {
      const sortBy = this.querystring.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else this.query = this.query.sort('createdAt');
    return this;
  }

  limitFields() {
    if (this.querystring.fields) {
      const fields = this.querystring.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    }
    return this;
  }

  pagination() {
    const page = parseInt(this.querystring.page )* 1 || 1;
    const limit = parseInt(this.querystring.limit) * 1;
    const skip = (page - 1) *1* limit; 
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;  