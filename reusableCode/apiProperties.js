class APIProperties {
  constructor(bltQuery, bltQueryString) {
    this.bltQuery = bltQuery;
    this.bltQueryString = bltQueryString;
    console.log(bltQueryString);
  }

  filter() {
    // {filtering} Here is where we need to build the query
    const queryObject = { ...this.bltQueryString }; // get a copy/ new object of the request.query object
    const fieldsToExclude = ['page', 'sort', 'limit', 'fields']; // these are the fields we need to exclude
    fieldsToExclude.forEach((item) => delete queryObject[item]); // removing all the fields from the object looping over if it exist

    // {better filtering} gte, gt, let, lt need to be handled ie greater than equal, greater than, less then equal...
    let toursString = JSON.stringify(queryObject);
    toursString = toursString.replace(
      /\b(gte|lte|gt|lt)\b/g,
      (matchedValue) => `$${matchedValue}`
    );
    this.bltQuery = this.bltQuery.find(JSON.parse(toursString));
    return this;
  }

  sort() {
    // if "Sort" exists in the request then sort sort
    if (this.bltQueryString.sort) {
      const sortedBy = this.bltQueryString.sort.split(',').join(' ');
      this.bltQuery = this.bltQuery.sort(sortedBy);
    } else {
      this.bltQuery = this.bltQuery.sort('-tourCreatedDate');
    }
    return this;
  }

  limitFields() {
    // field limiting on the request
    if (this.bltQueryString.fields) {
      const myFields = this.bltQueryString.fields.split(',').join(' ');
      this.bltQuery = this.bltQuery.select(myFields);
    } else {
      this.bltQuery = this.bltQuery.select('-__v');
    }
    return this;
  }

  paginate() {
    // pagination page=3 limit=15, default page 1-15 page 1 = 16 - 30, page 2 = 31 - 45
    // get page and limit values and set default
    // start on page 1 and limit 50 results per page as default
    //
    // or page 0 is 1-50, page 1 is 51-100 so if we want page 3 with limit  of 10 per page we'd
    // need to take the page - 1 multiply by the limit to get the return value.
    const page = this.bltQueryString.page * 1 || 1; // time by 1 to convert to number and start on main page
    const limit = this.bltQueryString.limit * 1 || 50; // limit to 50 results per page
    const skip = (page - 1) * limit;

    this.bltQuery = this.bltQuery.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIProperties;
