class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;      // Mongoose query object
    this.queryStr = queryStr; // req.query object
  }

  // 1. Text Search (using text index)
  search() {
    if (this.queryStr.search) {
      this.query = this.query.find({
        $text: { $search: this.queryStr.search },
      });
    }
    return this;
  }

  // 2. Generic Filtering (location, jobType, category, experience, salary etc.)
  filter() {
    const queryCopy = { ...this.queryStr };

    // Remove non-filter parameters
    const removeFields = ['search', 'sort', 'fields', 'page', 'limit'];
    removeFields.forEach((el) => delete queryCopy[el]);

    // Format query string to enable MongoDB operators ($gte, $lte, etc.)
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);

    // Apply regex search for string fields (excluding specific enums or IDs)
    Object.keys(parsedQuery).forEach((key) => {
      const skipFields = ['status', 'jobType', 'employmentType', 'employerId', 'candidateId', '_id'];
      if (typeof parsedQuery[key] === 'string' && !skipFields.includes(key)) {
        parsedQuery[key] = { $regex: parsedQuery[key], $options: 'i' };
      }
    });

    this.query = this.query.find(parsedQuery);
    return this;
  }

  // 3. Sorting
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // Default sort latest first
    }
    return this;
  }

  // 4. Field Projection
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // 5. Pagination
  paginate() {
    const page = parseInt(this.queryStr.page, 10) || 1;
    const limit = parseInt(this.queryStr.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
