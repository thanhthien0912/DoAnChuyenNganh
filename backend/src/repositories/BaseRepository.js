class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  createDocument(data) {
    return new this.model(data);
  }

  async create(data, options = {}) {
    if (options.session) {
      return this.model.create([data], { session: options.session }).then(([doc]) => doc);
    }
    return this.model.create(data);
  }

  async save(document, options = {}) {
    if (options.session) {
      return document.save({ session: options.session });
    }
    return document.save();
  }

  findById(id, options = {}) {
    const query = this.model.findById(id);
    return this.applyQueryOptions(query, options);
  }

  findOne(filter = {}, options = {}) {
    const query = this.model.findOne(filter);
    return this.applyQueryOptions(query, options);
  }

  find(filter = {}, options = {}) {
    const query = this.model.find(filter);
    return this.applyQueryOptions(query, options);
  }

  countDocuments(filter = {}) {
    return this.model.countDocuments(filter);
  }

  updateById(id, update, options = {}) {
    const query = this.model.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
      ...options
    });
    return query;
  }

  updateOne(filter, update, options = {}) {
    const query = this.model.findOneAndUpdate(filter, update, {
      new: true,
      runValidators: true,
      ...options
    });
    return query;
  }

  deleteById(id, options = {}) {
    return this.model.findByIdAndDelete(id, options);
  }

  deleteOne(filter, options = {}) {
    return this.model.findOneAndDelete(filter, options);
  }

  deleteMany(filter, options = {}) {
    return this.model.deleteMany(filter, options);
  }

  applyQueryOptions(query, options) {
    const {
      select,
      populate,
      sort,
      skip,
      limit,
      lean
    } = options;

    if (select) {
      query = query.select(select);
    }

    if (populate) {
      query = query.populate(populate);
    }

    if (sort) {
      query = query.sort(sort);
    }

    if (typeof skip === 'number') {
      query = query.skip(skip);
    }

    if (typeof limit === 'number') {
      query = query.limit(limit);
    }

    if (lean) {
      query = query.lean();
    }

    return query;
  }
}

module.exports = BaseRepository;
